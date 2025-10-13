'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';
import { authManager } from '../utils/auth-manager.js';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // List of paths that should bypass authentication
  const publicPaths = ['/SignIn', '/SignUp'];
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/agent-store/');
  
  // Role-based route protection
  const checkRoleAccess = (userRole, currentPath) => {
    if (currentPath.startsWith('/admin/') && userRole !== 'admin') {
      return false;
    }
    if (currentPath.startsWith('/agent/') && !['admin', 'agent'].includes(userRole)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    // If current path is public, don't check auth
    if (isPublicPath) {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }
    
    // Check if user is authenticated using auth-manager
    const checkAuth = async () => {
      try {
        // Wait for auth manager to initialize
        if (!authManager.isInitialized) {
          await new Promise(resolve => {
            const checkInit = () => {
              if (authManager.isInitialized) {
                resolve();
              } else {
                setTimeout(checkInit, 10);
              }
            };
            checkInit();
          });
        }

        // Use unified auth-manager - refresh state first, then check
        console.log('🔐 UNIFIED AuthGuard: Starting auth check for path:', pathname);
        console.log('🔐 UNIFIED AuthGuard: Current localStorage state:', {
          authToken: localStorage.getItem('authToken') ? 'exists' : 'missing',
          userData: localStorage.getItem('userData') ? 'exists' : 'missing',
          tokenExpiry: localStorage.getItem('tokenExpiry') ? 'exists' : 'missing'
        });
        
        const refreshResult = authManager.refreshAuthState();
        console.log('🔐 UNIFIED AuthGuard: Auth state refresh result:', refreshResult);
        
        const authenticated = authManager.isAuthenticated();
        const user = authManager.getUser();
        const token = authManager.getToken();
        
        console.log('🔐 UNIFIED AuthGuard: Detailed auth check result:', {
          authenticated,
          hasUser: !!user,
          hasToken: !!token,
          userRole: user?.role,
          userId: user?.id || user?._id,
          pathname,
          isPublicPath,
          localStorage: {
            authToken: localStorage.getItem('authToken') ? 'exists' : 'missing',
            userData: localStorage.getItem('userData') ? 'exists' : 'missing',
            tokenExpiry: localStorage.getItem('tokenExpiry') ? 'exists' : 'missing'
          },
          sessionStorage: {
            isAuthenticated: sessionStorage.getItem('isAuthenticated')
          }
        });
        
        if (authenticated && user) {
          // Check role-based access
          if (!checkRoleAccess(user.role, pathname)) {
            console.log('🔐 AuthGuard: Role access denied', {
              userRole: user.role,
              pathname,
              requiredRole: pathname.startsWith('/admin/') ? 'admin' : 'agent'
            });
            router.push('/unauthorized');
            setLoading(false);
            return;
          }
          
          console.log('🔐 UNIFIED AuthGuard: User authenticated successfully', {
            userId: user.id || user._id,
            role: user.role,
            pathname
          });
          setUser(user);
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          console.log('🔐 UNIFIED AuthGuard: User not authenticated, redirecting to SignIn');
          router.push('/SignIn');
          setLoading(false);
        }
      } catch (error) {
        console.error('🔐 AuthGuard error:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          pathname: window.location.pathname
        });
        router.push('/SignIn');
        setLoading(false);
      }
    };
    
    // Add a longer delay to ensure localStorage and sessionStorage are updated after login
    setTimeout(checkAuth, 1000); // Increased delay to ensure auth state is fully saved
  }, [router, isPublicPath, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="text-center">
          {/* Epic Loading Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20"></div>
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-amber-400 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Zap className="w-8 h-8 text-black animate-bounce" strokeWidth={2.5} />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-transparent bg-clip-text animate-pulse drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]">
              UnlimitedData
            </h1>
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Sparkles className="w-5 h-5 animate-spin drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
              <span className="text-lg font-bold text-yellow-300">Verifying authentication...</span>
              <Sparkles className="w-5 h-5 animate-spin drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
            </div>
            
            {/* Loading dots animation */}
            <div className="flex justify-center space-x-2 pt-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthGuard;