const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { Order, User } = require('../schema/schema');

// ============================================
// PAYMENT PROCESSING
// ============================================

// Initialize payment (Paystack integration)
router.post('/initialize', auth, async (req, res) => {
  try {
    const { orderId, amount, email, phoneNumber } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!orderId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and email are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // For demo purposes, we'll simulate Paystack initialization
    // In production, you would integrate with actual Paystack API
    const paymentReference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate Paystack response
    const paystackResponse = {
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `https://checkout.paystack.com/${paymentReference}`,
        access_code: paymentReference,
        reference: paymentReference
      }
    };

    // Update order with payment reference
    order.paymentReference = paymentReference;
    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      payment: {
        reference: paymentReference,
        authorizationUrl: paystackResponse.data.authorization_url,
        amount: amount * 100, // Paystack expects amount in kobo
        email,
        phoneNumber
      }
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify payment (Paystack webhook)
router.post('/verify', async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Find order by payment reference
    const order = await Order.findOne({ paymentReference: reference });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // For demo purposes, we'll simulate successful payment
    // In production, you would verify with Paystack API
    const paymentVerified = true; // Simulate successful verification

    if (paymentVerified) {
      // Update order status
      order.paymentStatus = 'completed';
      order.status = 'completed';
      order.paidAt = new Date();
      await order.save();

      // Update agent earnings if this is an agent store order
      if (order.agentId) {
        const agent = await User.findById(order.agentId);
        if (agent && agent.agentMetadata) {
          const commissionRate = agent.agentMetadata.commissionRate || 10; // Default 10% if not set
          const commission = order.totalAmount * (commissionRate / 100); // Use actual commission rate
          agent.agentMetadata.availableBalance = (agent.agentMetadata.availableBalance || 0) + commission;
          agent.agentMetadata.totalEarnings = (agent.agentMetadata.totalEarnings || 0) + commission;
          await agent.save();
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount
        }
      });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      order.status = 'failed';
      await order.save();

      res.json({
        success: false,
        message: 'Payment verification failed',
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      payment: {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        totalAmount: order.totalAmount,
        paidAt: order.paidAt
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// MOBILE MONEY PAYMENT
// ============================================

// Initialize mobile money payment
router.post('/mobile-money', auth, async (req, res) => {
  try {
    const { orderId, phoneNumber, network } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!orderId || !phoneNumber || !network) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, phone number, and network are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // Generate mobile money reference
    const mobileMoneyReference = `MM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update order with mobile money payment info
    order.paymentMethod = 'mobile_money';
    order.paymentReference = mobileMoneyReference;
    order.paymentStatus = 'pending';
    order.mobileMoneyInfo = {
      phoneNumber,
      network: network.toUpperCase()
    };
    await order.save();

    // For demo purposes, we'll simulate mobile money payment
    // In production, you would integrate with actual mobile money API
    res.json({
      success: true,
      message: 'Mobile money payment initialized',
      payment: {
        reference: mobileMoneyReference,
        phoneNumber,
        network: network.toUpperCase(),
        amount: order.totalAmount,
        instructions: `You will receive a prompt on ${phoneNumber} to confirm payment of GHS ${order.totalAmount}`
      }
    });

  } catch (error) {
    console.error('Initialize mobile money payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// PAYMENT METHODS
// ============================================

// Get available payment methods
router.get('/methods', async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'paystack',
        name: 'Paystack',
        type: 'card',
        description: 'Pay with Visa, Mastercard, or Verve',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'mtn_mobile_money',
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        description: 'Pay with MTN Mobile Money',
        icon: 'smartphone',
        enabled: true
      },
      {
        id: 'vodafone_cash',
        name: 'Vodafone Cash',
        type: 'mobile_money',
        description: 'Pay with Vodafone Cash',
        icon: 'smartphone',
        enabled: true
      },
      {
        id: 'airteltigo_money',
        name: 'AirtelTigo Money',
        type: 'mobile_money',
        description: 'Pay with AirtelTigo Money',
        icon: 'smartphone',
        enabled: true
      }
    ];

    res.json({
      success: true,
      paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
