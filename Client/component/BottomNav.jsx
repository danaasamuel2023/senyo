'use client';

import { Home, Package, Wallet, User, ShoppingBag } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Don't show bottom nav on certain pages
  const hideBottomNavPaths = ['/SignIn', '/SignUp', '/admin', '/verify-otp'];
  const shouldHide = hideBottomNavPaths.some(path => pathname.startsWith(path));

  if (shouldHide) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/', requireAuth: false },
    { icon: ShoppingBag, label: 'Orders', path: '/myorders', requireAuth: true },
    { icon: Package, label: 'Buy Data', path: '/mtnup2u', requireAuth: false },
    { icon: Wallet, label: 'Wallet', path: '/topup', requireAuth: true },
    { icon: User, label: 'Profile', path: '/profile', requireAuth: true }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl border-t border-gray-200/50 dark:border-gray-800/50 z-40 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ icon: Icon, label, path, requireAuth }) => {
          // Show all items, but redirect to login if not authenticated
          const isActive = pathname === path;
          
          const handleClick = () => {
            if (requireAuth && !isAuthenticated) {
              router.push('/SignIn');
            } else {
              router.push(path);
            }
          };

          return (
            <button
              key={path}
              onClick={handleClick}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 active:scale-95 ${
                isActive 
                  ? 'text-[#FFCC08]' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#FFCC08] to-yellow-500 rounded-b-full shadow-lg shadow-yellow-500/50" />
              )}
              
              {/* Icon with background on active */}
              <div className={`relative transition-all duration-300 ${
                isActive ? 'transform -translate-y-1' : ''
              }`}>
                {isActive && (
                  <div className="absolute inset-0 -m-2 bg-[#FFCC08]/10 dark:bg-[#FFCC08]/20 rounded-xl" />
                )}
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className="relative z-10"
                />
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Enhanced styling */}
      <style jsx>{`
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  );
}

