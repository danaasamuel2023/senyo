import { NextResponse } from 'next/server';

/**
 * Error Tracking API endpoint
 * Receives and processes error data
 */

export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // Log error data (in production, you'd store this in a database)
    console.error('❌ Error Data Received:', {
      message: errorData.message,
      sessionId: errorData.context?.sessionId,
      timestamp: errorData.context?.timestamp,
      url: errorData.context?.url,
      userAgent: errorData.context?.userAgent
    });

    // Process different types of errors
    if (errorData.message) {
      console.error('Error Message:', errorData.message);
    }

    if (errorData.stack) {
      console.error('Error Stack:', errorData.stack);
    }

    if (errorData.context) {
      console.error('Error Context:', errorData.context);
    }

    // In production, you would:
    // 1. Store error in database
    // 2. Send to error tracking service (Sentry, LogRocket, etc.)
    // 3. Alert developers for critical errors
    // 4. Generate error reports

    return NextResponse.json({ 
      success: true, 
      message: 'Error data received' 
    });

  } catch (error) {
    console.error('❌ Error Tracking API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process error data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Error Tracking API endpoint',
    status: 'active'
  });
}