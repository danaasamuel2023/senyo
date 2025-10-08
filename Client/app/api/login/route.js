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
