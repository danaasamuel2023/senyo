// Protected Route Component
// Ensures users are authenticated and handles routing logic

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '../utils/auth-manager.js';

export default function ProtectedRoute({ children, requiredRole = null, redirectTo = '/SignIn' }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 ProtectedRoute: Checking authentication...');
        
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

        // Use unified auth-manager - single check, no retries
        const authenticated = authManager.isAuthenticated();
        const user = authManager.getUser();
        
        console.log('🔐 UNIFIED ProtectedRoute: Auth check result:', {
          authenticated,
          hasUser: !!user,
          userRole: user?.role,
          requiredRole
        });

        if (!authenticated) {
          console.log('❌ UNIFIED ProtectedRoute: User not authenticated, redirecting to login');
          router.push(redirectTo);
          return;
        }

        // Check role requirement if specified
        if (requiredRole && user?.role !== requiredRole) {
          console.log('❌ UNIFIED ProtectedRoute: Insufficient permissions, redirecting');
          router.push('/unauthorized');
          return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
        
        console.log('✅ UNIFIED ProtectedRoute: Access granted');
      } catch (error) {
        console.error('❌ UNIFIED ProtectedRoute: Error checking authentication:', error);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, requiredRole, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return children;
  }

  // Return null while redirecting
  return null;
}

// Higher-order component for protecting pages
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute 
        requiredRole={options.requiredRole}
        redirectTo={options.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for authentication state in components
export function useAuthState() {
  const [authState, setAuthState] = useState(authManager.getAuthState());

  useEffect(() => {
    const updateAuthState = () => {
      setAuthState(authManager.getAuthState());
    };

    // Initial update
    updateAuthState();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        setTimeout(updateAuthState, 10);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return authState;
}
