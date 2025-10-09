/**
 * Automated Test Runner for Critical Functionality
 * Tests authentication, API endpoints, and user flows
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.isRunning = false;
  }

  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  async runAllTests() {
    if (this.isRunning) {
      console.log('⚠️ Tests already running');
      return;
    }

    this.isRunning = true;
    this.results = [];
    
    console.log('🧪 Starting automated tests...');
    console.log(`📋 Running ${this.tests.length} tests\n`);

    for (const test of this.tests) {
      try {
        console.log(`▶️ Running: ${test.name}`);
        const startTime = performance.now();
        
        const result = await test.testFunction();
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.results.push({
          name: test.name,
          status: 'PASS',
          duration,
          result
        });

        console.log(`✅ PASS: ${test.name} (${duration.toFixed(2)}ms)`);
        
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.results.push({
          name: test.name,
          status: 'FAIL',
          duration,
          error: error.message
        });

        console.log(`❌ FAIL: ${test.name} (${duration.toFixed(2)}ms)`);
        console.log(`   Error: ${error.message}`);
      }
    }

    this.isRunning = false;
    this.printSummary();
    return this.results;
  }

  printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 Test Summary');
    console.log('═══════════════════════════════════════');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log('═══════════════════════════════════════\n');

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
      console.log('');
    }
  }

  getResults() {
    return this.results;
  }

  clearResults() {
    this.results = [];
  }
}

// Test functions
const testFunctions = {
  // Test authentication
  async testAuthentication() {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sunumanfred14@gmail.com',
        password: 'Kingfred4190$'
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('No token received');
    }

    return { token: data.token, user: data.user };
  },

  // Test admin dashboard API
  async testAdminDashboard() {
    const authResult = await testFunctions.testAuthentication();
    
    const response = await fetch('/api/v1/admin/admin/dashboard/statistics', {
      headers: {
        'Authorization': `Bearer ${authResult.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin dashboard API failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.userStats) {
      throw new Error('Invalid admin dashboard response');
    }

    return data;
  },

  // Test admin orders API
  async testAdminOrders() {
    const authResult = await testFunctions.testAuthentication();
    
    const response = await fetch('/api/v1/admin/admin/orders?limit=5', {
      headers: {
        'Authorization': `Bearer ${authResult.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin orders API failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.orders) {
      throw new Error('Invalid admin orders response');
    }

    return data;
  },

  // Test admin transactions API
  async testAdminTransactions() {
    const authResult = await testFunctions.testAuthentication();
    
    const response = await fetch('/api/v1/admin/admin/transactions?limit=5', {
      headers: {
        'Authorization': `Bearer ${authResult.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Admin transactions API failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.transactions) {
      throw new Error('Invalid admin transactions response');
    }

    return data;
  },

  // Test error monitoring
  async testErrorMonitoring() {
    if (typeof window === 'undefined') {
      throw new Error('Error monitoring test requires browser environment');
    }

    if (!window.errorMonitor) {
      throw new Error('Error monitor not initialized');
    }

    // Trigger a test error
    const originalError = console.error;
    console.error('Test error for monitoring');
    
    // Check if error was captured
    const errors = window.errorMonitor.getErrors();
    if (errors.errors.length === 0) {
      throw new Error('Error monitoring not capturing errors');
    }

    return { errorsCaptured: errors.errors.length };
  },

  // Test performance monitoring
  async testPerformanceMonitoring() {
    if (typeof window === 'undefined') {
      throw new Error('Performance monitoring test requires browser environment');
    }

    if (!window.performanceMonitor) {
      throw new Error('Performance monitor not initialized');
    }

    const metrics = window.performanceMonitor.getMetrics();
    const score = window.performanceMonitor.getPerformanceScore();

    return { metrics, score };
  },

  // Test localStorage functionality
  async testLocalStorage() {
    if (typeof window === 'undefined') {
      throw new Error('LocalStorage test requires browser environment');
    }

    const testKey = 'test-key';
    const testValue = 'test-value';

    try {
      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);
      
      if (retrievedValue !== testValue) {
        throw new Error('LocalStorage set/get failed');
      }

      localStorage.removeItem(testKey);
      return { localStorage: 'working' };
    } catch (error) {
      throw new Error(`LocalStorage test failed: ${error.message}`);
    }
  }
};

// Create test runner instance
const testRunner = new TestRunner();

// Add all tests
testRunner.addTest('Authentication', testFunctions.testAuthentication);
testRunner.addTest('Admin Dashboard API', testFunctions.testAdminDashboard);
testRunner.addTest('Admin Orders API', testFunctions.testAdminOrders);
testRunner.addTest('Admin Transactions API', testFunctions.testAdminTransactions);
testRunner.addTest('Error Monitoring', testFunctions.testErrorMonitoring);
testRunner.addTest('Performance Monitoring', testFunctions.testPerformanceMonitoring);
testRunner.addTest('LocalStorage', testFunctions.testLocalStorage);

// Export for global access
if (typeof window !== 'undefined') {
  window.testRunner = testRunner;
  window.runTests = () => testRunner.runAllTests();
  window.getTestResults = () => testRunner.getResults();
}

export default testRunner;
