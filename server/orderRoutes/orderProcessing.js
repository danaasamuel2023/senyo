const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { Order, User, ProductPricing, AgentCatalog } = require('../schema/schema');

// ============================================
// ORDER PROCESSING
// ============================================

// Create order from store
router.post('/create', auth, async (req, res) => {
  try {
    const { items, totalAmount, customerInfo, agentCode } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total amount is required'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.phoneNumber || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have id, phoneNumber, and price'
        });
      }

      // Verify product exists and is enabled
      const product = await ProductPricing.findById(item.id);
      if (!product || !product.enabled) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.id} not found or disabled`
        });
      }
    }

    // Determine if this is an agent store order
    let agentId = null;
    if (agentCode) {
      const agent = await User.findOne({ 'agentMetadata.agentCode': agentCode });
      if (agent) {
        agentId = agent._id;
      }
    }

    // Create order
    const order = new Order({
      userId,
      agentId,
      items: items.map(item => ({
        productId: item.id,
        network: item.network,
        capacity: item.capacity,
        phoneNumber: item.phoneNumber,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount,
      status: 'pending',
      orderType: agentId ? 'agent-store' : 'main-store',
      source: agentId ? `agent-${agentCode}` : 'main-store',
      customerInfo: {
        name: customerInfo?.name || req.user.name,
        email: customerInfo?.email || req.user.email,
        phone: customerInfo?.phone || req.user.phoneNumber
      }
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt,
        agentCode: agentCode || null
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Process order (Admin/System)
router.put('/:orderId/process', auth, async (req, res) => {
  try {
    // Check if user is admin or system
    if (req.user.role !== 'admin' && req.user.role !== 'system') {
      return res.status(403).json({
        success: false,
        message: 'Admin or system access required'
      });
    }

    const { orderId } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    order.processedAt = new Date();
    order.processedBy = req.user._id;
    order.notes = notes;

    // If order is completed, update agent earnings
    if (status === 'completed' && order.agentId) {
      const agent = await User.findById(order.agentId);
      if (agent && agent.agentMetadata) {
        const commissionRate = agent.agentMetadata.commissionRate || 10;
        const commission = order.totalAmount * (commissionRate / 100);
        
        agent.agentMetadata.availableBalance = (agent.agentMetadata.availableBalance || 0) + commission;
        agent.agentMetadata.totalEarnings = (agent.agentMetadata.totalEarnings || 0) + commission;
        await agent.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order processed successfully',
      order: {
        id: order._id,
        status: order.status,
        processedAt: order.processedAt,
        notes: order.notes
      }
    });

  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user orders
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent orders
router.get('/agent', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { agentId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get agent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phoneNumber')
      .populate('agentId', 'name email agentMetadata');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (order.userId._id.toString() !== userId.toString() && 
        order.agentId && order.agentId._id.toString() !== userId.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Cancel order
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user can cancel this order
    if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['completed', 'cancelled', 'failed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = userId;
    order.cancelReason = reason;

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt,
        cancelReason: order.cancelReason
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get order statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build filter based on user role
    let filter = { createdAt: { $gte: startDate } };
    
    if (req.user.role === 'agent') {
      filter.agentId = userId;
    } else if (req.user.role === 'user') {
      filter.userId = userId;
    }
    // Admin can see all orders

    // Get order statistics
    const orders = await Order.find(filter);
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const failedOrders = orders.filter(order => order.status === 'failed').length;

    // Get daily statistics
    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, revenue: 0 };
      }
      dailyStats[date].orders += 1;
      dailyStats[date].revenue += order.totalAmount || 0;
    });

    const dailyStatsArray = Object.entries(dailyStats)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      stats: {
        overview: {
          totalOrders,
          totalRevenue,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          failedOrders,
          conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        dailyStats: dailyStatsArray,
        period: {
          current: period,
          startDate,
          endDate: now
        }
      }
    });

  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
