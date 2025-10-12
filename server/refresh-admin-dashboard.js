const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// Refresh Admin Dashboard
const refreshAdminDashboard = async () => {
  try {
    console.log('🔄 Refreshing Admin Dashboard...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure all prices have proper timestamps
    console.log('🕒 Updating price timestamps...');
    
    const allPrices = await ProductPricing.find({});
    let updatedCount = 0;
    
    for (const price of allPrices) {
      const needsUpdate = !price.updatedAt || price.updatedAt < new Date('2025-10-12');
      
      if (needsUpdate) {
        price.updatedAt = new Date();
        price.description = `${price.network} ${price.capacity}GB Data Bundle - Updated ${new Date().toLocaleDateString()}`;
        await price.save();
        updatedCount++;
      }
    }
    
    console.log(`✅ Updated ${updatedCount} price timestamps`);

    // Verify all prices are valid
    console.log('\n🔍 Verifying all prices...');
    
    const invalidPrices = await ProductPricing.find({
      $or: [
        { price: { $lte: 0 } },
        { price: { $gte: 10000 } },
        { capacity: { $lte: 0 } },
        { capacity: { $gte: 1000 } },
        { network: { $exists: false } },
        { network: '' }
      ]
    });

    if (invalidPrices.length > 0) {
      console.log(`❌ Found ${invalidPrices.length} invalid prices, fixing...`);
      
      for (const price of invalidPrices) {
        if (price.price <= 0 || price.price >= 10000) {
          price.price = Math.max(1, price.capacity * 4.2);
        }
        if (price.capacity <= 0 || price.capacity >= 1000) {
          price.capacity = Math.max(1, Math.min(100, price.capacity || 1));
        }
        if (!price.network || price.network === '') {
          price.network = 'MTN';
        }
        
        price.enabled = true;
        price.description = `Fixed invalid price - ${new Date().toLocaleDateString()}`;
        price.updatedAt = new Date();
        
        await price.save();
        console.log(`   ✅ Fixed ${price.network} ${price.capacity}GB: ${price.price} GHS`);
      }
    } else {
      console.log('✅ All prices are valid');
    }

    // Show current price summary
    console.log('\n📊 Current Price Summary:');
    
    const networks = await ProductPricing.distinct('network');
    
    for (const network of networks) {
      const networkPrices = await ProductPricing.find({ network }).sort({ capacity: 1 });
      const activeCount = networkPrices.filter(p => p.enabled).length;
      const totalCount = networkPrices.length;
      
      console.log(`\n   ${network}:`);
      console.log(`     Total packages: ${totalCount}`);
      console.log(`     Active packages: ${activeCount}`);
      console.log(`     Disabled packages: ${totalCount - activeCount}`);
      
      if (networkPrices.length > 0) {
        const minPrice = Math.min(...networkPrices.map(p => p.price));
        const maxPrice = Math.max(...networkPrices.map(p => p.price));
        const avgPrice = networkPrices.reduce((sum, p) => sum + p.price, 0) / networkPrices.length;
        
        console.log(`     Price range: ${minPrice} - ${maxPrice} GHS`);
        console.log(`     Average price: ${avgPrice.toFixed(2)} GHS`);
      }
    }

    // Check for any issues that might cause "Invalid price" error
    console.log('\n🔍 Checking for potential issues...');
    
    // Check for very high prices that might trigger validation
    const highPrices = await ProductPricing.find({ price: { $gte: 1000 } });
    if (highPrices.length > 0) {
      console.log(`⚠️  Found ${highPrices.length} packages with prices >= 1000 GHS:`);
      highPrices.forEach(price => {
        console.log(`   - ${price.network} ${price.capacity}GB: ${price.price} GHS`);
      });
    } else {
      console.log('✅ No packages with suspiciously high prices');
    }

    // Check for zero or negative prices
    const zeroPrices = await ProductPricing.find({ price: { $lte: 0 } });
    if (zeroPrices.length > 0) {
      console.log(`❌ Found ${zeroPrices.length} packages with zero/negative prices:`);
      zeroPrices.forEach(price => {
        console.log(`   - ${price.network} ${price.capacity}GB: ${price.price} GHS`);
      });
    } else {
      console.log('✅ No packages with zero/negative prices');
    }

    // Check for missing required fields
    const missingFields = await ProductPricing.find({
      $or: [
        { description: { $exists: false } },
        { description: '' },
        { enabled: { $exists: false } }
      ]
    });
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Found ${missingFields.length} packages with missing fields:`);
      for (const price of missingFields) {
        if (!price.description || price.description === '') {
          price.description = `${price.network} ${price.capacity}GB Data Bundle`;
        }
        if (price.enabled === undefined || price.enabled === null) {
          price.enabled = true;
        }
        price.updatedAt = new Date();
        await price.save();
        console.log(`   ✅ Fixed missing fields for ${price.network} ${price.capacity}GB`);
      }
    } else {
      console.log('✅ No packages with missing required fields');
    }

    console.log('\n✅ Admin dashboard refresh completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)');
    console.log('   2. Refresh the admin dashboard page');
    console.log('   3. Check browser console for any JavaScript errors');
    console.log('   4. Try the "Refresh Prices" button');
    console.log('   5. If error persists, check network tab for API errors');

  } catch (error) {
    console.error('❌ Refresh failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the refresh
refreshAdminDashboard();
