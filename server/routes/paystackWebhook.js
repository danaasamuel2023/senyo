const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Transaction, User, Wallet } = require('../schema/schema');
const WalletService = require('../services/walletService');

// Paystack webhook secret (should be set in environment variables)
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || 'paystack_webhook_secret';

/**
 * Verify Paystack webhook signature
 */
const verifyPaystackSignature = (req, res, next) => {
  const signature = req.headers['x-paystack-signature'];
  
  if (!signature) {
    console.log('[WEBHOOK] ❌ Missing Paystack signature');
    return res.status(400).json({
      success: false,
      error: 'Missing Paystack signature'
    });
  }

  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (hash !== signature) {
    console.log('[WEBHOOK] ❌ Invalid Paystack signature');
    return res.status(400).json({
      success: false,
      error: 'Invalid Paystack signature'
    });
  }

  console.log('[WEBHOOK] ✅ Paystack signature verified');
  next();
};

/**
 * Process successful payment with in-memory caching
 */
const processSuccessfulPayment = async (transactionData) => {
  try {
    const { reference, amount, status, gateway_fees, customer } = transactionData;
    
    console.log(`[WEBHOOK] Processing successful payment: ${reference}`);
    
    // Use WalletService for cached processing
    const result = await WalletService.processPayment(reference);
    
    if (result.success) {
      console.log(`[WEBHOOK] ✅ Payment processed successfully: ${reference}`);
      console.log(`[WEBHOOK] Amount: ₵${amount / 100}, New Balance: ₵${result.newBalance}`);
      
      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          reference,
          amount: amount / 100,
          newBalance: result.newBalance,
          fromCache: result.fromCache || false
        }
      };
    } else {
      console.log(`[WEBHOOK] ❌ Payment processing failed: ${reference} - ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`[WEBHOOK] ❌ Error processing payment: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Paystack webhook endpoint
 */
router.post('/paystack-webhook', verifyPaystackSignature, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log(`[WEBHOOK] Received Paystack webhook: ${event}`);
    console.log(`[WEBHOOK] Reference: ${data?.reference}`);
    console.log(`[WEBHOOK] Status: ${data?.status}`);
    console.log(`[WEBHOOK] Amount: ${data?.amount}`);

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        console.log('[WEBHOOK] Processing successful charge');
        const result = await processSuccessfulPayment(data);
        
        if (result.success) {
          return res.json({
            success: true,
            message: 'Webhook processed successfully',
            data: result.data
          });
        } else {
          return res.status(400).json({
            success: false,
            error: result.error
          });
        }

      case 'charge.failed':
        console.log('[WEBHOOK] Processing failed charge');
        // Update transaction status to failed
        const failedTransaction = await Transaction.findOne({ reference: data.reference });
        if (failedTransaction) {
          failedTransaction.status = 'failed';
          failedTransaction.failedAt = new Date();
          await failedTransaction.save();
        }
        
        return res.json({
          success: true,
          message: 'Failed charge processed'
        });

      case 'charge.dispute.created':
        console.log('[WEBHOOK] Processing charge dispute');
        // Handle dispute if needed
        return res.json({
          success: true,
          message: 'Dispute processed'
        });

      default:
        console.log(`[WEBHOOK] Unhandled event: ${event}`);
        return res.json({
          success: true,
          message: 'Webhook received but event not processed'
        });
    }
  } catch (error) {
    console.log(`[WEBHOOK] ❌ Webhook processing error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

/**
 * Webhook test endpoint (GET method for testing)
 */
router.get('/paystack-webhook', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed. Use POST for webhook processing.'
  });
});

module.exports = router;
