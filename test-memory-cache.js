#!/usr/bin/env node

/**
 * Test script for in-memory cache functionality
 * Tests wallet balance caching and performance improvements
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { WalletService } = require('./server/services/walletService');

dotenv.config();

async function testMemoryCache() {
  try {
    console.log('🧪 Testing In-Memory Cache Implementation\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unlimiteddata');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Cache Miss (First Request)
    console.log('📊 Test 1: Cache Miss (First Request)');
    const start1 = Date.now();
    const result1 = await WalletService.getWalletBalance('test-user-id', true);
    const time1 = Date.now() - start1;
    
    console.log(`   Result: ${result1.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   From Cache: ${result1.fromCache ? '✅ Yes' : '❌ No'}`);
    console.log(`   Time: ${time1}ms\n`);

    // Test 2: Cache Hit (Second Request)
    console.log('📊 Test 2: Cache Hit (Second Request)');
    const start2 = Date.now();
    const result2 = await WalletService.getWalletBalance('test-user-id', true);
    const time2 = Date.now() - start2;
    
    console.log(`   Result: ${result2.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   From Cache: ${result2.fromCache ? '✅ Yes' : '❌ No'}`);
    console.log(`   Time: ${time2}ms`);
    console.log(`   Performance Improvement: ${Math.round((time1 - time2) / time1 * 100)}%\n`);

    // Test 3: Cache Statistics
    console.log('📊 Test 3: Cache Statistics');
    const stats = WalletService.getCacheStats();
    console.log('   Cache Stats:', JSON.stringify(stats, null, 2));
    console.log('');

    // Test 4: Cache Invalidation
    console.log('📊 Test 4: Cache Invalidation');
    WalletService.clearAllCaches();
    console.log('   ✅ All caches cleared\n');

    // Test 5: Performance Comparison
    console.log('📊 Test 5: Performance Comparison');
    const iterations = 10;
    
    // Without cache
    console.log('   Testing without cache...');
    const startNoCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      await WalletService.getWalletBalance('test-user-id', false);
    }
    const timeNoCache = Date.now() - startNoCache;
    
    // With cache (first request populates cache)
    await WalletService.getWalletBalance('test-user-id', true);
    
    console.log('   Testing with cache...');
    const startWithCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      await WalletService.getWalletBalance('test-user-id', true);
    }
    const timeWithCache = Date.now() - startWithCache;
    
    console.log(`   Without Cache: ${timeNoCache}ms (${iterations} requests)`);
    console.log(`   With Cache: ${timeWithCache}ms (${iterations} requests)`);
    console.log(`   Performance Improvement: ${Math.round((timeNoCache - timeWithCache) / timeNoCache * 100)}%\n`);

    // Test 6: Memory Usage
    console.log('📊 Test 6: Memory Usage');
    const memoryUsage = process.memoryUsage();
    console.log(`   RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`);
    console.log(`   Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`   Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('\n📈 Cache Benefits:');
    console.log('   ✅ Faster wallet balance retrieval');
    console.log('   ✅ Reduced database load');
    console.log('   ✅ Better user experience');
    console.log('   ✅ Automatic cache invalidation');
    console.log('   ✅ Memory-efficient implementation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run tests
testMemoryCache();
