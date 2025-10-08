import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || (() => {
  // Default to localhost for development, production URL for production
  return process.env.NODE_ENV === 'production' ? 'https://unlimitedata.onrender.com' : 'http://localhost:5001';
})();

export async function POST(request) {
  try {
    console.log('🔐 Login API v1 route called');
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    
    const body = await request.json();
    
    // Forward the login request to the backend server
    const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Handle rate limiting and other HTTP errors
      let errorData;
      
      // Get the response text first, then try to parse as JSON
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);
      
      try {
        // Try to parse the text as JSON
        errorData = JSON.parse(responseText);
      } catch (jsonError) {
        // If JSON parsing fails, it's likely a plain text error response
        if (response.status === 429) {
          // Rate limiting error
          errorData = {
            success: false,
            error: 'Too many login attempts. Please wait 15 minutes before trying again.',
            details: responseText
          };
        } else {
          // Other HTTP errors
          errorData = {
            success: false,
            error: 'Server error occurred. Please try again later.',
            details: responseText
          };
        }
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }
    
    // Parse successful response
    const data = await response.json();
    
    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to connect to server. Please check your internet connection.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
