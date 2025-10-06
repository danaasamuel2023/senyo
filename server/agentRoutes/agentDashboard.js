const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { User, Order, AgentCatalog } = require('../schema/schema');

// Get agent dashboard analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { period = 'today' } = req.query;

    // Calculate date range based on period
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
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get agent's orders for the period
    const orders = await Order.find({
      agentId: agentId,
      createdAt: { $gte: startDate }
    });

    // Get agent data first to get commission rate
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    const commissionRate = agent.agentMetadata?.commissionRate || 0; // No default, must be set by admin

    // Calculate metrics
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const netProfit = totalSales * (commissionRate / 100); // Use actual commission rate
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get wallet balance from agent metadata
    const walletBalance = {
      available: agent.agentMetadata?.availableBalance || 0,
      pending: agent.agentMetadata?.pendingBalance || 0,
      totalEarnings: agent.agentMetadata?.totalEarnings || 0
    };
    
    // Ensure agent has proper metadata structure
    if (!agent.agentMetadata) {
      return res.status(400).json({
        success: false,
        message: 'Agent metadata not configured. Please contact admin.'
      });
    }

    // Get recent customers (last 10 orders)
    const recentOrders = await Order.find({ agentId: agentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name phoneNumber');

    const recentCustomers = recentOrders.map(order => ({
      id: order._id,
      name: order.userId?.name || 'Customer',
      phone: order.userId?.phoneNumber || order.customerInfo?.phone || 'Not provided',
      lastOrder: getTimeAgo(order.createdAt),
      totalSpent: order.totalAmount || 0
    }));

    // Get previous period for comparison
    let previousStartDate;
    switch (period) {
      case 'today':
        previousStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      default:
        previousStartDate = startDate;
    }

    const previousOrders = await Order.find({
      agentId: agentId,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousSales = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const salesChange = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;
    const ordersChange = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

    res.json({
      success: true,
      analytics: {
        totalSales,
        orders: totalOrders,
        netProfit,
        avgOrder,
        commissionRate,
        walletBalance,
        recentCustomers,
        changes: {
          sales: salesChange,
          orders: ordersChange
        },
        period: {
          current: period,
          startDate,
          endDate: now
        }
      }
    });

  } catch (error) {
    console.error('Get agent analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent profile
router.get('/profile', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    
    const agent = await User.findById(agentId).select('name email phoneNumber agentMetadata');
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    if (!agent.agentMetadata) {
      return res.status(400).json({
        success: false,
        message: 'Agent metadata not configured. Please contact admin.'
      });
    }

    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentMetadata?.agentCode,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel,
        storeCustomization: agent.agentMetadata?.storeCustomization,
        walletBalance: {
          available: agent.agentMetadata?.availableBalance || 0,
          pending: agent.agentMetadata?.pendingBalance || 0,
          totalEarnings: agent.agentMetadata?.totalEarnings || 0
        }
      }
    });

  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent store statistics
router.get('/store-stats', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    
    // Get agent catalog
    const catalog = await AgentCatalog.findOne({ agentId });
    const products = catalog ? (catalog.products || catalog.items || []) : [];
    
    if (!catalog) {
      return res.json({
        success: true,
        stats: {
          totalProducts: 0,
          activeProducts: 0,
          totalOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          uniqueCustomers: 0,
          conversionRate: 0
        }
      });
    }
    
    // Get orders count
    const totalOrders = await Order.countDocuments({ agentId });
    const completedOrders = await Order.countDocuments({ 
      agentId, 
      status: 'completed' 
    });
    
    // Get total revenue
    const orders = await Order.find({ agentId, status: 'completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get unique customers
    const uniqueCustomers = await Order.distinct('userId', { agentId });
    
    res.json({
      success: true,
      stats: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive !== false || p.enabled !== false).length,
        totalOrders,
        completedOrders,
        totalRevenue,
        uniqueCustomers: uniqueCustomers.length,
        conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
      }
    });

  } catch (error) {
    console.error('Get agent store stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent recent activity
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { limit = 10 } = req.query;
    
    // Get recent orders
    const recentOrders = await Order.find({ agentId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name phoneNumber');
    
    const activities = recentOrders.map(order => ({
      id: order._id,
      type: 'order',
      title: `New order from ${order.userId?.name || 'Customer'}`,
      description: `${order.items?.length || 0} items - ₵${order.totalAmount || 0}`,
      timestamp: order.createdAt,
      status: order.status
    }));
    
    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Get agent recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
}

module.exports = router;
