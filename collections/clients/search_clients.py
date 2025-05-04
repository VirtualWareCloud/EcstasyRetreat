import os
from pymongo import MongoClient
from dotenv import load_dotenv

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../config/.env'))
load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client["EcstasyRetreatDB"]
clients_collection = db["clients"]

def find_clients_by_city(city):
    return clients_collection.find({"address.city": city})

if __name__ == "__main__":
    city = "Pretoria"
    clients = find_clients_by_city(city)
    for client in clients:
        print(client)