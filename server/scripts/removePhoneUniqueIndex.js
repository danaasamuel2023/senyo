// Script to remove unique constraint from phoneNumber field
// Run with: node server/scripts/removePhoneUniqueIndex.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const removePhoneUniqueIndex = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(uri);
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
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
};

// Run the script
removePhoneUniqueIndex().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
