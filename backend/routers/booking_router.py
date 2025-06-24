from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, date, time
from ..database import get_database
from ..models import (
    BookingCreate, Booking, BookingResponse, User, BookingStatus,
    PaymentStatus, Review, ReviewCreate
)
from ..auth import get_current_active_user, get_current_therapist
from ..services.email_service import email_service
from ..services.sms_service import sms_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new booking."""
    # Verify therapist exists and is available
    therapist = await db.therapists.find_one({
        "id": booking_data.therapist_id,
        "status": "approved",
        "is_available": True
    })
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist not found or unavailable"
        )
    
    # Get service details
    service = await db.services.find_one({"id": booking_data.service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check for time conflicts
    existing_booking = await db.bookings.find_one({
        "therapist_id": booking_data.therapist_id,
        "appointment_date": booking_data.appointment_date,
        "appointment_time": booking_data.appointment_time,
        "status": {"$in": ["confirmed", "in_progress"]}
    })
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time slot already booked"
        )
    
    # Calculate total amount
    total_amount = service["base_price"] * (booking_data.duration_minutes / 60)
    
    # Create booking
    booking = Booking(
        **booking_data.dict(),
        client_id=current_user.id,
        total_amount=total_amount
    )
    
    await db.bookings.insert_one(booking.dict())
    
    # Get therapist user details
    therapist_user = await db.users.find_one({"id": therapist["user_id"]})
    
    # Send notifications
    await email_service.send_booking_confirmation(
        current_user.email,
        current_user.full_name,
        therapist_user["full_name"],
        service["name"],
        str(booking_data.appointment_date),
        str(booking_data.appointment_time),
        booking_data.location_address,
        total_amount
    )
    
    await email_service.send_therapist_notification(
        therapist_user["email"],
        therapist_user["full_name"],
        current_user.full_name,
        service["name"],
        str(booking_data.appointment_date),
        str(booking_data.appointment_time),
        booking_data.location_address
    )
    
    # Send SMS confirmation
    await sms_service.send_booking_confirmation_sms(
        current_user.phone,
        current_user.full_name,
        service["name"],
        str(booking_data.appointment_date),
        str(booking_data.appointment_time)
    )
    
    logger.info(f"New booking created: {booking.id}")
    
    return BookingResponse(
        **booking.dict(),
        therapist_name=therapist_user["full_name"],
        service_name=service["name"]
    )

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    status: Optional[BookingStatus] = Query(None),
    limit: int = Query(20, le=100),
    skip: int = Query(0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user's bookings."""
    query = {"client_id": current_user.id}
    if status:
        query["status"] = status
    
    bookings_cursor = db.bookings.find(query).skip(skip).limit(limit).sort("appointment_date", -1)
    bookings = await bookings_cursor.to_list(length=limit)
    
    result = []
    for booking in bookings:
        # Get therapist and service details
        therapist = await db.therapists.find_one({"id": booking["therapist_id"]})
        service = await db.services.find_one({"id": booking["service_id"]})
        
        therapist_name = None
        if therapist:
            therapist_user = await db.users.find_one({"id": therapist["user_id"]})
            if therapist_user:
                therapist_name = therapist_user["full_name"]
        
        result.append(BookingResponse(
            **booking,
            therapist_name=therapist_name,
            service_name=service["name"] if service else None
        ))
    
    return result

