#!/usr/bin/env node

/**
 * Test Admin Routes
 * This script tests if admin routes are working correctly
 */

const express = require('express');
const path = require('path');

// Create a minimal test server
const app = express();

// Import admin routes
const adminV1Routes = require('./adminRoutes/adminV1Routes');
const AdminManagement = require('./admin-management/adminManagemet');

// Create admin router
const adminRouter = express.Router();

// Mount admin routes
adminRouter.use('/', AdminManagement);
adminRouter.use('/', adminV1Routes);

// Mount admin router
app.use('/api/v1/admin', adminRouter);

// Test route
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test server working' });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Testing admin routes...');
  
  // Test the routes
  const http = require('http');
  
  const testRoute = (path, callback) => {
    const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          callback(null, result);
        } catch (e) {
          callback(e, data);
        }
      });
    });
    
    req.on('error', callback);
  };
  
  // Test routes
  testRoute('/api/v1/admin/orders?limit=5', (err, result) => {
    if (err) {
      console.log('❌ Orders route error:', err.message);
    } else {
      console.log('✅ Orders route response:', result);
    }
  });
  
  testRoute('/api/v1/admin/transactions?limit=5', (err, result) => {
    if (err) {
      console.log('❌ Transactions route error:', err.message);
    } else {
      console.log('✅ Transactions route response:', result);
    }
  });
  
  testRoute('/api/v1/admin/dashboard/statistics', (err, result) => {
    if (err) {
      console.log('❌ Dashboard route error:', err.message);
    } else {
      console.log('✅ Dashboard route response:', result);
    }
    
    // Close server after tests
    setTimeout(() => {
      console.log('Test complete. Closing server...');
      process.exit(0);
    }, 1000);
  });
});
