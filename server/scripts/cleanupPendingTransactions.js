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

// Cleanup old pending transactions
const cleanupPendingTransactions = async () => {
  try {
    console.log('🧹 Starting cleanup of old pending transactions...');
    
    // Find transactions older than 30 minutes that are still pending
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const oldPendingTransactions = await Transaction.find({
      status: 'pending',
      createdAt: { $lt: thirtyMinutesAgo }
    });
    
    console.log(`📊 Found ${oldPendingTransactions.length} old pending transactions`);
    
    if (oldPendingTransactions.length === 0) {
      console.log('✅ No old pending transactions to clean up');
      return;
    }
    
    // Update them to 'failed' status
    const result = await Transaction.updateMany(
      {
        status: 'pending',
        createdAt: { $lt: thirtyMinutesAgo }
      },
      {
        $set: {
          status: 'failed',
          failureReason: 'Transaction timeout - cleaned up by system',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} transactions to 'failed' status`);
    
    // Show summary
    console.log('\n📋 Summary of cleaned transactions:');
    oldPendingTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.reference} - ₵${tx.amount} - ${tx.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error cleaning up transactions:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await cleanupPendingTransactions();
  
  console.log('\n🎉 Cleanup completed successfully!');
  console.log('💡 Users can now make new deposits without 429 errors');
  
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the script
main();
