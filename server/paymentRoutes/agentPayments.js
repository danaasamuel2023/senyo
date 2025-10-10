const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { User, Order, Transaction } = require('../schema/schema');

// ============================================
// AGENT PAYMENT PROCESSING
// ============================================

// Process agent store payment
router.post('/process', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod, agentCode } = req.body;
    const userId = req.user._id;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Find the agent
    const agent = await User.findOne({ agentCode: agentCode });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Calculate commission
    const commissionRate = agent.agentMetadata?.commissionRate || 10;
    const commission = order.totalAmount * (commissionRate / 100);
    const platformFee = order.totalAmount * 0.05; // 5% platform fee
    const netAmount = order.totalAmount - commission - platformFee;

    // Create transaction record
    const transaction = new Transaction({
      userId: userId,
      agentId: agent._id,
      orderId: orderId,
      amount: order.totalAmount,
      commission: commission,
      platformFee: platformFee,
      netAmount: netAmount,
      paymentMethod: paymentMethod,
      status: 'pending',
      type: 'agent_store_purchase'
    });

    await transaction.save();

    // Update order with transaction ID
    order.transactionId = transaction._id;
    order.status = 'paid';
    await order.save();

    // Update agent earnings
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }
    
    agent.agentMetadata.pendingBalance = (agent.agentMetadata.pendingBalance || 0) + commission;
    agent.agentMetadata.totalEarnings = (agent.agentMetadata.totalEarnings || 0) + commission;
    
    await agent.save();

    // Process actual payment (integrate with Paystack)
    const paymentResult = await processPayment({
      amount: order.totalAmount * 100, // Convert to kobo
      email: req.user.email,
      reference: transaction._id.toString(),
      callback_url: process.env.NODE_ENV === 'production' 
        ? `${process.env.FRONTEND_URL || 'https://www.unlimiteddatagh.com'}/api/payment/callback`
        : `http://localhost:3000/api/payment/callback`,
      metadata: {
        orderId: orderId,
        agentCode: agentCode,
        userId: userId
      }
    });

    if (paymentResult.success) {
      transaction.paymentReference = paymentResult.reference;
      transaction.status = 'processing';
      await transaction.save();

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        paymentUrl: paymentResult.authorization_url,
        transaction: transaction
      });
    } else {
      throw new Error('Payment processing failed');
    }

  } catch (error) {
    console.error('Agent payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// Verify agent store payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { reference } = req.body;

    // Verify payment with Paystack
    const verificationResult = await verifyPayment(reference);

    if (verificationResult.success) {
      // Find transaction
      const transaction = await Transaction.findOne({ paymentReference: reference });
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Update transaction status
      transaction.status = 'completed';
      transaction.verifiedAt = new Date();
      await transaction.save();

      // Update order status
      const order = await Order.findById(transaction.orderId);
      if (order) {
        order.status = 'completed';
        order.completedAt = new Date();
        await order.save();
      }

      // Process data delivery (integrate with data provider)
      await processDataDelivery(order);

      res.json({
        success: true,
        message: 'Payment verified and order completed',
        transaction: transaction,
        order: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: verificationResult.message
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Get agent earnings
router.get('/earnings', auth, async (req, res) => {
  try {
    const agentId = req.user._id;

    // Get agent's transactions
    const transactions = await Transaction.find({ agentId: agentId })
      .populate('orderId', 'totalAmount items')
      .sort({ createdAt: -1 });

    // Calculate earnings summary
    const totalEarnings = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.commission, 0);

    const pendingEarnings = transactions
      .filter(t => t.status === 'processing')
      .reduce((sum, t) => sum + t.commission, 0);

    const thisMonthEarnings = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const currentMonth = new Date();
        return t.status === 'completed' && 
               transactionDate.getMonth() === currentMonth.getMonth() &&
               transactionDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, t) => sum + t.commission, 0);

    res.json({
      success: true,
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        thisMonth: thisMonthEarnings,
        transactions: transactions.slice(0, 50) // Last 50 transactions
      }
    });

  } catch (error) {
    console.error('Get agent earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
});

// Request withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { amount, bankDetails } = req.body;

    // Get agent
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const availableBalance = agent.agentMetadata?.availableBalance || 0;
    
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

    // Create withdrawal request
    const withdrawal = new Transaction({
      userId: agentId,
      amount: amount,
      type: 'withdrawal',
      status: 'pending',
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

// ============================================
// HELPER FUNCTIONS
// ============================================

// Process payment with Paystack
async function processPayment(paymentData) {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack payment error:', error);
    return { success: false, message: error.message };
  }
}

// Verify payment with Paystack
async function verifyPayment(reference) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { success: false, message: error.message };
  }
}

// Process data delivery
async function processDataDelivery(order) {
  try {
    // Integrate with your data provider API
    // This is a placeholder - replace with actual data provider integration
    
    for (const item of order.items) {
      // Send data to recipient phone number
      const deliveryResult = await sendDataBundle({
        phoneNumber: item.phoneNumber,
        network: item.network,
        amount: item.capacity,
        reference: order._id.toString()
      });

      if (deliveryResult.success) {
        console.log(`Data delivered successfully to ${item.phoneNumber}`);
      } else {
        console.error(`Data delivery failed for ${item.phoneNumber}:`, deliveryResult.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Data delivery error:', error);
    return { success: false, message: error.message };
  }
}

// Send data bundle (placeholder)
async function sendDataBundle(data) {
  // Replace this with actual data provider API call
  // Example: Hubtel, MTN API, etc.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Data bundle sent successfully' });
    }, 2000);
  });
}

module.exports = router;
