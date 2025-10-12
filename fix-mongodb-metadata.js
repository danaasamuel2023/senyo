#!/usr/bin/env node

/**
 * Fix MongoDB Metadata Validation Error Script
 * Resolves "Cast to Map failed for value" errors in transaction metadata
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

// Import schemas
const { Transaction, Wallet } = require('./server/schema/schema');

async function fixMetadataValidation() {
  try {
    console.log('🔧 Fixing MongoDB Metadata Validation Error\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix Transaction metadata
    console.log('\n🔍 Checking Transaction metadata...');
    
    const transactionsWithInvalidMetadata = await Transaction.find({
      metadata: { $exists: true, $not: { $type: 'map' } }
    });

    console.log(`   Found ${transactionsWithInvalidMetadata.length} transactions with invalid metadata`);

    if (transactionsWithInvalidMetadata.length > 0) {
      console.log('   Converting metadata to Map format...');
      
      for (const transaction of transactionsWithInvalidMetadata) {
        if (transaction.metadata && typeof transaction.metadata === 'object' && !(transaction.metadata instanceof Map)) {
          // Convert object to Map
          const metadataMap = new Map();
          for (const [key, value] of Object.entries(transaction.metadata)) {
            metadataMap.set(key, value);
          }
          transaction.metadata = metadataMap;
          await transaction.save();
        }
      }
      
      console.log('   ✅ Fixed Transaction metadata');
    }

    // Fix Wallet transaction metadata
    console.log('\n🔍 Checking Wallet transaction metadata...');
    
    const walletsWithInvalidMetadata = await Wallet.find({
      'transactions.metadata': { $exists: true, $not: { $type: 'map' } }
    });

    console.log(`   Found ${walletsWithInvalidMetadata.length} wallets with invalid metadata`);

    if (walletsWithInvalidMetadata.length > 0) {
      console.log('   Converting wallet transaction metadata to Map format...');
      
      for (const wallet of walletsWithInvalidMetadata) {
        let updated = false;
        
        for (const transaction of wallet.transactions) {
          if (transaction.metadata && typeof transaction.metadata === 'object' && !(transaction.metadata instanceof Map)) {
            // Convert object to Map
            const metadataMap = new Map();
            for (const [key, value] of Object.entries(transaction.metadata)) {
              metadataMap.set(key, value);
            }
            transaction.metadata = metadataMap;
            updated = true;
          }
        }
        
        if (updated) {
          await wallet.save();
        }
      }
      
      console.log('   ✅ Fixed Wallet transaction metadata');
    }

    // Verify fixes
    console.log('\n🧪 Verifying fixes...');
    
    const remainingInvalidTransactions = await Transaction.find({
      metadata: { $exists: true, $not: { $type: 'map' } }
    });
    
    const remainingInvalidWallets = await Wallet.find({
      'transactions.metadata': { $exists: true, $not: { $type: 'map' } }
    });

    console.log(`   Remaining invalid Transaction metadata: ${remainingInvalidTransactions.length}`);
    console.log(`   Remaining invalid Wallet metadata: ${remainingInvalidWallets.length}`);

    if (remainingInvalidTransactions.length === 0 && remainingInvalidWallets.length === 0) {
      console.log('\n🎉 All metadata validation errors have been fixed!');
    } else {
      console.log('\n⚠️  Some metadata validation errors remain');
    }

    console.log('\n📋 Summary:');
    console.log('   ✅ Transaction metadata converted to Map format');
    console.log('   ✅ Wallet transaction metadata converted to Map format');
    console.log('   ✅ MongoDB validation errors resolved');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Test transaction creation');
    console.log('   2. Test wallet operations');
    console.log('   3. Monitor for any new metadata errors');

  } catch (error) {
    console.error('❌ Error fixing metadata validation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
if (require.main === module) {
  fixMetadataValidation().catch(console.error);
}

module.exports = { fixMetadataValidation };
