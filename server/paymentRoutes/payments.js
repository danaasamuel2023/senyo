const express = require('express');
const router = express.Router();
const verifyAuth = require('../middlewareUser/middleware');
const { DataPurchase, User, Wallet } = require('../schema/schema');
const axios = require('axios');

// PayStack Configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Payment methods configuration for PayStack
const PAYMENT_METHODS = {
  mobile_money: {
    name: 'Mobile Money',
    icon: '📱',
    providers: ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'],
    processingTime: 'Instant',
    fees: 0.015, // 1.5% fee (PayStack standard)
    paystackChannel: 'mobile_money'
  },
  bank_transfer: {
    name: 'Bank Transfer',
    icon: '🏦',
    providers: ['GCB Bank', 'Ecobank', 'Stanbic Bank', 'Fidelity Bank'],
    processingTime: '1-3 hours',
    fees: 0.01, // 1% fee
    paystackChannel: 'bank'
  },
  card: {
    name: 'Card Payment',
    icon: '💳',
    providers: ['Visa', 'Mastercard', 'American Express'],
    processingTime: 'Instant',
    fees: 0.035, // 3.5% fee
    paystackChannel: 'card'
  },
  wallet: {
    name: 'Wallet Balance',
    icon: '💰',
    providers: ['Account Balance'],
    processingTime: 'Instant',
    fees: 0, // No fees
    paystackChannel: null
  }
};

