const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { User, Order, AgentCatalog } = require('../schema/schema');

// ============================================
// ADMIN AGENT MANAGEMENT
// ============================================

// Get all agents (Admin only)
router.get('/agents', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build filter
    const filter = { role: 'agent' };
    
    if (status) {
      filter['agentMetadata.status'] = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'agentMetadata.agentCode': { $regex: search, $options: 'i' } }
      ];
    }

    const agents = await User.find(filter)
      .select('name email phoneNumber agentMetadata createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalAgents = await User.countDocuments(filter);

    // Get additional stats for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const orders = await Order.find({ agentId: agent._id });
        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;

        return {
          ...agent,
          stats: {
            totalSales,
            totalOrders,
            completedOrders,
            conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
          }
        };
      })
    );

    res.json({
      success: true,
      agents: agentsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalAgents,
        pages: Math.ceil(totalAgents / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent details (Admin only)
router.get('/agents/:agentId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { agentId } = req.params;

    const agent = await User.findById(agentId).select('name email phoneNumber agentMetadata createdAt');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent's orders
    const orders = await Order.find({ agentId }).sort({ createdAt: -1 }).limit(10);
    
    // Get agent's catalog
    const catalog = await AgentCatalog.findOne({ agentId });
    
    // Calculate stats
    const allOrders = await Order.find({ agentId });
    const totalSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const failedOrders = allOrders.filter(order => order.status === 'failed').length;

    res.json({
      success: true,
      agent: {
        ...agent.toObject(),
        stats: {
          totalSales,
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        recentOrders: orders,
        catalog: catalog ? {
          totalProducts: catalog.products?.length || 0,
          activeProducts: catalog.products?.filter(p => p.isActive !== false).length || 0
        } : null
      }
    });

  } catch (error) {
    console.error('Get agent details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Approve agent (Admin only)
router.put('/agents/:agentId/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { agentId } = req.params;
    const { status, notes } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Initialize agentMetadata if it doesn't exist
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }

    // Update agent status
    agent.agentMetadata.status = status || 'approved';
    agent.agentMetadata.approvedAt = new Date();
    agent.agentMetadata.approvedBy = req.user._id;
    agent.agentMetadata.notes = notes;

    // Generate agent code if approved
    if (status === 'approved' && !agent.agentMetadata.agentCode) {
      const agentCode = `AG${Date.now().toString().slice(-6)}-${agent.name.substring(0, 2).toUpperCase()}`;
      agent.agentMetadata.agentCode = agentCode;
    }

    await agent.save();

    res.json({
      success: true,
      message: `Agent ${status} successfully`,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        agentCode: agent.agentMetadata.agentCode,
        status: agent.agentMetadata.status,
        approvedAt: agent.agentMetadata.approvedAt
      }
    });

  } catch (error) {
    console.error('Approve agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update agent commission (Admin only)
router.put('/agents/:agentId/commission', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { agentId } = req.params;
    const { commissionRate } = req.body;

    if (!commissionRate || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Valid commission rate (0-100) is required'
      });
    }

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Initialize agentMetadata if it doesn't exist
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }

    agent.agentMetadata.commissionRate = commissionRate;
    agent.agentMetadata.commissionUpdatedAt = new Date();
    agent.agentMetadata.commissionUpdatedBy = req.user._id;

    await agent.save();

    res.json({
      success: true,
      message: 'Agent commission updated successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        commissionRate: agent.agentMetadata.commissionRate
      }
    });

  } catch (error) {
    console.error('Update agent commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Suspend/Activate agent (Admin only)
router.put('/agents/:agentId/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { agentId } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, suspended, inactive)'
      });
    }

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Initialize agentMetadata if it doesn't exist
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }

    agent.agentMetadata.status = status;
    agent.agentMetadata.statusUpdatedAt = new Date();
    agent.agentMetadata.statusUpdatedBy = req.user._id;
    agent.agentMetadata.statusReason = reason;

    await agent.save();

    res.json({
      success: true,
      message: `Agent ${status} successfully`,
      agent: {
        id: agent._id,
        name: agent.name,
        status: agent.agentMetadata.status,
        statusUpdatedAt: agent.agentMetadata.statusUpdatedAt
      }
    });

  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent analytics (Admin only)
router.get('/agents/:agentId/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { agentId } = req.params;
    const { period = 'month' } = req.query;

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

    // Get agent's orders for the period
    const orders = await Order.find({
      agentId: agentId,
      createdAt: { $gte: startDate }
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const failedOrders = orders.filter(order => order.status === 'failed').length;

    // Calculate commission
    const agent = await User.findById(agentId);
    const commissionRate = agent.agentMetadata?.commissionRate || 10;
    const totalCommission = totalRevenue * (commissionRate / 100);

    // Get daily sales
    const dailySales = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { orders: 0, revenue: 0 };
      }
      dailySales[date].orders += 1;
      dailySales[date].revenue += order.totalAmount || 0;
    });

    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          totalCommission,
          commissionRate,
          conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        dailySales: dailySalesArray,
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

// Get all agent applications (Admin only)
router.get('/applications', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status = 'pending', page = 1, limit = 10 } = req.query;

    const filter = { 
      role: 'agent',
      'agentMetadata.status': status
    };

    const applications = await User.find(filter)
      .select('name email phoneNumber agentMetadata createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalApplications = await User.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalApplications,
        pages: Math.ceil(totalApplications / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get agent applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;