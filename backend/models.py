from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    CLIENT = "client"
    THERAPIST = "therapist"
    ADMIN = "admin"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class TherapistStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REJECTED = "rejected"

# Base Models
class BaseDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    role: UserRole = UserRole.CLIENT

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseDocument, UserBase):
    hashed_password: str
    is_active: bool = True
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}

class UserResponse(BaseDocument, UserBase):
    is_active: bool
    profile_image: Optional[str] = None

# Service Models
class ServiceBase(BaseModel):
    name: str
    description: str
    duration_minutes: int
    base_price: float
    category: str

class ServiceCreate(ServiceBase):
    pass

class Service(BaseDocument, ServiceBase):
    is_active: bool = True
    image_url: Optional[str] = None

# Therapist Models
class TherapistBase(BaseModel):
    user_id: str
    specialties: List[str]
    experience_years: int
    certifications: List[str]
    languages: List[str]
    service_areas: List[str]
    bio: Optional[str] = None
    hourly_rate: float

class TherapistCreate(TherapistBase):
    # Additional fields for application
    license_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    equipment_owned: List[str] = []
    availability: Optional[Dict[str, Any]] = {}
    references: List[str] = []
    portfolio_images: List[str] = []

class TherapistApplication(BaseDocument):
    # Personal Information
    full_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    zip_code: str
    
    # Professional Information
    experience_years: int
    certifications: str
    specialties: str
    license_number: Optional[str] = None
    insurance_provider: Optional[str] = None
    
    # Work Details
    service_areas: str
    availability: str
    transportation: str
    equipment_owned: str
    languages: str
    
    # References
    references: str
    portfolio_url: Optional[str] = None
    
    # Background
    background_check: bool = False
    motivation: str
    expectations: str
    
    # Application Status
    status: TherapistStatus = TherapistStatus.PENDING
    admin_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None

class Therapist(BaseDocument, TherapistBase):
    status: TherapistStatus = TherapistStatus.PENDING
    rating: float = 0.0
    total_bookings: int = 0
    profile_image: Optional[str] = None
    gallery_images: List[str] = []
    reviews_count: int = 0
    is_available: bool = True
    last_active: Optional[datetime] = None

class TherapistPublic(BaseModel):
    id: str
    user_id: str
    full_name: str
    specialties: List[str]
    experience_years: int
    service_areas: List[str]
    bio: Optional[str] = None
    hourly_rate: float
    rating: float
    reviews_count: int
    profile_image: Optional[str] = None
    gallery_images: List[str]
    is_available: bool
    created_at: datetime

# Booking Models
class BookingBase(BaseModel):
    client_id: str
    therapist_id: str
    service_id: str
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    location_address: str
    location_city: str
    location_state: str
    location_zip: str
    special_requests: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class Booking(BaseDocument, BookingBase):
    status: BookingStatus = BookingStatus.PENDING
    total_amount: float
    payment_status: PaymentStatus = PaymentStatus.PENDING
    stripe_payment_intent_id: Optional[str] = None
    cancellation_reason: Optional[str] = None
    completed_at: Optional[datetime] = None
    therapist_notes: Optional[str] = None
    client_notes: Optional[str] = None

class BookingResponse(BaseDocument, BookingBase):
    status: BookingStatus
    total_amount: float
    payment_status: PaymentStatus
    therapist_name: Optional[str] = None
    service_name: Optional[str] = None

# Review Models
class ReviewBase(BaseModel):
    booking_id: str
    client_id: str
    therapist_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(BaseDocument, ReviewBase):
    is_verified: bool = False
    helpful_count: int = 0

class ReviewResponse(BaseDocument, ReviewBase):
    client_name: str
    created_at: datetime

# Payment Models
class PaymentIntent(BaseModel):
    booking_id: str
    amount: float
    currency: str = "usd"

class PaymentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str

# Admin Models
class AdminStats(BaseModel):
    total_users: int
    total_therapists: int
    total_bookings: int
    total_revenue: float
    pending_applications: int
    active_bookings: int

# Notification Models
class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    type: str
    data: Optional[Dict[str, Any]] = {}

class Notification(BaseDocument, NotificationBase):
    is_read: bool = False
    read_at: Optional[datetime] = None

# Search Models
class TherapistSearch(BaseModel):
    city: Optional[str] = None
    specialties: Optional[List[str]] = None
    min_rating: Optional[float] = None
    max_price: Optional[float] = None
    availability_date: Optional[date] = None
    service_type: Optional[str] = None

# File Upload Models
class FileUpload(BaseModel):
    filename: str
    file_type: str
    file_size: int
    file_url: str

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None