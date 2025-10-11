const express = require('express');
const router = express.Router();
const { Wallet, Referral, PromoCode, User } = require('../schema/schema.js');
const verifyAuth = require('../middlewareUser/middleware.js');
const { sendTransactionReceipt } = require('../services/emailService.js');
const WalletService = require('../services/walletService');

// Enhanced logging utility
const logWalletActivity = (userId, action, details = {}) => {
  console.log(`[WALLET_${action.toUpperCase()}]`, {
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Get comprehensive wallet information
router.get('/balance', verifyAuth, async (req, res) => {
  try {
    logWalletActivity(req.user._id, 'BALANCE_REQUEST');
    
    let wallet = await Wallet.findOne({ userId: req.user._id });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      logWalletActivity(req.user._id, 'WALLET_CREATED');
      wallet = new Wallet({ 
        userId: req.user._id,
        balance: 0,
        currency: 'GHS',
        frozen: false,
        transactions: []
      });
      await wallet.save();
    }

    // Get user information for enhanced response
    const user = await User.findById(req.user._id).select('firstName lastName email phoneNumber');
    
    // Get recent transactions (last 15 for better overview)
    const recentTransactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 15);

    // Calculate wallet statistics
    const totalDeposits = wallet.transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalSpent = wallet.transactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const walletStats = {
      totalDeposits,
      totalSpent,
      transactionCount: wallet.transactions.length,
      lastActivity: wallet.lastTransaction,
      isActive: wallet.lastTransaction && 
        (new Date() - wallet.lastTransaction) < (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    logWalletActivity(req.user._id, 'BALANCE_RETRIEVED', { 
      balance: wallet.balance,
      transactionCount: wallet.transactions.length 
    });

    res.json({
      success: true,
      balance: wallet.balance,
      currency: wallet.currency,
      frozen: wallet.frozen,
      freezeReason: wallet.freezeReason,
      recentTransactions,
      user: user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber
      } : null,
      stats: walletStats,
      limits: {
        dailyLimit: wallet.dailyLimit || 10000,
        monthlyLimit: wallet.monthlyLimit || 50000,
        maxBalance: wallet.maxBalance || 100000
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'BALANCE_ERROR', { error: error.message });
    console.error('Error fetching wallet:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch wallet balance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get cache statistics (admin only)
router.get('/cache/stats', verifyAuth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = WalletService.getCacheStats();
    res.json({
      success: true,
      cacheStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache statistics'
    });
  }
});

// Clear all caches (admin only)
router.post('/cache/clear', verifyAuth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    WalletService.clearAllCaches();
    res.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing caches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear caches'
    });
  }
});

// Get comprehensive transaction history with advanced filtering
router.get('/transactions', verifyAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    logWalletActivity(req.user._id, 'TRANSACTIONS_REQUEST', { 
      page, limit, type, status, search 
    });
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.json({
        success: true,
        transactions: [],
        total: 0,
        page: 1,
        pages: 0,
        summary: {
          totalDeposits: 0,
          totalSpent: 0,
          totalTransactions: 0
        }
      });
    }

    let transactions = [...wallet.transactions];
    
    // Apply filters
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(t => t.createdAt >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      transactions = transactions.filter(t => t.createdAt <= end);
    }
    
    if (minAmount) {
      transactions = transactions.filter(t => Math.abs(t.amount) >= parseFloat(minAmount));
    }
    
    if (maxAmount) {
      transactions = transactions.filter(t => Math.abs(t.amount) <= parseFloat(maxAmount));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      transactions = transactions.filter(t => 
        t.description?.toLowerCase().includes(searchLower) ||
        t.reference?.toLowerCase().includes(searchLower) ||
        t.type?.toLowerCase().includes(searchLower)
      );
    }

    // Sort transactions
    transactions.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate summary statistics
    const summary = {
      totalDeposits: transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalSpent: transactions
        .filter(t => t.type === 'purchase' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      failedTransactions: transactions.filter(t => t.status === 'failed').length
    };

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    logWalletActivity(req.user._id, 'TRANSACTIONS_RETRIEVED', { 
      total: transactions.length,
      returned: paginatedTransactions.length 
    });

    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: transactions.length,
      page: parseInt(page),
      pages: Math.ceil(transactions.length / limit),
      summary,
      filters: {
        type, status, startDate, endDate, minAmount, maxAmount, search
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'TRANSACTIONS_ERROR', { error: error.message });
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced fund addition with validation and limits
router.post('/add-funds', verifyAuth, async (req, res) => {
  try {
    const { amount, reference, description, source, metadata } = req.body;

    logWalletActivity(req.user._id, 'ADD_FUNDS_REQUEST', { 
      amount, reference, source 
    });

    // Enhanced validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }

    if (amount > 100000) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount exceeds maximum limit of GHS 100,000 per transaction.' 
      });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ 
        userId: req.user._id,
        balance: 0,
        currency: 'GHS',
        frozen: false,
        transactions: []
      });
    }

    // Check if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ 
        success: false,
        message: 'Wallet is frozen',
        reason: wallet.freezeReason 
      });
    }

    // Check daily/monthly limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayDeposits = wallet.transactions
      .filter(t => 
        t.type === 'deposit' && 
        t.status === 'completed' && 
        t.createdAt >= today
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyDeposits = wallet.transactions
      .filter(t => 
        t.type === 'deposit' && 
        t.status === 'completed' && 
        t.createdAt >= monthStart
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (todayDeposits + amount > (wallet.dailyLimit || 10000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Daily deposit limit exceeded',
        limit: wallet.dailyLimit || 10000,
        used: todayDeposits
      });
    }

    if (monthlyDeposits + amount > (wallet.monthlyLimit || 50000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly deposit limit exceeded',
        limit: wallet.monthlyLimit || 50000,
        used: monthlyDeposits
      });
    }

    const balanceBefore = wallet.balance;
    wallet.balance += parseFloat(amount);
    const balanceAfter = wallet.balance;

    // Check maximum balance limit
    if (wallet.balance > (wallet.maxBalance || 100000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Maximum wallet balance exceeded',
        limit: wallet.maxBalance || 100000
      });
    }

    const transaction = {
      type: 'deposit',
      amount: parseFloat(amount),
      balanceBefore,
      balanceAfter,
      description: description || 'Wallet top-up',
      reference: reference || `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      source: source || 'manual',
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      createdAt: new Date()
    };

    wallet.transactions.push(transaction);
    wallet.lastTransaction = new Date();
    await wallet.save();

    // Send email notification if user has email
    try {
      const user = await User.findById(req.user._id).select('email firstName lastName');
      if (user && user.email) {
        await sendTransactionReceipt({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          transaction,
          type: 'deposit'
        });
      }
    } catch (emailError) {
      console.error('Failed to send deposit notification:', emailError);
      // Don't fail the transaction if email fails
    }

    logWalletActivity(req.user._id, 'FUNDS_ADDED', { 
      amount, 
      balanceBefore, 
      balanceAfter,
      reference: transaction.reference
    });

    res.json({
      success: true,
      message: 'Funds added successfully',
      balance: wallet.balance,
      transaction,
      limits: {
        dailyRemaining: (wallet.dailyLimit || 10000) - todayDeposits - amount,
        monthlyRemaining: (wallet.monthlyLimit || 50000) - monthlyDeposits - amount
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'ADD_FUNDS_ERROR', { error: error.message });
    console.error('Error adding funds:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add funds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced fund deduction with comprehensive validation
router.post('/deduct', verifyAuth, async (req, res) => {
  try {
    const { amount, reference, description, metadata, orderId, productDetails } = req.body;

    logWalletActivity(req.user._id, 'DEDUCT_REQUEST', { 
      amount, reference, orderId 
    });

    // Enhanced validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ 
        success: false,
        message: 'Wallet not found. Please contact support.' 
      });
    }

    // Check if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ 
        success: false,
        message: 'Wallet is frozen',
        reason: wallet.freezeReason 
      });
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient balance',
        currentBalance: wallet.balance,
        requiredAmount: amount,
        shortfall: amount - wallet.balance
      });
    }

    // Check daily spending limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySpending = wallet.transactions
      .filter(t => 
        t.type === 'purchase' && 
        t.status === 'completed' && 
        t.createdAt >= today
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (todaySpending + amount > (wallet.dailySpendingLimit || 5000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Daily spending limit exceeded',
        limit: wallet.dailySpendingLimit || 5000,
        used: todaySpending
      });
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= parseFloat(amount);
    const balanceAfter = wallet.balance;

    const transaction = {
      type: 'purchase',
      amount: -parseFloat(amount),
      balanceBefore,
      balanceAfter,
      description: description || 'Purchase',
      reference: reference || `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
      metadata: {
        ...metadata,
        orderId,
        productDetails,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      createdAt: new Date()
    };

    wallet.transactions.push(transaction);
    wallet.lastTransaction = new Date();
    await wallet.save();

    // Send email notification if user has email
    try {
      const user = await User.findById(req.user._id).select('email firstName lastName');
      if (user && user.email) {
        await sendTransactionReceipt({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          transaction,
          type: 'purchase',
          productDetails
        });
      }
    } catch (emailError) {
      console.error('Failed to send purchase notification:', emailError);
      // Don't fail the transaction if email fails
    }

    logWalletActivity(req.user._id, 'FUNDS_DEDUCTED', { 
      amount, 
      balanceBefore, 
      balanceAfter,
      reference: transaction.reference,
      orderId
    });

    res.json({
      success: true,
      message: 'Payment successful',
      balance: wallet.balance,
      transaction,
      limits: {
        dailySpendingRemaining: (wallet.dailySpendingLimit || 5000) - todaySpending - amount
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'DEDUCT_ERROR', { error: error.message });
    console.error('Error deducting funds:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced promo code application with better validation
router.post('/apply-promo', verifyAuth, async (req, res) => {
  try {
    const { code, orderAmount, orderItems } = req.body;

    logWalletActivity(req.user._id, 'PROMO_APPLY_REQUEST', { 
      code, orderAmount 
    });

    if (!code || !orderAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Promo code and order amount are required' 
      });
    }

    if (orderAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order amount' 
      });
    }

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!promoCode) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid or expired promo code',
        suggestions: await getSimilarPromoCodes(code)
      });
    }

    // Check usage limits
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return res.status(400).json({ 
        success: false,
        message: 'Promo code usage limit reached',
        limit: promoCode.usageLimit,
        used: promoCode.usageCount
      });
    }

    // Check per-user limit
    const userUsageCount = promoCode.usedBy.filter(
      u => u.userId.toString() === req.user._id.toString()
    ).length;

    if (userUsageCount >= promoCode.perUserLimit) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already used this promo code',
        limit: promoCode.perUserLimit,
        used: userUsageCount
      });
    }

    // Check minimum purchase
    if (orderAmount < promoCode.minPurchase) {
      return res.status(400).json({ 
        success: false,
        message: `Minimum purchase of GHS ${promoCode.minPurchase} required`,
        required: promoCode.minPurchase,
        current: orderAmount,
        shortfall: promoCode.minPurchase - orderAmount
      });
    }

    // Check if promo applies to specific products/networks
    if (promoCode.applicableNetworks && orderItems) {
      const orderNetworks = orderItems.map(item => item.network);
      const hasApplicableNetwork = orderNetworks.some(network => 
        promoCode.applicableNetworks.includes(network)
      );
      
      if (!hasApplicableNetwork) {
        return res.status(400).json({ 
          success: false,
          message: 'Promo code not applicable to selected products',
          applicableNetworks: promoCode.applicableNetworks
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'percentage') {
      discountAmount = (orderAmount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);
    const finalAmount = Math.max(0, orderAmount - discountAmount);

    logWalletActivity(req.user._id, 'PROMO_APPLIED', { 
      code, 
      discountAmount, 
      finalAmount 
    });

    res.json({
      success: true,
      discountAmount,
      finalAmount,
      originalAmount: orderAmount,
      promoCode: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        validUntil: promoCode.validUntil
      },
      usage: {
        userLimit: promoCode.perUserLimit,
        userUsed: userUsageCount,
        userRemaining: promoCode.perUserLimit - userUsageCount,
        globalLimit: promoCode.usageLimit,
        globalUsed: promoCode.usageCount,
        globalRemaining: promoCode.usageLimit ? promoCode.usageLimit - promoCode.usageCount : 'Unlimited'
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'PROMO_APPLY_ERROR', { error: error.message });
    console.error('Error applying promo code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to apply promo code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Enhanced promo code confirmation with detailed tracking
router.post('/confirm-promo', verifyAuth, async (req, res) => {
  try {
    const { code, orderAmount, discountApplied, orderId, orderDetails } = req.body;

    logWalletActivity(req.user._id, 'PROMO_CONFIRM_REQUEST', { 
      code, orderAmount, discountApplied, orderId 
    });

    const promoCode = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (!promoCode) {
      return res.status(404).json({ 
        success: false,
        message: 'Promo code not found' 
      });
    }

    // Record usage
    promoCode.usageCount += 1;
    promoCode.usedBy.push({
      userId: req.user._id,
      usedAt: new Date(),
      orderAmount,
      discountApplied,
      orderId,
      orderDetails,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Update last used date
    promoCode.lastUsed = new Date();
    
    await promoCode.save();

    logWalletActivity(req.user._id, 'PROMO_CONFIRMED', { 
      code, 
      discountApplied,
      orderId 
    });

    res.json({ 
      success: true, 
      message: 'Promo code usage recorded successfully',
      usage: {
        totalUses: promoCode.usageCount,
        userUses: promoCode.usedBy.filter(u => u.userId.toString() === req.user._id.toString()).length
      }
    });
  } catch (error) {
    logWalletActivity(req.user._id, 'PROMO_CONFIRM_ERROR', { error: error.message });
    console.error('Error confirming promo code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to confirm promo code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// New endpoint: Get wallet limits and settings
router.get('/limits', verifyAuth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.json({
        success: true,
        limits: {
          dailyLimit: 10000,
          monthlyLimit: 50000,
          maxBalance: 100000,
          dailySpendingLimit: 5000
        },
        usage: {
          dailyDeposits: 0,
          monthlyDeposits: 0,
          dailySpending: 0,
          currentBalance: 0
        }
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const usage = {
      dailyDeposits: wallet.transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed' && t.createdAt >= today)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      monthlyDeposits: wallet.transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed' && t.createdAt >= monthStart)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      dailySpending: wallet.transactions
        .filter(t => t.type === 'purchase' && t.status === 'completed' && t.createdAt >= today)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      currentBalance: wallet.balance
    };

    res.json({
      success: true,
      limits: {
        dailyLimit: wallet.dailyLimit || 10000,
        monthlyLimit: wallet.monthlyLimit || 50000,
        maxBalance: wallet.maxBalance || 100000,
        dailySpendingLimit: wallet.dailySpendingLimit || 5000
      },
      usage,
      remaining: {
        dailyDeposits: (wallet.dailyLimit || 10000) - usage.dailyDeposits,
        monthlyDeposits: (wallet.monthlyLimit || 50000) - usage.monthlyDeposits,
        dailySpending: (wallet.dailySpendingLimit || 5000) - usage.dailySpending,
        maxBalance: (wallet.maxBalance || 100000) - usage.currentBalance
      }
    });
  } catch (error) {
    console.error('Error fetching wallet limits:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch wallet limits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// New endpoint: Get wallet statistics and analytics
router.get('/analytics', verifyAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.json({
        success: true,
        analytics: {
          totalTransactions: 0,
          totalDeposits: 0,
          totalSpent: 0,
          averageTransaction: 0,
          transactionTrend: [],
          topCategories: []
        }
      });
    }

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const recentTransactions = wallet.transactions.filter(t => t.createdAt >= startDate);
    
    const analytics = {
      totalTransactions: recentTransactions.length,
      totalDeposits: recentTransactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalSpent: recentTransactions
        .filter(t => t.type === 'purchase' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      averageTransaction: recentTransactions.length > 0 
        ? recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentTransactions.length 
        : 0,
      transactionTrend: generateTransactionTrend(recentTransactions, period),
      topCategories: generateTopCategories(recentTransactions)
    };

    res.json({
      success: true,
      analytics,
      period
    });
  } catch (error) {
    console.error('Error fetching wallet analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch wallet analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get similar promo codes
async function getSimilarPromoCodes(inputCode) {
  try {
    const codes = await PromoCode.find({ 
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).select('code description').limit(5);
    
    return codes.map(code => ({
      code: code.code,
      description: code.description
    }));
  } catch (error) {
    console.error('Error fetching similar promo codes:', error);
    return [];
  }
}

// Helper function to generate transaction trend data
function generateTransactionTrend(transactions, period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const trend = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayTransactions = transactions.filter(t => 
      t.createdAt >= date && t.createdAt < nextDate
    );
    
    const deposits = dayTransactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const purchases = dayTransactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    trend.push({
      date: date.toISOString().split('T')[0],
      deposits,
      purchases,
      total: deposits + purchases,
      count: dayTransactions.length
    });
  }
  
  return trend;
}

// Helper function to generate top categories
function generateTopCategories(transactions) {
  const categories = {};
  
  transactions.forEach(t => {
    if (t.metadata?.productDetails?.network) {
      const network = t.metadata.productDetails.network;
      if (!categories[network]) {
        categories[network] = { count: 0, amount: 0 };
      }
      categories[network].count += 1;
      categories[network].amount += Math.abs(t.amount);
    }
  });
  
  return Object.entries(categories)
    .map(([network, data]) => ({
      network,
      count: data.count,
      amount: data.amount
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

// Deposit funds to wallet with Paystack integration
router.post('/deposit', verifyAuth, async (req, res) => {
  try {
    const { amount, email, phoneNumber, metadata = {} } = req.body;
    const userId = req.user._id;

    logWalletActivity(userId, 'DEPOSIT_REQUEST', { amount, email });

    // Enhanced validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }

    if (amount > 100000) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount exceeds maximum limit of GHS 100,000 per transaction.' 
      });
    }

    if (amount < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimum deposit amount is GHS 10.' 
      });
    }

    // Get user information
    const user = await User.findById(userId).select('email firstName lastName phoneNumber');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user's account is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled',
        reason: user.disableReason || 'Account has been disabled'
      });
    }

    // Check if user's account is approved
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Account approval required',
        reason: 'Your account requires approval before you can make deposits'
      });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Account not approved',
        reason: user.rejectionReason || 'Your account has been rejected'
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ 
        userId,
        balance: 0,
        currency: 'GHS',
        frozen: false,
        transactions: []
      });
      await wallet.save();
    }

    // Check if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ 
        success: false,
        message: 'Wallet is frozen',
        reason: wallet.freezeReason 
      });
    }

    // Check daily/monthly limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayDeposits = wallet.transactions
      .filter(t => 
        t.type === 'deposit' && 
        t.status === 'completed' && 
        t.createdAt >= today
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyDeposits = wallet.transactions
      .filter(t => 
        t.type === 'deposit' && 
        t.status === 'completed' && 
        t.createdAt >= monthStart
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (todayDeposits + amount > (wallet.dailyLimit || 10000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Daily deposit limit exceeded',
        limit: wallet.dailyLimit || 10000,
        used: todayDeposits,
        remaining: (wallet.dailyLimit || 10000) - todayDeposits
      });
    }

    if (monthlyDeposits + amount > (wallet.monthlyLimit || 50000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Monthly deposit limit exceeded',
        limit: wallet.monthlyLimit || 50000,
        used: monthlyDeposits,
        remaining: (wallet.monthlyLimit || 50000) - monthlyDeposits
      });
    }

    // Check maximum balance limit
    if (wallet.balance + amount > (wallet.maxBalance || 100000)) {
      return res.status(400).json({ 
        success: false,
        message: 'Maximum wallet balance would be exceeded',
        currentBalance: wallet.balance,
        depositAmount: amount,
        wouldBeBalance: wallet.balance + amount,
        limit: wallet.maxBalance || 100000
      });
    }

    // Generate unique reference for Paystack
    const reference = `DEPOSIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create pending transaction record
    const transaction = {
      type: 'deposit',
      amount: parseFloat(amount),
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance, // Will be updated after successful payment
      description: 'Wallet deposit via Paystack',
      reference,
      status: 'pending',
      source: 'paystack',
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        depositType: 'paystack'
      },
      createdAt: new Date()
    };

    wallet.transactions.push(transaction);
    await wallet.save();

    // Initialize Paystack payment
    const paystackData = {
      email: email || user.email,
      amount: Math.round(parseFloat(amount) * 100), // Convert to pesewas
      currency: 'GHS',
      reference,
      callback_url: `${process.env.FRONTEND_URL || 'https://www.unlimiteddatagh.com'}/payment/callback?reference=${reference}`,
      metadata: {
        userId: userId,
        depositAmount: amount,
        customerName: `${user.firstName} ${user.lastName}`,
        phoneNumber: phoneNumber || user.phoneNumber,
        ...metadata
      },
      channels: ['card', 'bank', 'mobile_money']
    };

    // Add phone number for mobile money if provided
    if (phoneNumber) {
      paystackData.metadata.phone = phoneNumber;
    }

    try {
      const axios = require('axios');
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b';
      const PAYSTACK_BASE_URL = 'https://api.paystack.co';

      const paystackResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        paystackData,
        {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paystackResponse.data.status) {
        logWalletActivity(userId, 'DEPOSIT_INITIATED', { 
          amount, 
          reference,
          paystackUrl: paystackResponse.data.data.authorization_url
        });

        res.json({
          success: true,
          message: 'Deposit initiated successfully',
          data: {
            reference,
            amount: parseFloat(amount),
            paystackUrl: paystackResponse.data.data.authorization_url,
            accessCode: paystackResponse.data.data.access_code
          },
          limits: {
            dailyRemaining: (wallet.dailyLimit || 10000) - todayDeposits,
            monthlyRemaining: (wallet.monthlyLimit || 50000) - monthlyDeposits,
            maxBalanceRemaining: (wallet.maxBalance || 100000) - wallet.balance
          }
        });
      } else {
        throw new Error('Paystack initialization failed');
      }
    } catch (paystackError) {
      console.error('Paystack initialization error:', paystackError);
      
      // Update transaction status to failed
      const transactionIndex = wallet.transactions.findIndex(t => t.reference === reference);
      if (transactionIndex !== -1) {
        wallet.transactions[transactionIndex].status = 'failed';
        wallet.transactions[transactionIndex].metadata.error = paystackError.message;
        await wallet.save();
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to initialize deposit. Please try again.',
        error: process.env.NODE_ENV === 'development' ? paystackError.message : undefined
      });
    }

  } catch (error) {
    logWalletActivity(req.user._id, 'DEPOSIT_ERROR', { error: error.message });
    console.error('Error processing deposit:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process deposit request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify deposit payment status
router.get('/deposit/verify/:reference', verifyAuth, async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user._id;

    logWalletActivity(userId, 'DEPOSIT_VERIFY_REQUEST', { reference });

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Reference is required'
      });
    }

    // Find the transaction in wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const transaction = wallet.transactions.find(t => t.reference === reference);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If already completed, return success
    if (transaction.status === 'completed') {
        return res.json({
          success: true,
          message: 'Deposit already completed',
        data: {
          reference,
          amount: transaction.amount,
          status: 'completed',
          completedAt: transaction.completedAt
        }
      });
    }

    // If failed, return failure
    if (transaction.status === 'failed') {
        return res.json({
          success: false,
          message: 'Deposit failed',
        data: {
          reference,
          amount: transaction.amount,
          status: 'failed',
          error: transaction.metadata?.error
        }
      });
    }

    // If still pending, verify with Paystack
    if (transaction.status === 'pending') {
      try {
        const axios = require('axios');
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b';
        const PAYSTACK_BASE_URL = 'https://api.paystack.co';

        const paystackResponse = await axios.get(
          `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
          {
            headers: {
              'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const { data } = paystackResponse.data;

        if (data.status === 'success') {
          // Process successful payment using WalletService
          const result = await WalletService.updateWalletBalance(
            userId,
            transaction.amount,
            'deposit',
            {
              reference: transaction.reference,
              description: 'Wallet deposit via Paystack',
              gateway: 'paystack',
              paystackReference: data.reference
            }
          );

          if (result.success) {
            // Update transaction status
            const transactionIndex = wallet.transactions.findIndex(t => t.reference === reference);
            if (transactionIndex !== -1) {
              wallet.transactions[transactionIndex].status = 'completed';
              wallet.transactions[transactionIndex].completedAt = new Date();
              wallet.transactions[transactionIndex].balanceAfter = result.newBalance;
              await wallet.save();
            }

            logWalletActivity(userId, 'DEPOSIT_COMPLETED', { 
              reference, 
              amount: transaction.amount,
              newBalance: result.newBalance
            });

            return res.json({
              success: true,
              message: 'Deposit completed successfully',
              data: {
                reference,
                amount: transaction.amount,
                status: 'completed',
                newBalance: result.newBalance,
                completedAt: new Date()
              }
            });
          } else {
            return res.status(500).json({
              success: false,
              message: 'Failed to update wallet balance',
              error: result.error
            });
          }
        } else if (data.status === 'failed') {
          // Update transaction status to failed
          const transactionIndex = wallet.transactions.findIndex(t => t.reference === reference);
          if (transactionIndex !== -1) {
            wallet.transactions[transactionIndex].status = 'failed';
            wallet.transactions[transactionIndex].metadata.error = 'Payment failed on Paystack';
            await wallet.save();
          }

          return res.json({
            success: false,
            message: 'Payment failed',
            data: {
              reference,
              amount: transaction.amount,
              status: 'failed'
            }
          });
        } else {
          // Still pending
          return res.json({
            success: false,
            message: 'Payment still pending',
            data: {
              reference,
              amount: transaction.amount,
              status: 'pending'
            }
          });
        }
      } catch (paystackError) {
        console.error('Paystack verification error:', paystackError);
        return res.status(500).json({
          success: false,
          message: 'Failed to verify payment with Paystack',
          error: process.env.NODE_ENV === 'development' ? paystackError.message : undefined
        });
      }
    }

  } catch (error) {
    logWalletActivity(req.user._id, 'DEPOSIT_VERIFY_ERROR', { error: error.message });
    console.error('Error verifying deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify deposit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;