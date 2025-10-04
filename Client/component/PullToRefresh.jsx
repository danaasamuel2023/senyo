'use client';

import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80; // Distance needed to trigger refresh

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Only enable pull-to-refresh if at top of page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY !== 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
        
        // Prevent default scroll when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setIsPulling(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
      startY.current = 0;
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = (pullDistance / PULL_THRESHOLD) * 360;
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-Refresh Indicator */}
      <div 
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-200"
        style={{
          transform: `translate(-50%, ${isPulling || isRefreshing ? '0' : '-100%'})`,
          opacity: opacity
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-2xl border border-gray-200 dark:border-gray-700">
          <RefreshCw 
            className={`w-6 h-6 text-[#FFCC08] ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
            }}
          />
        </div>
      </div>

      {/* Pull Progress Indicator */}
      {isPulling && !isRefreshing && (
        <div 
          className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCC08] to-yellow-500 z-50 transition-all duration-100"
          style={{
            width: `${(pullDistance / PULL_THRESHOLD) * 100}%`,
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '100%'
          }}
        />
      )}

      {/* Refresh Message */}
      {isPulling && pullDistance >= PULL_THRESHOLD && !isRefreshing && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#FFCC08] text-black px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Release to refresh
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

