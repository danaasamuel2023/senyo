/**
 * In-Memory Cache Implementation for Wallet Balances and User Data
 * Provides fast access to frequently accessed data without database queries
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time-to-live tracking
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if expired/not found
   */
  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }
}

// Wallet-specific cache operations
class WalletCache extends MemoryCache {
  constructor() {
    super();
    this.defaultTTL = 2 * 60 * 1000; // 2 minutes for wallet data
  }

  /**
   * Cache user wallet balance
   * @param {string} userId - User ID
   * @param {object} walletData - Wallet data object
   */
  setWalletBalance(userId, walletData) {
    const key = `wallet:${userId}`;
    this.set(key, {
      balance: walletData.balance,
      currency: walletData.currency,
      frozen: walletData.frozen,
      lastUpdated: Date.now(),
      ...walletData
    });
  }

  /**
   * Get cached wallet balance
   * @param {string} userId - User ID
   * @returns {object|null} Cached wallet data
   */
  getWalletBalance(userId) {
    const key = `wallet:${userId}`;
    return this.get(key);
  }

  /**
   * Invalidate wallet cache for user
   * @param {string} userId - User ID
   */
  invalidateWallet(userId) {
    const key = `wallet:${userId}`;
    this.delete(key);
  }

  /**
   * Update wallet balance in cache
   * @param {string} userId - User ID
   * @param {number} newBalance - New balance amount
   */
  updateWalletBalance(userId, newBalance) {
    const key = `wallet:${userId}`;
    const cached = this.get(key);
    if (cached) {
      cached.balance = newBalance;
      cached.lastUpdated = Date.now();
      this.set(key, cached);
    }
  }
}

// User-specific cache operations
class UserCache extends MemoryCache {
  constructor() {
    super();
    this.defaultTTL = 10 * 60 * 1000; // 10 minutes for user data
  }

  /**
   * Cache user data
   * @param {string} userId - User ID
   * @param {object} userData - User data object
   */
  setUserData(userId, userData) {
    const key = `user:${userId}`;
    this.set(key, {
      ...userData,
      lastUpdated: Date.now()
    });
  }

  /**
   * Get cached user data
   * @param {string} userId - User ID
   * @returns {object|null} Cached user data
   */
  getUserData(userId) {
    const key = `user:${userId}`;
    return this.get(key);
  }

  /**
   * Invalidate user cache
   * @param {string} userId - User ID
   */
  invalidateUser(userId) {
    const key = `user:${userId}`;
    this.delete(key);
  }
}

// Transaction cache for payment processing
class TransactionCache extends MemoryCache {
  constructor() {
    super();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes for transaction data
  }

  /**
   * Cache transaction data
   * @param {string} reference - Transaction reference
   * @param {object} transactionData - Transaction data
   */
  setTransaction(reference, transactionData) {
    const key = `transaction:${reference}`;
    this.set(key, {
      ...transactionData,
      lastUpdated: Date.now()
    });
  }

  /**
   * Get cached transaction
   * @param {string} reference - Transaction reference
   * @returns {object|null} Cached transaction data
   */
  getTransaction(reference) {
    const key = `transaction:${reference}`;
    return this.get(key);
  }

  /**
   * Invalidate transaction cache
   * @param {string} reference - Transaction reference
   */
  invalidateTransaction(reference) {
    const key = `transaction:${reference}`;
    this.delete(key);
  }
}

// Create singleton instances
const walletCache = new WalletCache();
const userCache = new UserCache();
const transactionCache = new TransactionCache();

// Auto-cleanup every 5 minutes
setInterval(() => {
  walletCache.cleanup();
  userCache.cleanup();
  transactionCache.cleanup();
}, 5 * 60 * 1000);

module.exports = {
  MemoryCache,
  WalletCache,
  UserCache,
  TransactionCache,
  walletCache,
  userCache,
  transactionCache
};
