import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

/**
 * Mobile Enhancement Components
 * Improves mobile user experience
 */

export const MobileStatusBar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(null);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor battery level if available
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        const handleBatteryChange = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };

        battery.addEventListener('levelchange', handleBatteryChange);
        
        return () => {
          battery.removeEventListener('levelchange', handleBatteryChange);
        };
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-2 bg-gray-900 text-white text-xs">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Signal className="w-3 h-3" />
          <span>4G</span>
        </div>
        <div className="flex items-center space-x-1">
          <Wifi className={`w-3 h-3 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {batteryLevel && (
          <div className="flex items-center space-x-1">
            <Battery className="w-3 h-3" />
            <span>{batteryLevel}%</span>
          </div>
        )}
        <div className="text-right">
          <div className="font-mono">{new Date().toLocaleTimeString('en-GH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}</div>
        </div>
      </div>
    </div>
  );
};

export const TouchFeedback = ({ children, onPress, className = '' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    onPress?.();
  };

  return (
    <div
      className={`touch-manipulation ${isPressed ? 'scale-95' : 'scale-100'} transition-transform duration-100 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export const SwipeGesture = ({ onSwipeLeft, onSwipeRight, children }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-manipulation"
    >
      {children}
    </div>
  );
};

export const MobileKeyboardHandler = ({ onKeyboardShow, onKeyboardHide }) => {
  useEffect(() => {
    const handleResize = () => {
      const isKeyboardVisible = window.innerHeight < window.outerHeight * 0.75;
      
      if (isKeyboardVisible) {
        onKeyboardShow?.();
      } else {
        onKeyboardHide?.();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [onKeyboardShow, onKeyboardHide]);

  return null;
};

export const MobileOptimizedInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC08] focus:border-transparent touch-manipulation ${className}`}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      {...props}
    />
  );
};

export const MobileOptimizedButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  return (
    <TouchFeedback onPress={onClick}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full py-4 px-6 text-base font-bold rounded-lg transition-all duration-200 touch-manipulation ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#FFCC08] text-black hover:bg-[#FFD700] active:scale-95 shadow-lg'
        } ${className}`}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    </TouchFeedback>
  );
};

export const MobilePullToRefresh = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      onRefresh?.().finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 bg-[#FFCC08] text-black text-center py-2 z-10"
          style={{ transform: `translateY(${pullDistance - 50}px)` }}
        >
          {pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 bg-[#FFCC08] text-black text-center py-2 z-10">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            <span>Refreshing...</span>
          </div>
        </div>
      )}
      
      <div style={{ transform: `translateY(${Math.max(0, pullDistance - 50)}px)` }}>
        {children}
      </div>
    </div>
  );
};

export default {
  MobileStatusBar,
  TouchFeedback,
  SwipeGesture,
  MobileKeyboardHandler,
  MobileOptimizedInput,
  MobileOptimizedButton,
  MobilePullToRefresh
};
