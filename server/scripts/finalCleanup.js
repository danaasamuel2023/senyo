#!/usr/bin/env node

/**
 * Final Cleanup Script
 * Removes only test data while preserving production users
 */

const mongoose = require('mongoose');
const { User, Wallet, DataPurchase, Transaction } = require('../schema/schema');

async function finalCleanup() {
  console.log('🧹 Final Test Data Cleanup...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB\n');

    // Define test patterns more specifically
    const testPatterns = {
      emails: [
        /test@/i,
        /dummy@/i,
        /fake@/i,
        /example@/i,
        /demo@/i,
        /@test\./i,
        /@example\./i,
        /@dummy\./i
      ],
      phoneNumbers: [
        /^0241234567$/,
        /^0240000000$/,
        /^0241111111$/,
        /^0242222222$/,
        /^0243333333$/,
        /^0244444444$/,
        /^0245555555$/,
        /^0246666666$/,
        /^0247777777$/,
        /^0248888888$/,
        /^0249999999$/
      ],
      references: [
        /^TEST-/i,
        /^test_/i,
        /^dummy/i,
        /^fake/i,
        /^example/i,
        /^demo/i
      ]
    };

    // Function to check if data matches test patterns
    function isTestData(data, type) {
      const patterns = testPatterns[type] || [];
      return patterns.some(pattern => {
        if (pattern.test) {
          return pattern.test(data);
        }
        return false;
      });
    }

    console.log('🔍 Identifying test data...\n');

    // Find test users (excluding admin)
    const testUsers = await User.find({
      $and: [
        { email: { $ne: 'admin@unlimiteddata.gh' } }, // Preserve admin
        {
          $or: [
            { email: { $regex: /test@|dummy@|fake@|example@|demo@|@test\.|@example\.|@dummy\./i } },
            { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } },
            { name: { $regex: /test|dummy|fake|example|demo/i } }
          ]
        }
      ]
    });

    console.log(`📊 Found ${testUsers.length} test users to remove`);

    if (testUsers.length > 0) {
      console.log('Test users to be deleted:');
      testUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.phoneNumber}`);
      });
      console.log('');
    }

    // Find related data
    const testUserIds = testUsers.map(user => user._id);
    const testWallets = await Wallet.find({ userId: { $in: testUserIds } });
    const testTransactions = await Transaction.find({
      $or: [
        { userId: { $in: testUserIds } },
        { reference: { $regex: /^TEST-|^test_|^dummy|^fake|^example|^demo/i } }
      ]
    });
    const testPurchases = await DataPurchase.find({
      $or: [
        { userId: { $in: testUserIds } },
        { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } },
        { geonetReference: { $regex: /^TEST-|^test_|^dummy|^fake|^example|^demo/i } }
      ]
    });

    console.log(`💳 Test wallets: ${testWallets.length}`);
    console.log(`💸 Test transactions: ${testTransactions.length}`);
    console.log(`📦 Test purchases: ${testPurchases.length}\n`);

    const totalTestRecords = testUsers.length + testWallets.length + testTransactions.length + testPurchases.length;

    if (totalTestRecords === 0) {
      console.log('✅ No test data found. System is clean!\n');
      return;
    }

    console.log('📋 Cleanup Summary:');
    console.log(`   👤 Test Users: ${testUsers.length}`);
    console.log(`   💳 Test Wallets: ${testWallets.length}`);
    console.log(`   💸 Test Transactions: ${testTransactions.length}`);
    console.log(`   📦 Test Purchases: ${testPurchases.length}`);
    console.log(`   📊 Total Records: ${totalTestRecords}\n`);

    // Confirmation prompt
    console.log('⚠️  WARNING: This will permanently delete test data!');
    console.log('🔄 To proceed, run: node scripts/finalCleanup.js --confirm\n');

    // Check for confirmation flag
    const args = process.argv.slice(2);
    if (!args.includes('--confirm')) {
      console.log('❌ Cleanup cancelled. Use --confirm flag to proceed.');
      return;
    }

    console.log('🗑️  Starting cleanup process...\n');

    // Start cleanup in reverse order
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Delete test data purchases
        if (testPurchases.length > 0) {
          console.log('🗑️  Deleting test data purchases...');
          await DataPurchase.deleteMany({
            _id: { $in: testPurchases.map(p => p._id) }
          }, { session });
          console.log(`✅ Deleted ${testPurchases.length} test data purchases`);
        }

        // Delete test transactions
        if (testTransactions.length > 0) {
          console.log('🗑️  Deleting test transactions...');
          await Transaction.deleteMany({
            _id: { $in: testTransactions.map(t => t._id) }
          }, { session });
          console.log(`✅ Deleted ${testTransactions.length} test transactions`);
        }

        // Delete test wallets
        if (testWallets.length > 0) {
          console.log('🗑️  Deleting test wallets...');
          await Wallet.deleteMany({
            _id: { $in: testWallets.map(w => w._id) }
          }, { session });
          console.log(`✅ Deleted ${testWallets.length} test wallets`);
        }

        // Delete test users
        if (testUsers.length > 0) {
          console.log('🗑️  Deleting test users...');
          await User.deleteMany({
            _id: { $in: testUsers.map(u => u._id) }
          }, { session });
          console.log(`✅ Deleted ${testUsers.length} test users`);
        }
      });

      console.log('\n🎉 Test data cleanup completed successfully!');
      console.log(`📊 Total records deleted: ${totalTestRecords}`);

    } finally {
      session.endSession();
    }

    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    const remainingUsers = await User.find({});
    const remainingTestUsers = await User.find({
      $and: [
        { email: { $ne: 'admin@unlimiteddata.gh' } },
        {
          $or: [
            { email: { $regex: /test@|dummy@|fake@|example@|demo@|@test\.|@example\.|@dummy\./i } },
            { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } }
          ]
        }
      ]
    });

    console.log('📊 Final System Status:');
    console.log(`   👤 Total Users: ${remainingUsers.length}`);
    console.log(`   ⚠️  Remaining Test Users: ${remainingTestUsers.length}`);

    if (remainingTestUsers.length === 0) {
      console.log('✅ Cleanup verification successful - no test data remaining');
    } else {
      console.log('⚠️  Some test users still remain:');
      remainingTestUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    }

    console.log('\n👤 Remaining Users:');
    remainingUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Balance: ₵${user.walletBalance}`);
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.disconnect();
    console.log('\n📊 Cleanup process completed');
  }
}

// Run the cleanup
if (require.main === module) {
  finalCleanup();
}

module.exports = finalCleanup;
