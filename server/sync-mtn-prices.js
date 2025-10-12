const axios = require('axios');
const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// DataMart API Configuration
const DATAMART_BASE_URL = 'https://api.datamartgh.shop';
const DATAMART_API_KEY = process.env.DATAMART_API_KEY || 'f3d158934310f9c63f3f1b68f2f1ecda916ffada9ea984740c4f3902250f534d';

const datamartClient = axios.create({
  baseURL: DATAMART_BASE_URL,
  headers: {
    'x-api-key': DATAMART_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Updated MTN Packages with competitive pricing
const UPDATED_MTN_PACKAGES = [
  { network: 'MTN', capacity: 1, price: 4.20 },
  { network: 'MTN', capacity: 2, price: 8.40 },
  { network: 'MTN', capacity: 3, price: 12.50 },
  { network: 'MTN', capacity: 4, price: 16.50 },
  { network: 'MTN', capacity: 5, price: 20.50 },
  { network: 'MTN', capacity: 6, price: 24.60 },
  { network: 'MTN', capacity: 7, price: 28.50 },
  { network: 'MTN', capacity: 8, price: 32.80 },
  { network: 'MTN', capacity: 10, price: 41.00 },
  { network: 'MTN', capacity: 15, price: 61.50 },
  { network: 'MTN', capacity: 20, price: 82.00 },
  { network: 'MTN', capacity: 25, price: 102.50 },
  { network: 'MTN', capacity: 30, price: 123.00 },
  { network: 'MTN', capacity: 40, price: 164.00 },
  { network: 'MTN', capacity: 50, price: 205.00 },
  { network: 'MTN', capacity: 60, price: 246.00 },
  { network: 'MTN', capacity: 80, price: 328.00 },
  { network: 'MTN', capacity: 100, price: 410.00 }
];

// Sync MTN prices function
const syncMTNPrices = async () => {
  try {
    console.log('🔄 Starting MTN Price Sync...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let datamartPackages = [];
    let apiSource = 'mock';

    // Try to get data from DataMart API
    try {
      console.log('📡 Attempting to connect to DataMart API...');
      
      // Try smart endpoint first (includes fallback)
      try {
        const smartResponse = await axios.get('http://localhost:5001/api/test-datamart/smart-packages', {
          params: { network: 'MTN' },
          timeout: 10000
        });
        
        if (smartResponse.data.success) {
          console.log('✅ Smart endpoint working, using data from:', smartResponse.data.source);
          const packages = smartResponse.data.data;
          
          if (packages && packages.length > 0) {
            console.log(`📦 Found ${packages.length} MTN packages from ${smartResponse.data.source}`);
            
            // Update local pricing with smart endpoint data
            for (const pkg of packages) {
              const capacity = pkg.capacity.toString();
              const price = parseFloat(pkg.price);
              
              if (OFFICIAL_PRICING['YELLO'][capacity] !== price) {
                console.log(`🔄 Updating ${capacity}GB: ${OFFICIAL_PRICING['YELLO'][capacity]} → ${price}`);
                OFFICIAL_PRICING['YELLO'][capacity] = price;
              }
            }
            
            console.log('✅ Local pricing updated from smart endpoint');
            return;
          }
        }
      } catch (smartError) {
        console.log('⚠️ Smart endpoint failed, trying direct DataMart API...');
      }
      
      // Fallback to direct DataMart API
      const datamartResponse = await datamartClient.get('/api/data-packages', {
        params: { network: 'MTN' }
      });

      if (datamartResponse.data && datamartResponse.data.success) {
        datamartPackages = datamartResponse.data.data || [];
        apiSource = 'datamart_api';
        console.log(`✅ Found ${datamartPackages.length} MTN packages from DataMart API`);
      } else {
        throw new Error('Invalid response from DataMart API');
      }
    } catch (apiError) {
      console.log(`⚠️  DataMart API failed: ${apiError.message}`);
      console.log('📦 Using updated mock data as fallback...');
      
      datamartPackages = UPDATED_MTN_PACKAGES;
      apiSource = 'updated_mock_data';
      console.log(`✅ Using ${datamartPackages.length} updated MTN packages`);
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    console.log('\n🔄 Syncing MTN packages...\n');

    for (const pkg of datamartPackages) {
      try {
        const { network, capacity, price } = pkg;

        if (!network || !capacity || price === undefined) {
          results.errors.push({
            package: pkg,
            error: 'Missing required fields (network, capacity, price)'
          });
          continue;
        }

        // Check if price exists
        const existingPrice = await ProductPricing.findOne({ 
          network: network, 
          capacity: parseInt(capacity) 
        });

        if (existingPrice) {
          // Update existing price if different
          if (existingPrice.price !== parseFloat(price)) {
            const oldPrice = existingPrice.price;
            existingPrice.price = parseFloat(price);
            existingPrice.updatedAt = new Date();
            existingPrice.description = `Updated from ${apiSource}`;
            await existingPrice.save();
            
            results.updated++;
            console.log(`✅ Updated ${network} ${capacity}GB: ${oldPrice} → ${price} (${apiSource})`);
          } else {
            console.log(`⏭️  ${network} ${capacity}GB: No change needed (${price})`);
          }
        } else {
          // Create new price
          const newPrice = new ProductPricing({
            network: network,
            capacity: parseInt(capacity),
            price: parseFloat(price),
            description: `Created from ${apiSource}`,
            enabled: true
          });
          await newPrice.save();
          
          results.created++;
          console.log(`🆕 Created ${network} ${capacity}GB: ${price} (${apiSource})`);
        }
      } catch (error) {
        results.errors.push({
          package: pkg,
          error: error.message
        });
        console.error(`❌ Error processing ${pkg.network} ${pkg.capacity}GB:`, error.message);
      }
    }

    console.log('\n📊 Sync Results:');
    console.log(`   Source: ${apiSource}`);
    console.log(`   Total Processed: ${datamartPackages.length}`);
    console.log(`   Created: ${results.created}`);
    console.log(`   Updated: ${results.updated}`);
    console.log(`   Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.package.network} ${error.package.capacity}GB: ${error.error}`);
      });
    }

    // Show current MTN prices
    console.log('\n📋 Current MTN Prices:');
    const currentPrices = await ProductPricing.find({ network: 'MTN' }).sort({ capacity: 1 });
    currentPrices.forEach(price => {
      console.log(`   ${price.capacity}GB: ${price.price} GHS`);
    });

    console.log('\n✅ MTN price sync completed successfully!');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the sync
syncMTNPrices();
