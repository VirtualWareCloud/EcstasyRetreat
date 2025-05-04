from flask import Flask
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)
db = client.get_database("EcstasyRetreatDB")

@app.route('/')
def home():
    return "Ecstasy Retreat Backend is Running!"

if __name__ == '__main__':
    app.run(debug=True)