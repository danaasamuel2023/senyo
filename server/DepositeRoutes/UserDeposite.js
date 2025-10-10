const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Transaction, User, Wallet } = require('../schema/schema');
const axios = require('axios');
const crypto = require('crypto');
const {
  rateLimitPayments,
  verifyPaystackSignature,
  validateDepositAmount,
  preventDuplicateDeposits,
  checkBlocked,
  validateReference,
  sanitizeInput,
  auditLog
} = require('../middleware/paystackSecurity');

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; 
if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY not set. Payment operations will fail.');
}
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initiate Deposit
router.post('/deposit',
  checkBlocked,
  rateLimitPayments,
  sanitizeInput,
  validateDepositAmount,
  preventDuplicateDeposits(Transaction),
  auditLog('DEPOSIT_INITIATED'),
  async (req, res) => {
  try {
    const { userId, amount, totalAmountWithFee, email } = req.body;
    
    console.log('[DEPOSIT] Request received:', { 
      userId, 
      amount, 
      totalAmountWithFee, 
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Validate input
    if (!userId || !amount || amount < 10) {
      console.log('[DEPOSIT] ❌ Validation failed:', { userId, amount });
      return res.status(400).json({ 
        success: false,
        error: 'Minimum deposit amount is ₵10' 
      });
    }

    // Find user to get their email and check account status
    console.log('[DEPOSIT] Looking for user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('[DEPOSIT] ❌ User not found for ID:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    console.log('[DEPOSIT] ✅ User found:', { id: user._id, email: user.email });

    // Check if user's account is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
        message: 'Your account has been disabled. Deposits are not allowed.',
        disableReason: user.disableReason || 'No reason provided'
      });
    }

    // Generate a unique transaction reference
    const reference = `DEP-${crypto.randomBytes(10).toString('hex')}-${Date.now()}`;

    // Create a pending transaction - store the original amount
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount, // This is the BASE amount WITHOUT fee that will be added to wallet
      status: 'pending',
      reference,
      gateway: 'paystack'
    });

    await transaction.save();

    // Initiate Paystack payment with the total amount including fee
    // Fixed: Parse amount to float, multiply by 100, then round to integer
    const paystackAmount = totalAmountWithFee ? 
      Math.round(parseFloat(totalAmountWithFee) * 100) : // If provided, use total with fee
      Math.round(parseFloat(amount) * 100); // Fallback to base amount if no total provided
    
    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email || user.email,
        amount: paystackAmount, // Convert to pesewas (smallest currency unit for GHS)
        currency: 'GHS',
        reference,
        callback_url: process.env.NODE_ENV === 'production' 
          ? `${process.env.FRONTEND_URL || 'https://www.unlimiteddatagh.com'}/payment/callback?source=unlimitedata`
          : `http://localhost:3000/payment/callback?source=unlimitedata`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return Paystack payment URL
    return res.json({
      success: true,
      message: 'Deposit initiated',
      paystackUrl: paystackResponse.data.data.authorization_url,
      reference
    });

  } catch (error) {
    console.error('Deposit Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// FIXED: Added transaction locking mechanism using processing field
// Process a successful payment and update user wallet
async function processSuccessfulPayment(reference, idempotencyKey = null) {
  console.log(`[PAYMENT] Starting to process payment for reference: ${reference}`);
  
  // Generate idempotency key if not provided
  if (!idempotencyKey) {
    idempotencyKey = `payment_${reference}_${Date.now()}`;
  }
  
  // First, try to find any transaction with this reference regardless of status
  const existingTransaction = await Transaction.findOne({ reference });
  console.log(`[PAYMENT] Found transaction:`, existingTransaction ? {
    id: existingTransaction._id,
    status: existingTransaction.status,
    amount: existingTransaction.amount,
    userId: existingTransaction.userId,
    processing: existingTransaction.processing,
    idempotencyKey: existingTransaction.idempotencyKey
  } : 'NOT FOUND');

  // Check if already processed with same idempotency key
  if (existingTransaction && existingTransaction.idempotencyKey === idempotencyKey) {
    console.log(`[PAYMENT] Transaction already processed with same idempotency key`);
    return { 
      success: true, 
      message: 'Transaction already processed',
      newBalance: existingTransaction.newBalance || 0
    };
  }

  // Use atomic operation with multiple conditions to prevent race conditions
  const transaction = await Transaction.findOneAndUpdate(
    { 
      reference, 
      status: 'pending',
      $or: [
        { processing: { $ne: true } },
        { processing: { $exists: false } }
      ],
      // Add timeout for stuck processing (5 minutes)
      $or: [
        { processingStartedAt: { $exists: false } },
        { processingStartedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } }
      ]
    },
    { 
      $set: { 
        processing: true,
        processingStartedAt: new Date(),
        idempotencyKey: idempotencyKey
      } 
    },
    { new: true }
  );

  if (!transaction) {
    console.log(`[PAYMENT] Transaction ${reference} not found or already processed/processing`);
    
    // Check if it's already completed
    if (existingTransaction && existingTransaction.status === 'completed') {
      console.log(`[PAYMENT] Transaction already completed`);
      return { 
        success: true, 
        message: 'Transaction already processed',
        newBalance: existingTransaction.newBalance || 0
      };
    }
    
    return { success: false, message: 'Transaction not found or already processed' };
  }

  try {
    console.log(`[PAYMENT] Processing transaction ${reference}, amount: ${transaction.amount}, idempotency: ${idempotencyKey}`);
    
    // Use database transaction for atomic operations
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Update transaction status atomically
        await Transaction.findByIdAndUpdate(
          transaction._id,
          { 
            $set: { 
              status: 'completed',
              completedAt: new Date(),
              processing: false
            }
          },
          { session }
        );
        console.log(`[PAYMENT] Transaction ${reference} marked as completed`);

        // Update user's wallet balance atomically
        const user = await User.findById(transaction.userId, null, { session });
        if (!user) {
          throw new Error(`User not found for transaction ${reference}`);
        }

        // Update User.walletBalance (used by frontend)
        const previousUserBalance = user.walletBalance;
        user.walletBalance += transaction.amount;
        await user.save({ session });
        
        // Find or create wallet for the user (for backend consistency)
        let wallet = await Wallet.findOne({ userId: transaction.userId }, null, { session });
        if (!wallet) {
          wallet = new Wallet({
            userId: transaction.userId,
            balance: 0,
            currency: 'GHS'
          });
          console.log(`[PAYMENT] Created new wallet for user ${transaction.userId}`);
        }
        
        const previousWalletBalance = wallet.balance;
        wallet.balance += transaction.amount;
        await wallet.save({ session });
        
        // Store the new balance in transaction for idempotency
        await Transaction.findByIdAndUpdate(
          transaction._id,
          { $set: { newBalance: user.walletBalance } },
          { session }
        );
        
        // Invalidate verification cache for this reference
        const cacheKey = `verify_${reference}`;
        verificationCache.delete(cacheKey);
        
        console.log(`[PAYMENT] ✅ User ${user._id} wallet updated successfully!`);
        console.log(`[PAYMENT]    User.walletBalance: GHS ${previousUserBalance} → GHS ${user.walletBalance}`);
        console.log(`[PAYMENT]    Wallet.balance: GHS ${previousWalletBalance} → GHS ${wallet.balance}`);
        console.log(`[PAYMENT]    Deposit amount: GHS ${transaction.amount}`);
        console.log(`[PAYMENT]    Idempotency key: ${idempotencyKey}`);
        console.log(`[PAYMENT]    Cache invalidated for reference: ${reference}`);
      });
      
      return { 
        success: true, 
        message: 'Deposit successful',
        newBalance: transaction.newBalance || 0,
        idempotencyKey: idempotencyKey
      };
      
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error(`[PAYMENT] ❌ Error processing payment:`, error);
    
    // Release the processing lock and log the error
    try {
      await Transaction.findByIdAndUpdate(transaction._id, {
        $set: { 
          processing: false,
          processingError: error.message,
          processingErrorAt: new Date()
        }
      });
    } catch (updateError) {
      console.error(`[PAYMENT] ❌ Failed to release processing lock:`, updateError);
    }
    
    throw error;
  }
}

