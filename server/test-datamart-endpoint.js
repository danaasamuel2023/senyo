const express = require('express');
const axios = require('axios');
const router = express.Router();

// DataMart API Configuration
const DATAMART_BASE_URL = 'https://api.datamartgh.shop';
const DATAMART_API_KEY = process.env.DATAMART_API_KEY || 'f3d158934310f9c63f3f1b68f2f1ecda916ffada9ea984740c4f3902250f534d';

const datamartClient = axios.create({
  baseURL: DATAMART_BASE_URL,
  headers: {
    'x-api-key': DATAMART_API_KEY
  }
});

// Test endpoint to check DataMart API connectivity
router.get('/test-datamart', async (req, res) => {
  try {
    console.log('🔍 Testing DataMart API connectivity...');
    
    const results = {
      apiKey: DATAMART_API_KEY,
      baseURL: DATAMART_BASE_URL,
      timestamp: new Date().toISOString(),
      tests: []
    };
    
    // Test 1: Basic server connectivity
    try {
      const serverResponse = await axios.get(DATAMART_BASE_URL, { timeout: 5000 });
      results.tests.push({
        test: 'Server Connectivity',
        status: 'SUCCESS',
        statusCode: serverResponse.status,
        message: 'Server is reachable'
      });
    } catch (error) {
      results.tests.push({
        test: 'Server Connectivity',
        status: 'FAILED',
        error: error.message,
        message: 'Server is not reachable'
      });
    }
    
    // Test 2: API key validation with different endpoints
    const endpoints = [
      '/api/data-packages',
      '/api/packages',
      '/api/balance',
      '/api/status',
      '/data-packages',
      '/packages',
      '/balance',
      '/status'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await datamartClient.get(endpoint, { timeout: 5000 });
        results.tests.push({
          test: `Endpoint: ${endpoint}`,
          status: 'SUCCESS',
          statusCode: response.status,
          data: response.data,
          message: 'Endpoint is working'
        });
        break; // Stop on first success
      } catch (error) {
        results.tests.push({
          test: `Endpoint: ${endpoint}`,
          status: 'FAILED',
          statusCode: error.response?.status,
          error: error.message,
          message: 'Endpoint not found'
        });
      }
    }
    
    // Test 3: Alternative API patterns
    const alternativePatterns = [
      { url: `${DATAMART_BASE_URL}/v1/data-packages`, headers: { 'x-api-key': DATAMART_API_KEY } },
      { url: `${DATAMART_BASE_URL}/v1/packages`, headers: { 'x-api-key': DATAMART_API_KEY } },
      { url: `${DATAMART_BASE_URL}/data`, headers: { 'x-api-key': DATAMART_API_KEY } },
      { url: `${DATAMART_BASE_URL}/api`, headers: { 'x-api-key': DATAMART_API_KEY } }
    ];
    
    for (const pattern of alternativePatterns) {
      try {
        const response = await axios.get(pattern.url, { 
          headers: pattern.headers, 
          timeout: 5000 
        });
        results.tests.push({
          test: `Alternative Pattern: ${pattern.url}`,
          status: 'SUCCESS',
          statusCode: response.status,
          data: response.data,
          message: 'Alternative endpoint found'
        });
        break;
      } catch (error) {
        results.tests.push({
          test: `Alternative Pattern: ${pattern.url}`,
          status: 'FAILED',
          statusCode: error.response?.status,
          error: error.message
        });
      }
    }
    
    // Summary
    const successCount = results.tests.filter(t => t.status === 'SUCCESS').length;
    const totalTests = results.tests.length;
    
    results.summary = {
      totalTests,
      successCount,
      failureCount: totalTests - successCount,
      overallStatus: successCount > 0 ? 'PARTIAL_SUCCESS' : 'FAILED'
    };
    
    console.log(`📊 Test Results: ${successCount}/${totalTests} tests passed`);
    
    res.json({
      success: true,
      message: 'DataMart API test completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to test DataMart API'
    });
  }
});

