const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// BulkClix API Configuration
const BULKCLIX_BASE_URL = 'https://api.bulkclix.com/api/v1/payment-api';
const BULKCLIX_API_KEY = process.env.BULKCLIX_API_KEY || 'OUxANRH1feWp232T70JyJZpO1PXldZouNqQT8iJa';

// Create BulkClix client with intelligent configuration
const bulkClixClient = axios.create({
  baseURL: BULKCLIX_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'x-api-key': BULKCLIX_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Enhanced logging function
const logBulkClixOperation = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BULKCLIX_${operation}]`, JSON.stringify(data, null, 2));
};

// Intelligent retry mechanism
const retryOperation = async (operation, maxRetries = 3, delay = 2000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logBulkClixOperation(`RETRY_ATTEMPT_${attempt}`, { operation, attempt, maxRetries });
      const result = await operation();
      if (attempt > 1) {
        logBulkClixOperation('RETRY_SUCCESS', { operation, attempt });
      }
      return result;
    } catch (error) {
      lastError = error;
      logBulkClixOperation('RETRY_ERROR', { 
        operation, 
        attempt, 
        error: error.message,
        status: error.response?.status 
      });
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Send money to bank account
const sendToBank = async (amount, accountNumber, accountName, bankId, clientReference) => {
  const payload = {
    amount: amount.toString(),
    account_number: accountNumber,
    account_name: accountName,
    bank_id: bankId,
    client_reference: clientReference
  };

  logBulkClixOperation('BANK_TRANSFER_REQUEST', payload);

  try {
    const result = await retryOperation(async () => {
      const response = await bulkClixClient.post('/send/bank', payload);
      return response.data;
    });

    logBulkClixOperation('BANK_TRANSFER_SUCCESS', result);
    return { success: true, data: result };
  } catch (error) {
    logBulkClixOperation('BANK_TRANSFER_ERROR', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return { 
      success: false, 
      error: error.response?.data || { message: error.message },
      statusCode: error.response?.status
    };
  }
};

// Send money to mobile money
const sendToMobileMoney = async (amount, accountNumber, channel, accountName, clientReference) => {
  const payload = {
    amount: amount.toString(),
    account_number: accountNumber,
    channel: channel,
    account_name: accountName,
    client_reference: clientReference
  };

  logBulkClixOperation('MOBILE_MONEY_REQUEST', payload);

  try {
    const result = await retryOperation(async () => {
      const response = await bulkClixClient.post('/send/mobilemoney', payload);
      return response.data;
    });

    logBulkClixOperation('MOBILE_MONEY_SUCCESS', result);
    return { success: true, data: result };
  } catch (error) {
    logBulkClixOperation('MOBILE_MONEY_ERROR', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return { 
      success: false, 
      error: error.response?.data || { message: error.message },
      statusCode: error.response?.status
    };
  }
};

// Get banks list with caching
let banksCache = null;
let banksCacheExpiry = null;
const BANKS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getBanksList = async (forceRefresh = false) => {
  // Check cache first
  if (!forceRefresh && banksCache && banksCacheExpiry && new Date() < banksCacheExpiry) {
    logBulkClixOperation('BANKS_CACHE_HIT', { cacheAge: new Date() - banksCacheExpiry });
    return { success: true, data: banksCache, cached: true };
  }

  logBulkClixOperation('BANKS_REQUEST', { forceRefresh });

  try {
    const result = await retryOperation(async () => {
      const response = await bulkClixClient.get('/banks/list');
      return response.data;
    });

    // Update cache
    banksCache = result.data;
    banksCacheExpiry = new Date(Date.now() + BANKS_CACHE_DURATION);
    
    logBulkClixOperation('BANKS_SUCCESS', { count: result.data?.length || 0 });
    return { success: true, data: result.data, cached: false };
  } catch (error) {
    logBulkClixOperation('BANKS_ERROR', {
      error: error.message,
      status: error.response?.status
    });
    
    return { 
      success: false, 
      error: error.response?.data || { message: error.message }
    };
  }
};

// Verify bank account
const verifyBankAccount = async (accountNumber, bankId) => {
  const params = {
    account_number: accountNumber,
    bank_id: bankId
  };

  logBulkClixOperation('ACCOUNT_VERIFICATION_REQUEST', params);

  try {
    const result = await retryOperation(async () => {
      const response = await bulkClixClient.get('/bankNameQuery', { params });
      return response.data;
    });

    logBulkClixOperation('ACCOUNT_VERIFICATION_SUCCESS', result);
    return { success: true, data: result.data };
  } catch (error) {
    logBulkClixOperation('ACCOUNT_VERIFICATION_ERROR', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return { 
      success: false, 
      error: error.response?.data || { message: error.message }
    };
  }
};

module.exports = {
  sendToBank,
  sendToMobileMoney,
  getBanksList,
  verifyBankAccount
};
