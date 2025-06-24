from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from ..database import get_database
from ..models import Service, ServiceCreate, User
from ..auth import get_current_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/services", tags=["services"])

@router.get("/", response_model=List[Service])
async def get_services(
    category: Optional[str] = Query(None),
    is_active: bool = Query(True),
    limit: int = Query(50, le=100),
    skip: int = Query(0),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of services."""
    query = {"is_active": is_active}
    
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    
    services_cursor = db.services.find(query).skip(skip).limit(limit).sort("name", 1)
    services = await services_cursor.to_list(length=limit)
    
    return [Service(**service) for service in services]

@router.get("/{service_id}", response_model=Service)
async def get_service(
    service_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get service by ID."""
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    return Service(**service)

@router.post("/", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create new service (Admin only)."""
    service = Service(**service_data.dict())
    await db.services.insert_one(service.dict())
    
    logger.info(f"New service created: {service.name}")
    return service

@router.put("/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    service_update: dict,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update service (Admin only)."""
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Remove fields that shouldn't be updated directly
    forbidden_fields = {"id", "created_at"}
    update_data = {k: v for k, v in service_update.items() if k not in forbidden_fields}
    
    if update_data:
        from datetime import datetime
        update_data["updated_at"] = datetime.utcnow()
        await db.services.update_one(
            {"id": service_id},
            {"$set": update_data}
        )
        
        # Get updated service
        updated_service = await db.services.find_one({"id": service_id})
        logger.info(f"Service updated: {service_id}")
        return Service(**updated_service)
    
    return Service(**service)

@router.delete("/{service_id}")
async def delete_service(
    service_id: str,
    current_admin: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete service (Admin only)."""
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Soft delete by setting is_active to False
    await db.services.update_one(
        {"id": service_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    logger.info(f"Service deleted: {service_id}")
    return {"message": "Service deleted successfully"}