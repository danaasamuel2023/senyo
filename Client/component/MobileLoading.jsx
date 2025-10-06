'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Skeleton Loader Component
export const Skeleton = ({ 
  className = '', 
  variant = 'text', // 'text', 'circular', 'rectangular', 'card'
  animation = 'shimmer', // 'shimmer', 'pulse', 'none'
  width,
  height,
}) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const animations = {
    shimmer: 'animate-shimmer',
    pulse: 'animate-pulse',
    none: '',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '10rem' },
    card: { width: '100%', height: '12rem' },
  };

  const size = defaultSizes[variant];

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-800
        ${variants[variant]}
        ${animations[animation]}
        ${className}
      `}
      style={{
        width: width || size.width,
        height: height || size.height,
      }}
    />
  );
};

// Card Skeleton Component
export const CardSkeleton = ({ showImage = true }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
      {showImage && (
        <Skeleton variant="rectangular" height="200px" className="mb-4" />
      )}
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" height="36px" width="80px" />
          <Skeleton variant="rectangular" height="36px" width="80px" />
        </div>
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = ({ showIcon = true }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {showIcon && (
        <Skeleton variant="circular" width="40px" height="40px" />
      )}
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height="14px" />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
    </div>
  );
};

// Pull to Refresh Component
export const PullToRefresh = ({ 
  onRefresh, 
  children,
  threshold = 80,
  refreshing = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
      
      if (onRefresh) {
        await onRefresh();
      }
      
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    setStartY(0);
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={`
          absolute top-0 left-1/2 -translate-x-1/2 z-50
          transition-all duration-300
          ${pullDistance > 0 || isRefreshing ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          transform: `translateX(-50%) translateY(${isRefreshing ? 60 : pullDistance - 40}px)`,
        }}
      >
        <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full shadow-lg flex items-center justify-center">
          <Loader2 
            className="w-6 h-6 text-[#FFCC08]"
            style={{
              transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const colors = {
    primary: 'text-[#FFCC08]',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizes[size]} ${colors[color]} animate-spin`} />
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" className="mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  value = 0, 
  max = 100,
  showLabel = false,
  color = 'primary',
  size = 'medium',
  animated = false,
  className = '',
}) => {
  const percentage = (value / max) * 100;
  
  const colors = {
    primary: 'bg-[#FFCC08]',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizes = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`
            ${colors[color]} ${sizes[size]} rounded-full
            transition-all duration-500 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full bg-white/30 animate-shimmer" />
          )}
        </div>
      </div>
      {showLabel && (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Loading Dots Component
export const LoadingDots = ({ color = 'primary' }) => {
  const colors = {
    primary: 'bg-[#FFCC08]',
    white: 'bg-white',
    gray: 'bg-gray-500',
  };

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${colors[color]} animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

// Content Placeholder Component
export const ContentPlaceholder = ({ 
  lines = 3,
  showAvatar = false,
  showImage = false,
}) => {
  return (
    <div className="animate-pulse">
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="50%" height="16px" />
            <Skeleton variant="text" width="30%" height="14px" />
          </div>
        </div>
      )}
      
      {showImage && (
        <Skeleton variant="rectangular" height="200px" className="mb-4" />
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={i === lines - 1 ? '70%' : '100%'}
            height="14px"
          />
        ))}
      </div>
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({ text = 'Loading' }) => {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <LoadingSpinner size="small" />
      <span>{text}</span>
      <LoadingDots color="gray" />
    </span>
  );
};

// Export styles for animations
export const loadingStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0.2) 80%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @media (prefers-color-scheme: dark) {
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 80%,
        transparent 100%
      );
    }
  }
`;

export default {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  PullToRefresh,
  LoadingSpinner,
  FullPageLoading,
  ProgressBar,
  LoadingDots,
  ContentPlaceholder,
  InlineLoading,
};