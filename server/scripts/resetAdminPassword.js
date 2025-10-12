#!/usr/bin/env node

/**
 * Reset Admin Password Script
 * Resets the password for an existing admin user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../schema/schema');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

async function resetAdminPassword() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminEmail = 'sunumanfred14@gmail.com';
    const newPassword = 'admin123'; // Simple password for testing
    
    console.log(`🔍 Looking for admin user: ${adminEmail}`);
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.name);
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    
    // Hash new password
    console.log('\n🔐 Resetting password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Password reset successfully!');
    console.log('\n📋 New Admin Login Details:');
    console.log('═══════════════════════════════════════');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: admin`);
    console.log('═══════════════════════════════════════');
    console.log('\n🌐 Admin Panel URL: http://localhost:3000/admin/dashboard');
    console.log('\n⚠️  IMPORTANT: Please save these credentials securely!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
}

// Run the script
console.log('🚀 UnlimitedData GH - Admin Password Reset Script');
console.log('═══════════════════════════════════════════\n');

resetAdminPassword();
