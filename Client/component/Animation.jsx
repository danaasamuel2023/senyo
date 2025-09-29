/**
 * Animation Components for UnlimitedData Gh Dashboard
 * 
 * Provides smooth animated counters for displaying dynamic numerical values
 * with customizable duration, formatting, and easing functions.
 * 
 * @module AnimationComponents
 * @author UnlimitedData Gh
 * @version 2.0.0
 */

'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Easing functions for smooth animations
 */
const easingFunctions = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

/**
 * AnimatedCounter Component
 * 
 * A performant counter component that animates from 0 (or a start value) to a target value
 * with customizable formatting, duration, and easing.
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Target value to count to
 * @param {number} [props.startValue=0] - Starting value for the animation
 * @param {number} [props.duration=1000] - Animation duration in milliseconds
 * @param {string} [props.prefix=''] - String to prepend to the value
 * @param {string} [props.suffix=''] - String to append to the value
 * @param {number} [props.decimals=0] - Number of decimal places to display
 * @param {string} [props.separator=','] - Thousands separator
 * @param {string} [props.decimal='.'] - Decimal separator
 * @param {string} [props.easing='easeOutQuad'] - Easing function name
 * @param {Function} [props.onComplete] - Callback when animation completes
 * @param {boolean} [props.preserveValue=false] - Keep the value when component updates
 * @param {string} [props.className=''] - CSS classes for styling
 * @param {boolean} [props.enableScrollTrigger=false] - Start animation when element is in viewport
 */
const AnimatedCounter = ({ 
  value = 0,
  startValue = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  decimal = '.',
  easing = 'easeOutQuad',
  onComplete,
  preserveValue = false,
  className = '',
  enableScrollTrigger = false,
  delay = 0,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(preserveValue ? value : startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef(null);
  const elementRef = useRef(null);
  const startTimeRef = useRef(null);
  const previousValueRef = useRef(startValue);

  // Select easing function
  const easingFunction = useMemo(() => {
    return easingFunctions[easing] || easingFunctions.easeOutQuad;
  }, [easing]);

  // Format number with separators
  const formatNumber = useCallback((num) => {
    if (typeof num !== 'number' || isNaN(num)) return `${prefix}0${suffix}`;
    
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    const formatted = parts.join(decimal);
    return `${prefix}${formatted}${suffix}`;
  }, [prefix, suffix, decimals, separator, decimal]);

  // Animation logic
  const animate = useCallback(() => {
    const finalValue = Number(value) || 0;
    const initialValue = preserveValue ? previousValueRef.current : startValue;
    const valueDifference = finalValue - initialValue;
    
    const updateCounter = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(updateCounter);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      
      const currentValue = initialValue + (valueDifference * easedProgress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(finalValue);
        setIsAnimating(false);
        setHasAnimated(true);
        previousValueRef.current = finalValue;
        
        if (onComplete) {
          onComplete(finalValue);
        }
      }
    };
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset start time and begin animation
    startTimeRef.current = null;
    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(updateCounter);
  }, [value, startValue, duration, delay, easingFunction, preserveValue, onComplete]);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!enableScrollTrigger) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animate();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableScrollTrigger, animate, hasAnimated]);

  // Update animation when value changes
  useEffect(() => {
    if (!enableScrollTrigger || hasAnimated) {
      animate();
    }
  }, [value, enableScrollTrigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span 
      ref={elementRef}
      className={`animated-counter ${className} ${isAnimating ? 'animating' : ''}`}
      data-value={value}
      {...props}
    >
      {formatNumber(displayValue)}
    </span>
  );
};

/**
 * CurrencyCounter Component
 * 
 * Specialized counter for animating currency values with proper formatting
 * using the Intl.NumberFormat API for locale-specific currency display.
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Target currency value
 * @param {number} [props.startValue=0] - Starting value for the animation
 * @param {number} [props.duration=1500] - Animation duration in milliseconds
 * @param {string} [props.currency='GHS'] - Currency code (e.g., 'GHS', 'USD', 'EUR')
 * @param {string} [props.locale='en-GH'] - Locale for formatting (e.g., 'en-GH', 'en-US')
 * @param {string} [props.easing='easeOutQuad'] - Easing function name
 * @param {Function} [props.onComplete] - Callback when animation completes
 * @param {boolean} [props.showSymbol=true] - Whether to show currency symbol
 * @param {string} [props.className=''] - CSS classes for styling
 * @param {boolean} [props.enableScrollTrigger=false] - Start animation when element is in viewport
 * @param {number} [props.minimumFractionDigits=2] - Minimum decimal places
 * @param {number} [props.maximumFractionDigits=2] - Maximum decimal places
 * @param {boolean} [props.compact=false] - Use compact notation for large numbers
 */
