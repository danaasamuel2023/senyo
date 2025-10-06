// Mobile Utilities and Performance Optimizations

// Check if device is mobile
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if device is iOS
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Check if device is Android
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Check if device supports touch
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get safe area insets
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
  };
};

// Haptic feedback
export const hapticFeedback = (duration = 10) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

// Format phone number for mobile display
export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy load images
export const lazyLoadImage = (imageUrl, placeholder = '/placeholder.jpg') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error('Failed to load image'));
  });
};

// Optimize image URL for mobile
export const optimizeImageUrl = (url, width = 800, quality = 80) => {
  // If using a CDN like Cloudinary or Imgix, add optimization parameters
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto,c_limit/`);
  }
  // Add other CDN optimizations as needed
  return url;
};

// Calculate responsive font size
export const responsiveFontSize = (baseSize, minSize, maxSize) => {
  const vw = Math.min(window.innerWidth / 100, 4);
  const size = baseSize + vw;
  return Math.max(minSize, Math.min(size, maxSize));
};

// Check network connection
export const getNetworkStatus = () => {
  if (!navigator.connection) return 'unknown';
  
  const connection = navigator.connection;
  return {
    type: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // Round-trip time in ms
    saveData: connection.saveData, // Data saver mode enabled
  };
};

// Request idle callback with fallback
export const requestIdleCallback = (callback, options) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for browsers that don't support requestIdleCallback
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
};

// Cancel idle callback with fallback
export const cancelIdleCallback = (id) => {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  };
  
  const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
  return observer;
};

// Format currency for mobile display
export const formatCurrency = (amount, currency = 'GHS') => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date for mobile display
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  
  return new Intl.DateTimeFormat('en-GH', options[format] || options.short).format(new Date(date));
};

// Truncate text for mobile
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - suffix.length) + suffix;
};

// Calculate reading time
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

// Storage utilities with fallback
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from storage:', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error writing to storage:', e);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from storage:', e);
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing storage:', e);
      return false;
    }
  },
};

// Share functionality
export const share = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  } else {
    // Fallback to copying to clipboard
    if (data.url) {
      return copyToClipboard(data.url);
    }
    return false;
  }
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Check if PWA is installed
export const isPWAInstalled = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Request permission for notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
  return null;
};

// Detect orientation
export const getOrientation = () => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

// Lock screen orientation (if supported)
export const lockOrientation = async (orientation = 'portrait') => {
  if (screen.orientation && screen.orientation.lock) {
    try {
      await screen.orientation.lock(orientation);
      return true;
    } catch (err) {
      console.error('Failed to lock orientation:', err);
      return false;
    }
  }
  return false;
};

// Unlock screen orientation
export const unlockOrientation = () => {
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }
};

// Format file size for mobile display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number (Ghana format)
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return /^0[235]\d{8}$/.test(cleaned);
};

// Generate unique ID
export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Check if element is in viewport
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Smooth scroll to element
export const smoothScrollTo = (element, offset = 0) => {
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
};

// Export all utilities
export default {
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
  getSafeAreaInsets,
  hapticFeedback,
  formatPhoneNumber,
  debounce,
  throttle,
  lazyLoadImage,
  optimizeImageUrl,
  responsiveFontSize,
  getNetworkStatus,
  requestIdleCallback,
  cancelIdleCallback,
  createIntersectionObserver,
  formatCurrency,
  formatDate,
  truncateText,
  calculateReadingTime,
  storage,
  share,
  copyToClipboard,
  isPWAInstalled,
  requestNotificationPermission,
  showNotification,
  getOrientation,
  lockOrientation,
  unlockOrientation,
  formatFileSize,
  validateEmail,
  validatePhoneNumber,
  generateUniqueId,
  isInViewport,
  smoothScrollTo,
};