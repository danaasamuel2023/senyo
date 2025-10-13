// Script to remove unique constraint from phoneNumber field
// Run with: node server/scripts/removePhoneUniqueIndex.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { handleDatabaseError, handleScriptError, setupGlobalErrorHandlers } = require('../utils/databaseErrorHandler');

dotenv.config();

// Setup global error handlers
setupGlobalErrorHandlers();

const removePhoneUniqueIndex = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const database = process.env.MONGODB_DATABASE || 'unlimiteddata';
    const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log('MongoDB Connected...');

    // Get the User collection
    const db = mongoose.connection.db;
    const collection = db.collection('userdataunlimiteds');

    // List all indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    // Drop the unique index on phoneNumber if it exists
    try {
      await collection.dropIndex('phoneNumber_1');
      console.log('✅ Successfully dropped unique index on phoneNumber');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  No unique index found on phoneNumber (already removed)');
      } else {
        console.log('❌ Error dropping index:', error.message);
      }
    }

    // Verify indexes after removal
    console.log('\nIndexes after removal:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

  } catch (error) {
    handleScriptError(error, 'Remove Phone Unique Index');
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n👋 Database connection closed.');
    } catch (disconnectError) {
      console.error('⚠️  Warning: Error disconnecting from MongoDB:', disconnectError.message);
    }
    process.exit(0);
  }
};

// Run the script
removePhoneUniqueIndex().catch(err => {
  handleScriptError(err, 'Remove Phone Unique Index Script');
});
