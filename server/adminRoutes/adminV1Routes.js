const express = require('express');
const router = express.Router();
const { User, DataPurchase, Transaction, ReferralBonus, DataInventory, AgentCatalog, ProductPricing } = require('../schema/schema');
const { auth, adminAuth } = require('../middleware/auth');

// Dashboard Statistics Routes
router.get('/dashboard/statistics', auth, adminAuth, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total orders
    const totalOrders = await DataPurchase.countDocuments();
    
    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await DataPurchase.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get today's revenue
    const todayRevenueData = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].totalRevenue : 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          todayOrders,
          todayRevenue
        }
      }
    });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Daily Summary Route
router.get('/dashboard/daily-summary/:date', auth, adminAuth, async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get daily orders
    const dailyOrders = await DataPurchase.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get daily revenue
    const dailyRevenueData = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const dailyRevenue = dailyRevenueData.length > 0 ? dailyRevenueData[0].totalRevenue : 0;
    
    // Get daily deposits
    const dailyDeposits = await Transaction.countDocuments({
      type: 'deposit',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get network breakdown (mock data for now)
    const networkBreakdown = [
      { network: 'MTN', orders: Math.floor(dailyOrders * 0.4), revenue: Math.floor(dailyRevenue * 0.4) },
      { network: 'Airtel', orders: Math.floor(dailyOrders * 0.3), revenue: Math.floor(dailyRevenue * 0.3) },
      { network: 'Glo', orders: Math.floor(dailyOrders * 0.2), revenue: Math.floor(dailyRevenue * 0.2) },
      { network: '9mobile', orders: Math.floor(dailyOrders * 0.1), revenue: Math.floor(dailyRevenue * 0.1) }
    ];
    
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: dailyOrders,
          totalRevenue: dailyRevenue,
          totalDeposits: dailyDeposits
        },
        networkBreakdown
      }
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary'
    });
  }
});

// Batch Daily Summary Route - Get multiple days in one request
router.get('/dashboard/daily-summary-batch', auth, adminAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const results = [];
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Get daily orders
      const dailyOrders = await DataPurchase.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Get daily revenue
      const dailyRevenueData = await DataPurchase.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' }
          }
        }
      ]);
      
      const dailyRevenue = dailyRevenueData.length > 0 ? dailyRevenueData[0].totalRevenue : 0;
      
      results.push({
        date: dateStr,
        summary: {
          totalOrders: dailyOrders,
          totalRevenue: dailyRevenue,
          totalDeposits: 0 // Skip deposits for batch to reduce load
        }
      });
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch daily summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch batch daily summary'
    });
  }
});

// Users Management Routes
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const searchQuery = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { referralCode: { $regex: search, $options: 'i' } }
          ] 
        } 
      : {};
    
    const users = await User.find(searchQuery)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(searchQuery);
    
    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalUsers: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID
router.get('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update user details
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phoneNumber, role, walletBalance, referralCode } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (phoneNumber) userFields.phoneNumber = phoneNumber;
    if (role) userFields.role = role;
    if (referralCode) userFields.referralCode = referralCode;
    
    // Handle wallet balance update separately to ensure sync
    if (walletBalance !== undefined) {
      const WalletService = require('../services/walletService');
      const currentUser = await User.findById(req.params.id);
      
      if (!currentUser) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      const balanceDifference = walletBalance - currentUser.walletBalance;
      
      if (balanceDifference !== 0) {
        const result = await WalletService.updateWalletBalance(
          req.params.id,
          balanceDifference,
          'admin-adjustment',
          {
            description: 'Admin wallet balance adjustment',
            adminId: req.user._id,
            adminName: req.user.name,
            oldBalance: currentUser.walletBalance,
            newBalance: walletBalance
          }
        );
        
        if (!result.success) {
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to update wallet balance',
            error: result.error 
          });
        }
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Add money to user wallet
router.put('/users/:id/add-money', auth, adminAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const userId = req.params.id;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const amountToAdd = parseFloat(amount);
    const oldBalance = user.walletBalance || 0;
    
    // Use WalletService to ensure both User.walletBalance and Wallet.balance are updated
    const WalletService = require('../services/walletService');
    const result = await WalletService.updateWalletBalance(
      userId,
      amountToAdd,
      'admin-deposit',
      {
        description: `Admin credit: ${reason || 'Manual credit by admin'}`,
        adminId: req.user._id,
        adminName: req.user.name,
        reason: reason || 'Manual credit by admin',
        oldBalance: oldBalance
      }
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add money to user wallet',
        error: result.error 
      });
    }
    
    res.json({
      success: true,
      message: `Successfully added GHS ${amountToAdd.toFixed(2)} to user wallet`,
      data: {
        userId: userId,
        userName: user.name,
        oldBalance: oldBalance,
        newBalance: result.newBalance,
        amountAdded: amountToAdd
      }
    });
  } catch (err) {
    console.error('Add money error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add money to user wallet' 
    });
  }
});

