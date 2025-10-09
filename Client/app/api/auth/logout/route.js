import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Clear any authentication tokens from cookies or headers
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear auth token cookie if it exists
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('❌ Logout API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
