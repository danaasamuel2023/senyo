// Script to update existing user to admin role
// Run with: node server/scripts/updateToAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import User model
const { User } = require('../schema/schema');

// MongoDB connection
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
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Update user to admin
const updateUserToAdmin = async () => {
  try {
    const email = 'sunumanfred14@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }

    console.log('📋 Current user details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Phone: ${user.phoneNumber}`);

    // Update to admin
    user.role = 'admin';
    user.approvalStatus = 'approved';
    user.isVerified = true;
    
    // Add admin metadata
    user.adminMetadata = {
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
      canAccessReports: true,
      adminNotes: 'Updated to admin via script'
    };

    await user.save();

    console.log('\n✅ User successfully updated to admin!');
    console.log('\n📋 Updated Details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Approved: ${user.approvalStatus}`);
    console.log(`   Verified: ${user.isVerified}`);
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: Kingfred4190$`);
    console.log('\n🌐 Admin Panel URL: http://localhost:3000/admin/dashboard');
    console.log('\n⚠️  Make sure your backend server is running on port 5000!');
    
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await updateUserToAdmin();
  
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
