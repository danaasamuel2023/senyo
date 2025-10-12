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

// Check DataMart API prices
const checkDataMartPrices = async () => {
  try {
    console.log('📡 Checking DataMart API Prices...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Try to get data from DataMart API
    console.log('🔗 Attempting to connect to DataMart API...');
    
    let datamartPackages = [];
    let apiSource = 'unavailable';
    
    try {
      const datamartResponse = await datamartClient.get('/api/data-packages');
      
      if (datamartResponse.data && datamartResponse.data.success) {
        datamartPackages = datamartResponse.data.data || [];
        apiSource = 'datamart_api';
        console.log(`✅ Successfully retrieved ${datamartPackages.length} packages from DataMart API`);
      } else {
        throw new Error('Invalid response from DataMart API');
      }
    } catch (apiError) {
      console.log(`❌ DataMart API failed: ${apiError.message}`);
      console.log('📦 Using mock data for comparison...');
      
      // Use mock data as fallback
      datamartPackages = [
        // MTN Packages
        { network: 'MTN', capacity: 1, price: 3.50 },
        { network: 'MTN', capacity: 2, price: 6.00 },
        { network: 'MTN', capacity: 3, price: 8.50 },
        { network: 'MTN', capacity: 5, price: 13.00 },
        { network: 'MTN', capacity: 10, price: 24.00 },
        { network: 'MTN', capacity: 20, price: 45.00 },
        { network: 'MTN', capacity: 30, price: 65.00 },
        { network: 'MTN', capacity: 50, price: 95.00 },
        { network: 'MTN', capacity: 100, price: 180.00 },
        
        // Vodafone Packages
        { network: 'VODAFONE', capacity: 1, price: 3.20 },
        { network: 'VODAFONE', capacity: 2, price: 5.80 },
        { network: 'VODAFONE', capacity: 3, price: 8.20 },
        { network: 'VODAFONE', capacity: 5, price: 12.50 },
        { network: 'VODAFONE', capacity: 10, price: 23.00 },
        { network: 'VODAFONE', capacity: 20, price: 43.00 },
        { network: 'VODAFONE', capacity: 30, price: 62.00 },
        { network: 'VODAFONE', capacity: 50, price: 92.00 },
        { network: 'VODAFONE', capacity: 100, price: 175.00 },
        
        // AirtelTigo Packages
        { network: 'airteltigo', capacity: 1, price: 3.00 },
        { network: 'airteltigo', capacity: 2, price: 5.50 },
        { network: 'airteltigo', capacity: 3, price: 7.80 },
        { network: 'airteltigo', capacity: 5, price: 12.00 },
        { network: 'airteltigo', capacity: 10, price: 22.00 },
        { network: 'airteltigo', capacity: 20, price: 42.00 },
        { network: 'airteltigo', capacity: 30, price: 61.00 },
        { network: 'airteltigo', capacity: 50, price: 91.00 },
        { network: 'airteltigo', capacity: 100, price: 170.00 }
      ];
      apiSource = 'mock_data';
      console.log(`📊 Using ${datamartPackages.length} mock packages for comparison`);
    }

    // Get current database prices
    console.log('\n📊 Current Database Prices:');
    const dbPrices = await ProductPricing.find({}).sort({ network: 1, capacity: 1 });
    
    // Group by network
    const dbPricesByNetwork = {};
    dbPrices.forEach(price => {
      if (!dbPricesByNetwork[price.network]) {
        dbPricesByNetwork[price.network] = [];
      }
      dbPricesByNetwork[price.network].push(price);
    });

    // Group DataMart prices by network
    const datamartPricesByNetwork = {};
    datamartPackages.forEach(pkg => {
      if (!datamartPricesByNetwork[pkg.network]) {
        datamartPricesByNetwork[pkg.network] = [];
      }
      datamartPricesByNetwork[pkg.network].push(pkg);
    });

    // Compare prices for each network
    console.log('\n🔍 Price Comparison (DataMart vs Database):');
    console.log('=' .repeat(80));
    
    const allNetworks = new Set([
      ...Object.keys(dbPricesByNetwork),
      ...Object.keys(datamartPricesByNetwork)
    ]);

    for (const network of allNetworks) {
      console.log(`\n📱 ${network.toUpperCase()}:`);
      console.log('-' .repeat(40));
      
      const dbNetworkPrices = dbPricesByNetwork[network] || [];
      const datamartNetworkPrices = datamartPricesByNetwork[network] || [];
      
      // Create maps for easy comparison
      const dbPriceMap = {};
      dbNetworkPrices.forEach(price => {
        dbPriceMap[price.capacity] = price.price;
      });
      
      const datamartPriceMap = {};
      datamartNetworkPrices.forEach(pkg => {
        datamartPriceMap[pkg.capacity] = pkg.price;
      });
      
      // Get all capacities
      const allCapacities = new Set([
        ...Object.keys(dbPriceMap).map(Number),
        ...Object.keys(datamartPriceMap).map(Number)
      ]);
      
      const sortedCapacities = Array.from(allCapacities).sort((a, b) => a - b);
      
      console.log('Capacity | DataMart | Database | Difference | Status');
      console.log('---------|----------|----------|------------|--------');
      
      for (const capacity of sortedCapacities) {
        const datamartPrice = datamartPriceMap[capacity];
        const dbPrice = dbPriceMap[capacity];
        
        if (datamartPrice && dbPrice) {
          const difference = dbPrice - datamartPrice;
          const status = difference > 0 ? '📈 Higher' : difference < 0 ? '📉 Lower' : '✅ Same';
          console.log(`${capacity.toString().padEnd(8)} | ${datamartPrice.toString().padEnd(8)} | ${dbPrice.toString().padEnd(8)} | ${difference.toFixed(2).padEnd(10)} | ${status}`);
        } else if (datamartPrice) {
          console.log(`${capacity.toString().padEnd(8)} | ${datamartPrice.toString().padEnd(8)} | ${'N/A'.padEnd(8)} | ${'N/A'.padEnd(10)} | 🆕 Missing in DB`);
        } else if (dbPrice) {
          console.log(`${capacity.toString().padEnd(8)} | ${'N/A'.padEnd(8)} | ${dbPrice.toString().padEnd(8)} | ${'N/A'.padEnd(10)} | ➕ Extra in DB`);
        }
      }
    }

    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log('=' .repeat(50));
    
    console.log(`\n🔗 DataMart API Status: ${apiSource}`);
    console.log(`📦 DataMart Packages: ${datamartPackages.length}`);
    console.log(`💾 Database Packages: ${dbPrices.length}`);
    
    // Calculate average prices
    const datamartAvgPrice = datamartPackages.reduce((sum, pkg) => sum + pkg.price, 0) / datamartPackages.length;
    const dbAvgPrice = dbPrices.reduce((sum, price) => sum + price.price, 0) / dbPrices.length;
    
    console.log(`\n💰 Average Prices:`);
    console.log(`   DataMart: ${datamartAvgPrice.toFixed(2)} GHS`);
    console.log(`   Database: ${dbAvgPrice.toFixed(2)} GHS`);
    console.log(`   Difference: ${(dbAvgPrice - datamartAvgPrice).toFixed(2)} GHS`);
    
    // Price range comparison
    const datamartMinPrice = Math.min(...datamartPackages.map(pkg => pkg.price));
    const datamartMaxPrice = Math.max(...datamartPackages.map(pkg => pkg.price));
    const dbMinPrice = Math.min(...dbPrices.map(price => price.price));
    const dbMaxPrice = Math.max(...dbPrices.map(price => price.price));
    
    console.log(`\n📊 Price Ranges:`);
    console.log(`   DataMart: ${datamartMinPrice} - ${datamartMaxPrice} GHS`);
    console.log(`   Database: ${dbMinPrice} - ${dbMaxPrice} GHS`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('=' .repeat(30));
    
    if (apiSource === 'datamart_api') {
      console.log('✅ DataMart API is working - prices are current');
      console.log('🔄 Consider syncing database with latest DataMart prices');
    } else {
      console.log('⚠️  DataMart API is unavailable - using mock data');
      console.log('🔧 Check DataMart API endpoint and credentials');
      console.log('📞 Contact DataMart support if issue persists');
    }
    
    console.log('\n🔄 To sync prices with DataMart API:');
    console.log('   node sync-mtn-prices.js');
    console.log('\n🔄 To refresh admin dashboard:');
    console.log('   node refresh-admin-dashboard.js');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the check
checkDataMartPrices();
