'use client';

import { useState, useEffect } from 'react';
import { authenticateUser, isAuthenticated, getCurrentUser, logoutUser } from '../utils/tokenAuth';

export default function TokenSigninForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      
      setIsLoggedIn(authenticated);
      setUser(currentUser);
    };

    checkAuth();
  }, []);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Use token-based authentication
      const result = await authenticateUser(email, password);
      
      if (result.success) {
        setSuccess(true);
        setIsLoggedIn(true);
        setUser(result.user);
        console.log('✅ Token-based signin successful:', result);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setError(result.error || 'Signin failed');
      }
    } catch (error) {
      setError('Signin failed. Please try again.');
      console.error('Signin error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    setEmail('');
    setPassword('');
    setSuccess(false);
    setError('');
  };

  // Show logged-in state
  if (isLoggedIn && user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
          ✅ Authenticated
        </h2>
        
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-semibold text-green-800">Welcome back!</p>
          <p className="text-green-700">
            <strong>Name:</strong> {user.name}<br/>
            <strong>Email:</strong> {user.email}<br/>
            <strong>Role:</strong> {user.role}<br/>
            <strong>Login Method:</strong> {user.loginMethod}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Sign In (Token-Based)
      </h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <p className="font-semibold">✅ Signin Successful!</p>
          <p>Redirecting to dashboard...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">❌ Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSignin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In (Token-Based)'}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>🔐 Token-Based Authentication:</strong> This signin uses JWT tokens for secure authentication. 
          Tokens are stored locally and automatically validated.
        </p>
      </div>
      
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>ℹ️ Features:</strong>
          <br/>• JWT token generation and validation
          <br/>• Automatic token refresh
          <br/>• Secure local storage
          <br/>• Role-based permissions
        </p>
      </div>
    </div>
  );
}
