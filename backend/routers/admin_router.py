from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..database import get_database
from ..models import (
    AdminStats, User, Booking, BookingStatus, PaymentStatus,
    TherapistApplication, Therapist, TherapistStatus
)
from ..auth import get_current_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get admin dashboard statistics."""
    # Total users
    total_users = await db.users.count_documents({"role": "client"})
    
    # Total therapists
    total_therapists = await db.therapists.count_documents({"status": "approved"})
    
    # Total bookings
    total_bookings = await db.bookings.count_documents({})
    
    # Total revenue
    paid_bookings = await db.bookings.find({"payment_status": "paid"}).to_list(length=None)
    total_revenue = sum(booking["total_amount"] for booking in paid_bookings)
    
    # Pending applications
    pending_applications = await db.therapist_applications.count_documents({"status": "pending"})
    
    # Active bookings
    active_bookings = await db.bookings.count_documents({
        "status": {"$in": ["confirmed", "in_progress"]}
    })
    
    return AdminStats(
        total_users=total_users,
        total_therapists=total_therapists,
        total_bookings=total_bookings,
        total_revenue=total_revenue,
        pending_applications=pending_applications,
        active_bookings=active_bookings
    )

@router.get("/users")
async def get_all_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(50, le=200),
    skip: int = Query(0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all users (Admin only)."""
    query = {}
    if role:
        query["role"] = role
    if is_active is not None:
        query["is_active"] = is_active
    
    users_cursor = db.users.find(query).skip(skip).limit(limit).sort("created_at", -1)
    users = await users_cursor.to_list(length=limit)
    
    # Remove sensitive information
    for user in users:
        user.pop("hashed_password", None)
    
    return users

@router.get("/bookings")
async def get_all_bookings(
    status: Optional[BookingStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    skip: int = Query(0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all bookings (Admin only)."""
    query = {}
    
    if status:
        query["status"] = status
    
    if payment_status:
        query["payment_status"] = payment_status
    
    if date_from or date_to:
        date_query = {}
        if date_from:
            try:
                from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
                date_query["$gte"] = from_date
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_from format. Use YYYY-MM-DD"
                )
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
                date_query["$lte"] = to_date
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date_to format. Use YYYY-MM-DD"
                )
        
        query["appointment_date"] = date_query
    
    bookings_cursor = db.bookings.find(query).skip(skip).limit(limit).sort("created_at", -1)
    bookings = await bookings_cursor.to_list(length=limit)
    
    # Enrich with user and therapist details
    enriched_bookings = []
    for booking in bookings:
        # Get client details
        client = await db.users.find_one({"id": booking["client_id"]})
        
        # Get therapist details
        therapist_data = await db.therapists.find_one({"id": booking["therapist_id"]})
        therapist_user = None
        if therapist_data:
            therapist_user = await db.users.find_one({"id": therapist_data["user_id"]})
        
        # Get service details
        service = await db.services.find_one({"id": booking["service_id"]})
        
        enriched_booking = {
            **booking,
            "client_name": client["full_name"] if client else "Unknown",
            "client_email": client["email"] if client else "Unknown",
            "therapist_name": therapist_user["full_name"] if therapist_user else "Unknown",
            "service_name": service["name"] if service else "Unknown"
        }
        
        enriched_bookings.append(enriched_booking)
    
    return enriched_bookings

@router.get("/therapists")
async def get_all_therapists(
    status: Optional[TherapistStatus] = Query(None),
    limit: int = Query(50, le=200),
    skip: int = Query(0),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all therapists (Admin only)."""
    query = {}
    if status:
        query["status"] = status
    
    therapists_cursor = db.therapists.find(query).skip(skip).limit(limit).sort("created_at", -1)
    therapists = await therapists_cursor.to_list(length=limit)
    
    # Enrich with user details
    enriched_therapists = []
    for therapist in therapists:
        user = await db.users.find_one({"id": therapist["user_id"]})
        if user:
            enriched_therapist = {
                **therapist,
                "full_name": user["full_name"],
                "email": user["email"],
                "phone": user["phone"]
            }
            enriched_therapists.append(enriched_therapist)
    
    return enriched_therapists

@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Activate user account (Admin only)."""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
    )
    
    logger.info(f"User activated: {user_id}")
    return {"message": "User activated successfully"}

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Deactivate user account (Admin only)."""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    logger.info(f"User deactivated: {user_id}")
    return {"message": "User deactivated successfully"}

@router.put("/therapists/{therapist_id}/status")
async def update_therapist_status(
    therapist_id: str,
    new_status: TherapistStatus,
    notes: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update therapist status (Admin only)."""
    therapist = await db.therapists.find_one({"id": therapist_id})
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Therapist not found"
        )
    
    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }
    
    if notes:
        update_data["admin_notes"] = notes
    
    await db.therapists.update_one(
        {"id": therapist_id},
        {"$set": update_data}
    )
    
    logger.info(f"Therapist status updated: {therapist_id} -> {new_status}")
    return {"message": "Therapist status updated successfully"}

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get revenue analytics (Admin only)."""
    now = datetime.utcnow()
    
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "quarter":
        start_date = now - timedelta(days=90)
    else:  # year
        start_date = now - timedelta(days=365)
    
    # Get bookings in the period
    bookings = await db.bookings.find({
        "created_at": {"$gte": start_date},
        "payment_status": "paid"
    }).to_list(length=None)
    
    # Group by date
    daily_revenue = {}
    for booking in bookings:
        date_key = booking["created_at"].strftime("%Y-%m-%d")
        if date_key not in daily_revenue:
            daily_revenue[date_key] = 0
        daily_revenue[date_key] += booking["total_amount"]
    
    # Calculate totals
    total_revenue = sum(booking["total_amount"] for booking in bookings)
    total_bookings = len(bookings)
    avg_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": now.isoformat(),
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "average_booking_value": avg_booking_value,
        "daily_revenue": daily_revenue
    }

@router.get("/analytics/popular-services")
async def get_popular_services(
    limit: int = Query(10, le=50),
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get popular services analytics (Admin only)."""
    # Aggregate bookings by service
    pipeline = [
        {"$match": {"status": {"$in": ["confirmed", "completed"]}}},
        {"$group": {
            "_id": "$service_id",
            "total_bookings": {"$sum": 1},
            "total_revenue": {"$sum": "$total_amount"}
        }},
        {"$sort": {"total_bookings": -1}},
        {"$limit": limit}
    ]
    
    service_stats = await db.bookings.aggregate(pipeline).to_list(length=limit)
    
    # Enrich with service details
    enriched_stats = []
    for stat in service_stats:
        service = await db.services.find_one({"id": stat["_id"]})
        if service:
            enriched_stat = {
                "service_id": stat["_id"],
                "service_name": service["name"],
                "category": service["category"],
                "total_bookings": stat["total_bookings"],
                "total_revenue": stat["total_revenue"],
                "average_revenue_per_booking": stat["total_revenue"] / stat["total_bookings"]
            }
            enriched_stats.append(enriched_stat)
    
    return enriched_stats