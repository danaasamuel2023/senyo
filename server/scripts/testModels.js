const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, DataPurchase } = require('../schema/schema');

dotenv.config();

const testModels = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log('User model working, count:', userCount);
    
    // Test DataPurchase model
    const purchaseCount = await DataPurchase.countDocuments();
    console.log('DataPurchase model working, count:', purchaseCount);
    
    console.log('All models are working correctly!');
    
  } catch (error) {
    console.error('Error testing models:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

testModels();
