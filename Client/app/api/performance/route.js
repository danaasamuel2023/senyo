import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Performance monitoring endpoint
export async function POST(request) {
  try {
    const performanceData = await request.json();
    
    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', performanceData);
    }
    
    // In production, you could send to external services like:
    // - Google Analytics
    // - DataDog
    // - New Relic
    // - Custom analytics service
    
    // For now, just log to console
    console.log('Production Performance:', {
      type: performanceData.type,
      data: performanceData.data,
      url: performanceData.url,
      timestamp: performanceData.timestamp,
      userId: performanceData.userId
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Performance metric recorded successfully' 
    });
    
  } catch (error) {
    console.error('Performance monitoring endpoint failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record performance metric' 
      },
      { status: 500 }
    );
  }
}
