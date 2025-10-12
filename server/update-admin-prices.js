const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// Update admin dashboard prices
const updateAdminPrices = async () => {
  try {
    console.log('🔄 Updating Admin Dashboard Prices...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all MTN prices
    const mtnPrices = await ProductPricing.find({ network: 'MTN' }).sort({ capacity: 1 });
    
    console.log(`📊 Found ${mtnPrices.length} MTN packages to update\n`);
    
    // Update descriptions to be more admin-friendly
    for (const price of mtnPrices) {
      price.description = `MTN ${price.capacity}GB Data Bundle - Updated ${new Date().toLocaleDateString()}`;
      price.updatedAt = new Date();
      await price.save();
    }
    
    console.log('✅ Updated all MTN package descriptions');
    
    // Create a summary for admin dashboard
    const priceSummary = {
      network: 'MTN',
      totalPackages: mtnPrices.length,
      priceRange: {
        min: Math.min(...mtnPrices.map(p => p.price)),
        max: Math.max(...mtnPrices.map(p => p.price)),
        average: mtnPrices.reduce((sum, p) => sum + p.price, 0) / mtnPrices.length
      },
      packages: mtnPrices.map(p => ({
        capacity: p.capacity,
        price: p.price,
        enabled: p.enabled,
        description: p.description
      })),
      lastUpdated: new Date().toISOString()
    };
    
    console.log('\n📋 Admin Dashboard Summary:');
    console.log(`   Network: ${priceSummary.network}`);
    console.log(`   Total Packages: ${priceSummary.totalPackages}`);
    console.log(`   Price Range: ${priceSummary.priceRange.min} - ${priceSummary.priceRange.max} GHS`);
    console.log(`   Average Price: ${priceSummary.priceRange.average.toFixed(2)} GHS`);
    console.log(`   Last Updated: ${priceSummary.lastUpdated}`);
    
    // Show top 5 most popular packages (by capacity)
    console.log('\n🏆 Top 5 Most Popular Packages:');
    const popularPackages = mtnPrices
      .filter(p => [1, 2, 3, 5, 10].includes(p.capacity))
      .sort((a, b) => a.capacity - b.capacity);
    
    popularPackages.forEach((pkg, index) => {
      console.log(`   ${index + 1}. ${pkg.capacity}GB - ${pkg.price} GHS`);
    });
    
    // Check for any disabled packages
    const disabledPackages = mtnPrices.filter(p => !p.enabled);
    if (disabledPackages.length > 0) {
      console.log('\n⚠️  Disabled Packages:');
      disabledPackages.forEach(pkg => {
        console.log(`   ${pkg.capacity}GB - ${pkg.price} GHS`);
      });
    } else {
      console.log('\n✅ All packages are active');
    }
    
    console.log('\n✅ Admin dashboard prices updated successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Go to admin dashboard');
    console.log('   2. Navigate to Price Management');
    console.log('   3. Refresh the page to see updated prices');
    console.log('   4. Test the sync functionality');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the update
updateAdminPrices();
