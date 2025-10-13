'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';
import { authManager, isAuthenticated, getUserRole } from '../utils/auth-manager';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
    userRole: null
  });
  
  // List of paths that should bypass authentication
  const publicPaths = ['/SignIn', '/SignUp', '/reset', '/help', '/landing', '/error', '/unauthorized'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // If current path is public, don't check auth
        if (isPublicPath) {
          setAuthState({
            isAuthenticated: true,
            loading: false,
            userRole: null
          });
          return;
        }
        
        // Use the unified auth manager to check authentication
        const authenticated = isAuthenticated();
        const userRole = getUserRole();
        
        console.log('🔐 AuthGuard: Authentication check:', {
          authenticated,
          userRole,
          pathname
        });
        
        if (!authenticated) {
          // Redirect to sign in with current path as redirect parameter
          const redirectUrl = `/SignIn?redirect=${encodeURIComponent(pathname)}`;
          console.log('🔐 AuthGuard: Not authenticated, redirecting to:', redirectUrl);
          router.push(redirectUrl);
          return;
        }
        
        // User is authenticated - check if they should be redirected to their dashboard
        if (pathname === '/') {
          let dashboardPath = '/';
          
          if (userRole === 'admin') {
            dashboardPath = '/admin/dashboard';
          } else if (userRole === 'agent') {
            dashboardPath = '/agent/dashboard';
          }
          
          if (dashboardPath !== '/') {
            console.log('🔐 AuthGuard: Redirecting authenticated user to dashboard:', dashboardPath);
            router.push(dashboardPath);
            return;
          }
        }
        
        // User is authenticated and on appropriate page
        setAuthState({
          isAuthenticated: true,
          loading: false,
          userRole
        });
        
      } catch (error) {
        console.error('🔐 AuthGuard: Error checking authentication:', error);
        // On error, redirect to sign in
        router.push('/SignIn');
      }
    };
    
    checkAuthentication();
  }, [router, pathname, isPublicPath]);

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          {/* Epic Loading Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200/20"></div>
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 border-r-teal-400 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse flex items-center justify-center">
              <Zap className="w-8 h-8 text-white animate-bounce" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text animate-pulse">
              DATAHUSTLE
            </h1>
            <div className="flex items-center justify-center space-x-2 text-emerald-300">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-lg font-bold">Verifying authentication...</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return authState.isAuthenticated ? children : null;
};

export default AuthGuard;