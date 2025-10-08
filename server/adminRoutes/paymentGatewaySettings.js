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
          bulkclixEnabled: false,
          paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
          paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
          bulkclixApiKey: process.env.BULKCLIX_API_KEY || '',
          autoSwitch: false,
          fallbackGateway: 'paystack'
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
      activeGateway,
      paystackEnabled,
      bulkclixEnabled,
      paystackPublicKey,
      paystackSecretKey,
      bulkclixApiKey,
      autoSwitch,
      fallbackGateway
    } = req.body;

    // Validate required fields
    if (!activeGateway || !['paystack', 'bulkclix'].includes(activeGateway)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid active gateway. Must be either "paystack" or "bulkclix"'
      });
    }

    if (!fallbackGateway || !['paystack', 'bulkclix'].includes(fallbackGateway)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fallback gateway. Must be either "paystack" or "bulkclix"'
      });
    }

    // Validate API keys based on enabled gateways
    if (paystackEnabled && (!paystackPublicKey || !paystackSecretKey)) {
      return res.status(400).json({
        success: false,
        error: 'Paystack public and secret keys are required when Paystack is enabled'
      });
    }

    if (bulkclixEnabled && !bulkclixApiKey) {
      return res.status(400).json({
        success: false,
        error: 'BulkClix API key is required when BulkClix is enabled'
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

    // Update settings
    settings.data = {
      activeGateway,
      paystackEnabled: Boolean(paystackEnabled),
      bulkclixEnabled: Boolean(bulkclixEnabled),
      paystackPublicKey: paystackPublicKey || '',
      paystackSecretKey: paystackSecretKey || '',
      bulkclixApiKey: bulkclixApiKey || '',
      autoSwitch: Boolean(autoSwitch),
      fallbackGateway,
      updatedAt: new Date()
    };

    await settings.save();

    // Clear payment gateway service cache to ensure immediate effect
    paymentGatewayService.clearCache();

    // Update environment variables if provided
    if (paystackPublicKey && paystackPublicKey.trim()) {
      process.env.PAYSTACK_PUBLIC_KEY = paystackPublicKey;
    }
    if (paystackSecretKey && paystackSecretKey.trim()) {
      process.env.PAYSTACK_SECRET_KEY = paystackSecretKey;
    }
    if (bulkclixApiKey && bulkclixApiKey.trim()) {
      process.env.BULKCLIX_API_KEY = bulkclixApiKey;
    }

    console.log(`[PAYMENT_GATEWAY] Settings updated - Active: ${activeGateway}, Paystack: ${paystackEnabled}, BulkClix: ${bulkclixEnabled}`);

    return res.json({
      success: true,
      message: 'Payment gateway settings updated successfully',
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

// Test payment gateway connection
router.post('/payment-gateway-settings/test', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { gateway, apiKey } = req.body;

    if (!gateway || !['paystack', 'bulkclix'].includes(gateway)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gateway. Must be either "paystack" or "bulkclix"'
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required for testing'
      });
    }

    let testResult = {};

    if (gateway === 'paystack') {
      // Test Paystack connection
      try {
        const axios = require('axios');
        const response = await axios.get('https://api.paystack.co/bank', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        testResult = {
          success: true,
          message: 'Paystack connection successful',
          data: {
            status: response.status,
            bankCount: response.data.data?.length || 0
          }
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'Paystack connection failed',
          error: error.response?.data?.message || error.message
        };
      }
    } else if (gateway === 'bulkclix') {
      // Test BulkClix connection
      try {
        const axios = require('axios');
        const response = await axios.get('https://api.bulkclix.com/api/v1/payment-api/banks/list', {
          headers: {
            'x-api-key': apiKey,
            'Accept': 'application/json'
          }
        });

        testResult = {
          success: true,
          message: 'BulkClix connection successful',
          data: {
            status: response.status,
            bankCount: response.data.data?.length || 0
          }
        };
      } catch (error) {
        testResult = {
          success: false,
          message: 'BulkClix connection failed',
          error: error.response?.data?.message || error.message
        };
      }
    }

    return res.json(testResult);
  } catch (error) {
    console.error('Test Payment Gateway Error:', error);
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
          paystackEnabled: true,
          bulkclixEnabled: false
        }
      });
    }

    return res.json({
      success: true,
      data: {
        activeGateway: settings.data.activeGateway || 'paystack',
        paystackEnabled: settings.data.paystackEnabled || false,
        bulkclixEnabled: settings.data.bulkclixEnabled || false
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
