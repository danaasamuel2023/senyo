const mongoose = require('mongoose');
const { DataInventory } = require('../schema/schema');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const testToggle = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing toggle functionality...\n');
    
    // Test 1: Toggle YELLO stock status
    console.log('1️⃣ Testing YELLO stock toggle...');
    let yellOItem = await DataInventory.findOne({ network: 'YELLO' });
    console.log(`   Before: inStock = ${yellOItem.inStock}`);
    
    // Simulate toggle
    yellOItem.inStock = !yellOItem.inStock;
    yellOItem.updatedAt = new Date();
    await yellOItem.save();
    
    console.log(`   After: inStock = ${yellOItem.inStock}`);
    
    // Test 2: Toggle TELECEL API status
    console.log('\n2️⃣ Testing TELECEL API toggle...');
    let telecelItem = await DataInventory.findOne({ network: 'TELECEL' });
    console.log(`   Before: skipGeonettech = ${telecelItem.skipGeonettech}`);
    
    // Simulate toggle
    telecelItem.skipGeonettech = !telecelItem.skipGeonettech;
    telecelItem.updatedAt = new Date();
    await telecelItem.save();
    
    console.log(`   After: skipGeonettech = ${telecelItem.skipGeonettech}`);
    
    // Display final status
    console.log('\n📊 Final Inventory Status:');
    const allInventory = await DataInventory.find({}).sort({ network: 1 });
    allInventory.forEach(item => {
      console.log(`${item.network}: Stock=${item.inStock ? '✅' : '❌'}, API=${item.skipGeonettech ? '❌' : '✅'}`);
    });
    
    console.log('\n🎉 Toggle test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing toggle:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

testToggle();