// Cleanup stuck processing transactions (run periodically)
async function cleanupStuckProcessingTransactions() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const stuckTransactions = await Transaction.find({
      processing: true,
      processingStartedAt: { $lt: fiveMinutesAgo }
    });
    
    if (stuckTransactions.length > 0) {
      console.log(`[CLEANUP] Found ${stuckTransactions.length} stuck processing transactions`);
      
      for (const transaction of stuckTransactions) {
        console.log(`[CLEANUP] Releasing stuck transaction: ${transaction.reference}`);
        
        await Transaction.findByIdAndUpdate(transaction._id, {
          $set: {
            processing: false,
            processingError: 'Stuck processing - released by cleanup',
            processingErrorAt: new Date()
          }
        });
      }
    }
  } catch (error) {
    console.error('[CLEANUP] Error cleaning up stuck transactions:', error);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupStuckProcessingTransactions, 5 * 60 * 1000);

// Cleanup verification cache every 10 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  
  for (const [key, value] of verificationCache.entries()) {
    if (now - value.timestamp > maxAge) {
      verificationCache.delete(key);
      console.log(`[CACHE_CLEANUP] Removed expired cache entry: ${key}`);
    }
  }
}, 10 * 60 * 1000);

// Test webhook endpoint (for development)
router.post('/paystack/webhook/test', async (req, res) => {
  console.log('[WEBHOOK_TEST] Test webhook received:', JSON.stringify(req.body, null, 2));
  return res.json({ message: 'Test webhook received successfully' });
});