@router.get("/therapist-bookings", response_model=List[BookingResponse])
async def get_therapist_bookings(
    status: Optional[BookingStatus] = Query(None),
    limit: int = Query(20, le=100),
    skip: int = Query(0),
    current_therapist: User = Depends(get_current_therapist),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get therapist's bookings."""
    # Get therapist profile
    therapist = await db.therapists.find_one({"user_id": current_therapist.id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist profile not found"
        )
    
    query = {"therapist_id": therapist["id"]}
    if status:
        query["status"] = status
    
    bookings_cursor = db.bookings.find(query).skip(skip).limit(limit).sort("appointment_date", -1)
    bookings = await bookings_cursor.to_list(length=limit)
    
    result = []
    for booking in bookings:
        # Get client and service details
        client = await db.users.find_one({"id": booking["client_id"]})
        service = await db.services.find_one({"id": booking["service_id"]})
        
        result.append(BookingResponse(
            **booking,
            therapist_name=current_therapist.full_name,
            service_name=service["name"] if service else None
        ))
    
    return result

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get booking details."""
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user has access to this booking
    therapist = None
    if current_user.role == "therapist":
        therapist = await db.therapists.find_one({"user_id": current_user.id})
    
    if (booking["client_id"] != current_user.id and 
        (not therapist or booking["therapist_id"] != therapist["id"]) and
        current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    # Get additional details
    therapist_data = await db.therapists.find_one({"id": booking["therapist_id"]})
    service = await db.services.find_one({"id": booking["service_id"]})
    
    therapist_name = None
    if therapist_data:
        therapist_user = await db.users.find_one({"id": therapist_data["user_id"]})
        if therapist_user:
            therapist_name = therapist_user["full_name"]
    
    return BookingResponse(
        **booking,
        therapist_name=therapist_name,
        service_name=service["name"] if service else None
    )

@router.put("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: str,
    current_therapist: User = Depends(get_current_therapist),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Confirm booking (Therapist only)."""
    # Get therapist profile
    therapist = await db.therapists.find_one({"user_id": current_therapist.id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist profile not found"
        )
    
    # Get booking
    booking = await db.bookings.find_one({
        "id": booking_id,
        "therapist_id": therapist["id"]
    })
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking["status"] != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be confirmed"
        )
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": BookingStatus.CONFIRMED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    logger.info(f"Booking confirmed: {booking_id}")
    return {"message": "Booking confirmed successfully"}

@router.put("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    reason: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cancel booking."""
    booking = await db.bookings.find_one({"id": booking_id})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user can cancel this booking
    can_cancel = False
    if booking["client_id"] == current_user.id:
        can_cancel = True
    elif current_user.role == "therapist":
        therapist = await db.therapists.find_one({"user_id": current_user.id})
        if therapist and booking["therapist_id"] == therapist["id"]:
            can_cancel = True
    elif current_user.role == "admin":
        can_cancel = True
    
    if not can_cancel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    if booking["status"] in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled"
        )
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": BookingStatus.CANCELLED,
                "cancellation_reason": reason,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    logger.info(f"Booking cancelled: {booking_id}")
    return {"message": "Booking cancelled successfully"}

@router.put("/{booking_id}/complete")
async def complete_booking(
    booking_id: str,
    notes: Optional[str] = None,
    current_therapist: User = Depends(get_current_therapist),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark booking as completed (Therapist only)."""
    # Get therapist profile
    therapist = await db.therapists.find_one({"user_id": current_therapist.id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist profile not found"
        )
    
    # Get booking
    booking = await db.bookings.find_one({
        "id": booking_id,
        "therapist_id": therapist["id"]
    })
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking["status"] != BookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking must be confirmed before completion"
        )
    
    # Update booking status
    update_data = {
        "status": BookingStatus.COMPLETED,
        "completed_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if notes:
        update_data["therapist_notes"] = notes
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": update_data}
    )
    
    # Update therapist stats
    await db.therapists.update_one(
        {"id": therapist["id"]},
        {"$inc": {"total_bookings": 1}}
    )
    
    logger.info(f"Booking completed: {booking_id}")
    return {"message": "Booking marked as completed"}

@router.post("/{booking_id}/review", response_model=Review)
async def create_review(
    booking_id: str,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create review for completed booking."""
    # Get booking
    booking = await db.bookings.find_one({
        "id": booking_id,
        "client_id": current_user.id
    })
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking["status"] != BookingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed bookings"
        )
    
    # Check if review already exists
    existing_review = await db.reviews.find_one({"booking_id": booking_id})
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review already exists for this booking"
        )
    
    # Create review
    review = Review(
        **review_data.dict(),
        booking_id=booking_id,
        client_id=current_user.id,
        is_verified=True
    )
    
    await db.reviews.insert_one(review.dict())
    
    # Update therapist rating
    therapist_reviews = await db.reviews.find({"therapist_id": review_data.therapist_id}).to_list(length=None)
    if therapist_reviews:
        avg_rating = sum(r["rating"] for r in therapist_reviews) / len(therapist_reviews)
        await db.therapists.update_one(
            {"id": review_data.therapist_id},
            {
                "$set": {
                    "rating": round(avg_rating, 1),
                    "reviews_count": len(therapist_reviews)
                }
            }
        )
    
    logger.info(f"Review created for booking: {booking_id}")
    return review