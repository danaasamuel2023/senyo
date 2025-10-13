/**
 * Authentication middleware for protected routes
 * Handles token validation and route protection
 */

import { isAuthenticated, getCurrentUser, getAuthHeader, hasPermission } from '../utils/tokenAuth';

/**
 * Middleware to protect routes that require authentication
 */
export function requireAuth(Component) {
  return function AuthenticatedComponent(props) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to signin page
      if (typeof window !== 'undefined') {
        window.location.href = '/signin-token';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Middleware to protect admin routes
 */
export function requireAdmin(Component) {
  return function AdminComponent(props) {
    const user = getCurrentUser();
    
    if (!isAuthenticated() || !user || user.role !== 'admin') {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Middleware to protect agent routes
 */
export function requireAgent(Component) {
  return function AgentComponent(props) {
    const user = getCurrentUser();
    
    if (!isAuthenticated() || !user || !['admin', 'agent'].includes(user.role)) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Middleware to check specific permissions
 */
export function requirePermission(permission) {
  return function PermissionComponent(Component) {
    return function ProtectedComponent(props) {
      if (!isAuthenticated() || !hasPermission(permission)) {
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        return null;
      }

      return <Component {...props} />;
    };
  };
}

/**
 * Higher-order component for authentication
 */
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    const { requireRole, requirePermission: requiredPermission } = options;
    
    // Check basic authentication
    if (!isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin-token';
      }
      return null;
    }

    const user = getCurrentUser();
    
    // Check role requirement
    if (requireRole && user.role !== requireRole) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Hook for authentication state
 */
export function useAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      
      setIsAuth(authenticated);
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  return {
    isAuthenticated: isAuth,
    user,
    loading,
    authHeaders: getAuthHeader()
  };
}

/**
 * API client with automatic token injection
 */
export class AuthenticatedApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const authHeaders = getAuthHeader();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Check if token is expired
    if (response.status === 401) {
      // Redirect to signin
      if (typeof window !== 'undefined') {
        window.location.href = '/signin-token';
      }
      throw new Error('Authentication required');
    }

    return response;
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

/**
 * Route guard component
 */
export function RouteGuard({ children, requireRole, requirePermission }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/signin-token';
    }
    return null;
  }

  if (requireRole && user.role !== requireRole) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return null;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return null;
  }

  return children;
}

/**
 * Authentication context provider
 */
export function AuthProvider({ children }) {
  const authState = useAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Create auth context
import { createContext } from 'react';
export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  authHeaders: {}
});

// Export default authenticated API client
export const authApi = new AuthenticatedApiClient();
