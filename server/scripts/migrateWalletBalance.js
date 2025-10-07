#!/usr/bin/env node

/**
 * Migration Script: Sync User.walletBalance to Wallet Collection
 * 
 * This script migrates the old user.walletBalance field to the new Wallet collection
 * to ensure consistency across the system.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Wallet } = require('../schema/schema');

dotenv.config();

async function migrateWalletBalances() {
  try {
    console.log('🔄 Starting wallet balance migration...');
    
    // Connect to MongoDB using the same method as the server
    const username = process.env.MONGODB_USERNAME || 'dajounimarket';
    const password = process.env.MONGODB_PASSWORD || '';
    const cluster = process.env.MONGODB_CLUSTER || 'cluster0.kp8c2.mongodb.net';
    
    const uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true,
    };
    
    await mongoose.connect(uri, options);
    
    console.log('✅ Connected to MongoDB');
    
    // Find all users with walletBalance > 0
    const usersWithBalance = await User.find({ 
      walletBalance: { $gt: 0 } 
    }).select('_id walletBalance firstName lastName email');
    
    console.log(`📊 Found ${usersWithBalance.length} users with wallet balance > 0`);
    
    let migratedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const user of usersWithBalance) {
      try {
        // Check if wallet already exists
        let wallet = await Wallet.findOne({ userId: user._id });
        
        if (!wallet) {
          // Create new wallet with the user's balance
          wallet = new Wallet({
            userId: user._id,
            balance: user.walletBalance,
            currency: 'GHS',
            frozen: false,
            transactions: [{
              type: 'deposit',
              amount: user.walletBalance,
              balanceBefore: 0,
              balanceAfter: user.walletBalance,
              description: 'Initial balance migration from user.walletBalance',
              reference: `MIGRATION_${user._id}_${Date.now()}`,
              status: 'completed',
              metadata: {
                migration: true,
                originalBalance: user.walletBalance,
                migratedAt: new Date()
              },
              createdAt: new Date()
            }],
            lastTransaction: new Date()
          });
          
          await wallet.save();
          createdCount++;
          console.log(`✅ Created wallet for user ${user.firstName} ${user.lastName} (${user.email}) with balance ₵${user.walletBalance}`);
        } else {
          // Update existing wallet if the balance is different
          if (wallet.balance !== user.walletBalance) {
            const balanceDifference = user.walletBalance - wallet.balance;
            
            // Add migration transaction
            wallet.transactions.push({
              type: balanceDifference > 0 ? 'deposit' : 'withdrawal',
              amount: Math.abs(balanceDifference),
              balanceBefore: wallet.balance,
              balanceAfter: user.walletBalance,
              description: `Balance adjustment migration (${balanceDifference > 0 ? 'added' : 'deducted'} ₵${Math.abs(balanceDifference)})`,
              reference: `MIGRATION_ADJUST_${user._id}_${Date.now()}`,
              status: 'completed',
              metadata: {
                migration: true,
                adjustment: true,
                originalWalletBalance: wallet.balance,
                userWalletBalance: user.walletBalance,
                difference: balanceDifference,
                migratedAt: new Date()
              },
              createdAt: new Date()
            });
            
            wallet.balance = user.walletBalance;
            wallet.lastTransaction = new Date();
            await wallet.save();
            updatedCount++;
            console.log(`🔄 Updated wallet for user ${user.firstName} ${user.lastName} (${user.email}) from ₵${wallet.balance - balanceDifference} to ₵${user.walletBalance}`);
          } else {
            console.log(`⏭️  Wallet already up to date for user ${user.firstName} ${user.lastName} (${user.email})`);
          }
        }
        
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating wallet for user ${user._id}:`, error.message);
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`   Total users processed: ${migratedCount}`);
    console.log(`   New wallets created: ${createdCount}`);
    console.log(`   Existing wallets updated: ${updatedCount}`);
    console.log(`   Users skipped (already up to date): ${migratedCount - createdCount - updatedCount}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const totalUserBalance = await User.aggregate([
      { $match: { walletBalance: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$walletBalance' } } }
    ]);
    
    const totalWalletBalance = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const userTotal = totalUserBalance[0]?.total || 0;
    const walletTotal = totalWalletBalance[0]?.total || 0;
    
    console.log(`   Total User.walletBalance: ₵${userTotal}`);
    console.log(`   Total Wallet.balance: ₵${walletTotal}`);
    
    if (Math.abs(userTotal - walletTotal) < 0.01) {
      console.log('✅ Migration verification successful! Balances match.');
    } else {
      console.log('⚠️  Warning: Balance totals do not match. Please review the migration.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateWalletBalances();
}

module.exports = { migrateWalletBalances };
