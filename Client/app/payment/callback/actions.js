'use server';

export async function verifyPayment(reference) {
  try {
    console.log('🔍 Server action: Verifying payment for reference:', reference);
    
    const response = await fetch(`http://localhost:5001/api/v1/verify-payment?reference=${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('🔍 Server action: API response:', { status: response.status, data });

    return {
      success: response.ok && data.success,
      data: data,
      status: response.status
    };
  } catch (error) {
    console.error('🔍 Server action: Error:', error);
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}
