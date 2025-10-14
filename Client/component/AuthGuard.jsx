'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';
import { authManager, isAuthenticated, getUserRole, syncAuthState } from '../utils/auth-manager';

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
        
        // Enhanced authentication check with retry logic
        let authenticated = false;
        let userRole = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        console.log('🔐 AuthGuard: Starting authentication check for path:', pathname);
        
        // Force global auth state synchronization first
        try {
          await syncAuthState();
          console.log('🔐 AuthGuard: Auth state synchronized');
        } catch (error) {
          console.error('🔐 AuthGuard: Error synchronizing auth state:', error);
        }
        
        // Retry authentication check to handle timing issues
        while (!authenticated && attempts < maxAttempts) {
          attempts++;
          console.log(`🔐 AuthGuard: Authentication check attempt ${attempts}/${maxAttempts}`);
          
          // Force refresh auth state from storage
          authManager.refreshAuthState();
          
          // Check authentication with multiple methods
          authenticated = isAuthenticated();
          userRole = getUserRole();
          
          // Additional verification: check localStorage directly
          const directToken = localStorage.getItem('authToken');
          const directUserData = localStorage.getItem('userData');
          const directExpiry = localStorage.getItem('tokenExpiry');
          
          const directAuth = !!(directToken && directUserData && directExpiry && 
                               Date.now() < parseInt(directExpiry));
          
          console.log('🔐 AuthGuard: Authentication check result:', {
            authenticated,
            directAuth,
            userRole,
            pathname,
            attempt: attempts,
            hasToken: !!authManager.getToken(),
            hasUser: !!authManager.getUser(),
            directToken: !!directToken,
            directUserData: !!directUserData,
            directExpiry: !!directExpiry,
            localStorage: {
              authToken: directToken ? 'exists' : 'missing',
              userData: directUserData ? 'exists' : 'missing',
              tokenExpiry: directExpiry ? 'exists' : 'missing'
            },
            tokenExpired: directExpiry ? Date.now() > parseInt(directExpiry) : true
          });
          
          // If auth manager says not authenticated but localStorage has valid data, 
          // force authentication
          if (!authenticated && directAuth) {
            console.log('🔐 AuthGuard: Forcing authentication from localStorage data');
            try {
              const user = JSON.parse(directUserData);
              authManager.authState = {
                isAuthenticated: true,
                user,
                token: directToken,
                loading: false
              };
              authenticated = true;
              userRole = user.role;
            } catch (error) {
              console.error('🔐 AuthGuard: Error parsing user data from localStorage:', error);
            }
          }
          
          if (!authenticated && attempts < maxAttempts) {
            console.log(`🔐 AuthGuard: Not authenticated, waiting 100ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        if (!authenticated) {
          // Final check - look for auth data in localStorage directly
          const token = localStorage.getItem('authToken');
          const userData = localStorage.getItem('userData');
          const expiryTime = localStorage.getItem('tokenExpiry');
          
          if (token && userData && expiryTime) {
            const isExpired = Date.now() > parseInt(expiryTime);
            if (!isExpired) {
              try {
                const user = JSON.parse(userData);
                console.log('🔐 AuthGuard: Found valid auth data in localStorage, forcing authentication');
                authenticated = true;
                userRole = user.role;
                
                // Update auth manager state
                authManager.authState = {
                  isAuthenticated: true,
                  user,
                  token,
                  loading: false
                };
              } catch (error) {
                console.error('🔐 AuthGuard: Error parsing user data from localStorage:', error);
              }
            }
          }
        }
        
        if (!authenticated) {
          // Final safety check - prevent redirect if we just came from SignIn
          const isFromSignIn = pathname === '/SignIn' || 
                              (typeof window !== 'undefined' && 
                               document.referrer.includes('/SignIn'));
          
          if (isFromSignIn) {
            console.log('🔐 AuthGuard: Preventing redirect loop - user just came from SignIn');
            // Wait a bit more and try one more time
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // One final check
            authManager.refreshAuthState();
            const finalCheck = isAuthenticated();
            
            if (finalCheck) {
              console.log('🔐 AuthGuard: Final check successful, user is authenticated');
              authenticated = true;
              userRole = getUserRole();
            } else {
              console.log('🔐 AuthGuard: Final check failed, but preventing redirect loop');
              // Set a temporary auth state to prevent redirect loop
              setAuthState({
                isAuthenticated: false,
                loading: false,
                userRole: null
              });
              return;
            }
          } else {
            // Redirect to sign in with current path as redirect parameter
            const redirectUrl = `/SignIn?redirect=${encodeURIComponent(pathname)}`;
            console.log('🔐 AuthGuard: Not authenticated after all attempts, redirecting to:', redirectUrl);
            router.push(redirectUrl);
            return;
          }
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
        console.log('🔐 AuthGuard: Authentication successful, setting auth state');
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