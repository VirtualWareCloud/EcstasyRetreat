import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
therapists_collection = db["therapists"]

sample_therapist = {
    "fullName": "Samantha Rivera",
    "email": "samantha.rivera@gmail.com",
    "whatsappNumber": "+27711234567",
    "profilePictureUrl": "https://example.com/images/samantha.jpg",
    "specialty": "Swedish Massage",
    "description": "Experienced therapist specializing in Swedish techniques for stress relief.",
    "address": {
        "country": "South Africa",
        "city": "Johannesburg",
        "suburb": "Sandton"
    },
    "services": [
        {"serviceName": "Swedish Massage - 60 Minutes", "price": 700.00},
        {"serviceName": "Deep Tissue Massage - 90 Minutes", "price": 950.00}
    ],
    "availabilitySchedule": [
        {"day": "Monday", "time": "10:00 - 16:00"},
        {"day": "Wednesday", "time": "12:00 - 18:00"}
    ],
    "createdAt": datetime.now(timezone.utc),
    "updatedAt": datetime.now(timezone.utc)
}

result = therapists_collection.insert_one(sample_therapist)
print(f"✅ Sample therapist inserted with _id: {result.inserted_id}")