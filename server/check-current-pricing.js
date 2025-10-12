const mongoose = require('mongoose');
const { ProductPricing } = require('./schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

const checkCurrentPricing = async () => {
  try {
    console.log('🔍 Checking Current MTN Pricing...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all MTN packages from database
    const mtnPackages = await ProductPricing.find({ network: 'MTN' }).sort({ capacity: 1 });
    
    console.log(`📦 Found ${mtnPackages.length} MTN packages in database:\n`);
    
    // Display current database prices
    console.log('📊 CURRENT DATABASE PRICES:');
    console.log('=' .repeat(50));
    mtnPackages.forEach(pkg => {
      console.log(`${pkg.capacity}GB: ${pkg.price} GHS (${pkg.isActive ? 'Active' : 'Inactive'})`);
    });

    // Our frontend prices with 0.5 GHS profit
    const frontendPrices = [
      { capacity: 1, price: 4.7 },
      { capacity: 2, price: 8.9 },
      { capacity: 3, price: 13.0 },
      { capacity: 4, price: 17.0 },
      { capacity: 5, price: 21.0 },
      { capacity: 6, price: 25.1 },
      { capacity: 7, price: 29.0 },
      { capacity: 8, price: 33.3 },
      { capacity: 10, price: 41.5 },
      { capacity: 15, price: 62.0 },
      { capacity: 20, price: 82.5 },
      { capacity: 25, price: 103.0 },
      { capacity: 30, price: 123.5 },
      { capacity: 40, price: 164.5 },
      { capacity: 50, price: 205.5 },
      { capacity: 60, price: 246.5 },
      { capacity: 80, price: 328.5 },
      { capacity: 100, price: 410.5 }
    ];

    console.log('\n🛒 FRONTEND PRICES (with 0.5 GHS profit):');
    console.log('=' .repeat(50));
    frontendPrices.forEach(pkg => {
      console.log(`${pkg.capacity}GB: ${pkg.price} GHS`);
    });

    // Compare prices
    console.log('\n📈 PRICE COMPARISON:');
    console.log('=' .repeat(60));
    console.log('Capacity | Database | Frontend | Profit | Status');
    console.log('-' .repeat(60));
    
    let totalProfit = 0;
    let matchedPackages = 0;

    frontendPrices.forEach(frontendPkg => {
      const dbPkg = mtnPackages.find(pkg => pkg.capacity === frontendPkg.capacity);
      if (dbPkg) {
        const profit = frontendPkg.price - dbPkg.price;
        totalProfit += profit;
        matchedPackages++;
        const status = profit === 0.5 ? '✅ Correct' : profit > 0.5 ? '⚠️  High' : '❌ Low';
        console.log(`${frontendPkg.capacity.toString().padStart(8)} | ${dbPkg.price.toString().padStart(8)} | ${frontendPkg.price.toString().padStart(8)} | ${profit.toFixed(1).padStart(6)} | ${status}`);
      } else {
        console.log(`${frontendPkg.capacity.toString().padStart(8)} | ${'N/A'.padStart(8)} | ${frontendPkg.price.toString().padStart(8)} | ${'N/A'.padStart(6)} | ❌ Missing`);
      }
    });

    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(30));
    console.log(`Total Packages: ${frontendPrices.length}`);
    console.log(`Matched Packages: ${matchedPackages}`);
    console.log(`Average Profit: ${(totalProfit / matchedPackages).toFixed(2)} GHS`);
    console.log(`Total Potential Profit: ${totalProfit.toFixed(2)} GHS`);

    // Check if prices are competitive
    console.log('\n🎯 COMPETITIVENESS ANALYSIS:');
    console.log('=' .repeat(40));
    
    const competitiveThreshold = 0.7; // 0.7 GHS above API price
    let competitiveCount = 0;
    
    frontendPrices.forEach(frontendPkg => {
      const dbPkg = mtnPackages.find(pkg => pkg.capacity === frontendPkg.capacity);
      if (dbPkg) {
        const markup = frontendPkg.price - dbPkg.price;
        if (markup <= competitiveThreshold) {
          competitiveCount++;
        }
      }
    });

    const competitivenessPercentage = (competitiveCount / matchedPackages) * 100;
    console.log(`Competitive Packages: ${competitiveCount}/${matchedPackages} (${competitivenessPercentage.toFixed(1)}%)`);
    
    if (competitivenessPercentage >= 80) {
      console.log('✅ Pricing is HIGHLY COMPETITIVE');
    } else if (competitivenessPercentage >= 60) {
      console.log('⚠️  Pricing is MODERATELY COMPETITIVE');
    } else {
      console.log('❌ Pricing needs improvement');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(20));
    if (competitivenessPercentage >= 80) {
      console.log('✅ Your pricing is competitive and should attract customers');
      console.log('✅ 0.5 GHS profit margin is reasonable');
      console.log('✅ Good balance between profit and competitiveness');
    } else {
      console.log('⚠️  Consider reducing profit margin for some packages');
      console.log('⚠️  Focus on most popular packages (5GB, 10GB, 20GB)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkCurrentPricing();
