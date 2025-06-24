from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import os
from datetime import datetime

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return db.database

async def connect_to_mongo():
    """Create database connection."""
    db.client = AsyncIOMotorClient(mongo_url)
    db.database = db.client[db_name]
    
    # Create indexes for better performance
    await create_indexes()

async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()

async def create_indexes():
    """Create database indexes for better performance."""
    if not db.database:
        return
    
    # Users collection indexes
    await db.database.users.create_index("email", unique=True)
    await db.database.users.create_index("phone")
    await db.database.users.create_index("role")
    
    # Therapists collection indexes
    await db.database.therapists.create_index("user_id", unique=True)
    await db.database.therapists.create_index("status")
    await db.database.therapists.create_index("rating")
    await db.database.therapists.create_index("service_areas")
    await db.database.therapists.create_index("specialties")
    
    # Bookings collection indexes
    await db.database.bookings.create_index("client_id")
    await db.database.bookings.create_index("therapist_id")
    await db.database.bookings.create_index("appointment_date")
    await db.database.bookings.create_index("status")
    await db.database.bookings.create_index([("appointment_date", 1), ("appointment_time", 1)])
    
    # Reviews collection indexes
    await db.database.reviews.create_index("therapist_id")
    await db.database.reviews.create_index("client_id")
    await db.database.reviews.create_index("booking_id", unique=True)
    
    # Services collection indexes
    await db.database.services.create_index("category")
    await db.database.services.create_index("is_active")
    
    # Therapist applications collection indexes
    await db.database.therapist_applications.create_index("email")
    await db.database.therapist_applications.create_index("status")
    await db.database.therapist_applications.create_index("created_at")
    
    # Notifications collection indexes
    await db.database.notifications.create_index("user_id")
    await db.database.notifications.create_index("is_read")
    await db.database.notifications.create_index("created_at")

async def init_default_data():
    """Initialize default data."""
    if not db.database:
        return
    
    # Create default services
    default_services = [
        {
            "id": "swedish-massage",
            "name": "Swedish Massage",
            "description": "Classic relaxation massage with gentle, flowing strokes to ease tension and promote relaxation.",
            "duration_minutes": 60,
            "base_price": 120.0,
            "category": "Relaxation",
            "is_active": True,
            "image_url": "https://images.pexels.com/photos/7544430/pexels-photo-7544430.jpeg",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "deep-tissue-massage",
            "name": "Deep Tissue Massage",
            "description": "Therapeutic massage targeting deep muscle layers to relieve chronic tension and pain.",
            "duration_minutes": 60,
            "base_price": 150.0,
            "category": "Therapeutic",
            "is_active": True,
            "image_url": "https://images.pexels.com/photos/6075005/pexels-photo-6075005.jpeg",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "hot-stone-massage",
            "name": "Hot Stone Massage",
            "description": "Heated stones combined with massage techniques for ultimate relaxation and muscle relief.",
            "duration_minutes": 90,
            "base_price": 180.0,
            "category": "Luxury",
            "is_active": True,
            "image_url": "https://images.pexels.com/photos/360209/pexels-photo-360209.jpeg",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "aromatherapy-massage",
            "name": "Aromatherapy Massage",
            "description": "Essential oils enhance your massage experience for mind-body wellness.",
            "duration_minutes": 60,
            "base_price": 160.0,
            "category": "Wellness",
            "is_active": True,
            "image_url": "https://images.pexels.com/photos/139396/lavender-flowers-blue-flowers-purple-139396.jpeg",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "couples-massage",
            "name": "Couples Massage",
            "description": "Side-by-side massage experience for two people in a romantic setting.",
            "duration_minutes": 60,
            "base_price": 300.0,
            "category": "Special",
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1703980467952-760bcd0e464a",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Insert services if they don't exist
    for service in default_services:
        existing = await db.database.services.find_one({"id": service["id"]})
        if not existing:
            await db.database.services.insert_one(service)

# Database event handlers for FastAPI
async def startup_db_client():
    """Startup database connection."""
    await connect_to_mongo()
    await init_default_data()

async def shutdown_db_client():
    """Shutdown database connection."""
    await close_mongo_connection()