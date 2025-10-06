const express = require('express');
const router = express.Router();
const adminAuth = require('../adminMiddleware/middleware');
const { User, AgentCatalog } = require('../schema/schema');

// ============================================
// AGENT APPROVAL SYSTEM
// ============================================

// Get all pending agents
router.get('/pending', adminAuth, async (req, res) => {
  try {
    const pendingAgents = await User.find({ 
      role: 'agent',
      'agentMetadata.status': 'pending'
    }).select('name email phoneNumber agentMetadata createdAt');

    res.json({
      success: true,
      agents: pendingAgents.map(agent => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentMetadata?.agentCode,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel || 'bronze',
        commissionRate: agent.agentMetadata?.commissionRate || 5,
        status: agent.agentMetadata?.status,
        appliedAt: agent.createdAt,
        documents: agent.agentMetadata?.documents || {}
      }))
    });

  } catch (error) {
    console.error('Get pending agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending agents'
    });
  }
});

// Get all agents with filters
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { status, level, search } = req.query;
    
    let filter = { role: 'agent' };
    
    if (status && status !== 'all') {
      filter['agentMetadata.status'] = status;
    }
    
    if (level && level !== 'all') {
      filter['agentMetadata.agentLevel'] = level;
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
      .sort({ createdAt: -1 });

    // Get agent statistics
    const stats = {
      total: await User.countDocuments({ role: 'agent' }),
      pending: await User.countDocuments({ role: 'agent', 'agentMetadata.status': 'pending' }),
      active: await User.countDocuments({ role: 'agent', 'agentMetadata.status': 'active' }),
      suspended: await User.countDocuments({ role: 'agent', 'agentMetadata.status': 'suspended' }),
      terminated: await User.countDocuments({ role: 'agent', 'agentMetadata.status': 'terminated' })
    };

    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentMetadata?.agentCode,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel || 'bronze',
        commissionRate: agent.agentMetadata?.commissionRate || 5,
        status: agent.agentMetadata?.status,
        totalEarnings: agent.agentMetadata?.totalEarnings || 0,
        availableBalance: agent.agentMetadata?.availableBalance || 0,
        appliedAt: agent.createdAt,
        lastActive: agent.agentMetadata?.lastActive
      })),
      stats: stats
    });

  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents'
    });
  }
});

// Approve agent
router.post('/approve/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { commissionRate, agentLevel, notes } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update agent status and metadata
    agent.agentMetadata.status = 'active';
    agent.agentMetadata.commissionRate = commissionRate || 5;
    agent.agentMetadata.agentLevel = agentLevel || 'bronze';
    agent.agentMetadata.approvedAt = new Date();
    agent.agentMetadata.approvedBy = req.admin._id;
    agent.agentMetadata.notes = notes;

    // Initialize agent balances
    agent.agentMetadata.availableBalance = 0;
    agent.agentMetadata.pendingBalance = 0;
    agent.agentMetadata.totalEarnings = 0;

    await agent.save();

    // Create initial agent catalog
    const catalog = new AgentCatalog({
      agentId: agent._id,
      products: [],
      isActive: true,
      createdAt: new Date()
    });

    await catalog.save();

    res.json({
      success: true,
      message: 'Agent approved successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        agentCode: agent.agentMetadata.agentCode,
        status: agent.agentMetadata.status,
        commissionRate: agent.agentMetadata.commissionRate,
        agentLevel: agent.agentMetadata.agentLevel
      }
    });

  } catch (error) {
    console.error('Approve agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve agent'
    });
  }
});

// Reject agent
router.post('/reject/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { reason } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update agent status
    agent.agentMetadata.status = 'rejected';
    agent.agentMetadata.rejectedAt = new Date();
    agent.agentMetadata.rejectedBy = req.admin._id;
    agent.agentMetadata.rejectionReason = reason;

    await agent.save();

    res.json({
      success: true,
      message: 'Agent rejected successfully'
    });

  } catch (error) {
    console.error('Reject agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject agent'
    });
  }
});

