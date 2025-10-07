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
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: true, // Enable mongoose buffering
        useNewUrlParser: false, // Deprecated option removed
        useUnifiedTopology: false, // Deprecated option removed
    };

    mongoose.connect(uri, options).then(() => {
        console.log('MongoDB connected with optimized settings');
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });
}

module.exports = ConnectDB;
