import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
therapists_collection = db["therapists"]

def update_therapist_email(therapist_id, new_email):
    result = therapists_collection.update_one(
        {"_id": ObjectId(therapist_id)},
        {"$set": {"email": new_email}}
    )
    return result.modified_count

if __name__ == "__main__":
    therapist_id = "ENTER_VALID_THERAPIST_OBJECT_ID_HERE"
    new_email = "updated.email@example.com"
    modified = update_therapist_email(therapist_id, new_email)
    print(f"✅ Number of documents updated: {modified}")