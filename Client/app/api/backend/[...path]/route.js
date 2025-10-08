import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || (() => {
  // Default to localhost for development, production URL for production
  return process.env.NODE_ENV === 'production' ? 'https://unlimitedata.onrender.com' : 'http://localhost:5001';
})();

export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, 'PATCH');
}

async function handleRequest(request, params, method) {
  try {
    // Reconstruct the API path
    const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
    const backendUrl = `${API_BASE_URL}/${path}`;
    
    // Get query parameters
    const url = new URL(request.url);
    const queryString = url.search;
    const fullBackendUrl = queryString ? `${backendUrl}${queryString}` : backendUrl;
    
    // Get headers (excluding host and other Next.js specific headers)
    const headers = {};
    request.headers.forEach((value, key) => {
      if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
        headers[key] = value;
      }
    });
    
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
    
    console.log(`[API Proxy] ${method} ${fullBackendUrl}`);
    
    // Make the request to the backend
    const response = await fetch(fullBackendUrl, requestOptions);
    
    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Return the response with the same status code and headers
    const nextResponse = NextResponse.json(responseData, { status: response.status });
    
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
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to connect to server. Please check your internet connection.',
        details: error.message,
        path: params.path
      },
      { status: 500 }
    );
  }
}
