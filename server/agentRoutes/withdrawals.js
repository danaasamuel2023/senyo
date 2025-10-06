const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { User, Transaction } = require('../schema/schema');

// ============================================
// AGENT WITHDRAWAL SYSTEM
// ============================================

// Get withdrawal history
router.get('/history', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const withdrawals = await Transaction.find({ 
      userId: agentId, 
      type: 'withdrawal' 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({ 
      userId: agentId, 
      type: 'withdrawal' 
    });

    res.json({
      success: true,
      withdrawals: withdrawals,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });

  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal history'
    });
  }
});

// Request withdrawal
router.post('/request', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { amount, bankDetails, withdrawalMethod } = req.body;

    // Get agent
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const availableBalance = agent.agentMetadata?.availableBalance || 0;
    
    // Validate withdrawal amount
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is GHS 50'
      });
    }

    // Check if agent has pending withdrawal
    const pendingWithdrawal = await Transaction.findOne({
      userId: agentId,
      type: 'withdrawal',
      status: 'pending'
    });

    if (pendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'You have a pending withdrawal request'
      });
    }

    // Create withdrawal request
    const withdrawal = new Transaction({
      userId: agentId,
      amount: amount,
      type: 'withdrawal',
      status: 'pending',
      withdrawalMethod: withdrawalMethod || 'bank_transfer',
      bankDetails: bankDetails,
      requestedAt: new Date()
    });

    await withdrawal.save();

    // Update agent balance
    agent.agentMetadata.availableBalance = availableBalance - amount;
    agent.agentMetadata.pendingWithdrawal = (agent.agentMetadata.pendingWithdrawal || 0) + amount;
    await agent.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: withdrawal
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Withdrawal request failed',
      error: error.message
    });
  }
});

// Get withdrawal statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const agentId = req.user._id;

    // Get agent
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get withdrawal statistics
    const totalWithdrawn = await Transaction.aggregate([
      { $match: { userId: agentId, type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingWithdrawals = await Transaction.aggregate([
      { $match: { userId: agentId, type: 'withdrawal', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonthWithdrawals = await Transaction.aggregate([
      { 
        $match: { 
          userId: agentId, 
          type: 'withdrawal', 
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        availableBalance: agent.agentMetadata?.availableBalance || 0,
        pendingBalance: agent.agentMetadata?.pendingBalance || 0,
        totalEarnings: agent.agentMetadata?.totalEarnings || 0,
        totalWithdrawn: totalWithdrawn[0]?.total || 0,
        pendingWithdrawals: pendingWithdrawals[0]?.total || 0,
        thisMonthWithdrawals: thisMonthWithdrawals[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal statistics'
    });
  }
});

// Cancel withdrawal request
router.post('/cancel/:withdrawalId', auth, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const agentId = req.user._id;

    const withdrawal = await Transaction.findOne({
      _id: withdrawalId,
      userId: agentId,
      type: 'withdrawal',
      status: 'pending'
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found or cannot be cancelled'
      });
    }

    // Update withdrawal status
    withdrawal.status = 'cancelled';
    withdrawal.cancelledAt = new Date();
    await withdrawal.save();

    // Restore agent balance
    const agent = await User.findById(agentId);
    agent.agentMetadata.availableBalance = (agent.agentMetadata.availableBalance || 0) + withdrawal.amount;
    agent.agentMetadata.pendingWithdrawal = Math.max(0, (agent.agentMetadata.pendingWithdrawal || 0) - withdrawal.amount);
    await agent.save();

    res.json({
      success: true,
      message: 'Withdrawal request cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel withdrawal request'
    });
  }
});

// Get withdrawal methods
router.get('/methods', auth, async (req, res) => {
  try {
    const withdrawalMethods = [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct transfer to your bank account',
        processingTime: '1-3 business days',
        minAmount: 50,
        maxAmount: 10000,
        fee: 0
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'MTN Mobile Money, Vodafone Cash, etc.',
        processingTime: 'Instant',
        minAmount: 10,
        maxAmount: 5000,
        fee: 2
      },
      {
        id: 'airtime',
        name: 'Airtime Credit',
        description: 'Convert to airtime credit',
        processingTime: 'Instant',
        minAmount: 5,
        maxAmount: 1000,
        fee: 0
      }
    ];

    res.json({
      success: true,
      methods: withdrawalMethods
    });

  } catch (error) {
    console.error('Get withdrawal methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal methods'
    });
  }
});

// Update bank details
router.put('/bank-details', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { bankDetails } = req.body;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Update bank details
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }
    
    agent.agentMetadata.bankDetails = bankDetails;
    agent.agentMetadata.bankDetailsUpdatedAt = new Date();
    await agent.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully'
    });

  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank details'
    });
  }
});

// Get bank details
router.get('/bank-details', auth, async (req, res) => {
  try {
    const agentId = req.user._id;

    const agent = await User.findById(agentId).select('agentMetadata.bankDetails');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      bankDetails: agent.agentMetadata?.bankDetails || null
    });

  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank details'
    });
  }
});

module.exports = router;
