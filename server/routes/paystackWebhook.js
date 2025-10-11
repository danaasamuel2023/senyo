const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const { Transaction, User, Wallet } = require('../schema/schema');
const WalletService = require('../services/walletService');

/**
 * Ensure database connection is ready before proceeding
 */
const ensureDatabaseReady = async () => {
  // Simple check - if connection is ready, proceed
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  // If not ready, wait briefly for connection
  console.log(`[WEBHOOK] Database not ready, waiting...`);
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once('connected', resolve);
    }
  });
  
  console.log(`[WEBHOOK] Database connection ready`);
  return true;
};

// Paystack webhook secret (should be set in environment variables)
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || 'paystack_webhook_secret_2024';

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
 * Process wallet transaction (helper function)
 */
const processWalletTransaction = async (wallet, reference, amount) => {
  try {
    // Find the specific transaction
    const transaction = wallet.transactions.find(t => t.reference === reference);
    if (!transaction) {
      console.log(`[WEBHOOK] ❌ Transaction not found: ${reference}`);
      return { success: false, error: 'Transaction not found' };
    }
    
    // Check if already processed
    if (transaction.status === 'completed') {
      console.log(`[WEBHOOK] ✅ Transaction already processed: ${reference}`);
      return {
        success: true,
        message: 'Payment already processed',
        data: {
          reference,
          amount: amount / 100,
          newBalance: wallet.balance,
          fromCache: true
        }
      };
    }
    
    // Process the payment using WalletService
    const result = await WalletService.updateWalletBalance(
      wallet.userId,
      transaction.amount,
      'deposit',
      {
        reference: transaction.reference,
        description: 'Wallet deposit via Paystack (webhook)',
        gateway: 'paystack',
        paystackReference: reference
      }
    );
    
    if (result.success) {
      // Update transaction status (re-fetch wallet to avoid version conflict)
      const updatedWallet = await Wallet.findOne({ userId: wallet.userId });
      const transactionIndex = updatedWallet.transactions.findIndex(t => t.reference === reference);
      if (transactionIndex !== -1) {
        updatedWallet.transactions[transactionIndex].status = 'completed';
        updatedWallet.transactions[transactionIndex].completedAt = new Date();
        updatedWallet.transactions[transactionIndex].balanceAfter = result.newBalance;
        await updatedWallet.save();
      }
      
      console.log(`[WEBHOOK] ✅ Payment processed successfully: ${reference}`);
      console.log(`[WEBHOOK] Amount: ₵${amount / 100}, New Balance: ₵${result.newBalance}`);
      
      // Trigger frontend balance update via custom event
      try {
        const { User } = require('../schema/schema');
        const user = await User.findById(wallet.userId);
        if (user) {
          console.log(`[WEBHOOK] 📡 Broadcasting balance update for user ${user._id}`);
          // This will be handled by the frontend to update balance in real-time
          global.balanceUpdateEvents = global.balanceUpdateEvents || new Map();
          global.balanceUpdateEvents.set(user._id, {
            newBalance: result.newBalance,
            reference,
            amount: amount / 100,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('[WEBHOOK] Error broadcasting balance update:', error);
      }
      
      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          reference,
          amount: amount / 100,
          newBalance: result.newBalance,
          fromCache: false
        }
      };
    } else {
      console.log(`[WEBHOOK] ❌ Payment processing failed: ${reference} - ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`[WEBHOOK] ❌ Error processing wallet transaction: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Process successful payment with wallet integration
 */
const processSuccessfulPayment = async (transactionData) => {
  try {
    const { reference, amount, status, gateway_fees, customer } = transactionData;
    
    console.log(`[WEBHOOK] Processing successful payment: ${reference}`);
    
    // Ensure database connection is ready
    await ensureDatabaseReady();
    
    // Check if this is a deposit transaction (starts with DEPOSIT-)
    if (reference.startsWith('DEPOSIT-')) {
      // Find the wallet that contains this transaction
      const { Wallet } = require('../schema/schema');
      const wallet = await Wallet.findOne({ 
        'transactions.reference': reference 
      });
      
      if (!wallet) {
        console.log(`[WEBHOOK] ❌ Wallet transaction not found: ${reference}`);
        console.log(`[WEBHOOK] Attempting to find user by transaction reference...`);
        
        // Try to find the transaction in the Transaction collection
        const transaction = await Transaction.findOne({ reference });
        if (transaction) {
          console.log(`[WEBHOOK] Found transaction in Transaction collection, creating wallet...`);
          // Create wallet for the user if it doesn't exist
          const user = await User.findById(transaction.userId);
          if (user) {
            const newWallet = new Wallet({
              userId: user._id,
              balance: user.walletBalance || 0,
              currency: 'GHS',
              frozen: false,
              transactions: [{
                type: 'deposit',
                amount: transaction.amount,
                balanceBefore: user.walletBalance || 0,
                balanceAfter: (user.walletBalance || 0) + transaction.amount,
                description: 'Wallet deposit via Paystack (webhook recovery)',
                reference: transaction.reference,
                status: 'pending',
                metadata: {
                  gateway: 'paystack',
                  paystackReference: reference,
                  recovered: true
                },
                createdAt: new Date()
              }]
            });
            await newWallet.save();
            console.log(`[WEBHOOK] ✅ Created wallet for user ${user._id}`);
            // Continue with the wallet we just created
            const createdWallet = await Wallet.findOne({ userId: user._id });
            return await processWalletTransaction(createdWallet, reference, amount);
          } else {
            console.log(`[WEBHOOK] ❌ User not found for transaction ${reference}`);
            return { success: false, error: 'User not found for transaction' };
          }
        } else {
          console.log(`[WEBHOOK] ❌ Transaction not found in any collection: ${reference}`);
          return { success: false, error: 'Transaction not found' };
        }
      }
      
      // Process the wallet transaction using the helper function
      return await processWalletTransaction(wallet, reference, amount);
    } else {
      // For non-deposit transactions, use the original WalletService method
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
    }
  } catch (error) {
    console.log(`[WEBHOOK] ❌ Error processing payment: ${error.message}`);
    console.log(`[WEBHOOK] Error stack:`, error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * Paystack webhook endpoint
 */
router.post('/paystack-webhook', verifyPaystackSignature, async (req, res) => {
  try {
    // Ensure database connection is ready before processing
    await ensureDatabaseReady();
    
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
