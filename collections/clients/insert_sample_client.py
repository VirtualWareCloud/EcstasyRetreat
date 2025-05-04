import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
clients_collection = db["clients"]

sample_client = {
    "fullName": "Michael Johnson",
    "email": "michael.johnson@gmail.com",
    "whatsappNumber": "+27734567890",
    "address": {
        "country": "South Africa",
        "city": "Pretoria",
        "suburb": "Menlyn"
    },
    "createdAt": datetime.now(timezone.utc),
    "updatedAt": datetime.now(timezone.utc)
}

result = clients_collection.insert_one(sample_client)
print(f"✅ Sample client inserted with _id: {result.inserted_id}")