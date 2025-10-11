/**
 * Enhanced Wallet Service with In-Memory Caching
 * Provides fast wallet operations with automatic cache management
 */

const { User, Wallet, Transaction } = require('../schema/schema');
const { walletCache, userCache, transactionCache } = require('../utils/memoryCache');

class WalletService {
  /**
   * Get user wallet balance with caching
   * @param {string} userId - User ID
   * @param {boolean} useCache - Whether to use cache (default: true)
   * @returns {Promise<object>} Wallet data
   */
  static async getWalletBalance(userId, useCache = true) {
    try {
      // Check cache first
      if (useCache) {
        const cached = walletCache.getWalletBalance(userId);
        if (cached) {
          console.log(`[WALLET_CACHE] ✅ Cache hit for user ${userId}`);
          return {
            success: true,
            ...cached,
            fromCache: true
          };
        }
      }

      console.log(`[WALLET_CACHE] ❌ Cache miss for user ${userId}, fetching from DB`);

      // Fetch from database
      let wallet = await Wallet.findOne({ userId });
      
      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new Wallet({
          userId,
          balance: 0,
          currency: 'GHS',
          frozen: false,
          transactions: []
        });
        await wallet.save();
      }

      // Get user data for enhanced response
      const user = await User.findById(userId).select('name email phoneNumber walletBalance');
      
      // Sync with User.walletBalance if different
      if (user && user.walletBalance !== wallet.balance) {
        console.log(`[WALLET_SYNC] Syncing User.walletBalance (${user.walletBalance}) with Wallet.balance (${wallet.balance})`);
        user.walletBalance = wallet.balance;
        await user.save();
      }

      const walletData = {
        balance: wallet.balance,
        currency: wallet.currency,
        frozen: wallet.frozen,
        freezeReason: wallet.freezeReason,
        lastTransaction: wallet.lastTransaction,
        user: user ? {
          name: user.name,
          email: user.email,
          phone: user.phoneNumber
        } : null,
        stats: {
          totalDeposits: wallet.transactions
            .filter(t => t.type === 'deposit' && t.status === 'completed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          totalSpent: wallet.transactions
            .filter(t => t.type === 'purchase' && t.status === 'completed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          transactionCount: wallet.transactions.length
        }
      };

      // Cache the result
      walletCache.setWalletBalance(userId, walletData);

      return {
        success: true,
        ...walletData,
        fromCache: false
      };

    } catch (error) {
      console.error(`[WALLET_SERVICE] Error getting wallet balance for user ${userId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update wallet balance with cache invalidation
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add/subtract
   * @param {string} type - Transaction type (deposit, purchase, etc.)
   * @param {object} metadata - Additional transaction metadata
   * @returns {Promise<object>} Update result
   */
  static async updateWalletBalance(userId, amount, type = 'deposit', metadata = {}) {
    try {
      const session = await Wallet.startSession();
      
      try {
        await session.withTransaction(async () => {
          // Get current wallet
          let wallet = await Wallet.findOne({ userId }).session(session);
          
          if (!wallet) {
            wallet = new Wallet({
              userId,
              balance: 0,
              currency: 'GHS',
              frozen: false,
              transactions: []
            });
          }

          const balanceBefore = wallet.balance;
          const balanceAfter = balanceBefore + amount;

          // Update wallet balance
          wallet.balance = balanceAfter;
          wallet.lastTransaction = new Date();

          // Add transaction record
          wallet.transactions.push({
            type,
            amount,
            balanceBefore,
            balanceAfter,
            description: metadata.description || `${type} transaction`,
            reference: metadata.reference,
            status: 'completed',
            metadata,
            createdAt: new Date()
          });

          await wallet.save({ session });

          // Update User.walletBalance for consistency
          const user = await User.findById(userId).session(session);
          if (user) {
            user.walletBalance = balanceAfter;
            await user.save({ session });
          }

          console.log(`[WALLET_UPDATE] User ${userId}: ${balanceBefore} → ${balanceAfter} (${type}: ${amount})`);
        });

        // Invalidate cache
        walletCache.invalidateWallet(userId);
        userCache.invalidateUser(userId);

        return {
          success: true,
          newBalance: (await Wallet.findOne({ userId })).balance,
          message: 'Wallet updated successfully'
        };

      } finally {
        await session.endSession();
      }

    } catch (error) {
      console.error(`[WALLET_SERVICE] Error updating wallet for user ${userId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process payment with caching
   * @param {string} reference - Transaction reference
   * @returns {Promise<object>} Processing result
   */
  static async processPayment(reference) {
    try {
      // Check transaction cache first
      const cachedTransaction = transactionCache.getTransaction(reference);
      if (cachedTransaction && cachedTransaction.status === 'completed') {
        console.log(`[PAYMENT_CACHE] ✅ Transaction ${reference} already processed (cached)`);
        return {
          success: true,
          message: 'Payment already processed',
          fromCache: true
        };
      }

      // Find transaction in database
      const transaction = await Transaction.findOne({ reference });
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      if (transaction.status === 'completed') {
        // Cache the completed transaction
        transactionCache.setTransaction(reference, {
          status: 'completed',
          amount: transaction.amount,
          userId: transaction.userId
        });
        
        return {
          success: true,
          message: 'Payment already processed',
          fromCache: false
        };
      }

      // Process the payment
      const result = await this.updateWalletBalance(
        transaction.userId,
        transaction.amount,
        'deposit',
        {
          reference: transaction.reference,
          description: 'Payment deposit',
          gateway: transaction.gateway
        }
      );

      if (result.success) {
        // Update transaction status
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Cache the completed transaction
        transactionCache.setTransaction(reference, {
          status: 'completed',
          amount: transaction.amount,
          userId: transaction.userId,
          completedAt: transaction.completedAt
        });

        console.log(`[PAYMENT_PROCESS] ✅ Payment ${reference} processed successfully`);
      }

      return result;

    } catch (error) {
      console.error(`[WALLET_SERVICE] Error processing payment ${reference}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  static getCacheStats() {
    return {
      wallet: walletCache.getStats(),
      user: userCache.getStats(),
      transaction: transactionCache.getStats()
    };
  }

  /**
   * Clear all caches
   */
  static clearAllCaches() {
    walletCache.clear();
    userCache.clear();
    transactionCache.clear();
    console.log('[WALLET_SERVICE] All caches cleared');
  }

  /**
   * Warm up cache for active users
   * @param {Array<string>} userIds - Array of user IDs to cache
   */
  static async warmUpCache(userIds) {
    console.log(`[WALLET_SERVICE] Warming up cache for ${userIds.length} users`);
    
    const promises = userIds.map(userId => this.getWalletBalance(userId, true));
    await Promise.all(promises);
    
    console.log('[WALLET_SERVICE] Cache warm-up completed');
  }
}

module.exports = WalletService;
