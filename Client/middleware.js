import { NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
  '/agent',
  '/profile',
  '/orders',
  '/myorders',
  '/payment',
  '/deposite',
  '/bulk-purchase',
  '/verification',
  '/verification-history',
  '/verification-services',
  '/verify-otp',
  '/analytics',
  '/reports',
  '/api-keys',
  '/settings',
  '/store',
  '/agent-store',
  '/agent-signup',
  '/admin-users',
  '/admin-transactions',
  '/admin-today',
  '/admin-daily',
  '/admin-report',
  '/allorders',
  '/exportorders',
  '/update-price',
  '/trending',
  '/numbers',
  '/week',
  '/waiting',
  '/toggle',
  '/testing',
  '/toast-test'
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/admin-users',
  '/admin-transactions',
  '/admin-today',
  '/admin-daily',
  '/admin-report',
  '/allorders',
  '/exportorders',
  '/update-price',
  '/trending',
  '/numbers',
  '/week',
  '/waiting',
  '/toggle',
  '/testing',
  '/toast-test'
];

// Agent-only routes
const AGENT_ROUTES = [
  '/agent',
  '/agent-store',
  '/agent-signup'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/SignIn',
  '/SignUp',
  '/reset',
  '/help',
  '/landing',
  '/error',
  '/not-found',
  '/test-payment',
  '/api/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/payment/callback'
];

// Helper function to check if route is protected
function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Helper function to check if route is admin-only
function isAdminRoute(pathname) {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// Helper function to check if route is agent-only
function isAgentRoute(pathname) {
  return AGENT_ROUTES.some(route => pathname.startsWith(route));
}

// Helper function to check if route is public
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
}

// Helper function to get user role from token
function getUserRoleFromToken(request) {
  try {
    // Try to get token from headers first (for API calls)
    let token = request.headers.get('x-auth-token') ||
                request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no token in headers, try cookies as fallback
    if (!token) {
      token = request.cookies.get('authToken')?.value;
    }
    
    if (!token) {
      console.log('No auth token found in middleware');
      return null;
    }
    
    // Validate token format (should be a JWT)
    if (!token.includes('.')) {
      console.log('Invalid token format');
      return null;
    }
    
    // Decode JWT token to get user role
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT structure');
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('Token expired');
      return null;
    }
    
    return payload.role || payload.user?.role || 'user';
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Handle Chrome DevTools requests
  if (pathname.includes('.well-known/appspecific/com.chrome.devtools.json')) {
    return new NextResponse(null, { status: 404 });
  }
  
  // Handle webpack hot-update requests that might cause 404s
  if (pathname.includes('webpack.hot-update')) {
    return new NextResponse(null, { status: 404 });
  }
  
  // Handle other development-only requests
  if (pathname.includes('hot-update') || pathname.includes('webpack')) {
    return new NextResponse(null, { status: 404 });
  }
  
  // Skip authentication check for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Skip authentication check for API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const userRole = getUserRoleFromToken(request);
    
    // If no token or role, redirect to login
    if (!userRole) {
      const loginUrl = new URL('/SignIn', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check admin route access
    if (isAdminRoute(pathname) && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Check agent route access
    if (isAgentRoute(pathname) && !['admin', 'agent'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
