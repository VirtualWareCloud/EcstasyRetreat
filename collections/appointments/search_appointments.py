import os
from pymongo import MongoClient
from dotenv import load_dotenv

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
appointments_collection = db["appointments"]

def find_appointments_by_city(city):
    return appointments_collection.find({"clientLocation.city": city})

if __name__ == "__main__":
    city = "Johannesburg"
    appointments = find_appointments_by_city(city)
    for appointment in appointments:
        print(appointment)