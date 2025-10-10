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

    // Simulate payment verification
    // In a real implementation, this would verify with Paystack or your payment provider
    const paymentData = {
      success: true,
      data: {
        reference: reference,
        status: 'completed',
        amount: 100, // This should come from the actual payment provider
        message: 'Payment verified successfully!',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Payment verification result:', paymentData);

    return NextResponse.json(paymentData, { status: 200 });

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

    // Simulate payment processing
    const paymentData = {
      success: true,
      data: {
        reference: reference,
        status: status || 'completed',
        amount: amount || 100,
        message: 'Payment processed successfully!',
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(paymentData, { status: 200 });

  } catch (error) {
    console.error('Payment callback POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
