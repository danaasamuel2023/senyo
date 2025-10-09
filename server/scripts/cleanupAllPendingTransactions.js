const mongoose = require('mongoose');
const { Transaction } = require('../schema/schema');

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

// Cleanup ALL pending transactions for a specific user
const cleanupAllPendingTransactions = async (userId) => {
  try {
    console.log(`🧹 Starting cleanup of ALL pending transactions for user: ${userId}...`);
    
    const pendingTransactions = await Transaction.find({
      userId: userId,
      status: 'pending'
    });
    
    console.log(`📊 Found ${pendingTransactions.length} pending transactions for user`);
    
    if (pendingTransactions.length === 0) {
      console.log('✅ No pending transactions to clean up');
      return;
    }
    
    // Update them to 'failed' status
    const result = await Transaction.updateMany(
      {
        userId: userId,
        status: 'pending'
      },
      {
        $set: {
          status: 'failed',
          failureReason: 'Transaction cleanup - resolved 429 error',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} transactions to 'failed' status`);
    
    // Show summary
    console.log('\n📋 Summary of cleaned transactions:');
    pendingTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.reference} - ₵${tx.amount} - ${tx.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up transactions:', error.message);
  }
};

// Main execution
const main = async () => {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Please provide a user ID as an argument');
    console.log('Usage: node cleanupAllPendingTransactions.js <userId>');
    process.exit(1);
  }
  
  await connectDB();
  await cleanupAllPendingTransactions(userId);
  
  console.log('\n🎉 Cleanup completed successfully!');
  console.log('💡 User can now make new deposits without 429 errors');
  
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the script
main();
