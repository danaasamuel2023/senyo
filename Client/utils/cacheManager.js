/**
 * Cache Manager for Performance Optimization
 * Provides intelligent caching for API responses and user data
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Generate cache key from URL and parameters
   */
  generateKey(url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}${paramString ? `?${paramString}` : ''}`;
  }

  /**
   * Set cache item with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    // Clean expired items if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanExpired();
    }

    const item = {
      data,
      timestamp: Date.now(),
      ttl,
      expires: Date.now() + ttl
    };

    this.cache.set(key, item);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store cache in localStorage:', error);
    }
  }

  /**
   * Get cache item if not expired
   */
  get(key) {
    // Check memory cache first
    const item = this.cache.get(key);
    if (item && Date.now() < item.expires) {
      return item.data;
    }

    // Check localStorage cache
    try {
      const storedItem = localStorage.getItem(`cache_${key}`);
      if (storedItem) {
        const parsedItem = JSON.parse(storedItem);
        if (Date.now() < parsedItem.expires) {
          // Restore to memory cache
          this.cache.set(key, parsedItem);
          return parsedItem.data;
        } else {
          // Remove expired item
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cache from localStorage:', error);
    }

    return null;
  }

  /**
   * Check if cache item exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Remove specific cache item
   */
  delete(key) {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    try {
      // Clear all cache items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired() {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expires) {
        this.cache.delete(key);
      }
    }

    // Clean localStorage cache
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          const storedItem = localStorage.getItem(key);
          if (storedItem) {
            try {
              const parsedItem = JSON.parse(storedItem);
              if (now >= parsedItem.expires) {
                localStorage.removeItem(key);
              }
            } catch (error) {
              // Remove corrupted cache item
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clean localStorage cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now < item.expires) {
        validItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      maxSize: this.maxSize,
      memoryUsage: this.cache.size / this.maxSize * 100
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

/**
 * Cached API request wrapper
 */
export const cachedRequest = async (url, options = {}, ttl = 5 * 60 * 1000) => {
  const key = cacheManager.generateKey(url, options.params);
  
  // Check cache first
  const cachedData = cacheManager.get(key);
  if (cachedData) {
    console.log('🚀 Cache hit:', url);
    return cachedData;
  }

  // Make API request
  console.log('🌐 Cache miss, making API request:', url);
  const response = await fetch(url, options);
  const data = await response.json();

  // Cache successful responses
  if (response.ok) {
    cacheManager.set(key, data, ttl);
  }

  return data;
};

/**
 * Cache user data with longer TTL
 */
export const cacheUserData = (userId, data) => {
  const key = `user_${userId}`;
  cacheManager.set(key, data, 30 * 60 * 1000); // 30 minutes
};

/**
 * Get cached user data
 */
export const getCachedUserData = (userId) => {
  const key = `user_${userId}`;
  return cacheManager.get(key);
};

/**
 * Cache wallet data with short TTL
 */
export const cacheWalletData = (userId, data) => {
  const key = `wallet_${userId}`;
  cacheManager.set(key, data, 2 * 60 * 1000); // 2 minutes
};

/**
 * Get cached wallet data
 */
export const getCachedWalletData = (userId) => {
  const key = `wallet_${userId}`;
  return cacheManager.get(key);
};

/**
 * Invalidate cache for specific user
 */
export const invalidateUserCache = (userId) => {
  cacheManager.delete(`user_${userId}`);
  cacheManager.delete(`wallet_${userId}`);
};

/**
 * Preload critical data
 */
export const preloadCriticalData = async (userId) => {
  if (!userId) return;

  // Preload user data if not cached
  if (!getCachedUserData(userId)) {
    try {
      const userData = await cachedRequest(`/api/v1/users/${userId}`);
      cacheUserData(userId, userData);
    } catch (error) {
      console.warn('Failed to preload user data:', error);
    }
  }

  // Preload wallet data if not cached
  if (!getCachedWalletData(userId)) {
    try {
      const walletData = await cachedRequest(`/api/wallet/balance`);
      cacheWalletData(userId, walletData);
    } catch (error) {
      console.warn('Failed to preload wallet data:', error);
    }
  }
};

export default cacheManager;
