const mongoose = require('mongoose');
const { Transaction } = require('../schema/schema');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '0246783840Sa';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const database = process.env.MONGODB_DATABASE || 'unlimiteddata';
    const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority&appName=Cluster0`;
    
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

// Check transaction status
const checkTransactionStatus = async () => {
  try {
    console.log('🔍 Checking Transaction Status\n');
    
    const reference = 'DEP-26d4a128ba6c68c54e38-1760011267939';
    
    // Find the transaction
    const transaction = await Transaction.findOne({ reference });
    
    if (!transaction) {
      console.log(`❌ Transaction not found: ${reference}`);
      return;
    }
    
    console.log(`📊 Transaction Details:`);
    console.log(`   Reference: ${transaction.reference}`);
    console.log(`   Status: ${transaction.status}`);
    console.log(`   Amount: GHS ${transaction.amount}`);
    console.log(`   Gateway: ${transaction.gateway}`);
    console.log(`   Processing: ${transaction.processing}`);
    console.log(`   Created: ${transaction.createdAt}`);
    console.log(`   Updated: ${transaction.updatedAt}`);
    
    if (transaction.metadata && transaction.metadata.paystackVerification) {
      console.log(`\n📋 Paystack Verification:`);
      console.log(`   Status: ${transaction.metadata.paystackVerification.status}`);
      console.log(`   Gateway Response: ${transaction.metadata.paystackVerification.gateway_response}`);
      console.log(`   Amount: ${transaction.metadata.paystackVerification.amount} pesewas`);
      console.log(`   Paid At: ${transaction.metadata.paystackVerification.paid_at}`);
    }
    
    // Check all recent transactions for this user
    console.log(`\n📊 Recent transactions for user ${transaction.userId}:`);
    const recentTransactions = await Transaction.find({ userId: transaction.userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentTransactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.reference} - ${tx.status} - GHS ${tx.amount} - ${tx.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
};

// Run the check
connectDB().then(() => {
  checkTransactionStatus();
});
