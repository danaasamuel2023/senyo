import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Simple in-memory rate limiting for API routes
const rateLimitMap = new Map();

function checkRateLimit(ip, maxRequests = 100, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create rate limit data for this IP
  let rateLimitData = rateLimitMap.get(ip) || { requests: [], lastCleanup: now };
  
  // Clean up old requests
  if (now - rateLimitData.lastCleanup > windowMs) {
    rateLimitData.requests = rateLimitData.requests.filter(time => time > windowStart);
    rateLimitData.lastCleanup = now;
  }
  
  // Add current request
  rateLimitData.requests.push(now);
  
  // Check if limit exceeded
  if (rateLimitData.requests.length > maxRequests) {
    return false;
  }
  
  // Update the map
  rateLimitMap.set(ip, rateLimitData);
  return true;
}

// Use local backend in development, production backend otherwise
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001' 
  : 'https://unlimitedata.onrender.com';

export async function POST(request) {
  try {
    console.log('🔐 Login API route called');
    console.log('🌐 API_BASE_URL:', API_BASE_URL);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Skip rate limiting in development
    if (process.env.NODE_ENV !== 'development') {
      // Check rate limit (100 requests per 5 minutes)
      if (!checkRateLimit(ip, 100, 5 * 60 * 1000)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many login attempts. Please try again in a few minutes.',
            details: 'Rate limit exceeded'
          },
          { status: 429 }
        );
      }
    }
    
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
            error: 'Too many login attempts. Please wait a few minutes before trying again.',
            details: responseText,
            retryAfter: 300 // 5 minutes in seconds
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
