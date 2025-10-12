const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ConnectDB = async () => {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const database = process.env.MONGODB_DATABASE || 'unlimiteddata';
    const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority&appName=Cluster0`;

    // Connection options for better performance and reliability
    const options = {
        maxPoolSize: 50, // Increased for high traffic (10M users/day)
        serverSelectionTimeoutMS: 5000, // Reduced for faster failover
        socketTimeoutMS: 45000, // Increased for better reliability
        connectTimeoutMS: 10000, // Connection timeout
        bufferCommands: true, // Enable buffering to prevent connection issues
        bufferTimeoutMS: 5000, // Reduced buffer timeout
        retryWrites: true,
        w: 'majority',
        // Additional performance optimizations
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        minPoolSize: 10, // Maintain minimum connections
        maxIdleTimeMS: 30000
    };

    try {
        await mongoose.connect(uri, options);
        console.log('MongoDB connected with optimized settings');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }

    // Add connection event listeners for better monitoring (only once)
    if (!mongoose.connection.listeners('connected').length) {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
    }

    // Handle process termination
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
}

module.exports = ConnectDB;
