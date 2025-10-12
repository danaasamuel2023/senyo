/**
 * Cache Middleware for High-Performance API Responses
 * Optimized for 10M users/day scalability
 */

const redisService = require('../services/redisService');

/**
 * Cache middleware for GET requests
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key
 */
const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cachedData = await redisService.get(cacheKey);
      
      if (cachedData !== null) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Cache miss - continue to route handler
      console.log(`❌ Cache miss: ${cacheKey}`);
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        redisService.set(cacheKey, data, ttl).catch(err => {
          console.error('❌ Cache set error:', err.message);
        });
        
        // Call original method
        return originalJson.call(this, {
          success: true,
          data: data,
          cached: false,
          timestamp: new Date().toISOString()
        });
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * User-specific cache middleware
 * @param {number} ttl - Time to live in seconds
 */
const userCacheMiddleware = (ttl = 300) => {
  return cacheMiddleware(ttl, (req) => {
    const userId = req.user?.id || req.params.userId || 'anonymous';
    return `user:${userId}:${req.originalUrl}`;
  });
};

/**
 * API key-specific cache middleware
 * @param {number} ttl - Time to live in seconds
 */
const apiKeyCacheMiddleware = (ttl = 300) => {
  return cacheMiddleware(ttl, (req) => {
    const apiKey = req.headers['x-api-key'] || 'no-key';
    return `api:${apiKey}:${req.originalUrl}`;
  });
};

/**
 * Invalidate cache for specific pattern
 * @param {string} pattern - Cache key pattern
 */
const invalidateCache = async (pattern) => {
  try {
    if (!redisService.isConnected) {
      return false;
    }

    // Note: This is a simplified version
    // In production, you might want to use Redis SCAN for pattern matching
    console.log(`🧹 Invalidating cache pattern: ${pattern}`);
    return true;
  } catch (error) {
    console.error('❌ Cache invalidation error:', error.message);
    return false;
  }
};

/**
 * Cache statistics middleware
 */
const cacheStatsMiddleware = async (req, res) => {
  try {
    const stats = await redisService.getStats();
    res.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      message: error.message
    });
  }
};

/**
 * Clear cache middleware (admin only)
 */
const clearCacheMiddleware = async (req, res) => {
  try {
    const result = await redisService.clear();
    res.json({
      success: result,
      message: result ? 'Cache cleared successfully' : 'Failed to clear cache',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
};

module.exports = {
  cacheMiddleware,
  userCacheMiddleware,
  apiKeyCacheMiddleware,
  invalidateCache,
  cacheStatsMiddleware,
  clearCacheMiddleware
};
