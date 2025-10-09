const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ConnectDB = () => {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;

    // Connection options for better performance and reliability
    const options = {
        maxPoolSize: 5, // Reduce pool size to avoid timeouts
        serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
        socketTimeoutMS: 30000, // Reduce socket timeout to 30 seconds
        connectTimeoutMS: 10000, // Add connection timeout
        bufferCommands: false, // Disable mongoose buffering to prevent timeouts
        retryWrites: true,
        w: 'majority'
    };

    mongoose.connect(uri, options).then(() => {
        console.log('MongoDB connected with optimized settings');
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

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
