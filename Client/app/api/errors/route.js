import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Error reporting endpoint for production monitoring
export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Client Error Report:', errorData);
    }
    
    // In production, you could send to external services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging service
    
    // For now, just log to console
    console.error('Production Error:', {
      type: errorData.type,
      message: errorData.message,
      url: errorData.url,
      timestamp: errorData.timestamp,
      userId: errorData.userId
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Error reported successfully' 
    });
    
  } catch (error) {
    console.error('Error reporting endpoint failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to report error' 
      },
      { status: 500 }
    );
  }
}
