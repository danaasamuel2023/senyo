// Error Handling Utilities
// Centralized error handling for consistent error messages and logging

export class PaymentError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Error code constants
export const ERROR_CODES = {
  // Payment errors
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  PAYMENT_NETWORK_ERROR: 'PAYMENT_NETWORK_ERROR',
  PAYMENT_INVALID_REFERENCE: 'PAYMENT_INVALID_REFERENCE',
  
  // Network errors
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_CORS_ERROR: 'NETWORK_CORS_ERROR',
  
  // Validation errors
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',
  
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
};

// Error message mappings
export const ERROR_MESSAGES = {
  [ERROR_CODES.PAYMENT_VERIFICATION_FAILED]: 'Payment verification failed. Please try again or contact support.',
  [ERROR_CODES.PAYMENT_TIMEOUT]: 'Payment verification timed out. Please check your connection and try again.',
  [ERROR_CODES.PAYMENT_NETWORK_ERROR]: 'Network error during payment verification. Please check your internet connection.',
  [ERROR_CODES.PAYMENT_INVALID_REFERENCE]: 'Invalid payment reference. Please check your payment details.',
  
  [ERROR_CODES.NETWORK_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.NETWORK_CORS_ERROR]: 'Network configuration error. Please contact support.',
  
  [ERROR_CODES.VALIDATION_INVALID_INPUT]: 'Invalid input provided. Please check your data and try again.',
  [ERROR_CODES.VALIDATION_MISSING_FIELD]: 'Required field is missing. Please provide all required information.',
  
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication required. Please sign in to continue.',
  [ERROR_CODES.AUTH_INVALID_TOKEN]: 'Invalid authentication token. Please sign in again.',
  [ERROR_CODES.AUTH_EXPIRED_TOKEN]: 'Authentication token has expired. Please sign in again.',
};

// Error handler function
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  // Handle specific error types
  if (error instanceof PaymentError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.status,
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      success: false,
      error: error.message,
      code: ERROR_CODES.NETWORK_UNAVAILABLE,
      status: 503,
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      code: ERROR_CODES.VALIDATION_INVALID_INPUT,
      status: 400,
    };
  }
  
  // Handle fetch/network errors
  if (error.name === 'AbortError') {
    return {
      success: false,
      error: ERROR_MESSAGES[ERROR_CODES.PAYMENT_TIMEOUT],
      code: ERROR_CODES.PAYMENT_TIMEOUT,
      status: 408,
    };
  }
  
  if (error.message.includes('Failed to fetch')) {
    return {
      success: false,
      error: ERROR_MESSAGES[ERROR_CODES.PAYMENT_NETWORK_ERROR],
      code: ERROR_CODES.PAYMENT_NETWORK_ERROR,
      status: 503,
    };
  }
  
  // Handle HTTP errors
  if (error.message.includes('HTTP')) {
    const statusMatch = error.message.match(/HTTP (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 500;
    
    return {
      success: false,
      error: error.message,
      code: ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
      status: status,
    };
  }
  
  // Default error
  return {
    success: false,
    error: ERROR_MESSAGES[ERROR_CODES.PAYMENT_VERIFICATION_FAILED],
    code: ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
    status: 500,
  };
};

// Validation helpers
export const validatePaymentReference = (reference) => {
  if (!reference) {
    throw new ValidationError('Payment reference is required', 'reference');
  }
  
  if (typeof reference !== 'string') {
    throw new ValidationError('Payment reference must be a string', 'reference');
  }
  
  if (reference.trim().length === 0) {
    throw new ValidationError('Payment reference cannot be empty', 'reference');
  }
  
  // Basic format validation (Paystack references are typically alphanumeric)
  if (!/^[a-zA-Z0-9_-]+$/.test(reference)) {
    throw new ValidationError('Invalid payment reference format', 'reference');
  }
  
  return true;
};

// Network error detection
export const isNetworkError = (error) => {
  return (
    error.name === 'AbortError' ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.message.includes('CORS')
  );
};

// Retry logic for network errors
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

export default {
  PaymentError,
  NetworkError,
  ValidationError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleError,
  validatePaymentReference,
  isNetworkError,
  withRetry,
};
