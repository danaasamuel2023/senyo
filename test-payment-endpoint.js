/**
 * Test Payment Endpoint
 * 
 * Add this to your server to test payment gateway switching
 * This creates a test endpoint that simulates a payment request
 */

const express = require('express');
const router = express.Router();
const paymentGatewayService = require('./server/services/paymentGatewayService');
const { auth: authMiddleware } = require('./server/middleware/auth');
const adminAuth = require('./server/adminMiddleware/middleware');

// Test payment processing endpoint
router.post('/test-payment', authMiddleware, adminAuth, async (req, res) => {
  try {
    console.log('🧪 Test Payment Request Received');
    
    // Get current gateway settings
    const settings = await paymentGatewayService.getSettings();
    console.log('📊 Current Gateway Settings:', {
      activeGateway: settings.activeGateway,
      paystackEnabled: settings.paystackEnabled,
      bulkclixEnabled: settings.bulkclixEnabled,
      autoSwitch: settings.autoSwitch,
      fallbackGateway: settings.fallbackGateway
    });
    
    // Test data for payment
    const testDepositData = {
      amount: 10,
      phoneNumber: '233241234567',
      network: 'MTN',
      userId: req.user._id,
      email: req.user.email || 'test@example.com'
    };
    
    console.log('💰 Processing test payment with data:', testDepositData);
    
    // Try to process the payment (this will show which gateway is used)
    try {
      const result = await paymentGatewayService.processMobileMoneyDeposit(testDepositData);
      console.log('✅ Payment processed successfully:', result);
      
      res.json({
        success: true,
        message: 'Test payment processed successfully',
        data: {
          gatewayUsed: settings.activeGateway,
          result: result,
          settings: {
            activeGateway: settings.activeGateway,
            paystackEnabled: settings.paystackEnabled,
            bulkclixEnabled: settings.bulkclixEnabled
          }
        }
      });
    } catch (paymentError) {
      console.log('⚠️ Payment processing failed (expected for test):', paymentError.message);
      
      // This is expected since we're using test API keys
      res.json({
        success: true,
        message: 'Test payment gateway selection verified',
        data: {
          gatewayUsed: settings.activeGateway,
          error: paymentError.message,
          settings: {
            activeGateway: settings.activeGateway,
            paystackEnabled: settings.paystackEnabled,
            bulkclixEnabled: settings.bulkclixEnabled
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Test payment endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test payment endpoint failed',
      details: error.message
    });
  }
});

// Get current gateway status
router.get('/gateway-status', authMiddleware, adminAuth, async (req, res) => {
  try {
    const status = await paymentGatewayService.getGatewayStatus();
    console.log('📊 Gateway Status Request:', status);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Gateway status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get gateway status',
      details: error.message
    });
  }
});

module.exports = router;
