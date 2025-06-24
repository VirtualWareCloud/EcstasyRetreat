from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from ..database import get_database
from ..models import UserCreate, UserLogin, Token, User, UserResponse
from ..auth import (
    authenticate_user, create_user_token, get_password_hash, 
    ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Register a new user."""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    user_dict["hashed_password"] = hashed_password
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    
    logger.info(f"New user registered: {user.email}")
    return UserResponse(**user.dict())

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Login user and return access token."""
    user = await authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    access_token = create_user_token(user)
    logger.info(f"User logged in: {user.email}")
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information."""
    return UserResponse(**current_user.dict())

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update current user information."""
    # Remove fields that shouldn't be updated directly
    forbidden_fields = {"id", "created_at", "hashed_password", "role"}
    update_data = {k: v for k, v in user_update.items() if k not in forbidden_fields}
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user_data = await db.users.find_one({"id": current_user.id})
        updated_user = User(**updated_user_data)
        
        logger.info(f"User updated: {current_user.email}")
        return UserResponse(**updated_user.dict())
    
    return UserResponse(**current_user.dict())