// Suspend agent
router.post('/suspend/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { reason } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update agent status
    agent.agentMetadata.status = 'suspended';
    agent.agentMetadata.suspendedAt = new Date();
    agent.agentMetadata.suspendedBy = req.admin._id;
    agent.agentMetadata.suspensionReason = reason;

    await agent.save();

    res.json({
      success: true,
      message: 'Agent suspended successfully'
    });

  } catch (error) {
    console.error('Suspend agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend agent'
    });
  }
});

// Reactivate agent
router.post('/reactivate/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update agent status
    agent.agentMetadata.status = 'active';
    agent.agentMetadata.reactivatedAt = new Date();
    agent.agentMetadata.reactivatedBy = req.admin._id;

    await agent.save();

    res.json({
      success: true,
      message: 'Agent reactivated successfully'
    });

  } catch (error) {
    console.error('Reactivate agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate agent'
    });
  }
});

// Update agent commission rate
router.put('/commission/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { commissionRate, agentLevel } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update commission rate and level
    agent.agentMetadata.commissionRate = commissionRate;
    if (agentLevel) {
      agent.agentMetadata.agentLevel = agentLevel;
    }
    agent.agentMetadata.updatedAt = new Date();
    agent.agentMetadata.updatedBy = req.admin._id;

    await agent.save();

    res.json({
      success: true,
      message: 'Agent commission rate updated successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        commissionRate: agent.agentMetadata.commissionRate,
        agentLevel: agent.agentMetadata.agentLevel
      }
    });

  } catch (error) {
    console.error('Update commission rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update commission rate'
    });
  }
});

// Get agent details
router.get('/:agentId', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await User.findById(agentId)
      .select('name email phoneNumber agentMetadata createdAt');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent's catalog
    const catalog = await AgentCatalog.findOne({ agentId: agent._id });
    
    // Get agent's recent orders
    const Order = require('../schema/schema').Order;
    const recentOrders = await Order.find({ agentId: agent._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name phoneNumber');

    res.json({
      success: true,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentMetadata?.agentCode,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel || 'bronze',
        commissionRate: agent.agentMetadata?.commissionRate || 5,
        status: agent.agentMetadata?.status,
        totalEarnings: agent.agentMetadata?.totalEarnings || 0,
        availableBalance: agent.agentMetadata?.availableBalance || 0,
        pendingBalance: agent.agentMetadata?.pendingBalance || 0,
        appliedAt: agent.createdAt,
        approvedAt: agent.agentMetadata?.approvedAt,
        lastActive: agent.agentMetadata?.lastActive,
        documents: agent.agentMetadata?.documents || {},
        notes: agent.agentMetadata?.notes
      },
      catalog: catalog ? {
        totalProducts: catalog.products?.length || 0,
        activeProducts: catalog.products?.filter(p => p.isActive !== false).length || 0
      } : null,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customerName: order.userId?.name || 'Anonymous',
        customerPhone: order.userId?.phoneNumber || order.customerInfo?.phone,
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    console.error('Get agent details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent details'
    });
  }
});

// Bulk approve agents
router.post('/bulk-approve', adminAuth, async (req, res) => {
  try {
    const { agentIds, commissionRate, agentLevel } = req.body;

    const results = [];
    
    for (const agentId of agentIds) {
      try {
        const agent = await User.findById(agentId);
        if (agent && agent.agentMetadata?.status === 'pending') {
          agent.agentMetadata.status = 'active';
          agent.agentMetadata.commissionRate = commissionRate || 5;
          agent.agentMetadata.agentLevel = agentLevel || 'bronze';
          agent.agentMetadata.approvedAt = new Date();
          agent.agentMetadata.approvedBy = req.admin._id;

          // Initialize balances
          agent.agentMetadata.availableBalance = 0;
          agent.agentMetadata.pendingBalance = 0;
          agent.agentMetadata.totalEarnings = 0;

          await agent.save();

          // Create catalog
          const catalog = new AgentCatalog({
            agentId: agent._id,
            products: [],
            isActive: true,
            createdAt: new Date()
          });
          await catalog.save();

          results.push({ agentId, status: 'approved', name: agent.name });
        } else {
          results.push({ agentId, status: 'skipped', reason: 'Not pending or not found' });
        }
      } catch (error) {
        results.push({ agentId, status: 'error', error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk approval completed',
      results: results
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk approval failed'
    });
  }
});

module.exports = router;
