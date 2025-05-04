import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
appointments_collection = db["appointments"]

def update_appointment_amount(appointment_id, new_amount):
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"amount": new_amount}}
    )
    return result.modified_count

if __name__ == "__main__":
    appointment_id = "ENTER_VALID_APPOINTMENT_OBJECT_ID_HERE"
    new_amount = 750.00
    modified = update_appointment_amount(appointment_id, new_amount)
    print(f"✅ Number of documents updated: {modified}")