// Deduct money from user wallet
router.put('/users/:id/deduct-money', auth, adminAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const userId = req.params.id;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reason is required for money deduction.' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const amountToDeduct = parseFloat(amount);
    const currentBalance = user.walletBalance || 0;
    
    if (amountToDeduct > currentBalance) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. User has GHS ${currentBalance.toFixed(2)} but trying to deduct GHS ${amountToDeduct.toFixed(2)}.` 
      });
    }
    
    // Use WalletService to ensure both User.walletBalance and Wallet.balance are updated
    const WalletService = require('../services/walletService');
    const result = await WalletService.updateWalletBalance(
      userId,
      -amountToDeduct, // Negative amount for deduction
      'admin-debit',
      {
        description: `Admin debit: ${reason}`,
        adminId: req.user._id,
        adminName: req.user.name,
        reason: reason,
        oldBalance: currentBalance
      }
    );
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to deduct money from user wallet',
        error: result.error 
      });
    }
    
    // Create transaction record
    const Transaction = require('../schema/schema').Transaction;
    const transaction = new Transaction({
      userId: userId,
      type: 'admin_debit',
      amount: -amountToDeduct, // Negative amount for deduction
      status: 'completed',
      description: `Admin debit: ${reason}`,
      metadata: {
        adminId: req.user._id,
        adminName: req.user.name,
        reason: reason,
        oldBalance: currentBalance,
        newBalance: result.newBalance
      }
    });
    await transaction.save();
    
    res.json({
      success: true,
      message: `Successfully deducted GHS ${amountToDeduct.toFixed(2)} from user wallet`,
      data: {
        userId: userId,
        userName: user.name,
        oldBalance: currentBalance,
        newBalance: result.newBalance,
        amountDeducted: amountToDeduct,
        transactionId: transaction._id
      }
    });
  } catch (err) {
    console.error('Deduct money error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to deduct money from user wallet' 
    });
  }
});

// Reset user password
router.put('/users/:id/reset-password', auth, adminAuth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Hash the new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    user.password = hashedPassword;
    user.lastPasswordReset = new Date();
    await user.save();
    
    // Log the password reset action
    console.log(`[ADMIN] Password reset for user ${user.name} (${user.email}) by admin ${req.user.name} (${req.user._id})`);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        resetBy: req.user.name,
        resetAt: new Date()
      }
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset user password' 
    });
  }
});

// Toggle user status (enable/disable)
router.put('/users/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const currentStatus = user.isDisabled;
    const newStatus = !currentStatus;
    
    // Update user status
    user.isDisabled = newStatus;
    if (newStatus) {
      user.disableReason = reason || 'Disabled by admin';
      user.disabledAt = new Date();
    } else {
      user.disableReason = undefined;
      user.disabledAt = undefined;
    }
    await user.save();
    
    const action = newStatus ? 'disabled' : 'enabled';
    console.log(`[ADMIN] User ${user.name} (${user.email}) ${action} by admin ${req.user.name} (${req.user._id})`);
    
    res.json({
      success: true,
      message: `User ${action} successfully`,
      data: {
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        newStatus: newStatus ? 'disabled' : 'active',
        reason: reason || null,
        actionBy: req.user.name,
        actionAt: new Date()
      }
    });
  } catch (err) {
    console.error('Toggle user status error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent deletion of admin users
    if (user.role === 'admin' || user.role === 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete admin users' 
      });
    }
    
    // Delete user and related data
    await User.findByIdAndDelete(userId);
    
    // Also delete related transactions and wallet data
    const Transaction = require('../schema/schema').Transaction;
    const Wallet = require('../schema/schema').Wallet;
    
    await Transaction.deleteMany({ userId: userId });
    await Wallet.deleteMany({ userId: userId });
    
    console.log(`[ADMIN] User ${user.name} (${user.email}) deleted by admin ${req.user.name} (${req.user._id})`);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: userId,
        deletedUserName: user.name,
        deletedUserEmail: user.email,
        deletedBy: req.user.name,
        deletedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

// Orders Management Routes
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      status = '',
      network = '',
      startDate = '',
      endDate = '',
      phoneNumber = ''
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (network) filter.network = network;
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber };
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include end date until midnight
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    const orders = await DataPurchase.find(filter)
      .populate('userId', 'name email phoneNumber')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await DataPurchase.countDocuments(filter);
    
    // Calculate total revenue from filtered orders
    const revenue = await DataPurchase.aggregate([
      { $match: filter },
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalOrders: total,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Transactions Management Routes
router.get('/transactions', auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      status = '',
      type = '',
      startDate = '',
      endDate = '',
      userId = ''
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email phoneNumber')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Transaction.countDocuments(filter);
    
    // Calculate total amount from filtered transactions
    const totalAmount = await Transaction.aggregate([
      { $match: filter },
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalTransactions: total,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get transaction by ID
router.get('/transactions/:id', auth, adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Verify Paystack transaction
router.post('/transactions/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('userId', 'name email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found' 
      });
    }
    
    // Only verify Paystack transactions
    if (transaction.gateway !== 'paystack') {
      return res.status(400).json({ 
        success: false,
        error: 'This transaction was not processed through Paystack',
        transaction
      });
    }
    
    // Verify with Paystack API
    try {
      const axios = require('axios');
      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      
      const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${transaction.reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      );
      
      if (paystackResponse.data.status) {
        // Update transaction status
        transaction.status = 'completed';
        transaction.metadata = {
          ...transaction.metadata,
          paystackVerification: paystackResponse.data.data,
          verifiedAt: new Date()
        };
        await transaction.save();
        
        res.json({
          success: true,
          verified: true,
          message: 'Transaction verified successfully',
          transaction,
          paystackData: paystackResponse.data.data
        });
      } else {
        res.json({
          success: false,
          verified: false,
          message: 'Transaction verification failed',
          paystackData: paystackResponse.data
        });
      }
    } catch (paystackError) {
      console.error('Paystack verification error:', paystackError.message);
      res.status(500).json({
        success: false,
        error: 'Paystack verification failed',
        details: paystackError.message
      });
    }
  } catch (err) {
    console.error('Transaction verification error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
});

// Update transaction status
router.put('/transactions/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, completed, or failed'
      });
    }
    
    const transaction = await Transaction.findById(id)
      .populate('userId', 'name email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Update transaction status
    const oldStatus = transaction.status;
    transaction.status = status;
    transaction.metadata = {
      ...transaction.metadata,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: req.user._id,
      previousStatus: oldStatus
    };
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction,
      oldStatus,
      newStatus: status
    });
  } catch (err) {
    console.error('Transaction status update error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error during status update'
    });
  }
});

// Get user orders
router.get('/user-orders/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    const orders = await DataPurchase.find({ userId })
      .populate('userId', 'name email phoneNumber')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await DataPurchase.countDocuments({ userId });
    
    res.json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
