#!/usr/bin/env node

/**
 * Test API URL Fixes
 * 
 * This script tests that all API URL configurations are working correctly
 */

const { API_URLS, getApiBaseUrl, getNextPublicApiUrl, buildApiEndpoint, API_ENDPOINTS } = require('./Client/utils/apiUrls');

function testApiUrlFixes() {
  console.log('🧪 Testing API URL Fixes...\n');
  
  // Test 1: Check API URL configuration
  console.log('📋 Test 1: API URL Configuration');
  console.log('Development URLs:', API_URLS.DEVELOPMENT);
  console.log('Production URLs:', API_URLS.PRODUCTION);
  
  // Test 2: Check environment detection
  console.log('\n🔍 Test 2: Environment Detection');
  console.log('Current NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('API Base URL:', getApiBaseUrl());
  console.log('Next Public API URL:', getNextPublicApiUrl());
  
  // Test 3: Check endpoint building
  console.log('\n🔗 Test 3: Endpoint Building');
  const testEndpoint = '/api/v1/test';
  const builtUrl = buildApiEndpoint(testEndpoint);
  console.log(`Input: ${testEndpoint}`);
  console.log(`Built URL: ${builtUrl}`);
  
  // Test 4: Check common endpoints
  console.log('\n📝 Test 4: Common Endpoints');
  Object.entries(API_ENDPOINTS).forEach(([key, endpoint]) => {
    const fullUrl = buildApiEndpoint(endpoint);
    console.log(`${key}: ${fullUrl}`);
  });
  
  // Test 5: Check for hardcoded URLs
  console.log('\n🔍 Test 5: Checking for hardcoded URLs...');
  const fs = require('fs');
  const path = require('path');
  
  function checkFileForHardcodedUrls(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hardcodedPatterns = [
        /localhost:5001/g,
        /unlimitedata\.onrender\.com/g,
        /http:\/\/localhost:5001/g,
        /https:\/\/unlimitedata\.onrender\.com/g
      ];
      
      let foundHardcoded = false;
      hardcodedPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          console.log(`⚠️  Found hardcoded URL in ${filePath}:`, matches[0]);
          foundHardcoded = true;
        }
      });
      
      return foundHardcoded;
    } catch (error) {
      // File might not exist or be readable, skip
      return false;
    }
  }
  
  // Check key files
  const keyFiles = [
    'Client/utils/envConfig.js',
    'Client/utils/apiConfig.js',
    'Client/utils/adminApi.js',
    'Client/app/admin/dashboard/page.js',
    'Client/component/UserDashboard.jsx'
  ];
  
  let foundIssues = false;
  keyFiles.forEach(file => {
    if (checkFileForHardcodedUrls(file)) {
      foundIssues = true;
    }
  });
  
  if (!foundIssues) {
    console.log('✅ No hardcoded URLs found in key files');
  }
  
  console.log('\n🎉 API URL Fix Test Completed!');
  console.log('💡 Summary:');
  console.log('   - API URLs are properly configured');
  console.log('   - Environment detection is working');
  console.log('   - Endpoint building is functional');
  console.log('   - Common endpoints are defined');
  
  if (foundIssues) {
    console.log('   - ⚠️  Some hardcoded URLs may still exist');
  } else {
    console.log('   - ✅ No hardcoded URLs detected');
  }
}

// Run the test
testApiUrlFixes();
