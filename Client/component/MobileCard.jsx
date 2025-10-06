'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, MoreVertical, Trash2, Edit, Share2, Star, Heart } from 'lucide-react';

// Swipeable Card Component
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 75,
  className = '',
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const cardRef = useRef(null);

  const handleStart = (clientX) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
    setHasSwiped(false);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const diff = currentX - startX;
    const absDiff = Math.abs(diff);
    
    if (absDiff > threshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight();
        setHasSwiped(true);
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft();
        setHasSwiped(true);
      }
    }
    
    setIsDragging(false);
    setCurrentX(startX);
  };

  const offset = isDragging ? currentX - startX : 0;
  const opacity = isDragging ? 1 - Math.abs(offset) / 200 : 1;

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {leftAction && (
        <div className={`absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center transition-opacity ${offset < -threshold ? 'opacity-100' : 'opacity-0'}`}>
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      )}
      {rightAction && (
        <div className={`absolute inset-y-0 left-0 w-24 bg-green-500 flex items-center justify-center transition-opacity ${offset > threshold ? 'opacity-100' : 'opacity-0'}`}>
          <Star className="w-6 h-6 text-white" />
        </div>
      )}
      
      {/* Main card */}
      <div
        ref={cardRef}
        className={`relative bg-white dark:bg-gray-900 transition-transform ${className}`}
        style={{
          transform: `translateX(${offset}px)`,
          opacity,
          transition: isDragging ? 'none' : 'transform 0.3s, opacity 0.3s',
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    </div>
  );
};

// Mobile Card Component
export const MobileCard = ({
  title,
  subtitle,
  description,
  image,
  badge,
  badgeVariant = 'default',
  onClick,
  onOptionsClick,
  actions,
  footer,
  className = '',
  variant = 'default', // 'default', 'compact', 'featured'
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const badgeStyles = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    accent: 'bg-[#FFCC08]/20 text-[#FFCC08]',
  };

  const variantStyles = {
    default: 'p-4',
    compact: 'p-3',
    featured: 'p-0',
  };

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800
        transition-all duration-200 overflow-hidden
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${isPressed ? 'shadow-inner' : 'shadow-sm hover:shadow-md'}
        ${variantStyles[variant]}
        ${className}
      `}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Featured variant with image */}
      {variant === 'featured' && image && (
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {badge && (
            <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-lg ${badgeStyles[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      <div className={variant === 'featured' ? 'p-4' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {badge && variant !== 'featured' && (
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg mb-2 ${badgeStyles[badgeVariant]}`}>
                {badge}
              </span>
            )}
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Options menu */}
          {onOptionsClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOptionsClick();
              }}
              className="p-2 -mr-2 -mt-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          {/* Arrow for clickable cards */}
          {onClick && !onOptionsClick && (
            <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 active:scale-95
                  ${action.variant === 'primary' 
                    ? 'bg-[#FFCC08] text-black hover:bg-yellow-500' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-1.5 inline" />}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// List Item Component (for more compact layouts)
export const MobileListItem = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onClick,
  className = '',
  showArrow = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900
        transition-all duration-200
        ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-800' : ''}
        ${isPressed ? 'scale-[0.98]' : ''}
        ${className}
      `}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      {/* Icon */}
      {Icon && (
        <div className="w-10 h-10 bg-[#FFCC08]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#FFCC08]" />
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Value or arrow */}
      {value && (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      )}
      
      {showArrow && onClick && (
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
    </div>
  );
};

// Stats Card Component
export const MobileStatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'increase', 'decrease', 'neutral'
  icon: Icon,
  className = '',
}) => {
  const changeStyles = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-[#FFCC08]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#FFCC08]" />
          </div>
        )}
      </div>
      {change && (
        <p className={`text-xs font-medium ${changeStyles[changeType]} flex items-center gap-1`}>
          {changeType === 'increase' && '↑'}
          {changeType === 'decrease' && '↓'}
          {change}
        </p>
      )}
    </div>
  );
};

// Interactive Card with Long Press
export const InteractiveCard = ({
  children,
  onPress,
  onLongPress,
  longPressDelay = 500,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const longPressTimer = useRef(null);
  const rippleRef = useRef(null);

  const handleStart = (e) => {
    setIsPressed(true);
    setShowRipple(true);
    
    // Set ripple position
    if (rippleRef.current && e.touches) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;
    }
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, longPressDelay);
  };

  const handleEnd = () => {
    setIsPressed(false);
    clearTimeout(longPressTimer.current);
    
    // Hide ripple after animation
    setTimeout(() => setShowRipple(false), 300);
  };

  const handleClick = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        transition-all duration-200
        ${isPressed ? 'scale-[0.98] shadow-inner' : 'shadow-sm'}
        ${className}
      `}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onClick={handleClick}
    >
      {children}
      
      {/* Ripple effect */}
      {showRipple && (
        <span
          ref={rippleRef}
          className="absolute w-10 h-10 bg-[#FFCC08]/30 rounded-full animate-ripple pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes ripple {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MobileCard;