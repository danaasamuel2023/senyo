'use server';

import { API_ENDPOINTS, getFullEndpoint } from '../../../utils/apiEndpoints';
import { handleError, validatePaymentReference, withRetry } from '../../../utils/errorHandler';

export async function verifyPayment(reference) {
  try {
    // Validate input using centralized validation
    validatePaymentReference(reference);

    console.log('🔍 Server action: Verifying payment for reference:', reference);
    
    // Use standardized endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
    const url = `${API_URL}${getFullEndpoint(API_ENDPOINTS.PAYMENT.VERIFY, {}, { reference })}`;
    
    // Use retry logic for network resilience
    const response = await withRetry(async () => {
      return await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Senyo-Payment-Callback/1.0',
          'X-Requested-With': 'XMLHttpRequest',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 seconds
      });
    });

    // Check if response is ok before parsing
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🔍 Server action: API response:', { status: response.status, data });

    return {
      success: response.ok && data.success,
      data: data,
      status: response.status
    };
  } catch (error) {
    console.error('🔍 Server action: Error:', error);
    
    // Use centralized error handling
    return handleError(error, 'PaymentCallbackActions.verifyPayment');
  }
}
