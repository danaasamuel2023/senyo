/**
 * Redis Service for High-Performance Caching
 * Optimized for 10M users/day scalability
 */

const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 300; // 5 minutes default
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // Redis configuration for production
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Connection pool settings
        family: 4,
        keepAlive: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // Retry settings
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      };

      this.client = redis.createClient(redisConfig);

      // Event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready');
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('⚠️ Redis connection ended');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
      
      console.log('🚀 Redis service initialized');
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) {
      console.warn('⚠️ Redis not connected, skipping cache set');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('❌ Redis set error:', error.message);
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  async get(key) {
    if (!this.isConnected) {
      console.warn('⚠️ Redis not connected, skipping cache get');
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      console.error('❌ Redis get error:', error.message);
      return null;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  async delete(key) {
    if (!this.isConnected) {
      console.warn('⚠️ Redis not connected, skipping cache delete');
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis delete error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis exists error:', error.message);
      return false;
    }
  }

  /**
   * Set expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  async expire(key, ttl) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('❌ Redis expire error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  async getStats() {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: true,
        memory: info,
        keyspace: keyspace,
        uptime: process.uptime()
      };
    } catch (error) {
      console.error('❌ Redis stats error:', error.message);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushAll();
      console.log('🧹 Redis cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Redis clear error:', error.message);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('👋 Redis disconnected');
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
