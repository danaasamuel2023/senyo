import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Use local backend in development, production backend otherwise
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001' 
  : 'https://unlimitedata.onrender.com';

export async function GET(request) {
  return handleBackendRequest(request, 'GET');
}

export async function POST(request) {
  return handleBackendRequest(request, 'POST');
}

export async function PUT(request) {
  return handleBackendRequest(request, 'PUT');
}

export async function DELETE(request) {
  return handleBackendRequest(request, 'DELETE');
}

export async function OPTIONS(request) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleBackendRequest(request, method) {
  try {
    console.log(`🔗 Backend API ${method} request`);
    
    // Get the path from the request URL
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    const queryString = url.searchParams.toString().replace('path=' + path, '').replace('&', '');
    
    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter required' },
        { status: 400 }
      );
    }
    
    const backendUrl = `${API_BASE_URL}${path}${queryString ? '?' + queryString : ''}`;
    console.log('📡 Backend URL:', backendUrl);
    
    // Get headers (excluding host and other Next.js specific headers)
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Add x-auth-token if present
    const authToken = request.headers.get('x-auth-token');
    if (authToken) {
      headers['x-auth-token'] = authToken;
    }
    
    // Prepare the request options
    const requestOptions = {
      method,
      headers,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        // Body might be empty or not readable, continue without it
      }
    }
    
    console.log('📤 Making request to backend...');
    
    // Make the request to the backend
    const response = await fetch(backendUrl, requestOptions);
    
    console.log('📊 Backend response status:', response.status);
    
    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('📄 Backend response data:', responseData);
    
    // Return the response with the same status code and headers
    const nextResponse = NextResponse.json(responseData, { status: response.status });
    
    // FIXED: Add CORS headers to prevent CORS errors
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
    
    // Copy important headers
    const headersToCopy = ['content-type', 'authorization', 'x-auth-token'];
    headersToCopy.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        nextResponse.headers.set(headerName, headerValue);
      }
    });
    
    return nextResponse;
    
  } catch (error) {
    console.error('❌ Backend API proxy error:', error);
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
