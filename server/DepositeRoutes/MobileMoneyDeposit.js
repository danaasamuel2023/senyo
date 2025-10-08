const express = require('express');
const router = express.Router();
const { Transaction, User, Wallet } = require('../schema/schema');
const axios = require('axios');
const crypto = require('crypto');
const paymentGatewayService = require('../services/paymentGatewayService');
const {
  rateLimitPayments,
  validateDepositAmount,
  preventDuplicateDeposits,
  checkBlocked,
  sanitizeInput,
  auditLog
} = require('../middleware/paystackSecurity');

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY not set. Payment operations will fail.');
}
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Mobile Money Networks Configuration
const MOBILE_MONEY_NETWORKS = {
  MTN: {
    name: 'MTN Mobile Money',
    shortName: 'MTN',
    prefixes: ['024', '054', '055', '059'],
    color: 'yellow',
    description: 'Ghana\'s leading mobile money service'
  },
  VODAFONE: {
    name: 'Vodafone Cash',
    shortName: 'Vodafone',
    prefixes: ['020', '050'],
    color: 'red',
    description: 'Fast and secure mobile money'
  },
  AIRTELTIGO: {
    name: 'AirtelTigo Money',
    shortName: 'AirtelTigo',
    prefixes: ['026', '027', '056', '057'],
    color: 'blue',
    description: 'Reliable mobile money service'
  }
};

// Validate mobile money phone number
function validateMobileMoneyNumber(phoneNumber, network) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const networkConfig = MOBILE_MONEY_NETWORKS[network];
  
  if (!networkConfig) {
    return { valid: false, error: 'Invalid network' };
  }
  
  const isValid = networkConfig.prefixes.some(prefix => 
    cleanPhone.startsWith(prefix) && cleanPhone.length === 10
  );
  
  if (!isValid) {
    return { 
      valid: false, 
      error: `Invalid ${networkConfig.shortName} number. Use format: ${networkConfig.prefixes.join(', ')}` 
    };
  }
  
  return { valid: true, cleanPhone };
}

// Get available mobile money networks
router.get('/networks', (req, res) => {
  try {
    const networks = Object.entries(MOBILE_MONEY_NETWORKS).map(([key, config]) => ({
      id: key,
      name: config.name,
      shortName: config.shortName,
      prefixes: config.prefixes,
      color: config.color,
      description: config.description
    }));
    
    return res.json({
      success: true,
      data: networks
    });
  } catch (error) {
    console.error('Get Networks Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Validate mobile money phone number
router.post('/validate-number', 
  sanitizeInput,
  (req, res) => {
    try {
      const { phoneNumber, network } = req.body;
      
      if (!phoneNumber || !network) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and network are required'
        });
      }
      
      const validation = validateMobileMoneyNumber(phoneNumber, network);
      
      if (!validation.valid) {
        return res.json({
          success: false,
          error: validation.error
        });
      }
      
      return res.json({
        success: true,
        message: 'Phone number is valid',
        data: {
          phoneNumber: validation.cleanPhone,
          network,
          networkName: MOBILE_MONEY_NETWORKS[network]?.name
        }
      });
    } catch (error) {
      console.error('Validate Number Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// Initiate Mobile Money Deposit
router.post('/mobile-money',
  checkBlocked,
  rateLimitPayments,
  sanitizeInput,
  validateDepositAmount,
  preventDuplicateDeposits(Transaction),
  auditLog('MOBILE_MONEY_DEPOSIT_INITIATED'),
  async (req, res) => {
    try {
      const { 
        userId, 
        amount, 
        phoneNumber, 
        network, 
        email,
        paymentMethod = 'mobile_money'
      } = req.body;

      // Validate input
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid deposit details' 
        });
      }

      if (!phoneNumber || !network) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and network are required for mobile money deposits'
        });
      }

      // Validate mobile money number
      const validation = validateMobileMoneyNumber(phoneNumber, network);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      // Find user to get their email and check account status
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Check if user's account is disabled
      if (user.isDisabled) {
        return res.status(403).json({
          success: false,
          error: 'Account is disabled',
          message: 'Your account has been disabled. Deposits are not allowed.',
          disableReason: user.disableReason || 'No reason provided'
        });
      }

      // Use payment gateway service to process the deposit
      const depositData = {
        amount: parseFloat(amount),
        phoneNumber: validation.cleanPhone,
        network,
        userId,
        email: email || user.email
      };

      const gatewayResult = await paymentGatewayService.processMobileMoneyDeposit(depositData);

      // Create a pending transaction
      const transaction = new Transaction({
        userId,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        reference: gatewayResult.reference,
        gateway: gatewayResult.gateway,
        paymentMethod,
        metadata: {
          phoneNumber: validation.cleanPhone,
          network,
          networkName: MOBILE_MONEY_NETWORKS[network]?.name,
          gatewayData: gatewayResult.data
        }
      });

      await transaction.save();

      // Return appropriate response based on gateway
      if (gatewayResult.gateway === 'paystack') {
        return res.json({
          success: true,
          message: 'Mobile money deposit initiated via Paystack',
          paystackUrl: gatewayResult.paystackUrl,
          reference: gatewayResult.reference,
          gateway: 'paystack',
          data: gatewayResult.data
        });
      } else if (gatewayResult.gateway === 'bulkclix') {
        return res.json({
          success: true,
          message: 'Mobile money deposit initiated via BulkClix',
          reference: gatewayResult.reference,
          gateway: 'bulkclix',
          data: gatewayResult.data
        });
      }

    } catch (error) {
      console.error('Mobile Money Deposit Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

// Get mobile money deposit history
router.get('/mobile-money/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Build query filter
    const filter = { 
      userId,
      paymentMethod: 'mobile_money'
    };
    
    // Add status filter if provided
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find transactions
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));
      
    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(filter);
    
    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Get Mobile Money History Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get mobile money deposit statistics
router.get('/mobile-money/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Get transaction statistics
    const stats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          paymentMethod: 'mobile_money'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get network usage statistics
    const networkStats = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          paymentMethod: 'mobile_money',
          'metadata.network': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$metadata.network',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Format statistics
    const formattedStats = {
      byStatus: {},
      byNetwork: {},
      totalTransactions: 0,
      totalAmount: 0
    };
    
    stats.forEach(stat => {
      formattedStats.byStatus[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      formattedStats.totalTransactions += stat.count;
      if (stat._id === 'completed') {
        formattedStats.totalAmount += stat.totalAmount;
      }
    });
    
    networkStats.forEach(stat => {
      formattedStats.byNetwork[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });
    
    return res.json({
      success: true,
      data: formattedStats
    });
    
  } catch (error) {
    console.error('Get Mobile Money Stats Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
