'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

// Mobile-optimized Modal Component
export const MobileModal = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'center', // 'center', 'bottom', 'full'
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnSwipe = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const modalRef = useRef(null);
  const startY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
      }, 300);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle touch events for swipe to close (bottom sheet only)
  const handleTouchStart = (e) => {
    if (variant === 'bottom' && closeOnSwipe) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && variant === 'bottom') {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        setDragY(diff);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && variant === 'bottom') {
      setIsDragging(false);
      if (dragY > 100) {
        onClose();
      }
      setDragY(0);
    }
  };

  if (!isOpen) return null;

  const modalVariants = {
    center: `
      max-w-md w-full mx-4 rounded-2xl
      ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
    `,
    bottom: `
      w-full max-h-[90vh] rounded-t-2xl
      ${isVisible ? 'translate-y-0' : 'translate-y-full'}
    `,
    full: `
      w-full h-full
      ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
    `,
  };

  const backdropClass = `
    fixed inset-0 bg-black/60 backdrop-blur-sm z-50
    transition-opacity duration-300
    ${isVisible ? 'opacity-100' : 'opacity-0'}
  `;

  const modalPositionClass = variant === 'bottom' 
    ? 'items-end' 
    : variant === 'full' 
      ? '' 
      : 'items-center justify-center';

  return (
    <div className={backdropClass}>
      <div 
        className={`fixed inset-0 z-50 flex ${modalPositionClass} ${variant === 'full' ? '' : 'p-0'}`}
        onClick={closeOnBackdrop ? onClose : undefined}
      >
        <div
          ref={modalRef}
          className={`
            bg-white dark:bg-gray-950 shadow-2xl
            transition-all duration-300 relative
            ${modalVariants[variant]}
            ${className}
          `}
          style={{
            transform: variant === 'bottom' && dragY > 0 
              ? `translateY(${dragY}px)` 
              : undefined
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe indicator for bottom sheet */}
          {variant === 'bottom' && (
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          )}

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={`
            ${variant === 'full' ? 'h-full' : 'max-h-[70vh]'}
            overflow-y-auto -webkit-overflow-scrolling-touch
            ${title ? '' : 'pt-5'}
          `}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Modal Component
export const MobileAlert = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'info', 'warning', 'danger', 'success'
  loading = false,
}) => {
  const variantStyles = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
  };

  const buttonStyles = {
    info: 'bg-blue-500 hover:bg-blue-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  };

  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      variant="center"
      showCloseButton={false}
    >
      <div className="p-6">
        <div className={`w-16 h-16 rounded-full ${variantStyles[variant]} flex items-center justify-center mx-auto mb-4`}>
          {variant === 'warning' && (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {variant === 'danger' && (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {variant === 'success' && (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {variant === 'info' && (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors active:scale-95"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold ${buttonStyles[variant]} transition-colors active:scale-95 disabled:opacity-50`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </MobileModal>
  );
};

// Action Sheet Component
export const MobileActionSheet = ({
  isOpen,
  onClose,
  title,
  actions = [],
  cancelText = 'Cancel',
}) => {
  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      variant="bottom"
      showCloseButton={false}
    >
      <div className="pb-safe">
        {title && (
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {title}
            </p>
          </div>
        )}

        <div className="py-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`
                w-full px-5 py-4 text-left flex items-center justify-between
                hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                active:scale-98
                ${action.variant === 'danger' ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-3">
                {action.icon && <action.icon className="w-5 h-5" />}
                <span className="font-medium">{action.label}</span>
              </div>
              {action.badge && (
                <span className="px-2 py-1 text-xs font-bold bg-[#FFCC08] text-black rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
          <button
            onClick={onClose}
            className="w-full px-5 py-4 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors active:scale-98"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </MobileModal>
  );
};

export default MobileModal;