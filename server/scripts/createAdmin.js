// Script to create an admin user
// Run this script with: node server/scripts/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
const { User } = require('../schema/schema');

// MongoDB connection
const connectDB = async () => {
  try {
    const password = '0246783840Sa';
    const uri = `mongodb+srv://dajounimarket:${password}@cluster0.kp8c2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Generate Unique Referral Code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Create admin user
const createAdminUser = async () => {
  try {
    // Admin details - CHANGE THESE!
    const adminDetails = {
      name: 'Admin User',
      email: 'sunumanfred14@gmail.com',
      password: 'Kingfred4190$', // CHANGE THIS PASSWORD!
      phoneNumber: '+233204120633', // CHANGE THIS PHONE NUMBER!
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminDetails.email }, 
        { phoneNumber: adminDetails.phoneNumber },
        { role: 'admin' }
      ] 
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Ask if they want to update the existing user to admin
      if (existingAdmin.role !== 'admin') {
        console.log('\n📌 This user exists but is not an admin.');
        console.log('   To make them admin, update their role in the database.');
      }
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminDetails.password, salt);

    // Create new admin user
    const adminUser = new User({
      name: adminDetails.name,
      email: adminDetails.email,
      password: hashedPassword,
      phoneNumber: adminDetails.phoneNumber,
      role: 'admin',
      referralCode: generateReferralCode(),
      approvalStatus: 'approved',
      isVerified: true,
      walletBalance: 0,
      adminMetadata: {
        permissions: [
          'manage_users',
          'manage_orders',
          'manage_inventory',
          'manage_reports',
          'manage_settings',
          'view_analytics',
          'process_payments',
          'handle_refunds'
        ],
        canApproveUsers: true,
        canManagePricing: true,
        canAccessReports: true
      }
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   Email: ${adminDetails.email}`);
    console.log(`   Password: ${adminDetails.password}`);
    console.log(`   Phone: ${adminDetails.phoneNumber}`);
    console.log(`   Role: admin`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createAdminUser();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed.');
  process.exit(0);
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
