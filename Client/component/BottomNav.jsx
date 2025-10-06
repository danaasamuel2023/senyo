'use client';

import { Home, Package, Wallet, User, ShoppingBag, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, [pathname]);

  // Navigation items configuration
  const navItems = [
    { icon: Home, label: 'Home', path: '/', requireAuth: false },
    { icon: ShoppingBag, label: 'Orders', path: '/myorders', requireAuth: true },
    { icon: Package, label: 'Buy', path: '/mtnup2u', requireAuth: false, accent: true },
    { icon: Wallet, label: 'Wallet', path: '/topup', requireAuth: true },
    { icon: User, label: 'Profile', path: '/profile', requireAuth: true }
  ];

  // Update active index and indicator position
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => pathname === item.path);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
      updateIndicator(currentIndex);
    }
  }, [pathname]);

  const updateIndicator = (index) => {
    if (itemRefs.current[index]) {
      const item = itemRefs.current[index];
      const itemRect = item.getBoundingClientRect();
      const navRect = navRef.current?.getBoundingClientRect();
      
      if (navRect) {
        setIndicatorStyle({
          left: `${itemRect.left - navRect.left + itemRect.width / 2}px`,
          transform: 'translateX(-50%)',
        });
      }
    }
  };

  // Don't show bottom nav on certain pages
  const hideBottomNavPaths = ['/SignIn', '/SignUp', '/admin', '/agent/dashboard', '/verify-otp'];
  const shouldHide = hideBottomNavPaths.some(path => pathname.startsWith(path));

  if (shouldHide) return null;

  const handleNavClick = (item, index) => {
    // Haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (item.requireAuth && !isAuthenticated) {
      router.push('/SignIn');
    } else {
      router.push(item.path);
    }
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav 
        ref={navRef}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-gray-200/30 dark:border-gray-800/30 z-40 safe-bottom"
      >
        {/* Active indicator bar */}
        <div 
          className="absolute top-0 h-[2px] bg-gradient-to-r from-[#FFCC08] to-yellow-500 transition-all duration-300 w-12"
          style={indicatorStyle}
        />

        <div className="flex justify-around items-center h-[60px] px-2 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                ref={(el) => (itemRefs.current[index] = el)}
                onClick={() => handleNavClick(item, index)}
                className={`
                  relative flex flex-col items-center justify-center flex-1 h-full 
                  transition-all duration-200 touch-target group
                  ${isActive ? 'scale-110' : 'active:scale-95'}
                `}
              >
                {/* Special accent for Buy button */}
                {item.accent && !isActive && (
                  <div className="absolute -top-1 right-1/2 translate-x-1/2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFCC08] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFCC08]"></span>
                    </span>
                  </div>
                )}
                
                {/* Icon container */}
                <div className={`
                  relative transition-all duration-200
                  ${isActive ? 'transform -translate-y-0.5' : ''}
                `}>
                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-0 -m-2.5 bg-[#FFCC08]/15 dark:bg-[#FFCC08]/20 rounded-xl blur-sm" />
                  )}
                  
                  {/* Icon with dynamic styling */}
                  <Icon 
                    size={item.accent && !isActive ? 24 : 22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`
                      relative z-10 transition-all duration-200
                      ${isActive 
                        ? 'text-[#FFCC08] drop-shadow-lg' 
                        : item.accent 
                          ? 'text-[#FFCC08]'
                          : 'text-gray-500 dark:text-gray-400 group-active:text-gray-700 dark:group-active:text-gray-300'
                      }
                    `}
                  />
                  
                  {/* Special effect for accent button */}
                  {item.accent && (
                    <Zap className="absolute top-0 right-0 w-3 h-3 text-[#FFCC08]" />
                  )}
                </div>
                
                {/* Label with better typography */}
                <span className={`
                  text-[10px] mt-1 transition-all duration-200
                  ${isActive 
                    ? 'font-bold text-[#FFCC08]' 
                    : item.accent
                      ? 'font-semibold text-gray-700 dark:text-gray-300'
                      : 'font-medium text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom safe area spacer */}
      <div className="md:hidden h-[60px] safe-bottom" />

      {/* Styles for safe area */}
      <style jsx>{`
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .touch-target {
          -webkit-tap-highlight-color: rgba(255, 204, 8, 0.1);
        }
        
        @supports (padding: max(0px)) {
          .safe-bottom {
            padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}