// Get available payment methods
router.get('/methods', verifyAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's wallet balance
    const wallet = await Wallet.findOne({ userId });
    const walletBalance = wallet?.balance || 0;

    // Format payment methods with user-specific data
    const methods = Object.entries(PAYMENT_METHODS).map(([key, method]) => ({
      id: key,
      name: method.name,
      icon: method.icon,
      providers: method.providers,
      processingTime: method.processingTime,
      fees: method.fees,
      available: key === 'wallet' ? walletBalance > 0 : true,
      walletBalance: key === 'wallet' ? walletBalance : null
    }));

    res.json({
      success: true,
      paymentMethods: methods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Initialize PayStack transaction
router.post('/initialize', verifyAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      orderId, 
      paymentMethod, 
      amount, 
      email,
      phoneNumber,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!orderId || !paymentMethod || !amount || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID, payment method, amount, and email are required' 
      });
    }

    // Find the order
    const order = await DataPurchase.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to order' 
      });
    }

    // Check if order is already paid
    if (order.status === 'completed' || order.status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is already paid' 
      });
    }

    // Calculate fees
    const methodConfig = PAYMENT_METHODS[paymentMethod];
    const fees = amount * (methodConfig?.fees || 0);
    const totalAmount = amount + fees;

    // Handle wallet payments separately
    if (paymentMethod === 'wallet') {
      const walletResult = await processWalletPayment(userId, totalAmount, order);
      
      if (walletResult.success) {
        // Update order status
        order.status = 'completed';
        order.paymentMethod = paymentMethod;
        order.paymentReference = walletResult.reference;
        order.paidAt = new Date();
        order.fees = fees;
        order.totalAmount = totalAmount;
        await order.save();

        return res.json({
          success: true,
          message: 'Payment processed successfully',
          payment: {
            reference: walletResult.reference,
            amount: totalAmount,
            fees: fees,
            method: paymentMethod,
            status: 'completed'
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: walletResult.message || 'Wallet payment failed'
        });
      }
    }

    // Initialize PayStack transaction
    const paystackData = {
      email: email,
      amount: Math.round(totalAmount * 100), // Convert to kobo (PayStack uses kobo)
      currency: 'GHS',
      reference: `ORDER_${orderId}_${Date.now()}`,
      metadata: {
        orderId: orderId,
        userId: userId,
        paymentMethod: paymentMethod,
        ...metadata
      },
      channels: methodConfig.paystackChannel ? [methodConfig.paystackChannel] : ['card', 'bank', 'mobile_money']
    };

    // Add phone number for mobile money
    if (paymentMethod === 'mobile_money' && phoneNumber) {
      paystackData.metadata.phone = phoneNumber;
    }

    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paystackData,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paystackResponse.data.status) {
      // Update order with PayStack reference
      order.paymentMethod = paymentMethod;
      order.paymentReference = paystackData.reference;
      order.fees = fees;
      order.totalAmount = totalAmount;
      order.paystackReference = paystackResponse.data.data.reference;
      await order.save();

      res.json({
        success: true,
        message: 'Payment initialized successfully',
        payment: {
          authorizationUrl: paystackResponse.data.data.authorization_url,
          accessCode: paystackResponse.data.data.access_code,
          reference: paystackData.reference,
          amount: totalAmount,
          fees: fees,
          method: paymentMethod,
          status: 'pending'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify PayStack payment
router.post('/verify', verifyAuth, async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }

    // Verify with PayStack
    const paystackResponse = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
      const transaction = paystackResponse.data.data;
      
      // Find the order
      const order = await DataPurchase.findOne({ 
        paystackReference: reference,
        userId: req.user._id 
      });

      if (order && order.status !== 'completed') {
        // Update order status
        order.status = 'completed';
        order.paidAt = new Date();
        order.paystackTransactionId = transaction.id;
        order.paystackFees = transaction.fees;
        await order.save();

        res.json({
          success: true,
          message: 'Payment verified successfully',
          payment: {
            reference: reference,
            amount: transaction.amount / 100, // Convert from kobo
            fees: transaction.fees / 100,
            method: order.paymentMethod,
            status: 'completed',
            paidAt: order.paidAt
          }
        });
      } else {
        res.json({
          success: true,
          message: 'Payment already processed',
          payment: {
            reference: reference,
            status: 'completed'
          }
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Process wallet payment
async function processWalletPayment(userId, amount, order) {
  try {
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet || wallet.balance < amount) {
      return {
        success: false,
        message: 'Insufficient wallet balance'
      };
    }

    // Deduct from wallet
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount: amount,
      description: `Payment for order #${order._id}`,
      reference: `PAY_${Date.now()}`,
      createdAt: new Date()
    });
    
    await wallet.save();

    return {
      success: true,
      reference: `WALLET_${Date.now()}`,
      message: 'Wallet payment successful'
    };
  } catch (error) {
    console.error('Wallet payment error:', error);
    return {
      success: false,
      message: 'Wallet payment failed'
    };
  }
}

// PayStack Webhook Handler
router.post('/webhook', async (req, res) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    const body = req.body;

    // Verify webhook signature
    const crypto = require('crypto');
    const secret = PAYSTACK_SECRET_KEY;
    const hashCheck = crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('hex');

    if (hash !== hashCheck) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = body.event;
    const data = body.data;

    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(data);
        break;
      case 'charge.failed':
        await handleFailedPayment(data);
        break;
      case 'transfer.success':
        await handleSuccessfulTransfer(data);
        break;
      case 'transfer.failed':
        await handleFailedTransfer(data);
        break;
      default:
        console.log(`Unhandled PayStack event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('PayStack webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Handle successful payment
async function handleSuccessfulPayment(transaction) {
  try {
    const order = await DataPurchase.findOne({ 
      paystackReference: transaction.reference 
    });

    if (order && order.status !== 'completed') {
      order.status = 'completed';
      order.paidAt = new Date();
      order.paystackTransactionId = transaction.id;
      order.paystackFees = transaction.fees;
      await order.save();

      console.log(`Order ${order._id} payment completed via PayStack`);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(transaction) {
  try {
    const order = await DataPurchase.findOne({ 
      paystackReference: transaction.reference 
    });

    if (order && order.status === 'pending') {
      order.status = 'failed';
      order.paymentFailureReason = transaction.gateway_response;
      await order.save();

      console.log(`Order ${order._id} payment failed via PayStack`);
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Handle successful transfer (for refunds)
async function handleSuccessfulTransfer(transfer) {
  try {
    console.log(`Transfer ${transfer.reference} completed successfully`);
    // Handle successful refund transfer
  } catch (error) {
    console.error('Error handling successful transfer:', error);
  }
}

// Handle failed transfer
async function handleFailedTransfer(transfer) {
  try {
    console.log(`Transfer ${transfer.reference} failed`);
    // Handle failed refund transfer
  } catch (error) {
    console.error('Error handling failed transfer:', error);
  }
}

// Get payment history
router.get('/history', verifyAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, method, status } = req.query;

    const query = { userId: userId };
    if (method) query.paymentMethod = method;
    if (status) query.status = status;

    const orders = await DataPurchase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('agentId', 'name agentCode');

    const totalOrders = await DataPurchase.countDocuments(query);

    res.json({
      success: true,
      payments: orders.map(order => ({
        id: order._id,
        amount: order.amount,
        totalAmount: order.totalAmount,
        fees: order.fees,
        paymentMethod: order.paymentMethod,
        paymentProvider: order.paymentProvider,
        paymentReference: order.paymentReference,
        status: order.status,
        agent: {
          name: order.agentId?.name,
          code: order.agentId?.agentCode
        },
        product: order.productName,
        createdAt: order.createdAt,
        paidAt: order.paidAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify payment status
router.get('/verify/:reference', verifyAuth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    const order = await Order.findOne({ 
      paymentReference: reference,
      customerId: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment reference not found' 
      });
    }

    res.json({
      success: true,
      payment: {
        reference: order.paymentReference,
        status: order.status,
        amount: order.totalAmount,
        method: order.paymentMethod,
        provider: order.paymentProvider,
        createdAt: order.createdAt,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Refund payment
router.post('/refund/:orderId', verifyAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await DataPurchase.findOne({ 
      _id: orderId,
      userId: userId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only completed orders can be refunded' 
      });
    }

    // Process refund based on payment method
    let refundResult;
    
    switch (order.paymentMethod) {
      case 'wallet':
        refundResult = await processWalletRefund(userId, order);
        break;
      case 'mobile_money':
        refundResult = await processMobileMoneyRefund(order);
        break;
      case 'card':
        refundResult = await processCardRefund(order);
        break;
      case 'bank_transfer':
        refundResult = await processBankRefund(order);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Refund not supported for this payment method' 
        });
    }

    if (refundResult.success) {
      // Update order status
      order.status = 'refunded';
      order.refundReason = reason;
      order.refundedAt = new Date();
      order.refundReference = refundResult.reference;
      await order.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refund: {
          reference: refundResult.reference,
          amount: order.totalAmount,
          reason: reason,
          processedAt: order.refundedAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: refundResult.message || 'Refund processing failed'
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Refund processing functions
async function processWalletRefund(userId, order) {
  try {
    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found'
      };
    }

    // Add refund to wallet
    wallet.balance += order.totalAmount;
    wallet.transactions.push({
      type: 'credit',
      amount: order.totalAmount,
      description: `Refund for order #${order._id}`,
      reference: `REF_${Date.now()}`,
      createdAt: new Date()
    });
    
    await wallet.save();

    return {
      success: true,
      reference: `WALLET_REF_${Date.now()}`
    };
  } catch (error) {
    console.error('Wallet refund error:', error);
    return {
      success: false,
      message: 'Wallet refund failed'
    };
  }
}

async function processMobileMoneyRefund(order) {
  // Simulate mobile money refund
  return {
    success: true,
    reference: `MM_REF_${Date.now()}`
  };
}

async function processCardRefund(order) {
  // Simulate card refund
  return {
    success: true,
    reference: `CARD_REF_${Date.now()}`
  };
}

async function processBankRefund(order) {
  // Simulate bank refund
  return {
    success: true,
    reference: `BANK_REF_${Date.now()}`
  };
}

module.exports = router;
