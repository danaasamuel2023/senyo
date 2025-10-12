const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// Verify MTN price sync
const verifyMTNSync = async () => {
  try {
    console.log('🔍 Verifying MTN Price Sync...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all MTN prices
    const mtnPrices = await ProductPricing.find({ network: 'MTN' }).sort({ capacity: 1 });
    
    console.log(`📊 Found ${mtnPrices.length} MTN packages in database:\n`);
    
    // Display all MTN prices
    console.log('📋 Current MTN Package Prices:');
    console.log('┌─────────┬─────────┬─────────────┬─────────────┐');
    console.log('│ Capacity│ Price   │ Description │ Status     │');
    console.log('├─────────┼─────────┼─────────────┼─────────────┤');
    
    mtnPrices.forEach(price => {
      const capacity = `${price.capacity}GB`.padEnd(9);
      const priceStr = `${price.price} GHS`.padEnd(9);
      const description = (price.description || '').substring(0, 13).padEnd(13);
      const status = price.enabled ? '✅ Active' : '❌ Disabled';
      
      console.log(`│ ${capacity}│ ${priceStr}│ ${description}│ ${status}     │`);
    });
    
    console.log('└─────────┴─────────┴─────────────┴─────────────┘');
    
    // Summary statistics
    const totalPackages = mtnPrices.length;
    const activePackages = mtnPrices.filter(p => p.enabled).length;
    const disabledPackages = totalPackages - activePackages;
    const averagePrice = mtnPrices.reduce((sum, p) => sum + p.price, 0) / totalPackages;
    const minPrice = Math.min(...mtnPrices.map(p => p.price));
    const maxPrice = Math.max(...mtnPrices.map(p => p.price));
    
    console.log('\n📈 Summary Statistics:');
    console.log(`   Total Packages: ${totalPackages}`);
    console.log(`   Active Packages: ${activePackages}`);
    console.log(`   Disabled Packages: ${disabledPackages}`);
    console.log(`   Average Price: ${averagePrice.toFixed(2)} GHS`);
    console.log(`   Price Range: ${minPrice} - ${maxPrice} GHS`);
    
    // Check for missing common packages
    const commonCapacities = [1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
    const existingCapacities = mtnPrices.map(p => p.capacity);
    const missingCapacities = commonCapacities.filter(cap => !existingCapacities.includes(cap));
    
    if (missingCapacities.length > 0) {
      console.log('\n⚠️  Missing Common Packages:');
      missingCapacities.forEach(cap => {
        console.log(`   ${cap}GB package not found`);
      });
    } else {
      console.log('\n✅ All common package sizes are available');
    }
    
    // Check for price consistency
    console.log('\n🔍 Price Consistency Check:');
    let hasInconsistencies = false;
    
    for (let i = 1; i < mtnPrices.length; i++) {
      const prev = mtnPrices[i - 1];
      const curr = mtnPrices[i];
      
      if (curr.capacity > prev.capacity && curr.price <= prev.price) {
        console.log(`   ⚠️  ${curr.capacity}GB (${curr.price}) should be more expensive than ${prev.capacity}GB (${prev.price})`);
        hasInconsistencies = true;
      }
    }
    
    if (!hasInconsistencies) {
      console.log('   ✅ All prices are consistent (larger packages cost more)');
    }
    
    console.log('\n✅ MTN price verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the verification
verifyMTNSync();
