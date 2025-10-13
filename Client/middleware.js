import { NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/',
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
  '/toast-test',
  '/wallet'
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/admin-users',
  '/admin-transactions',
  '/admin-today',
  '/admin-daily',
  '/admin-report',
  '/admin/products',
  '/admin/dashboard',
  '/admin/settings',
  '/admin/users',
  '/admin/price-management',
  '/admin/package-management',
  '/admin/control-center',
  '/admin/notifications',
  '/admin/agent-stores',
  '/admin/agents',
  '/admin/transactions',
  '/admin/bulk-messaging',
  '/admin/reports',
  '/admin/content',
  '/admin/analytics',
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
  '/SignIn',
  '/SignUp',
  '/reset',
  '/help',
  '/landing',
  '/error',
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
    // Try to get token from cookies first (set by auth.js)
    let token = request.cookies.get('authToken')?.value;
    
    // If no token in cookies, try headers as fallback (for API calls)
    if (!token) {
      token = request.headers.get('x-auth-token') ||
              request.headers.get('authorization')?.replace('Bearer ', '');
    }
    
    console.log('🔐 getUserRoleFromToken: Token validation:', {
      hasToken: !!token,
      tokenType: token ? (token.includes('bypass') ? 'bypass' : 'jwt') : 'none',
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      timestamp: new Date().toISOString()
    });
    
    if (!token) {
      console.log('❌ No auth token found in middleware');
      return null;
    }
    
    // Check if token is a bypass token (simple format)
    if (token.includes('bypass-token') || token.includes('client-token') || token.includes('fallback-token') || token.includes('immediate-bypass-token') || token.includes('error-bypass-token')) {
      console.log('✅ Bypass token detected, allowing access');
      return 'user'; // Default role for bypass tokens
    }
    
    // Validate JWT token format
    if (!token.includes('.')) {
      console.log('Invalid token format - not JWT and not bypass token');
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
    
    return payload.role || 'user';
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for Service Worker and PWA files
  if (
    pathname === '/sw.js' ||
    pathname === '/sw-minimal.js' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/icon') ||
    pathname === '/offline.html'
  ) {
    return NextResponse.next();
  }
  
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
    
    // Debug logging for authentication issues
    const authCookie = request.cookies.get('authToken')?.value;
    console.log('🔐 Middleware auth check:', {
      pathname,
      userRole,
      hasAuthCookie: !!authCookie,
      cookieValue: authCookie ? authCookie.substring(0, 30) + '...' : 'none',
      allCookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...'])),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...'
    });
    
    // If no token or role, redirect to login
    if (!userRole) {
      console.log('❌ No valid auth token found, redirecting to login');
      const loginUrl = new URL('/SignIn', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log('✅ Valid auth token found, allowing access');
    
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
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|sw-minimal.js|manifest.json|icon|offline.html).*)',
  ],
};
