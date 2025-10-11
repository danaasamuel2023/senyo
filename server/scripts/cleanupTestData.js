#!/usr/bin/env node

/**
 * Cleanup Test Data Script
 * Removes all test users and dummy data from the system
 */

const mongoose = require('mongoose');
const { User, Wallet, DataPurchase, Transaction, Announcement, UserAnnouncementInteraction } = require('../schema/schema');

async function cleanupTestData() {
  console.log('🧹 Starting Test Data Cleanup...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB\n');

    // Define test patterns to identify test data
    const testPatterns = {
      emails: [
        /test/i,
        /dummy/i,
        /fake/i,
        /example/i,
        /demo/i,
        /admin@unlimiteddata\.gh/i, // Admin test account
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
      ],
      names: [
        /test/i,
        /dummy/i,
        /fake/i,
        /example/i,
        /demo/i
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

    // 1. Find test users
    console.log('👤 Finding test users...');
    const testUsers = await User.find({
      $or: [
        { email: { $regex: /test|dummy|fake|example|demo|admin@unlimiteddata\.gh/i } },
        { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } },
        { firstName: { $regex: /test|dummy|fake|example|demo/i } },
        { lastName: { $regex: /test|dummy|fake|example|demo/i } }
      ]
    });

    console.log(`📊 Found ${testUsers.length} test users`);

    if (testUsers.length > 0) {
      console.log('Test users to be deleted:');
      testUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.phoneNumber}`);
      });
      console.log('');
    }

    // 2. Find test wallets
    console.log('💳 Finding test wallets...');
    const testUserIds = testUsers.map(user => user._id);
    const testWallets = await Wallet.find({ userId: { $in: testUserIds } });
    console.log(`📊 Found ${testWallets.length} test wallets\n`);

    // 3. Find test transactions
    console.log('💸 Finding test transactions...');
    const testTransactions = await Transaction.find({
      $or: [
        { userId: { $in: testUserIds } },
        { reference: { $regex: /^TEST-|^test_|^dummy|^fake|^example|^demo/i } },
        { description: { $regex: /test|dummy|fake|example|demo/i } }
      ]
    });
    console.log(`📊 Found ${testTransactions.length} test transactions\n`);

    // 4. Find test data purchases
    console.log('📦 Finding test data purchases...');
    const testPurchases = await DataPurchase.find({
      $or: [
        { userId: { $in: testUserIds } },
        { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } },
        { geonetReference: { $regex: /^TEST-|^test_|^dummy|^fake|^example|^demo/i } },
        { hubnetReference: { $regex: /^TEST-|^test_|^dummy|^fake|^example|^demo/i } }
      ]
    });
    console.log(`📊 Found ${testPurchases.length} test data purchases\n`);

    // 5. Find test announcements
    console.log('📢 Finding test announcements...');
    const testAnnouncements = await Announcement.find({
      $or: [
        { title: { $regex: /test|dummy|fake|example|demo/i } },
        { content: { $regex: /test|dummy|fake|example|demo/i } },
        { createdBy: { $in: testUserIds } }
      ]
    });
    console.log(`📊 Found ${testAnnouncements.length} test announcements\n`);

    // 6. Find test announcement interactions
    console.log('👆 Finding test announcement interactions...');
    const testInteractions = await UserAnnouncementInteraction.find({
      $or: [
        { userId: { $in: testUserIds } },
        { announcementId: { $in: testAnnouncements.map(a => a._id) } }
      ]
    });
    console.log(`📊 Found ${testInteractions.length} test announcement interactions\n`);

    // Summary
    const totalTestRecords = testUsers.length + testWallets.length + testTransactions.length + 
                           testPurchases.length + testAnnouncements.length + testInteractions.length;

    console.log('📋 Cleanup Summary:');
    console.log(`   👤 Test Users: ${testUsers.length}`);
    console.log(`   💳 Test Wallets: ${testWallets.length}`);
    console.log(`   💸 Test Transactions: ${testTransactions.length}`);
    console.log(`   📦 Test Data Purchases: ${testPurchases.length}`);
    console.log(`   📢 Test Announcements: ${testAnnouncements.length}`);
    console.log(`   👆 Test Interactions: ${testInteractions.length}`);
    console.log(`   📊 Total Records: ${totalTestRecords}\n`);

    if (totalTestRecords === 0) {
      console.log('✅ No test data found. System is clean!\n');
      return;
    }

    // Confirmation prompt
    console.log('⚠️  WARNING: This will permanently delete all test data!');
    console.log('🔄 To proceed, run: node scripts/cleanupTestData.js --confirm\n');

    // Check for confirmation flag
    const args = process.argv.slice(2);
    if (!args.includes('--confirm')) {
      console.log('❌ Cleanup cancelled. Use --confirm flag to proceed.');
      return;
    }

    console.log('🗑️  Starting cleanup process...\n');

    // Start cleanup in reverse order (to avoid foreign key constraints)
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // 1. Delete test announcement interactions
        if (testInteractions.length > 0) {
          console.log('🗑️  Deleting test announcement interactions...');
          await UserAnnouncementInteraction.deleteMany({
            _id: { $in: testInteractions.map(i => i._id) }
          }, { session });
          console.log(`✅ Deleted ${testInteractions.length} test announcement interactions`);
        }

        // 2. Delete test announcements
        if (testAnnouncements.length > 0) {
          console.log('🗑️  Deleting test announcements...');
          await Announcement.deleteMany({
            _id: { $in: testAnnouncements.map(a => a._id) }
          }, { session });
          console.log(`✅ Deleted ${testAnnouncements.length} test announcements`);
        }

        // 3. Delete test data purchases
        if (testPurchases.length > 0) {
          console.log('🗑️  Deleting test data purchases...');
          await DataPurchase.deleteMany({
            _id: { $in: testPurchases.map(p => p._id) }
          }, { session });
          console.log(`✅ Deleted ${testPurchases.length} test data purchases`);
        }

        // 4. Delete test transactions
        if (testTransactions.length > 0) {
          console.log('🗑️  Deleting test transactions...');
          await Transaction.deleteMany({
            _id: { $in: testTransactions.map(t => t._id) }
          }, { session });
          console.log(`✅ Deleted ${testTransactions.length} test transactions`);
        }

        // 5. Delete test wallets
        if (testWallets.length > 0) {
          console.log('🗑️  Deleting test wallets...');
          await Wallet.deleteMany({
            _id: { $in: testWallets.map(w => w._id) }
          }, { session });
          console.log(`✅ Deleted ${testWallets.length} test wallets`);
        }

        // 6. Delete test users
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
    
    const remainingTestUsers = await User.find({
      $or: [
        { email: { $regex: /test|dummy|fake|example|demo|admin@unlimiteddata\.gh/i } },
        { phoneNumber: { $regex: /^024(1234567|0000000|1111111|2222222|3333333|4444444|5555555|6666666|7777777|8888888|9999999)$/ } }
      ]
    });

    if (remainingTestUsers.length === 0) {
      console.log('✅ Cleanup verification successful - no test data remaining');
    } else {
      console.log(`⚠️  ${remainingTestUsers.length} test users still remain`);
    }

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
  cleanupTestData();
}

module.exports = cleanupTestData;
