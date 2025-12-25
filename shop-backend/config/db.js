const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sd_jewels';

        if (process.env.USE_MEMORY_DB && process.env.USE_MEMORY_DB.trim() === 'true') {
            console.log('Starting In-Memory MongoDB...');
            const mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`In-Memory MongoDB started at: ${uri}`);
        } else {
            console.log('Using Local MongoDB:', process.env.USE_MEMORY_DB);
        }

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
