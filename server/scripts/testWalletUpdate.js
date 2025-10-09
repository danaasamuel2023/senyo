const mongoose = require('mongoose');
const { User, Transaction } = require('../schema/schema');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '0246783840Sa';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test wallet balance update
const testWalletUpdate = async () => {
  try {
    console.log('🧪 Testing Wallet Balance Update\n');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'sunumanfred14@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log(`👤 Admin User: ${adminUser.name} (${adminUser.email})`);
    console.log(`💰 Current wallet balance: GHS ${adminUser.walletBalance}`);
    
    // Find a completed transaction for this user
    const completedTransaction = await Transaction.findOne({
      userId: adminUser._id,
      status: 'completed',
      type: 'deposit'
    }).sort({ createdAt: -1 });
    
    if (completedTransaction) {
      console.log(`\n📊 Latest completed transaction:`);
      console.log(`   Reference: ${completedTransaction.reference}`);
      console.log(`   Amount: GHS ${completedTransaction.amount}`);
      console.log(`   Status: ${completedTransaction.status}`);
      console.log(`   Created: ${completedTransaction.createdAt}`);
      
      // Check if wallet balance matches expected amount
      const expectedBalance = adminUser.walletBalance;
      console.log(`\n✅ Wallet balance verification:`);
      console.log(`   Current balance: GHS ${expectedBalance}`);
      console.log(`   Transaction amount: GHS ${completedTransaction.amount}`);
      
      if (expectedBalance >= completedTransaction.amount) {
        console.log(`   ✅ Wallet balance appears to be updated correctly`);
      } else {
        console.log(`   ⚠️ Wallet balance might not be updated correctly`);
      }
    } else {
      console.log(`\n📊 No completed transactions found for this user`);
    }
    
    // Test a small balance update
    console.log(`\n🧪 Testing manual wallet update...`);
    const previousBalance = adminUser.walletBalance;
    adminUser.walletBalance += 1; // Add 1 GHS for testing
    await adminUser.save();
    
    console.log(`   Previous balance: GHS ${previousBalance}`);
    console.log(`   New balance: GHS ${adminUser.walletBalance}`);
    console.log(`   ✅ Manual wallet update successful`);
    
    // Revert the test change
    adminUser.walletBalance = previousBalance;
    await adminUser.save();
    console.log(`   🔄 Reverted test change`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
};

// Run the test
connectDB().then(() => {
  testWalletUpdate();
});
