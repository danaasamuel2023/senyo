const mongoose = require('mongoose');
const { DataInventory } = require('../schema/schema');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB using the same method as the main server
const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const database = process.env.MONGODB_DATABASE || 'unlimiteddata';
    const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority&appName=Cluster0`;
    
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const initializeInventory = async () => {
  try {
    await connectDB();
    
    const networks = ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"];
    
    console.log('Initializing inventory data...');
    
    for (const network of networks) {
      const existingItem = await DataInventory.findOne({ network });
      
      if (!existingItem) {
        const inventoryItem = new DataInventory({
          network,
          inStock: true, // Default to in stock
          skipGeonettech: false, // Default to API enabled
          updatedAt: new Date()
        });
        
        await inventoryItem.save();
        console.log(`✅ Created inventory item for ${network}`);
      } else {
        console.log(`ℹ️  Inventory item for ${network} already exists`);
      }
    }
    
    console.log('🎉 Inventory initialization completed!');
    
    // Display current inventory status
    const allInventory = await DataInventory.find({}).sort({ network: 1 });
    console.log('\n📊 Current Inventory Status:');
    allInventory.forEach(item => {
      console.log(`${item.network}: Stock=${item.inStock ? '✅' : '❌'}, API=${item.skipGeonettech ? '❌' : '✅'}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing inventory:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
};

initializeInventory();
