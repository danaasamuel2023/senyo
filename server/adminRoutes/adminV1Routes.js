const express = require('express');
const router = express.Router();
const { User, DataPurchase, Transaction, ReferralBonus, DataInventory, AgentCatalog, ProductPricing } = require('../schema/schema');
const auth = require('../middlewareUser/middleware');
const adminAuth = require('../adminMiddleware/middleware');

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
    if (walletBalance !== undefined) userFields.walletBalance = walletBalance;
    if (referralCode) userFields.referralCode = referralCode;
    
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

module.exports = router;
