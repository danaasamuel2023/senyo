import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const source = searchParams.get('source');
    const trxref = searchParams.get('trxref');

    console.log('Payment callback API received:', { reference, source, trxref });

    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Call backend verification endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
    const verifyUrl = `${backendUrl}/api/v1/verify-payment?reference=${reference}`;
    
    console.log('Calling backend verification:', verifyUrl);
    
    try {
      const verifyResponse = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Senyo-Payment-Callback/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 seconds
      });

      if (!verifyResponse.ok) {
        throw new Error(`Backend verification failed: ${verifyResponse.status} ${verifyResponse.statusText}`);
      }

      const verifyData = await verifyResponse.json();
      console.log('Backend verification response:', verifyData);

      if (verifyData.success) {
        return NextResponse.json({
          success: true,
          data: {
            reference: reference,
            status: 'completed',
            amount: verifyData.data?.amount || 0,
            newBalance: verifyData.data?.newBalance || 0,
            message: 'Payment verified successfully!',
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      } else {
        return NextResponse.json({
          success: false,
          error: verifyData.error || 'Payment verification failed',
          data: {
            reference: reference,
            status: 'failed',
            message: verifyData.message || 'Payment verification failed'
          }
        }, { status: 400 });
      }
    } catch (backendError) {
      console.error('Backend verification error:', backendError);
      
      // Fallback: return error but don't fail completely
      return NextResponse.json({
        success: false,
        error: 'Backend verification failed',
        message: backendError.message,
        data: {
          reference: reference,
          status: 'pending',
          message: 'Payment verification is pending. Please check your wallet balance.'
        }
      }, { status: 200 }); // Return 200 to avoid breaking the callback flow
    }

  } catch (error) {
    console.error('Payment callback API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference, amount, status } = body;

    console.log('Payment callback POST received:', { reference, amount, status });

    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Call backend verification endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unlimitedata.onrender.com';
    const verifyUrl = `${backendUrl}/api/v1/verify-payment?reference=${reference}`;
    
    console.log('Calling backend verification (POST):', verifyUrl);
    
    try {
      const verifyResponse = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Senyo-Payment-Callback/1.0'
        },
        signal: AbortSignal.timeout(30000), // 30 seconds
      });

      if (!verifyResponse.ok) {
        throw new Error(`Backend verification failed: ${verifyResponse.status} ${verifyResponse.statusText}`);
      }

      const verifyData = await verifyResponse.json();
      console.log('Backend verification response (POST):', verifyData);

      if (verifyData.success) {
        return NextResponse.json({
          success: true,
          data: {
            reference: reference,
            status: 'completed',
            amount: verifyData.data?.amount || amount || 0,
            newBalance: verifyData.data?.newBalance || 0,
            message: 'Payment processed successfully!',
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      } else {
        return NextResponse.json({
          success: false,
          error: verifyData.error || 'Payment verification failed',
          data: {
            reference: reference,
            status: 'failed',
            message: verifyData.message || 'Payment verification failed'
          }
        }, { status: 400 });
      }
    } catch (backendError) {
      console.error('Backend verification error (POST):', backendError);
      
      // Fallback: return error but don't fail completely
      return NextResponse.json({
        success: false,
        error: 'Backend verification failed',
        message: backendError.message,
        data: {
          reference: reference,
          status: 'pending',
          message: 'Payment verification is pending. Please check your wallet balance.'
        }
      }, { status: 200 }); // Return 200 to avoid breaking the callback flow
    }

  } catch (error) {
    console.error('Payment callback POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
