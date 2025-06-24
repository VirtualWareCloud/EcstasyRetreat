from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import database functions
from .database import startup_db_client, shutdown_db_client

# Import routers
from .routers.auth_router import router as auth_router
from .routers.therapist_router import router as therapist_router
from .routers.booking_router import router as booking_router
from .routers.payment_router import router as payment_router
from .routers.service_router import router as service_router
from .routers.admin_router import router as admin_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="Ecstasy Retreat API",
    description="Mobile Massage Therapy Booking Platform",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Basic health check routes
@api_router.get("/")
async def root():
    return {"message": "Ecstasy Retreat API - Mobile Massage Therapy Platform"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Ecstasy Retreat API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(therapist_router)
api_router.include_router(booking_router)
api_router.include_router(payment_router)
api_router.include_router(service_router)
api_router.include_router(admin_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize the database connection and default data."""
    await startup_db_client()
    logger.info("Ecstasy Retreat API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection."""
    await shutdown_db_client()
    logger.info("Ecstasy Retreat API shutdown completed")