// Debug endpoint to check IP detection
router.get('/debug/ip', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  res.json({
    ip: ip,
    forwardedFor: forwardedFor,
    realIp: realIp,
    headers: req.headers,
    connection: req.connection.remoteAddress
  });
});

// Paystack webhook handler
router.post('/paystack/webhook',
  verifyPaystackSignature(PAYSTACK_SECRET_KEY),
  auditLog('PAYSTACK_WEBHOOK'),
  async (req, res) => {
  try {
    // Log incoming webhook
    console.log('Webhook received:', JSON.stringify({
      headers: req.headers['x-paystack-signature'],
      event: req.body.event,
      reference: req.body.data?.reference
    }));

    const secret = PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify Paystack signature
    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle successful charge
    if (event.event === 'charge.success') {
      const transaction = event.data;
      const { reference } = transaction;
      const metadata = transaction.metadata || {};
      
      console.log(`[WEBHOOK] Processing successful payment for reference: ${reference}`);
      console.log(`[WEBHOOK] Event data:`, JSON.stringify(event.data, null, 2));

      // Generate idempotency key for webhook processing
      const idempotencyKey = `webhook_${reference}_${event.data.id || Date.now()}`;

      // Verify amount matches (Paystack sends amount in kobo/pesewas)
      const webhookAmount = transaction.amount;
      const transactionRecord = await Transaction.findOne({ reference });
      
      if (transactionRecord) {
        const expectedAmount = transactionRecord.amount * 100; // Convert to pesewas
        
        if (Math.abs(webhookAmount - expectedAmount) > 1) {
          console.warn("⚠️ Payment amount mismatch", { 
            webhookAmount, 
            expectedAmount, 
            reference 
          });
          return res.status(400).json({ 
            success: false, 
            error: 'Amount mismatch' 
          });
        }
      }

      // Add retry logic for webhook processing
      let result;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          result = await processSuccessfulPayment(reference, idempotencyKey);
          console.log(`[WEBHOOK] Payment processing result (attempt ${retryCount + 1}):`, result);
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.error(`[WEBHOOK] ❌ Payment processing failed (attempt ${retryCount}/${maxRetries}):`, error.message);
          
          if (retryCount >= maxRetries) {
            console.error(`[WEBHOOK] ❌ All retry attempts failed for reference: ${reference}`);
            return res.status(500).json({ 
              success: false, 
              error: 'Payment processing failed after retries',
              reference: reference
            });
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`[WEBHOOK] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (result.success) {
        return res.json({ 
          success: true, 
          message: result.message,
          idempotencyKey: result.idempotencyKey
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          error: result.message 
        });
      }
    } else {
      console.log(`[WEBHOOK] Unhandled event type: ${event.event}`);
      return res.json({ message: 'Event received' });
    }

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// In-memory cache for verification results (5 minute TTL)
const verificationCache = new Map();

// Verify payment endpoint for client-side verification
router.get('/verify-payment',
  checkBlocked,
  rateLimitPayments,
  validateReference,
  auditLog('PAYMENT_VERIFICATION'),
  async (req, res) => {
  try {
    const { reference } = req.query;
    
    // Check cache first
    const cacheKey = `verify_${reference}`;
    const cachedResult = verificationCache.get(cacheKey);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < 5 * 60 * 1000) {
      console.log(`[VERIFY] ✅ Returning cached result for reference: ${reference}`);
      return res.json(cachedResult.data);
    }

    console.log(`[VERIFY] Verification request received for reference: ${reference}`);

    if (!reference) {
      console.log(`[VERIFY] ❌ No reference provided`);
      return res.status(400).json({ 
        success: false, 
        error: 'Reference is required' 
      });
    }

    // Find the transaction in our database
    const transaction = await Transaction.findOne({ reference });
    console.log(`[VERIFY] Transaction found:`, transaction ? {
      id: transaction._id,
      status: transaction.status,
      amount: transaction.amount,
      userId: transaction.userId
    } : 'NOT FOUND');

    if (!transaction) {
      console.log(`[VERIFY] ❌ Transaction not found in database`);
      const errorResponse = { 
        success: false, 
        error: 'Transaction not found' 
      };
      
      // Cache error result for 1 minute to prevent repeated failed lookups
      verificationCache.set(cacheKey, {
        data: errorResponse,
        timestamp: Date.now()
      });
      
      return res.status(404).json(errorResponse);
    }

    // If transaction is already completed, we can return success
    if (transaction.status === 'completed') {
      console.log(`[VERIFY] ✅ Transaction already completed, returning success`);
      const successResponse = {
        success: true,
        message: 'Payment already verified and completed',
        data: {
          reference,
          amount: transaction.amount,
          status: transaction.status
        }
      };
      
      // Cache successful result for 5 minutes
      verificationCache.set(cacheKey, {
        data: successResponse,
        timestamp: Date.now()
      });
      
      return res.json(successResponse);
    }

    // If transaction is still pending, verify with Paystack
    if (transaction.status === 'pending') {
      console.log(`[VERIFY] Transaction is pending, verifying with Paystack...`);
      try {
        // Verify the transaction status with Paystack
        const paystackResponse = await axios.get(
          `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const { data } = paystackResponse.data;
        console.log(`[VERIFY] Paystack response status:`, data.status);

        // If payment is successful
        if (data.status === 'success') {
          console.log(`[VERIFY] ✅ Paystack confirms payment successful, processing...`);
          // Process the payment using our common function
          const result = await processSuccessfulPayment(reference);
          
          if (result.success) {
            console.log(`[VERIFY] ✅ Payment processed successfully, wallet updated`);
            return res.json({
              success: true,
              message: 'Payment verified successfully',
              data: {
                reference,
                amount: transaction.amount,
                status: 'completed',
                newBalance: result.newBalance
              }
            });
          } else {
            console.log(`[VERIFY] ❌ Payment processing failed: ${result.message}`);
            return res.json({
              success: false,
              message: result.message,
              data: {
                reference,
                amount: transaction.amount,
                status: transaction.status
              }
            });
          }
        } else {
          console.log(`[VERIFY] ⚠️ Payment not successful, Paystack status: ${data.status}`);
          return res.json({
            success: false,
            message: 'Payment not completed',
            data: {
              reference,
              amount: transaction.amount,
              status: data.status
            }
          });
        }
      } catch (error) {
        console.error('[VERIFY] ❌ Paystack verification error:', error.message);
        console.error('[VERIFY] Error details:', error.response?.data || error);
        return res.status(500).json({
          success: false,
          error: 'Failed to verify payment with Paystack',
          details: error.message
        });
      }
    }

    // For failed or other statuses
    return res.json({
      success: false,
      message: `Payment status: ${transaction.status}`,
      data: {
        reference,
        amount: transaction.amount,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Verification Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all transactions for a user
router.get('/user-transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Build query filter
    const filter = { userId };
    
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
    console.error('Get Transactions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify pending transaction by ID
router.post('/verify-pending-transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if transaction is pending
    if (transaction.status !== 'pending') {
      return res.json({
        success: false,
        message: `Transaction is already ${transaction.status}`,
        data: {
          transactionId,
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status
        }
      });
    }
    
    // Verify with Paystack
    try {
      const paystackResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${transaction.reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { data } = paystackResponse.data;
      
      // If payment is successful
      if (data.status === 'success') {
        // Process the payment using our common function
        const result = await processSuccessfulPayment(transaction.reference);
        
        if (result.success) {
          return res.json({
            success: true,
            message: 'Transaction verified and completed successfully',
            data: {
              transactionId,
              reference: transaction.reference,
              amount: transaction.amount,
              status: 'completed'
            }
          });
        } else {
          return res.json({
            success: false,
            message: result.message,
            data: {
              transactionId,
              reference: transaction.reference,
              amount: transaction.amount,
              status: transaction.status
            }
          });
        }
      } else if (data.status === 'failed') {
        // Mark transaction as failed
        transaction.status = 'failed';
        await transaction.save();
        
        return res.json({
          success: false,
          message: 'Payment failed',
          data: {
            transactionId,
            reference: transaction.reference,
            amount: transaction.amount,
            status: 'failed'
          }
        });
      } else {
        // Still pending on Paystack side
        return res.json({
          success: false,
          message: `Payment status on gateway: ${data.status}`,
          data: {
            transactionId,
            reference: transaction.reference,
            amount: transaction.amount,
            status: transaction.status
          }
        });
      }
    } catch (error) {
      console.error('Paystack verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify payment with Paystack'
      });
    }
    
  } catch (error) {
    console.error('Verify Pending Transaction Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mobile Money Deposit using Paystack
router.post('/mobile-money-deposit',
  checkBlocked,
  rateLimitPayments,
  sanitizeInput,
  validateDepositAmount,
  preventDuplicateDeposits(Transaction),
  auditLog('MOBILE_MONEY_DEPOSIT_INITIATED'),
  async (req, res) => {
  try {
    const { userId, amount, phoneNumber, network, email } = req.body;

    // Validate input
    if (!userId || !amount || amount <= 0 || !phoneNumber || !network) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid mobile money deposit details. Phone number and network are required.' 
      });
    }

    // Validate network
    const validNetworks = ['MTN', 'VODAFONE', 'AIRTELTIGO'];
    if (!validNetworks.includes(network.toUpperCase())) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid network. Supported networks: MTN, VODAFONE, AIRTELTIGO' 
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

    // Use user's email if not provided
    const userEmail = email || user.email;
    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required for mobile money deposit' 
      });
    }

    // Generate unique reference
    const reference = `MOMO-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;

    // Calculate total amount with Paystack fees (2.9% + GHS 0.30)
    const paystackFee = (parseFloat(amount) * 0.029) + 0.30;
    const totalAmountWithFee = parseFloat(amount) + paystackFee;
    const paystackAmount = Math.round(totalAmountWithFee * 100); // Convert to pesewas

    // Create transaction record
    const transaction = new Transaction({
      userId: userId,
      amount: parseFloat(amount),
      totalAmount: totalAmountWithFee,
      fees: paystackFee,
      reference: reference,
      gateway: 'paystack',
      type: 'deposit',
      status: 'pending',
      paymentMethod: 'mobile_money',
      metadata: {
        phoneNumber: phoneNumber,
        network: network.toUpperCase(),
        email: userEmail,
        currency: 'GHS'
      }
    });

    await transaction.save();

    // Initialize Paystack mobile money payment
    const paystackData = {
      email: userEmail,
      amount: paystackAmount,
      currency: 'GHS',
      reference: reference,
      callback_url: process.env.NODE_ENV === 'production' 
        ? `${process.env.FRONTEND_URL || 'https://www.unlimiteddatagh.com'}/payment/callback?source=mobile_money`
        : `http://localhost:3000/payment/callback?source=mobile_money`,
      channels: ['mobile_money'],
      metadata: {
        custom_fields: [
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: phoneNumber
          },
          {
            display_name: 'Network',
            variable_name: 'network',
            value: network.toUpperCase()
          },
          {
            display_name: 'Payment Method',
            variable_name: 'payment_method',
            value: 'mobile_money'
          },
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId
          }
        ]
      }
    };

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
      // Update transaction with Paystack reference
      transaction.externalRef = paystackResponse.data.data.reference;
      await transaction.save();

      return res.json({
        success: true,
        message: 'Mobile money deposit initiated successfully',
        data: {
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code,
          reference: reference,
          amount: amount,
          totalAmount: totalAmountWithFee,
          fees: paystackFee,
          network: network.toUpperCase(),
          phoneNumber: phoneNumber
        }
      });
    } else {
      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.failureReason = paystackResponse.data.message || 'Paystack initialization failed';
      await transaction.save();

      return res.status(400).json({
        success: false,
        error: paystackResponse.data.message || 'Failed to initialize mobile money payment'
      });
    }

  } catch (error) {
    console.error('Mobile money deposit error:', error);
    
    // Update transaction status to failed if it exists
    if (error.transaction) {
      error.transaction.status = 'failed';
      error.transaction.failureReason = error.message;
      await error.transaction.save();
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test endpoint to verify Paystack configuration
router.get('/test-paystack', async (req, res) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
    
    if (!paystackSecretKey || !paystackPublicKey) {
      return res.json({
        success: false,
        message: 'Paystack keys not configured',
        keys: {
          secretKey: paystackSecretKey ? 'Set' : 'Missing',
          publicKey: paystackPublicKey ? 'Set' : 'Missing'
        }
      });
    }
    
    // Test Paystack API connection
    const paystackResponse = await axios.get('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (paystackResponse.status === 200) {
      return res.json({
        success: true,
        message: 'Paystack configuration working',
        keys: {
          secretKey: 'Set',
          publicKey: 'Set'
        },
        apiTest: {
          status: 'Connected',
          banksAvailable: paystackResponse.data.data?.length || 0
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Paystack API connection failed',
        status: paystackResponse.status
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: 'Paystack configuration test failed',
      error: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;