// Fallback endpoint for data packages when DataMart is down
router.get('/fallback-packages', async (req, res) => {
  try {
    const { network = 'MTN' } = req.query;
    
    // Fallback data packages (hardcoded for when DataMart is unavailable)
    const fallbackPackages = {
      'MTN': [
        { capacity: '1', price: 4.7, description: 'MTN 1GB Data Bundle' },
        { capacity: '2', price: 8.9, description: 'MTN 2GB Data Bundle' },
        { capacity: '3', price: 13.0, description: 'MTN 3GB Data Bundle' },
        { capacity: '4', price: 17.0, description: 'MTN 4GB Data Bundle' },
        { capacity: '5', price: 21.0, description: 'MTN 5GB Data Bundle' },
        { capacity: '6', price: 25.1, description: 'MTN 6GB Data Bundle' },
        { capacity: '7', price: 29.0, description: 'MTN 7GB Data Bundle' },
        { capacity: '8', price: 33.3, description: 'MTN 8GB Data Bundle' },
        { capacity: '10', price: 41.5, description: 'MTN 10GB Data Bundle' },
        { capacity: '15', price: 62.0, description: 'MTN 15GB Data Bundle' },
        { capacity: '20', price: 82.5, description: 'MTN 20GB Data Bundle' },
        { capacity: '25', price: 103.0, description: 'MTN 25GB Data Bundle' },
        { capacity: '30', price: 123.5, description: 'MTN 30GB Data Bundle' },
        { capacity: '40', price: 164.5, description: 'MTN 40GB Data Bundle' },
        { capacity: '50', price: 205.5, description: 'MTN 50GB Data Bundle' },
        { capacity: '60', price: 246.5, description: 'MTN 60GB Data Bundle' },
        { capacity: '80', price: 328.5, description: 'MTN 80GB Data Bundle' },
        { capacity: '100', price: 410.5, description: 'MTN 100GB Data Bundle' }
      ],
      'AT': [
        { capacity: '1', price: 3.95, description: 'AirtelTigo 1GB Data Bundle' },
        { capacity: '2', price: 8.35, description: 'AirtelTigo 2GB Data Bundle' },
        { capacity: '3', price: 13.25, description: 'AirtelTigo 3GB Data Bundle' },
        { capacity: '4', price: 16.50, description: 'AirtelTigo 4GB Data Bundle' },
        { capacity: '5', price: 19.50, description: 'AirtelTigo 5GB Data Bundle' },
        { capacity: '6', price: 23.50, description: 'AirtelTigo 6GB Data Bundle' },
        { capacity: '8', price: 30.50, description: 'AirtelTigo 8GB Data Bundle' },
        { capacity: '10', price: 38.50, description: 'AirtelTigo 10GB Data Bundle' },
        { capacity: '12', price: 45.50, description: 'AirtelTigo 12GB Data Bundle' },
        { capacity: '15', price: 57.50, description: 'AirtelTigo 15GB Data Bundle' },
        { capacity: '25', price: 95.00, description: 'AirtelTigo 25GB Data Bundle' },
        { capacity: '30', price: 115.00, description: 'AirtelTigo 30GB Data Bundle' },
        { capacity: '40', price: 151.00, description: 'AirtelTigo 40GB Data Bundle' },
        { capacity: '50', price: 190.00, description: 'AirtelTigo 50GB Data Bundle' }
      ],
      'TELECEL': [
        { capacity: '5', price: 19.50, description: 'Telecel 5GB Data Bundle' },
        { capacity: '8', price: 34.64, description: 'Telecel 8GB Data Bundle' },
        { capacity: '10', price: 36.50, description: 'Telecel 10GB Data Bundle' },
        { capacity: '12', price: 43.70, description: 'Telecel 12GB Data Bundle' },
        { capacity: '15', price: 52.85, description: 'Telecel 15GB Data Bundle' },
        { capacity: '20', price: 69.80, description: 'Telecel 20GB Data Bundle' },
        { capacity: '25', price: 86.75, description: 'Telecel 25GB Data Bundle' },
        { capacity: '30', price: 103.70, description: 'Telecel 30GB Data Bundle' },
        { capacity: '35', price: 120.65, description: 'Telecel 35GB Data Bundle' },
        { capacity: '40', price: 137.60, description: 'Telecel 40GB Data Bundle' },
        { capacity: '45', price: 154.55, description: 'Telecel 45GB Data Bundle' },
        { capacity: '50', price: 171.50, description: 'Telecel 50GB Data Bundle' },
        { capacity: '100', price: 341.00, description: 'Telecel 100GB Data Bundle' }
      ]
    };
    
    const packages = fallbackPackages[network.toUpperCase()] || fallbackPackages['MTN'];
    
    res.json({
      success: true,
      message: 'Fallback packages retrieved successfully',
      data: packages,
      source: 'fallback',
      network: network.toUpperCase(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Fallback packages error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve fallback packages'
    });
  }
});

// Smart endpoint that tries DataMart first, then falls back
router.get('/smart-packages', async (req, res) => {
  try {
    const { network = 'MTN' } = req.query;
    
    console.log(`🔍 Attempting to get packages for ${network}...`);
    
    // Try DataMart first
    try {
      const datamartResponse = await datamartClient.get('/api/data-packages', {
        params: { network },
        timeout: 5000
      });
      
      if (datamartResponse.data && datamartResponse.data.success) {
        console.log('✅ DataMart API working, using live data');
        return res.json({
          success: true,
          message: 'Packages retrieved from DataMart API',
          data: datamartResponse.data.data,
          source: 'datamart',
          network,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('⚠️ DataMart API failed, falling back to local data');
    }
    
    // Fallback to local data
    const fallbackResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/test-datamart/fallback-packages?network=${network}`);
    
    res.json({
      ...fallbackResponse.data,
      message: 'Packages retrieved from fallback data (DataMart API unavailable)',
      datamartStatus: 'unavailable'
    });
    
  } catch (error) {
    console.error('❌ Smart packages error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve packages'
    });
  }
});

module.exports = router;
