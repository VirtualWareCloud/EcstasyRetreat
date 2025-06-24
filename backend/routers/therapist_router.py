from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_database
from ..models import (
    TherapistApplication, TherapistPublic, TherapistSearch,
    User, UserRole, Therapist, TherapistCreate
)
from ..auth import get_current_active_user, get_current_admin
from ..services.email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/therapists", tags=["therapists"])

@router.post("/apply")
async def submit_therapist_application(
    application: TherapistApplication,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Submit therapist application."""
    # Check if email already has an application
    existing_app = await db.therapist_applications.find_one({"email": application.email})
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already exists for this email"
        )
    
    # Save application
    await db.therapist_applications.insert_one(application.dict())
    
    # Send confirmation email
    await email_service.send_application_received(
        application.email,
        application.full_name
    )
    
    logger.info(f"New therapist application submitted: {application.email}")
    return {"message": "Application submitted successfully", "application_id": application.id}

@router.get("/", response_model=List[TherapistPublic])
async def get_therapists(
    city: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    limit: int = Query(20, le=100),
    skip: int = Query(0),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of active therapists with filtering."""
    # Build query
    query = {"status": "approved", "is_available": True}
    
    if city:
        query["service_areas"] = {"$regex": city, "$options": "i"}
    
    if specialty:
        query["specialties"] = {"$regex": specialty, "$options": "i"}
    
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    
    if max_price:
        query["hourly_rate"] = {"$lte": max_price}
    
    # Get therapists
    therapists_cursor = db.therapists.find(query).skip(skip).limit(limit).sort("rating", -1)
    therapists = await therapists_cursor.to_list(length=limit)
    
    # Get user details for each therapist
    result = []
    for therapist in therapists:
        user_data = await db.users.find_one({"id": therapist["user_id"]})
        if user_data:
            therapist_public = TherapistPublic(
                **therapist,
                full_name=user_data["full_name"]
            )
            result.append(therapist_public)
    
    return result

@router.get("/{therapist_id}", response_model=TherapistPublic)
async def get_therapist(
    therapist_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get therapist details by ID."""
    therapist = await db.therapists.find_one({"id": therapist_id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist not found"
        )
    
    # Get user details
    user_data = await db.users.find_one({"id": therapist["user_id"]})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist user data not found"
        )
    
    return TherapistPublic(
        **therapist,
        full_name=user_data["full_name"]
    )

@router.get("/{therapist_id}/reviews")
async def get_therapist_reviews(
    therapist_id: str,
    limit: int = Query(10, le=50),
    skip: int = Query(0),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get therapist reviews."""
    reviews_cursor = db.reviews.find(
        {"therapist_id": therapist_id}
    ).skip(skip).limit(limit).sort("created_at", -1)
    
    reviews = await reviews_cursor.to_list(length=limit)
    
    # Get client names for reviews
    result = []
    for review in reviews:
        client_data = await db.users.find_one({"id": review["client_id"]})
        if client_data:
            review["client_name"] = client_data["full_name"]
            result.append(review)
    
    return result

@router.get("/{therapist_id}/availability")
async def get_therapist_availability(
    therapist_id: str,
    date: str,  # YYYY-MM-DD format
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get therapist availability for a specific date."""
    from datetime import datetime, time
    
    # Parse date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Check if therapist exists
    therapist = await db.therapists.find_one({"id": therapist_id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist not found"
        )
    
    # Get existing bookings for the date
    bookings = await db.bookings.find({
        "therapist_id": therapist_id,
        "appointment_date": target_date,
        "status": {"$in": ["confirmed", "in_progress"]}
    }).to_list(length=None)
    
    # Standard working hours (9 AM to 8 PM)
    available_slots = []
    for hour in range(9, 20):  # 9 AM to 7 PM (last slot)
        slot_time = time(hour, 0)
        
        # Check if slot is available
        is_available = True
        for booking in bookings:
            booking_time = booking["appointment_time"]
            duration = booking["duration_minutes"]
            
            # Check for time conflicts
            if (booking_time <= slot_time < 
                datetime.combine(target_date, booking_time) + 
                timedelta(minutes=duration)).time():
                is_available = False
                break
        
        available_slots.append({
            "time": slot_time.strftime("%H:%M"),
            "available": is_available
        })
    
    return {
        "date": date,
        "therapist_id": therapist_id,
        "available_slots": available_slots
    }

# Admin routes
@router.get("/admin/applications", response_model=List[TherapistApplication])
async def get_therapist_applications(
    status: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    skip: int = Query(0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get therapist applications (Admin only)."""
    query = {}
    if status:
        query["status"] = status
    
    applications_cursor = db.therapist_applications.find(query).skip(skip).limit(limit).sort("created_at", -1)
    applications = await applications_cursor.to_list(length=limit)
    
    return [TherapistApplication(**app) for app in applications]

@router.put("/admin/applications/{application_id}/approve")
async def approve_therapist_application(
    application_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Approve therapist application (Admin only)."""
    # Get application
    application = await db.therapist_applications.find_one({"id": application_id})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Create user account for therapist
    from ..auth import get_password_hash
    import secrets
    
    temp_password = secrets.token_urlsafe(12)
    hashed_password = get_password_hash(temp_password)
    
    user = User(
        email=application["email"],
        full_name=application["full_name"],
        phone=application["phone"],
        role=UserRole.THERAPIST,
        hashed_password=hashed_password,
        address=application["address"],
        city=application["city"],
        state=application["state"],
        zip_code=application["zip_code"]
    )
    
    await db.users.insert_one(user.dict())
    
    # Create therapist profile
    therapist = Therapist(
        user_id=user.id,
        specialties=application["specialties"].split(", "),
        experience_years=application["experience_years"],
        certifications=application["certifications"].split(", "),
        languages=application["languages"].split(", "),
        service_areas=application["service_areas"].split(", "),
        bio="",
        hourly_rate=120.0,  # Default rate
        status="approved"
    )
    
    await db.therapists.insert_one(therapist.dict())
    
    # Update application status
    await db.therapist_applications.update_one(
        {"id": application_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_by": current_admin.id,
                "reviewed_at": datetime.utcnow(),
                "admin_notes": "Application approved and therapist account created"
            }
        }
    )
    
    logger.info(f"Therapist application approved: {application['email']}")
    return {"message": "Application approved successfully", "temp_password": temp_password}

@router.put("/admin/applications/{application_id}/reject")
async def reject_therapist_application(
    application_id: str,
    reason: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Reject therapist application (Admin only)."""
    application = await db.therapist_applications.find_one({"id": application_id})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    await db.therapist_applications.update_one(
        {"id": application_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_by": current_admin.id,
                "reviewed_at": datetime.utcnow(),
                "admin_notes": reason
            }
        }
    )
    
    logger.info(f"Therapist application rejected: {application['email']}")
    return {"message": "Application rejected successfully"}