const CurrencyCounter = ({ 
  value = 0,
  startValue = 0,
  duration = 1500,
  currency = 'GHS',
  locale = 'en-GH',
  easing = 'easeOutQuad',
  onComplete,
  showSymbol = true,
  className = '',
  enableScrollTrigger = false,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  compact = false,
  delay = 0,
  colorPositive = 'text-green-600',
  colorNegative = 'text-red-600',
  showSign = false,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef(null);
  const elementRef = useRef(null);
  const startTimeRef = useRef(null);
  const previousValueRef = useRef(startValue);

  // Select easing function
  const easingFunction = useMemo(() => {
    return easingFunctions[easing] || easingFunctions.easeOutQuad;
  }, [easing]);

  // Create number formatter
  const formatter = useMemo(() => {
    const options = {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    };

    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
    }

    if (!showSymbol) {
      delete options.currency;
    }

    return new Intl.NumberFormat(locale, options);
  }, [currency, locale, showSymbol, minimumFractionDigits, maximumFractionDigits, compact]);

  // Format currency value
  const formatCurrency = useCallback((num) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return formatter.format(0);
    }

    const formatted = formatter.format(Math.abs(num));
    const sign = showSign && num > 0 ? '+' : (num < 0 ? '-' : '');
    
    return showSign ? `${sign}${formatted}` : (num < 0 && !showSymbol ? `-${formatted}` : formatted);
  }, [formatter, showSign, showSymbol]);

  // Animation logic
  const animate = useCallback(() => {
    const finalValue = Number(value) || 0;
    const initialValue = previousValueRef.current;
    const valueDifference = finalValue - initialValue;
    
    const updateCounter = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(updateCounter);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      
      const currentValue = initialValue + (valueDifference * easedProgress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(finalValue);
        setIsAnimating(false);
        setHasAnimated(true);
        previousValueRef.current = finalValue;
        
        if (onComplete) {
          onComplete(finalValue);
        }
      }
    };
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset start time and begin animation
    startTimeRef.current = null;
    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(updateCounter);
  }, [value, duration, delay, easingFunction, onComplete]);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    if (!enableScrollTrigger) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animate();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enableScrollTrigger, animate, hasAnimated]);

  // Update animation when value changes
  useEffect(() => {
    if (!enableScrollTrigger || hasAnimated) {
      animate();
    }
  }, [value, enableScrollTrigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Determine color based on value
  const valueColor = displayValue < 0 ? colorNegative : (displayValue > 0 ? colorPositive : '');

  return (
    <span 
      ref={elementRef}
      className={`currency-counter ${className} ${valueColor} ${isAnimating ? 'animating' : ''}`}
      data-value={value}
      data-currency={currency}
      {...props}
    >
      {formatCurrency(displayValue)}
    </span>
  );
};

/**
 * PercentageCounter Component
 * 
 * Animated counter specifically for percentage values with proper formatting
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Target percentage value (0-100)
 * @param {number} [props.decimals=1] - Number of decimal places
 * @param {boolean} [props.showSign=false] - Show + sign for positive values
 */
const PercentageCounter = ({ 
  value = 0, 
  decimals = 1,
  showSign = false,
  colorPositive = 'text-green-600',
  colorNegative = 'text-red-600',
  ...props 
}) => {
  const suffix = '%';
  const prefix = showSign && value > 0 ? '+' : '';
  const colorClass = value < 0 ? colorNegative : (value > 0 ? colorPositive : '');
  
  return (
    <AnimatedCounter
      value={value}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      className={colorClass}
      {...props}
    />
  );
};

/**
 * DataCounter Component
 * 
 * Animated counter for data units (MB, GB, TB) with automatic unit conversion
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Value in MB
 * @param {string} [props.unit='auto'] - Display unit ('MB', 'GB', 'TB', or 'auto')
 */
const DataCounter = ({ 
  value = 0, 
  unit = 'auto',
  decimals = 1,
  ...props 
}) => {
  const convertedValue = useMemo(() => {
    let displayValue = value;
    let displayUnit = 'MB';
    
    if (unit === 'auto') {
      if (value >= 1024 * 1024) { // TB
        displayValue = value / (1024 * 1024);
        displayUnit = 'TB';
      } else if (value >= 1024) { // GB
        displayValue = value / 1024;
        displayUnit = 'GB';
      }
    } else {
      switch(unit) {
        case 'GB':
          displayValue = value / 1024;
          displayUnit = 'GB';
          break;
        case 'TB':
          displayValue = value / (1024 * 1024);
          displayUnit = 'TB';
          break;
        default:
          displayUnit = 'MB';
      }
    }
    
    return { value: displayValue, unit: displayUnit };
  }, [value, unit]);
  
  return (
    <AnimatedCounter
      value={convertedValue.value}
      suffix={` ${convertedValue.unit}`}
      decimals={decimals}
      {...props}
    />
  );
};

/**
 * Export all animation components for UnlimitedData Gh platform
 */
export { 
  AnimatedCounter, 
  CurrencyCounter, 
  PercentageCounter, 
  DataCounter,
  easingFunctions 
};