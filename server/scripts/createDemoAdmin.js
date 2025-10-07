const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../schema/schema').User;

dotenv.config();

// Connect to MongoDB using the same connection as the main server
const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create demo admin user
const createDemoAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@unlimiteddata.gh' });
    if (existingAdmin) {
      console.log('Demo admin user already exists');
      console.log('Email: admin@unlimiteddata.gh');
      console.log('Password: admin123');
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@unlimiteddata.gh',
      password: hashedPassword,
      role: 'admin',
      phoneNumber: '+233123456789',
      isVerified: true,
      walletBalance: 10000,
      createdAt: new Date()
    });
    
    await adminUser.save();
    
    console.log('Demo admin user created successfully!');
    console.log('Email: admin@unlimiteddata.gh');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating demo admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

createDemoAdmin();
