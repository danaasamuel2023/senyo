'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, Sparkles } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // List of paths that should bypass authentication
  const publicPaths = ['/SignIn', '/SignUp'];
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/agent-store/');

  useEffect(() => {
    // If current path is public, don't check auth
    if (isPublicPath) {
      setLoading(false);
      setIsAuthenticated(true);
      return;
    }
    
    // Check if user is authenticated
    try {
      const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      
      if (!userData) {
        router.push('/SignUp');
        setLoading(false); // Set loading to false to allow redirect
        return;
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    } catch (error) {
      console.warn('AuthGuard localStorage access error:', error);
      router.push('/SignUp');
      setLoading(false);
    }
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