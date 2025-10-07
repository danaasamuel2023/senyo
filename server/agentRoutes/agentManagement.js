const express = require('express');
const jwt = require('jsonwebtoken');
const { User, AgentCatalog, OrderReport } = require('../schema/schema');
const router = express.Router();

// Middleware to verify agent authentication
const verifyAgentAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

  const jwtSecret = process.env.JWT_SECRET || 'DatAmArt';
  const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    if (user.role !== 'agent' || user.agentMetadata?.agentStatus !== 'active') {
      return res.status(403).json({ msg: 'Agent access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Generate unique agent code
const generateAgentCode = () => {
  return 'AGT' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Customize agent store
router.put('/customize-store', verifyAgentAuth, async (req, res) => {
  try {
    const {
      customSlug,
      storeName,
      storeDescription,
      brandColor,
      logoUrl,
      bannerUrl,
      welcomeMessage,
      showAgentInfo,
      showContactButton,
      socialLinks
    } = req.body;

    // Validate custom slug if provided
    if (customSlug) {
      const slugRegex = /^[a-zA-Z0-9_-]+$/;
      if (!slugRegex.test(customSlug)) {
        return res.status(400).json({ msg: 'Custom slug can only contain letters, numbers, hyphens, and underscores' });
      }

      // Check if slug is already taken
      const existingUser = await User.findOne({
        'agentMetadata.customSlug': customSlug,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ msg: 'Custom slug is already taken' });
      }
    }

    // Generate agent code if not exists
    let agentCode = req.user.agentMetadata?.agentCode;
    if (!agentCode) {
      agentCode = generateAgentCode();
    }

    // Update user with store customization
    const updateData = {
      'agentMetadata.customSlug': customSlug || agentCode,
      'agentMetadata.storeCustomization': {
        storeName,
        storeDescription,
        brandColor: brandColor || '#FFCC08',
        logoUrl,
        bannerUrl,
        welcomeMessage,
        showAgentInfo: showAgentInfo !== false,
        showContactButton: showContactButton !== false,
        socialLinks: socialLinks || {}
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      msg: 'Store customization saved successfully',
      agentCode,
      customSlug: customSlug || agentCode,
      customization: updatedUser.agentMetadata.storeCustomization
    });

  } catch (error) {
    console.error('Store customization error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get agent catalog
router.get('/catalog', verifyAgentAuth, async (req, res) => {
  try {
    const catalog = await AgentCatalog.findOne({ agentId: req.user._id });
    
    if (!catalog) {
      // Create default catalog if doesn't exist with updated MTN agent prices
      const defaultCatalog = new AgentCatalog({
        agentId: req.user._id,
        items: [
          {
            network: 'MTN',
            capacity: 1,
            price: 4.2,
            enabled: true,
            description: 'MTN 1GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 2,
            price: 8.4,
            enabled: true,
            description: 'MTN 2GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 3,
            price: 12.5,
            enabled: true,
            description: 'MTN 3GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 4,
            price: 16.5,
            enabled: true,
            description: 'MTN 4GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 5,
            price: 20.5,
            enabled: true,
            description: 'MTN 5GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 6,
            price: 24.6,
            enabled: true,
            description: 'MTN 6GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 8,
            price: 32.8,
            enabled: true,
            description: 'MTN 8GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 10,
            price: 41.0,
            enabled: true,
            description: 'MTN 10GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 15,
            price: 61.5,
            enabled: true,
            description: 'MTN 15GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 20,
            price: 82.0,
            enabled: true,
            description: 'MTN 20GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 25,
            price: 102.5,
            enabled: true,
            description: 'MTN 25GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 30,
            price: 123.0,
            enabled: true,
            description: 'MTN 30GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 40,
            price: 164.0,
            enabled: true,
            description: 'MTN 40GB Data Bundle'
          },
          {
            network: 'MTN',
            capacity: 50,
            price: 205.0,
            enabled: true,
            description: 'MTN 50GB Data Bundle'
          },
          {
            network: 'AT',
            capacity: 1,
            price: 4.50,
            enabled: true,
            description: 'AT 1GB Data Bundle'
          },
          {
            network: 'AT',
            capacity: 2,
            price: 9.00,
            enabled: true,
            description: 'AT 2GB Data Bundle'
          },
          {
            network: 'Telecel',
            capacity: 1,
            price: 4.00,
            enabled: true,
            description: 'Telecel 1GB Data Bundle'
          }
        ]
      });

      await defaultCatalog.save();
      return res.json({ success: true, catalog: defaultCatalog });
    }

    res.json({ success: true, catalog });
  } catch (error) {
    console.error('Get catalog error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update agent catalog
router.put('/catalog', verifyAgentAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ msg: 'Items must be an array' });
    }

    // Validate items
    for (const item of items) {
      if (!item.network || !item.capacity || !item.price) {
        return res.status(400).json({ msg: 'Each item must have network, capacity, and price' });
      }
    }

    const catalog = await AgentCatalog.findOneAndUpdate(
      { agentId: req.user._id },
      { 
        items: items.map(item => ({
          ...item,
          updatedAt: new Date()
        })),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, msg: 'Catalog updated successfully', catalog });
  } catch (error) {
    console.error('Update catalog error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get agent earnings and withdrawal history
router.get('/earnings', verifyAgentAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Calculate date range
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get orders for this agent
    const orders = await OrderReport.find({
      agentId: req.user._id,
      createdAt: { $gte: start, $lte: end },
      status: 'completed'
    }).sort({ createdAt: -1 });

    // Calculate earnings
    const totalEarnings = orders.reduce((sum, order) => {
      const commissionRate = req.user.agentMetadata?.commissionRate || 5;
      return sum + (order.price * commissionRate / 100);
    }, 0);

    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => sum + order.price, 0);

    res.json({
      success: true,
      earnings: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalOrders,
        totalValue: parseFloat(totalValue.toFixed(2)),
        commissionRate: req.user.agentMetadata?.commissionRate || 5,
        orders: orders.map(order => ({
          id: order._id,
          customer: order.phoneNumber,
          network: order.network,
          capacity: order.capacity,
          price: order.price,
          commission: parseFloat((order.price * (req.user.agentMetadata?.commissionRate || 5) / 100).toFixed(2)),
          createdAt: order.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Request withdrawal
router.post('/withdraw', verifyAgentAuth, async (req, res) => {
  try {
    const { amount, withdrawalMethod, accountDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Valid amount is required' });
    }

    if (!withdrawalMethod || !accountDetails) {
      return res.status(400).json({ msg: 'Withdrawal method and account details are required' });
    }

    // Check if agent has sufficient earnings
    const orders = await OrderReport.find({
      agentId: req.user._id,
      status: 'completed'
    });

    const totalEarnings = orders.reduce((sum, order) => {
      const commissionRate = req.user.agentMetadata?.commissionRate || 5;
      return sum + (order.price * commissionRate / 100);
    }, 0);

    const withdrawnAmount = req.user.agentMetadata?.totalWithdrawn || 0;
    const availableBalance = totalEarnings - withdrawnAmount;

    if (amount > availableBalance) {
      return res.status(400).json({ 
        msg: 'Insufficient balance',
        availableBalance: parseFloat(availableBalance.toFixed(2))
      });
    }

    // Create withdrawal request
    const withdrawalRequest = {
      amount: parseFloat(amount),
      withdrawalMethod,
      accountDetails,
      status: 'pending',
      requestedAt: new Date(),
      agentId: req.user._id
    };

    // Update user's withdrawal history
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { 'agentMetadata.withdrawalHistory': withdrawalRequest },
        $inc: { 'agentMetadata.totalWithdrawn': amount }
      },
      { new: true }
    );

    res.json({
      success: true,
      msg: 'Withdrawal request submitted successfully',
      withdrawalRequest: {
        ...withdrawalRequest,
        id: withdrawalRequest._id
      },
      availableBalance: parseFloat((availableBalance - amount).toFixed(2))
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get agent store public info (for public store pages)
router.get('/public/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Find agent by customSlug or agentCode
    const agent = await User.findOne({
      $or: [
        { 'agentMetadata.customSlug': identifier },
        { 'agentMetadata.agentCode': identifier }
      ],
      role: 'agent',
      'agentMetadata.agentStatus': 'active'
    });

    if (!agent) {
      return res.status(404).json({ msg: 'Agent store not found' });
    }

    // Get agent's catalog
    const catalog = await AgentCatalog.findOne({ agentId: agent._id });

    res.json({
      success: true,
      agent: {
        name: agent.name,
        phoneNumber: agent.phoneNumber,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel,
        storeCustomization: agent.agentMetadata?.storeCustomization
      },
      catalog: catalog?.items || []
    });

  } catch (error) {
    console.error('Get public agent store error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get agent dashboard stats
router.get('/dashboard', verifyAgentAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await OrderReport.find({
      agentId: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    // Get this month's orders
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await OrderReport.find({
      agentId: req.user._id,
      createdAt: { $gte: monthStart },
      status: 'completed'
    });

    // Calculate stats
    const commissionRate = req.user.agentMetadata?.commissionRate || 5;
    
    const todayStats = {
      orders: todayOrders.length,
      revenue: todayOrders.reduce((sum, order) => sum + order.price, 0),
      earnings: todayOrders.reduce((sum, order) => sum + (order.price * commissionRate / 100), 0)
    };

    const monthStats = {
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + order.price, 0),
      earnings: monthOrders.reduce((sum, order) => sum + (order.price * commissionRate / 100), 0)
    };

    res.json({
      success: true,
      stats: {
        today: todayStats,
        month: monthStats,
        commissionRate,
        totalWithdrawn: req.user.agentMetadata?.totalWithdrawn || 0,
        agentStatus: req.user.agentMetadata?.agentStatus,
        agentLevel: req.user.agentMetadata?.agentLevel
      }
    });

  } catch (error) {
    console.error('Get agent dashboard error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
