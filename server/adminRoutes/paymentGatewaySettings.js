const express = require('express');
const router = express.Router();
const { Settings, Transactiondataunlimited } = require('../schema/schema');
const adminAuth = require('../adminMiddleware/middleware');
const authMiddleware = require('../middlewareUser/middleware');
const paymentGatewayService = require('../services/paymentGatewayService');

// Get payment gateway settings
router.get('/payment-gateway-settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Find or create payment gateway settings
    let settings = await Settings.findOne({ type: 'payment_gateway' });
    
    if (!settings) {
      // Create default settings
      settings = new Settings({
        type: 'payment_gateway',
        data: {
          activeGateway: 'paystack',
          paystackEnabled: true,
          paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
          paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || ''
        }
      });
      await settings.save();
    }

    return res.json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    console.error('Get Payment Gateway Settings Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update payment gateway settings
router.put('/payment-gateway-settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    const {
      paystackPublicKey,
      paystackSecretKey
    } = req.body;

    // Validate Paystack API keys
    if (!paystackPublicKey || !paystackSecretKey) {
      return res.status(400).json({
        success: false,
        error: 'Paystack public and secret keys are required'
      });
    }

    // Find or create settings
    let settings = await Settings.findOne({ type: 'payment_gateway' });
    
    if (!settings) {
      settings = new Settings({
        type: 'payment_gateway',
        data: {}
      });
    }

    // Update settings - Paystack only
    settings.data = {
      activeGateway: 'paystack',
      paystackEnabled: true,
      paystackPublicKey: paystackPublicKey || '',
      paystackSecretKey: paystackSecretKey || '',
      updatedAt: new Date()
    };

    await settings.save();

    // Clear payment gateway service cache to ensure immediate effect
    paymentGatewayService.clearCache();

    // Update environment variables
    if (paystackPublicKey && paystackPublicKey.trim()) {
      process.env.PAYSTACK_PUBLIC_KEY = paystackPublicKey;
    }
    if (paystackSecretKey && paystackSecretKey.trim()) {
      process.env.PAYSTACK_SECRET_KEY = paystackSecretKey;
    }

    console.log(`[PAYMENT_GATEWAY] Settings updated - Paystack enabled with keys configured`);

    return res.json({
      success: true,
      message: 'Paystack settings updated successfully',
      data: settings.data
    });
  } catch (error) {
    console.error('Update Payment Gateway Settings Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test Paystack connection
router.post('/payment-gateway-settings/test', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Paystack secret key is required for testing'
      });
    }

    // Test Paystack connection
    try {
      const axios = require('axios');
      const response = await axios.get('https://api.paystack.co/bank', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return res.json({
        success: true,
        message: 'Paystack connection successful',
        data: {
          status: response.status,
          bankCount: response.data.data?.length || 0
        }
      });
    } catch (error) {
      return res.json({
        success: false,
        message: 'Paystack connection failed',
        error: error.response?.data?.message || error.message
      });
    }
  } catch (error) {
    console.error('Test Paystack Connection Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current active gateway
router.get('/payment-gateway-settings/active', authMiddleware, adminAuth, async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'payment_gateway' });
    
    if (!settings) {
      return res.json({
        success: true,
        data: {
          activeGateway: 'paystack',
          paystackEnabled: true
        }
      });
    }

    return res.json({
      success: true,
      data: {
        activeGateway: 'paystack',
        paystackEnabled: true
      }
    });
  } catch (error) {
    console.error('Get Active Gateway Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Clear pending transactions (Admin only)
router.post('/payment-gateway-settings/clear-pending', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { userId, reference } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Find and update pending transactions
    const updateResult = await Transactiondataunlimited.updateMany(
      { 
        userId, 
        status: 'pending',
        ...(reference && { reference })
      },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledReason: 'Admin cleared pending transaction'
        } 
      }
    );

    console.log(`[ADMIN] Cleared ${updateResult.modifiedCount} pending transactions for user ${userId}`);

    return res.json({
      success: true,
      message: `Cleared ${updateResult.modifiedCount} pending transactions`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        userId,
        reference
      }
    });
  } catch (error) {
    console.error('Clear Pending Transactions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
