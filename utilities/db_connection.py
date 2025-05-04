import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../config/.env'))
load_dotenv(dotenv_path)

def get_database():
    MONGO_URI = os.getenv("MONGODB_URI")
    if not MONGO_URI:
        raise ValueError("MONGODB_URI not found in environment variables.")

    client = MongoClient(MONGO_URI)
    return client["EcstasyRetreatDB"]

# Quick test if run directly
if __name__ == "__main__":
    try:
        db = get_database()
        print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Connection error: {e}")