const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// BulkClix API Configuration for Mobile Money Collection
const BULKCLIX_BASE_URL = 'https://api.bulkclix.com/api/v1/payment-api';
const BULKCLIX_API_KEY = process.env.BULKCLIX_API_KEY || 'OUxANRH1feWp232T70JyJZpO1PXldZouNqQT8iJa';

// Create BulkClix client for collection
const bulkClixCollectionClient = axios.create({
  baseURL: BULKCLIX_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'x-api-key': BULKCLIX_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Enhanced logging function
const logBulkClixCollection = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BULKCLIX_COLLECTION_${operation}]`, JSON.stringify(data, null, 2));
};

// Intelligent retry mechanism
const retryCollectionOperation = async (operation, maxRetries = 3, delay = 2000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logBulkClixCollection(`RETRY_ATTEMPT_${attempt}`, { operation, attempt, maxRetries });
      const result = await operation();
      if (attempt > 1) {
        logBulkClixCollection('RETRY_SUCCESS', { operation, attempt });
      }
      return result;
    } catch (error) {
      lastError = error;
      logBulkClixCollection('RETRY_ERROR', { 
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

// Collect mobile money from user (reverse of send - this would be for deposits)
// Note: BulkClix API documentation shows "send" operations, but for collection we need to use their collection endpoints
// Since the API docs only show "send", we'll create a collection service that simulates the process
// In a real implementation, you'd need BulkClix's collection API endpoints

const collectMobileMoney = async (amount, phoneNumber, channel, clientReference, description = '') => {
  const payload = {
    amount: amount.toString(),
    phone_number: phoneNumber,
    channel: channel.toUpperCase(),
    client_reference: clientReference,
    description: description || `Mobile money collection for ${clientReference}`
  };

  logBulkClixCollection('MOBILE_MONEY_COLLECTION_REQUEST', payload);

  try {
    // Note: This is a simulated collection since BulkClix API docs only show "send" operations
    // In production, you would need BulkClix's actual collection API endpoint
    // For now, we'll simulate the collection process
    
    const result = await retryCollectionOperation(async () => {
      // Simulate API call - replace with actual BulkClix collection endpoint when available
      // const response = await bulkClixCollectionClient.post('/collect/mobilemoney', payload);
      
      // For now, simulate successful collection
      const simulatedResponse = {
        message: "Collection Successful",
        data: {
          client_reference: clientReference,
          transaction_id: `COL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          amount: amount.toString(),
          channel: channel.toUpperCase(),
          phone_number: phoneNumber,
          status: "completed"
        }
      };
      
      return simulatedResponse;
    });

    logBulkClixCollection('MOBILE_MONEY_COLLECTION_SUCCESS', result);
    return { success: true, data: result };
  } catch (error) {
    logBulkClixCollection('MOBILE_MONEY_COLLECTION_ERROR', {
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

// Collect from bank account (for deposits)
const collectFromBank = async (amount, accountNumber, bankId, clientReference, description = '') => {
  const payload = {
    amount: amount.toString(),
    account_number: accountNumber,
    bank_id: bankId,
    client_reference: clientReference,
    description: description || `Bank collection for ${clientReference}`
  };

  logBulkClixCollection('BANK_COLLECTION_REQUEST', payload);

  try {
    // Note: This is a simulated collection since BulkClix API docs only show "send" operations
    // In production, you would need BulkClix's actual collection API endpoint
    
    const result = await retryCollectionOperation(async () => {
      // Simulate API call - replace with actual BulkClix collection endpoint when available
      // const response = await bulkClixCollectionClient.post('/collect/bank', payload);
      
      // For now, simulate successful collection
      const simulatedResponse = {
        message: "Collection Successful",
        data: {
          client_reference: clientReference,
          transaction_id: `COL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          amount: amount.toString(),
          account_number: accountNumber,
          bank_id: bankId,
          status: "completed"
        }
      };
      
      return simulatedResponse;
    });

    logBulkClixCollection('BANK_COLLECTION_SUCCESS', result);
    return { success: true, data: result };
  } catch (error) {
    logBulkClixCollection('BANK_COLLECTION_ERROR', {
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

// Get supported mobile money networks
const getSupportedNetworks = () => {
  return {
    success: true,
    data: [
      { id: 'MTN', name: 'MTN Mobile Money', code: 'MTN' },
      { id: 'VODAFONE', name: 'Vodafone Cash', code: 'VODAFONE' },
      { id: 'AIRTELTIGO', name: 'AirtelTigo Money', code: 'AIRTELTIGO' }
    ]
  };
};

// Validate mobile money number
const validateMobileMoneyNumber = (phoneNumber, network) => {
  const phoneRegex = /^0[0-9]{9}$/;
  
  if (!phoneRegex.test(phoneNumber)) {
    return { valid: false, message: 'Invalid phone number format. Use 0XXXXXXXXX' };
  }
  
  // Network-specific validation
  if (network.toUpperCase() === 'MTN' && !phoneNumber.startsWith('024') && !phoneNumber.startsWith('054') && !phoneNumber.startsWith('055') && !phoneNumber.startsWith('059')) {
    return { valid: false, message: 'Invalid MTN number. MTN numbers start with 024, 054, 055, or 059' };
  }
  
  if (network.toUpperCase() === 'VODAFONE' && !phoneNumber.startsWith('020') && !phoneNumber.startsWith('050')) {
    return { valid: false, message: 'Invalid Vodafone number. Vodafone numbers start with 020 or 050' };
  }
  
  if (network.toUpperCase() === 'AIRTELTIGO' && !phoneNumber.startsWith('026') && !phoneNumber.startsWith('056')) {
    return { valid: false, message: 'Invalid AirtelTigo number. AirtelTigo numbers start with 026 or 056' };
  }
  
  return { valid: true };
};

module.exports = {
  collectMobileMoney,
  collectFromBank,
  getSupportedNetworks,
  validateMobileMoneyNumber
};
