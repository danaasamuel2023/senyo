// MongoDB script to create the first admin user directly
// This script can be run when there are NO admin users in the system
// Run with: node server/scripts/createFirstAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection string
const username = process.env.MONGODB_USERNAME || 'dajounimarket';
const password = process.env.MONGODB_PASSWORD || '';
const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';

const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;

// User Schema Definition (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phoneNumber: String,
  role: String,
  referralCode: String,
  approvalStatus: String,
  isVerified: Boolean,
  walletBalance: Number,
  adminMetadata: {
    permissions: [String],
    canApproveUsers: Boolean,
    canManagePricing: Boolean,
    canAccessReports: Boolean,
    adminNotes: String
  }
});

const User = mongoose.model('Userdataunlimited', userSchema);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt function
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Generate referral code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Main function
async function createFirstAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists in the system!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}\n`);
      
      const proceed = await prompt('Do you want to create another admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes') {
        console.log('❌ Admin creation cancelled.');
        process.exit(0);
      }
    }

    console.log('📝 Please enter the details for the new admin user:\n');

    // Get admin details
    const name = await prompt('Name: ');
    const email = await prompt('Email: ');
    const password = await prompt('Password (min 8 characters): ');
    const phoneNumber = await prompt('Phone Number (with country code, e.g., +233501234567): ');

    // Validate inputs
    if (!name || !email || !password || !phoneNumber) {
      throw new Error('All fields are required!');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters!');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format!');
    }

    // Check if email already exists (only email needs to be unique)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('A user with this email already exists!');
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
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
        canAccessReports: true,
        adminNotes: 'Initial admin user created via script'
      }
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Login Details:');
    console.log('═══════════════════════════════════════');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: admin`);
    console.log('═══════════════════════════════════════');
    console.log('\n🌐 Admin Panel URL: http://localhost:3000/admin/dashboard');
    console.log('\n⚠️  IMPORTANT: Please save these credentials securely!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
}

// Run the script
console.log('🚀 UnlimitedData GH - Admin Creation Script');
console.log('═══════════════════════════════════════════\n');
createFirstAdmin();
