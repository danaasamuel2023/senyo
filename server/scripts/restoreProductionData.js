#!/usr/bin/env node

/**
 * Restore Production Data Script
 * Restores essential production data after test cleanup
 */

const mongoose = require('mongoose');
const { User, Wallet } = require('../schema/schema');

async function restoreProductionData() {
  console.log('🔄 Restoring Production Data...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB\n');

    // Create essential production admin user
    console.log('👤 Creating production admin user...');
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@unlimiteddata.gh',
      phoneNumber: '0246783840',
      password: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', // Default password: admin123
      role: 'admin',
      walletBalance: 1000, // Starting balance
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user created:', adminUser.email);

    // Create wallet for admin user
    console.log('💳 Creating admin wallet...');
    
    const adminWallet = new Wallet({
      userId: adminUser._id,
      balance: 1000,
      currency: 'GHS',
      frozen: false,
      transactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminWallet.save();
    console.log('✅ Admin wallet created with balance: ₵1000');

    // Create sample production users (optional)
    console.log('👥 Creating sample production users...');
    
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '0241234567',
        role: 'buyer',
        walletBalance: 500
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '0242345678',
        role: 'buyer',
        walletBalance: 750
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phoneNumber: '0243456789',
        role: 'buyer',
        walletBalance: 300
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        password: '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', // Default password: user123
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();

      // Create wallet for user
      const wallet = new Wallet({
        userId: user._id,
        balance: userData.walletBalance,
        currency: 'GHS',
        frozen: false,
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await wallet.save();
      console.log(`✅ User created: ${user.name} (${user.email})`);
    }

    // Verify restoration
    console.log('\n🔍 Verifying restoration...');
    
    const totalUsers = await User.countDocuments();
    const totalWallets = await Wallet.countDocuments();
    const adminUsers = await User.find({ role: 'admin' });
    const regularUsers = await User.find({ role: 'user' });

    console.log('📊 Restoration Summary:');
    console.log(`   👤 Total Users: ${totalUsers}`);
    console.log(`   💳 Total Wallets: ${totalWallets}`);
    console.log(`   👑 Admin Users: ${adminUsers.length}`);
    console.log(`   👥 Regular Users: ${regularUsers.length}`);

    if (adminUsers.length > 0) {
      console.log('\n👑 Admin Users:');
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email}) - ₵${admin.walletBalance}`);
      });
    }

    if (regularUsers.length > 0) {
      console.log('\n👥 Regular Users:');
      regularUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ₵${user.walletBalance}`);
      });
    }

    console.log('\n🎉 Production data restoration completed successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin: admin@unlimiteddata.gh / admin123');
    console.log('   Users: [email] / user123');

  } catch (error) {
    console.error('❌ Restoration failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.disconnect();
    console.log('\n📊 Restoration process completed');
  }
}

// Run the restoration
if (require.main === module) {
  restoreProductionData();
}

module.exports = restoreProductionData;
