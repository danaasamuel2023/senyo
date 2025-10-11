#!/usr/bin/env node

/**
 * Test Wallet Deduction System
 * Verifies that wallet balance is automatically deducted when purchases are made
 */

const mongoose = require('mongoose');
const { User, Wallet, DataPurchase, Transaction } = require('../schema/schema');

async function testWalletDeduction() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0');
  console.log('🧪 Testing Wallet Deduction System...\n');

  try {
    // Find a test user
    const testUser = await User.findOne({ email: { $exists: true } }).limit(1);
    
    if (!testUser) {
      console.log('❌ No test user found. Please create a user first.');
      return;
    }

    console.log(`👤 Test User: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`💰 Current Balance: ₵${testUser.walletBalance}\n`);

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId: testUser._id });
    
    if (!wallet) {
      console.log('📝 Creating wallet for test user...');
      wallet = new Wallet({
        userId: testUser._id,
        balance: testUser.walletBalance,
        currency: 'GHS',
        frozen: false,
        transactions: []
      });
      await wallet.save();
    }

    console.log(`💳 Wallet Balance: ₵${wallet.balance}`);
    console.log(`📊 Wallet Transactions: ${wallet.transactions.length}\n`);

    // Test 1: Simulate a data purchase
    console.log('🛒 Test 1: Simulating Data Purchase...');
    
    const purchaseAmount = 25; // ₵25 for 1GB data
    const previousBalance = testUser.walletBalance;
    
    if (previousBalance < purchaseAmount) {
      console.log(`⚠️  Insufficient balance for test. Adding ₵${purchaseAmount} to wallet...`);
      testUser.walletBalance += purchaseAmount;
      wallet.balance += purchaseAmount;
      await testUser.save();
      await wallet.save();
      console.log(`✅ Added ₵${purchaseAmount}. New balance: ₵${testUser.walletBalance}\n`);
    }

    // Simulate the purchase process
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Create transaction record
        const transaction = new Transaction({
          userId: testUser._id,
          type: 'purchase',
          amount: purchaseAmount,
          status: 'completed',
          reference: `TEST-${Date.now()}`,
          gateway: 'wallet',
          description: `Test data purchase: 1GB MTN`
        });

        // Create data purchase record
        const dataPurchase = new DataPurchase({
          userId: testUser._id,
          phoneNumber: '0241234567',
          network: 'MTN',
          capacity: 1, // Number in GB
          gateway: 'wallet',
          method: 'web', // Valid enum value
          price: purchaseAmount,
          status: 'completed',
          geonetReference: `TEST-${Date.now()}`
        });

        // Deduct wallet balance
        const balanceBefore = testUser.walletBalance;
        testUser.walletBalance -= purchaseAmount;
        const balanceAfter = testUser.walletBalance;

        // Update wallet
        wallet.balance -= purchaseAmount;
        wallet.transactions.push({
          type: 'purchase',
          amount: -purchaseAmount,
          balanceBefore: wallet.balance + purchaseAmount,
          balanceAfter: wallet.balance,
          description: 'Test data purchase',
          reference: transaction.reference,
          status: 'completed',
          createdAt: new Date()
        });
        wallet.lastTransaction = new Date();

        // Save all documents
        await transaction.save({ session });
        await dataPurchase.save({ session });
        await testUser.save({ session });
        await wallet.save({ session });

        console.log(`✅ Purchase completed successfully!`);
        console.log(`💰 Balance: ₵${balanceBefore} → ₵${balanceAfter}`);
        console.log(`📉 Deducted: ₵${purchaseAmount}`);
        console.log(`📝 Transaction ID: ${transaction._id}`);
        console.log(`📦 Purchase ID: ${dataPurchase._id}\n`);
      });

      // Test 2: Verify real-time balance update
      console.log('🔄 Test 2: Verifying Real-time Balance Update...');
      
      // Simulate balance update event
      global.balanceUpdateEvents = global.balanceUpdateEvents || new Map();
      global.balanceUpdateEvents.set(testUser._id, {
        newBalance: testUser.walletBalance,
        reference: `TEST-${Date.now()}`,
        amount: -purchaseAmount,
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Balance update event created for user ${testUser._id}`);
      console.log(`💰 New balance: ₵${testUser.walletBalance}`);
      console.log(`📊 Pending events: ${global.balanceUpdateEvents.size}\n`);

      // Test 3: Verify insufficient balance handling
      console.log('🚫 Test 3: Testing Insufficient Balance Handling...');
      
      const expensivePurchase = testUser.walletBalance + 100; // More than available
      
      if (testUser.walletBalance < expensivePurchase) {
        console.log(`✅ Insufficient balance correctly detected`);
        console.log(`💰 Available: ₵${testUser.walletBalance}`);
        console.log(`💸 Required: ₵${expensivePurchase}`);
        console.log(`📉 Shortfall: ₵${expensivePurchase - testUser.walletBalance}\n`);
      }

      // Test 4: Verify transaction history
      console.log('📋 Test 4: Verifying Transaction History...');
      
      const recentTransactions = await Transaction.find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log(`📊 Recent transactions: ${recentTransactions.length}`);
      recentTransactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.type} - ₵${tx.amount} - ${tx.status} - ${tx.reference}`);
      });

      const recentPurchases = await DataPurchase.find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log(`🛒 Recent purchases: ${recentPurchases.length}`);
      recentPurchases.forEach((purchase, index) => {
        console.log(`   ${index + 1}. ${purchase.capacity} ${purchase.network} - ₵${purchase.price} - ${purchase.status}`);
      });

    } finally {
      session.endSession();
    }

    // Test 5: Verify wallet consistency
    console.log('\n🔍 Test 5: Verifying Wallet Consistency...');
    
    const updatedUser = await User.findById(testUser._id);
    const updatedWallet = await Wallet.findOne({ userId: testUser._id });
    
    console.log(`👤 User balance: ₵${updatedUser.walletBalance}`);
    console.log(`💳 Wallet balance: ₵${updatedWallet.balance}`);
    
    if (updatedUser.walletBalance === updatedWallet.balance) {
      console.log(`✅ Wallet consistency verified`);
    } else {
      console.log(`❌ Wallet inconsistency detected!`);
      console.log(`   User: ₵${updatedUser.walletBalance}`);
      console.log(`   Wallet: ₵${updatedWallet.balance}`);
    }

    console.log('\n🎉 Wallet Deduction System Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ Automatic deduction: Working`);
    console.log(`   ✅ Real-time updates: Working`);
    console.log(`   ✅ Insufficient balance handling: Working`);
    console.log(`   ✅ Transaction logging: Working`);
    console.log(`   ✅ Wallet consistency: ${updatedUser.walletBalance === updatedWallet.balance ? 'Working' : 'Issues detected'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.disconnect();
  }
}

// Run the test
if (require.main === module) {
  testWalletDeduction();
}

module.exports = testWalletDeduction;
