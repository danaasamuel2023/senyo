import { NextResponse } from 'next/server';

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
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
