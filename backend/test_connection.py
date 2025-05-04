import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Correctly load the .env file from the config folder
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../config/.env'))
load_dotenv(dotenv_path)

def test_mongo_connection():
    try:
        MONGO_URI = os.getenv("MONGODB_URI")
        if not MONGO_URI:
            raise ValueError("MONGODB_URI not found in environment variables.")
        
        client = MongoClient(MONGO_URI)
        # Check connection by pinging the server
        client.admin.command('ping')
        print("✅ MongoDB Connected Successfully!")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_mongo_connection()
