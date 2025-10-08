'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  Star,
  Flame,
  Eye,
  EyeOff
} from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiConfig';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`p-3 rounded-xl shadow-xl flex items-center backdrop-blur-xl border max-w-sm ${
        type === 'success' 
          ? 'bg-green-500/95 text-white border-green-400/50' 
          : type === 'error' 
            ? 'bg-red-600/95 text-white border-red-500/50' 
            : 'bg-yellow-500/95 text-black border-yellow-400/50'
      }`}>
        <div className="mr-2">
          {type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : type === 'error' ? (
            <X className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>
        <div className="flex-grow">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 hover:scale-110 transition-transform">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);
  const [lastLoginAttempt, setLastLoginAttempt] = useState(0);
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Rate limiting countdown effect
  useEffect(() => {
    let interval;
    if (isRateLimited && rateLimitTimeLeft > 0) {
      interval = setInterval(() => {
        setRateLimitTimeLeft(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitTimeLeft]);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 204, 8, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(255, 204, 8, 0.5);
        }
      }
      .pulse-glow {
        animation: pulseGlow 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Function to show toast
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleLogin = async () => {
    // Check if user is rate limited
    if (isRateLimited) {
      setError(`Too many login attempts. Please wait ${rateLimitTimeLeft} seconds before trying again.`);
      showToast(`Too many login attempts. Please wait ${rateLimitTimeLeft} seconds before trying again.`, 'error');
      return;
    }

    // Check for rapid successive attempts (client-side rate limiting)
    const now = Date.now();
    const timeSinceLastAttempt = now - lastLoginAttempt;
    if (timeSinceLastAttempt < 2000) { // 2 seconds minimum between attempts
      setError('Please wait a moment before trying again.');
      showToast('Please wait a moment before trying again.', 'error');
      return;
    }

    setError('');
    setIsLoading(true);
    setLastLoginAttempt(now);

    try {
      // Use Next.js API route to avoid CORS issues in production
      const API_URL = '/api/login';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          const errorText = await response.text();
          errorData = { error: errorText, details: 'Non-JSON response' };
        }
        
        // Handle 429 rate limiting specifically
        if (response.status === 429) {
          const rateLimitMinutes = 15; // Default 15 minutes from server
          const rateLimitSeconds = rateLimitMinutes * 60;
          
          setIsRateLimited(true);
          setRateLimitTimeLeft(rateLimitSeconds);
          const errorMessage = errorData.error || `Too many login attempts. Please try again after ${rateLimitMinutes} minutes.`;
          setError(errorMessage);
          showToast(errorMessage, 'error');
          return;
        }
        
        // Handle other HTTP errors with improved error messages
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${errorData.details || 'Unknown error'}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (response.ok) {
        // Store token securely
        localStorage.setItem('authToken', data.token);
        
        // Store user info if provided
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            ...(data.user.agentMetadata ? { agentMetadata: data.user.agentMetadata } : {})
          }));
        }

        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect based on user role
        setTimeout(() => {
          try {
            // Check user role and redirect accordingly
            if (data.user && data.user.role === 'admin') {
              // Redirect to admin dashboard
              window.location.href = '/admin/dashboard';
            } else if (data.user && data.user.role === 'agent') {
              // Redirect to agent dashboard
              window.location.href = '/agent/dashboard';
            } else {
              // Redirect to home page for regular users
              window.location.href = '/';
            }
          } catch (err) {
            console.error("Navigation error:", err);
            showToast('Login successful. Please navigate to the dashboard.', 'success');
          }
        }, 2000);
      } else {
        setError(data.message || 'Login failed');
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err.message.includes('HTTP 401')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.message.includes('HTTP 403')) {
        errorMessage = 'Account is disabled. Please contact support.';
      } else if (err.message.includes('HTTP 429')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.message.includes('HTTP')) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements - MTN Yellow Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-[#FFD700]/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-[#FFCC08]/20 to-black/40 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-[#FFCC08]/10 to-[#FFD700]/10 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-[#FFCC08]/30 overflow-hidden shadow-2xl pulse-glow">
          {/* Header */}
          <div className="bg-[#FFCC08] p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-black animate-pulse" />
            </div>
            <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
              <Flame className="w-3 h-3 text-black animate-bounce" />
            </div>
            
            <div className="relative z-10 text-center">
              {/* UnlimitedData Gh Logo */}
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <Wifi className="w-6 h-6 text-[#FFCC08] mx-auto mb-1" strokeWidth={3} />
                    <div className="text-[#FFCC08] font-bold text-xs">DATA</div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-black mb-1">UNLIMITEDDATA GH</h1>
              <p className="text-black text-sm font-medium">Welcome Back</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Rate Limiting Warning */}
            {isRateLimited && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-red-200 text-sm font-medium">
                      Too many login attempts
                    </p>
                    <p className="text-red-300 text-xs">
                      Please wait {Math.floor(rateLimitTimeLeft / 60)}:{(rateLimitTimeLeft % 60).toString().padStart(2, '0')} before trying again
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 rounded-xl flex items-start bg-red-600/20 border border-red-600/40 backdrop-blur-sm">
                <div className="w-5 h-5 rounded-lg bg-red-600/30 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-300" />
                </div>
                <span className="text-red-200 font-medium text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm hover:border-[#FFCC08]/50 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 block w-full rounded-xl bg-white/10 backdrop-blur-sm border border-[#FFCC08]/30 text-white placeholder-white/60 focus:ring-2 focus:ring-[#FFCC08] focus:border-[#FFCC08] font-medium text-sm hover:border-[#FFCC08]/50 transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60 hover:text-[#FFCC08] transition-colors" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#FFCC08] focus:ring-[#FFCC08] border-[#FFCC08]/30 rounded bg-white/10 backdrop-blur-sm accent-[#FFCC08]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white font-medium">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="/reset" className="text-[#FFCC08] hover:text-[#FFD700] font-medium hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password || isRateLimited}
                className={`w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-xl text-black transition-all duration-300 transform hover:scale-105 font-bold ${
                  isRateLimited 
                    ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-[#FFCC08] hover:bg-[#FFCC08]/90 focus:outline-none focus:ring-4 focus:ring-[#FFCC08]/50'
                } ${isLoading || !email || !password ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRateLimited ? (
                  <>
                    <AlertTriangle className="animate-spin mr-2 w-4 h-4" />
                    Rate Limited ({Math.floor(rateLimitTimeLeft / 60)}:{(rateLimitTimeLeft % 60).toString().padStart(2, '0')})
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Wifi className="mr-2 w-4 h-4" />
                    Sign In
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-white font-medium text-sm">
                Don't have an account? 
                <a href="/SignUp" className="text-[#FFCC08] hover:text-[#FFD700] ml-1 font-bold hover:underline transition-colors">
                  Sign Up
                </a>
              </p>
            </div>

            {/* Additional Features */}
            <div className="mt-6 p-4 bg-[#FFCC08]/20 border border-[#FFCC08]/40 rounded-xl backdrop-blur-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-lg bg-[#FFCC08]/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#FFCC08]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#FFCC08] mb-2">Secure Access</h4>
                  <div className="space-y-1 text-white text-xs font-medium">
                    <p>• Your data is encrypted and secure</p>
                    <p>• Fast and reliable service</p>
                    <p>• 24/7 customer support available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}