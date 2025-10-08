import { NextResponse } from 'next/server';

// Direct API URL - no environment variable dependencies
const API_BASE_URL = 'https://unlimitedata.onrender.com';

export async function POST(request) {
  try {
    console.log('🔐 Login API route called');
    
    const body = await request.json();
    console.log('📝 Login request body:', { email: body.email, hasPassword: !!body.password });
    
    // Forward the login request to the backend server
    const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📊 Backend response status:', response.status);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Handle rate limiting and other HTTP errors
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, it might be a rate limit plain text response
        const textResponse = await response.text();
        console.log('📄 Non-JSON response:', textResponse);
        
        if (response.status === 429) {
          // Rate limiting error
          errorData = {
            success: false,
            error: 'Too many login attempts. Please wait 15 minutes before trying again.',
            details: textResponse
          };
        } else {
          // Other HTTP errors
          errorData = {
            success: false,
            error: 'Server error occurred. Please try again later.',
            details: textResponse
          };
        }
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }
    
    // Parse successful response
    const data = await response.json();
    console.log('📄 Backend response data:', { success: data.success, hasToken: !!data.token });
    
    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Login API route error:', error);
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
