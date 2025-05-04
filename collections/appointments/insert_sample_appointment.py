import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson import ObjectId

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
appointments_collection = db["appointments"]

sample_appointment = {
    "therapistId": ObjectId("ENTER_VALID_THERAPIST_OBJECT_ID_HERE"),
    "clientName": "John Doe",
    "clientEmail": "john.doe@example.com",
    "clientWhatsappNumber": "+27723456789",
    "serviceBooked": "Swedish Massage - 60 Minutes",
    "appointmentDateTime": datetime(2025, 5, 6, 15, 0, tzinfo=timezone.utc),
    "amount": 700.00,
    "currency": "ZAR",
    "clientLocation": {
        "country": "South Africa",
        "city": "Johannesburg",
        "suburb": "Rosebank"
    },
    "createdAt": datetime.now(timezone.utc),
    "updatedAt": datetime.now(timezone.utc)
}

result = appointments_collection.insert_one(sample_appointment)
print(f"✅ Sample appointment inserted with _id: {result.inserted_id}")