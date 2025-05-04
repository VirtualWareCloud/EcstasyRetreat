// Install dependencies first:
// npm install mongodb dotenv

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Load credentials and encode them
const mongoUser = encodeURIComponent(process.env.MONGO_USER);
const mongoPassword = encodeURIComponent(process.env.MONGO_PASSWORD);
const mongoHost = 'vwcdb1.leqev.mongodb.net';
const database = 'EcstasyRetreatDB'; // You can change this if needed

// Build the MongoDB connection URI
const mongoURI = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoHost}/${database}?retryWrites=true&w=majority&appName=VWCDB1`;

// Function to connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');
        return client;
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

// Export the function for reuse
module.exports = connectToMongoDB;

// If this file is run directly, test the connection immediately
if (require.main === module) {
    connectToMongoDB();
}
