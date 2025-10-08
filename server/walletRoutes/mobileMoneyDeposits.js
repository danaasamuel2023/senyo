const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, Wallet, Transaction } = require('../schema/schema');
const { collectMobileMoney, getSupportedNetworks, validateMobileMoneyNumber } = require('../services/bulkClixCollectionService');
const auth = require('../middlewareUser/middleware');

// Enhanced logging
const logMobileMoneyDeposit = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [MOBILE_MONEY_DEPOSIT_${operation}]`, JSON.stringify(data, null, 2));
};

// Validation helpers
const validateDepositAmount = (amount) => {
  const minAmount = 5;
  const maxAmount = 10000;
  
  if (!amount || amount < minAmount) {
    return { valid: false, message: `Minimum deposit amount is GHS ${minAmount}` };
  }
  
  if (amount > maxAmount) {
    return { valid: false, message: `Maximum deposit amount is GHS ${maxAmount}` };
  }
  
  return { valid: true };
};

// Mobile money deposit with intelligent processing
router.post('/deposit/mobile-money', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { amount, phoneNumber, network, description } = req.body;
      const userId = req.user._id;

      logMobileMoneyDeposit('MOBILE_MONEY_DEPOSIT_REQUEST', {
        userId,
        amount,
        phoneNumber: phoneNumber?.substring(0, 4) + '****',
        network
      });

      // Validation
      const amountValidation = validateDepositAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({ success: false, message: amountValidation.message });
      }

      const phoneValidation = validateMobileMoneyNumber(phoneNumber, network);
      if (!phoneValidation.valid) {
        return res.status(400).json({ success: false, message: phoneValidation.message });
      }

      const supportedNetworks = getSupportedNetworks();
      const validNetworks = supportedNetworks.data.map(n => n.code);
      if (!validNetworks.includes(network.toUpperCase())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid mobile money network',
          supportedNetworks: validNetworks
        });
      }

      // Get user
      const user = await User.findById(userId).session(session);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if user's account is disabled
      if (user.isDisabled) {
        return res.status(403).json({
          success: false,
          message: 'Account is disabled',
          reason: user.disableReason || 'No reason provided'
        });
      }

      // Generate unique reference
      const clientReference = `DEP_MOMO_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Create pending transaction
      const transaction = new Transaction({
        userId,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        reference: clientReference,
        gateway: 'bulkclix_momo',
        metadata: {
          phoneNumber: phoneNumber,
          network: network.toUpperCase(),
          description: description || `Mobile money deposit via ${network}`,
          requestedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      await transaction.save({ session });

      logMobileMoneyDeposit('TRANSACTION_CREATED', {
        userId,
        transactionId: transaction._id,
        reference: clientReference,
        amount
      });

      // Commit transaction before API call
      await session.commitTransaction();
      session.endSession();

      // Call BulkClix collection API
      const collectionResult = await collectMobileMoney(
        amount, 
        phoneNumber, 
        network, 
        clientReference, 
        description
      );

      // Update transaction status based on API result
      const updatedTransaction = await Transaction.findById(transaction._id);
      
      if (collectionResult.success) {
        updatedTransaction.status = 'completed';
        updatedTransaction.metadata.bulkClixTransactionId = collectionResult.data.data.transaction_id;
        updatedTransaction.metadata.completedAt = new Date();
        updatedTransaction.metadata.collectionResponse = collectionResult.data;
        
        // Update user wallet balance
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          // Create wallet if it doesn't exist
          const newWallet = new Wallet({
            userId: userId,
            balance: parseFloat(amount),
            currency: 'GHS',
            frozen: false,
            transactions: [{
              type: 'deposit',
              amount: parseFloat(amount),
              balanceBefore: 0,
              balanceAfter: parseFloat(amount),
              description: `Mobile money deposit via ${network}`,
              reference: clientReference,
              status: 'completed',
              metadata: {
                source: 'bulkclix_momo',
                phoneNumber: phoneNumber,
                network: network.toUpperCase(),
                bulkClixTransactionId: collectionResult.data.data.transaction_id
              },
              createdAt: new Date()
            }],
            lastTransaction: new Date()
          });
          await newWallet.save();
        } else {
          // Update existing wallet
          const balanceBefore = wallet.balance;
          wallet.balance += parseFloat(amount);
          wallet.transactions.push({
            type: 'deposit',
            amount: parseFloat(amount),
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            description: `Mobile money deposit via ${network}`,
            reference: clientReference,
            status: 'completed',
            metadata: {
              source: 'bulkclix_momo',
              phoneNumber: phoneNumber,
              network: network.toUpperCase(),
              bulkClixTransactionId: collectionResult.data.data.transaction_id
            },
            createdAt: new Date()
          });
          wallet.lastTransaction = new Date();
          await wallet.save();
        }
        
        logMobileMoneyDeposit('MOBILE_MONEY_DEPOSIT_SUCCESS', {
          userId,
          reference: clientReference,
          bulkClixTransactionId: collectionResult.data.data.transaction_id,
          amount
        });
      } else {
        updatedTransaction.status = 'failed';
        updatedTransaction.metadata.error = collectionResult.error;
        updatedTransaction.metadata.failedAt = new Date();
        
        logMobileMoneyDeposit('MOBILE_MONEY_DEPOSIT_FAILED', {
          userId,
          reference: clientReference,
          error: collectionResult.error
        });
      }
      
      await updatedTransaction.save();

      // Send response
      if (collectionResult.success) {
        res.json({
          success: true,
          message: 'Mobile money deposit successful',
          data: {
            transactionId: collectionResult.data.data.transaction_id,
            amount: amount,
            reference: clientReference,
            status: 'completed',
            network: network.toUpperCase(),
            phoneNumber: phoneNumber.substring(0, 4) + '****'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Mobile money deposit failed',
          error: collectionResult.error
        });
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logMobileMoneyDeposit('MOBILE_MONEY_DEPOSIT_ERROR', {
      userId: req.user._id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get supported mobile money networks
router.get('/networks', async (req, res) => {
  try {
    const networks = getSupportedNetworks();
    res.json({
      success: true,
      data: networks.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Validate mobile money number
router.post('/validate-number', auth, async (req, res) => {
  try {
    const { phoneNumber, network } = req.body;
    
    if (!phoneNumber || !network) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and network are required' 
      });
    }

    const validation = validateMobileMoneyNumber(phoneNumber, network);
    res.json({
      success: validation.valid,
      message: validation.valid ? 'Valid mobile money number' : validation.message,
      data: {
        phoneNumber: phoneNumber.substring(0, 4) + '****',
        network: network.toUpperCase(),
        isValid: validation.valid
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get mobile money deposit history
router.get('/deposits', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, network } = req.query;
    const userId = req.user._id;

    let query = { 
      userId, 
      type: 'deposit', 
      gateway: 'bulkclix_momo' 
    };
    
    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (network) {
      query['metadata.network'] = network.toUpperCase();
    }

    // Get transactions with pagination
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('amount status reference createdAt metadata');

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
