import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || (() => {
  // Default to localhost for development, production URL for production
  return process.env.NODE_ENV === 'production' ? 'https://unlimitedata.onrender.com' : 'http://localhost:5001';
})();

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/payment-gateway-settings/active`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Active payment gateway GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
