'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  resistance = 2.5,
  disabled = false,
  className = '',
  pullText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  refreshingText = 'Refreshing...'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Calculate pull progress (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1);
  
  // Determine if we should trigger refresh
  const shouldRefresh = pullDistance >= threshold;

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Pull to refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, disabled, isRefreshing]);

  useEffect(() => {
    if (disabled) return;

    let touchStartY = 0;
    let isDragging = false;
    let initialScrollY = 0;

    const handleTouchStart = (e) => {
      // Only allow pull-to-refresh when at the top of the page
      if (window.scrollY > 0) return;
      
      touchStartY = e.touches[0].clientY;
      initialScrollY = window.scrollY;
      isDragging = true;
      setIsPulling(false);
    };

    const handleTouchMove = (e) => {
      if (!isDragging || window.scrollY > 0) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;
      
      // Only allow downward pull
      if (deltaY > 0) {
        e.preventDefault();
        
        // Apply resistance for natural feel
        const resistanceFactor = 1 / (1 + deltaY / (window.innerHeight * resistance));
        const pullDistance = deltaY * resistanceFactor;
        
        setPullDistance(pullDistance);
        setCurrentY(touchY);
        setIsPulling(pullDistance > 10);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      
      if (shouldRefresh && !isRefreshing) {
        handleRefresh();
      } else {
        // Animate back to original position
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [shouldRefresh, isRefreshing, disabled, handleRefresh, resistance, threshold]);

  // Auto-reset when not refreshing
  useEffect(() => {
    if (!isRefreshing && pullDistance > 0) {
      const timer = setTimeout(() => {
        setPullDistance(0);
        setIsPulling(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, pullDistance]);

  return (
    <div className={`relative ${className}`}>
      {/* Pull to refresh indicator */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200 ease-out ${
          isPulling || isRefreshing ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          height: `${Math.min(pullDistance, threshold + 20)}px`,
          background: isRefreshing 
            ? 'linear-gradient(135deg, #FFCC08, #fbbf24)' 
            : 'linear-gradient(135deg, rgba(255, 204, 8, 0.9), rgba(251, 191, 36, 0.9))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center space-x-3 text-black font-medium">
          {isRefreshing ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>{refreshingText}</span>
            </>
          ) : (
            <>
              <div className="relative">
                <ArrowDown 
                  className={`w-6 h-6 transition-transform duration-200 ${
                    shouldRefresh ? 'rotate-180' : ''
                  }`}
                />
                {shouldRefresh && (
                  <div className="absolute inset-0 animate-ping">
                    <ArrowDown className="w-6 h-6 opacity-30" />
                  </div>
                )}
              </div>
              <span>
                {shouldRefresh ? releaseText : pullText}
              </span>
            </>
          )}
        </div>
        
        {/* Progress indicator */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-black/20 transition-all duration-200"
          style={{ 
            width: `${pullProgress * 100}%`,
            background: shouldRefresh 
              ? 'linear-gradient(90deg, #000, #333)' 
              : 'linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4))'
          }}
        />
      </div>

      {/* Content with pull effect */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateY(${Math.min(pullDistance * 0.3, 30)}px)`,
          opacity: isPulling ? Math.max(0.7, 1 - pullProgress * 0.3) : 1
        }}
      >
        {children}
      </div>

      {/* Haptic feedback simulation */}
      {shouldRefresh && !isRefreshing && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#FFCC08] rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;
