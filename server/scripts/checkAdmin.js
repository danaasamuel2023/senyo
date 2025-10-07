// Script to check if admin user exists and verify credentials
// Run with: node server/scripts/checkAdmin.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
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

// Check admin user
const checkAdminUser = async () => {
  try {
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('+password');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database!');
      console.log('   Run createAdmin.js or createFirstAdmin.js to create one.');
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);

    for (const admin of adminUsers) {
      console.log('═══════════════════════════════════════════');
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Phone: ${admin.phoneNumber}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Approved: ${admin.approvalStatus}`);
      console.log(`Verified: ${admin.isVerified}`);
      console.log(`Disabled: ${admin.isDisabled || false}`);
      console.log(`Created: ${admin.createdAt}`);
      
      // Test password for the specific admin we just created
      if (admin.email === 'sunumanfred14@gmail.com') {
        const testPassword = 'Kingfred4190$';
        const isValid = await bcrypt.compare(testPassword, admin.password);
        console.log(`\n🔐 Password test for ${admin.email}:`);
        console.log(`   Password is ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
          console.log('   The password might have been changed or there was an issue during creation.');
        }
      }
      
      if (admin.adminMetadata) {
        console.log(`\n📋 Admin Permissions:`);
        console.log(`   Can Approve Users: ${admin.adminMetadata.canApproveUsers}`);
        console.log(`   Can Manage Pricing: ${admin.adminMetadata.canManagePricing}`);
        console.log(`   Can Access Reports: ${admin.adminMetadata.canAccessReports}`);
        if (admin.adminMetadata.permissions && admin.adminMetadata.permissions.length > 0) {
          console.log(`   Permissions: ${admin.adminMetadata.permissions.join(', ')}`);
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('\n💡 Tips:');
    console.log('   - Make sure your backend server is running on port 5000');
    console.log('   - Use the email and password shown above to login');
    console.log('   - The admin panel URL is: http://localhost:3000/admin/dashboard');
    console.log('   - Check browser console for any error messages');
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await checkAdminUser();
  
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
