const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// Fix Invalid Price Error
const fixInvalidPrice = async () => {
  try {
    console.log('🔧 Fixing Invalid Price Error...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check for any invalid prices
    console.log('🔍 Checking for invalid prices...');
    
    const invalidPrices = await ProductPricing.find({
      $or: [
        { price: { $lte: 0 } },
        { price: { $gte: 10000 } },
        { capacity: { $lte: 0 } },
        { capacity: { $gte: 1000 } },
        { network: { $exists: false } },
        { network: '' },
        { price: { $exists: false } },
        { capacity: { $exists: false } }
      ]
    });

    if (invalidPrices.length > 0) {
      console.log(`❌ Found ${invalidPrices.length} invalid prices:`);
      invalidPrices.forEach(price => {
        console.log(`   - ${price.network} ${price.capacity}GB: ${price.price} GHS (ID: ${price._id})`);
      });

      // Fix invalid prices
      console.log('\n🔧 Fixing invalid prices...');
      for (const price of invalidPrices) {
        if (price.price <= 0 || price.price >= 10000) {
          // Set reasonable default price based on capacity
          const defaultPrice = Math.max(1, price.capacity * 4.2);
          price.price = defaultPrice;
          console.log(`   ✅ Fixed ${price.network} ${price.capacity}GB: ${defaultPrice} GHS`);
        }
        
        if (price.capacity <= 0 || price.capacity >= 1000) {
          // Set reasonable default capacity
          price.capacity = Math.max(1, Math.min(100, price.capacity || 1));
          console.log(`   ✅ Fixed ${price.network} capacity: ${price.capacity}GB`);
        }
        
        if (!price.network || price.network === '') {
          price.network = 'MTN';
          console.log(`   ✅ Fixed network: ${price.network}`);
        }
        
        price.enabled = true;
        price.description = `Fixed invalid price - ${new Date().toLocaleDateString()}`;
        price.updatedAt = new Date();
        
        await price.save();
      }
    } else {
      console.log('✅ No invalid prices found');
    }

    // Check for missing required fields
    console.log('\n🔍 Checking for missing required fields...');
    
    const pricesWithMissingFields = await ProductPricing.find({
      $or: [
        { description: { $exists: false } },
        { description: '' },
        { enabled: { $exists: false } },
        { createdAt: { $exists: false } },
        { updatedAt: { $exists: false } }
      ]
    });

    if (pricesWithMissingFields.length > 0) {
      console.log(`⚠️  Found ${pricesWithMissingFields.length} prices with missing fields:`);
      
      for (const price of pricesWithMissingFields) {
        if (!price.description || price.description === '') {
          price.description = `${price.network} ${price.capacity}GB Data Bundle`;
        }
        
        if (price.enabled === undefined || price.enabled === null) {
          price.enabled = true;
        }
        
        if (!price.createdAt) {
          price.createdAt = new Date();
        }
        
        price.updatedAt = new Date();
        
        await price.save();
        console.log(`   ✅ Fixed missing fields for ${price.network} ${price.capacity}GB`);
      }
    } else {
      console.log('✅ No missing required fields found');
    }

    // Verify all MTN prices are valid
    console.log('\n🔍 Verifying MTN prices...');
    
    const mtnPrices = await ProductPricing.find({ network: 'MTN' }).sort({ capacity: 1 });
    
    console.log(`📊 Found ${mtnPrices.length} MTN packages:`);
    
    let hasIssues = false;
    mtnPrices.forEach(price => {
      if (price.price <= 0 || price.price >= 10000) {
        console.log(`   ❌ Invalid price: ${price.network} ${price.capacity}GB = ${price.price} GHS`);
        hasIssues = true;
      } else if (price.capacity <= 0 || price.capacity >= 1000) {
        console.log(`   ❌ Invalid capacity: ${price.network} ${price.capacity}GB = ${price.price} GHS`);
        hasIssues = true;
      } else {
        console.log(`   ✅ Valid: ${price.network} ${price.capacity}GB = ${price.price} GHS`);
      }
    });

    if (!hasIssues) {
      console.log('\n✅ All MTN prices are valid!');
    }

    // Check for duplicate packages
    console.log('\n🔍 Checking for duplicate packages...');
    
    const duplicates = await ProductPricing.aggregate([
      {
        $group: {
          _id: { network: '$network', capacity: '$capacity' },
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate packages:`);
      
      for (const duplicate of duplicates) {
        console.log(`   - ${duplicate._id.network} ${duplicate._id.capacity}GB (${duplicate.count} copies)`);
        
        // Keep the first one, remove others
        const docsToRemove = duplicate.docs.slice(1);
        await ProductPricing.deleteMany({ _id: { $in: docsToRemove } });
        console.log(`   ✅ Removed ${docsToRemove.length} duplicates`);
      }
    } else {
      console.log('✅ No duplicate packages found');
    }

    // Final summary
    console.log('\n📋 Final Summary:');
    const finalCount = await ProductPricing.countDocuments({ network: 'MTN' });
    const activeCount = await ProductPricing.countDocuments({ network: 'MTN', enabled: true });
    
    console.log(`   Total MTN packages: ${finalCount}`);
    console.log(`   Active MTN packages: ${activeCount}`);
    console.log(`   Disabled MTN packages: ${finalCount - activeCount}`);
    
    // Show price range
    const priceStats = await ProductPricing.aggregate([
      { $match: { network: 'MTN' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log(`   Price range: ${stats.minPrice} - ${stats.maxPrice} GHS`);
      console.log(`   Average price: ${stats.avgPrice.toFixed(2)} GHS`);
    }

    console.log('\n✅ Invalid price fix completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Refresh the admin dashboard');
    console.log('   2. Clear browser cache if needed');
    console.log('   3. Test the price management functionality');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the fix
fixInvalidPrice();
