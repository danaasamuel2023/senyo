const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User, Wallet } = require('../schema/schema');
const { sendToBank, sendToMobileMoney, getBanksList, verifyBankAccount } = require('../services/bulkClixService');
const auth = require('../middlewareUser/middleware');

// Enhanced logging
const logWithdrawalOperation = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [WITHDRAWAL_${operation}]`, JSON.stringify(data, null, 2));
};

// Validation helpers
const validateWithdrawalAmount = (amount) => {
  const minAmount = 10;
  const maxAmount = 50000;
  
  if (!amount || amount < minAmount) {
    return { valid: false, message: `Minimum withdrawal amount is GHS ${minAmount}` };
  }
  
  if (amount > maxAmount) {
    return { valid: false, message: `Maximum withdrawal amount is GHS ${maxAmount}` };
  }
  
  return { valid: true };
};

const validateAccountNumber = (accountNumber, type) => {
  if (type === 'bank') {
    // Bank account validation (Ghana format)
    const bankRegex = /^[0-9]{10,16}$/;
    if (!bankRegex.test(accountNumber)) {
      return { valid: false, message: 'Invalid bank account number format' };
    }
  } else if (type === 'mobile') {
    // Mobile money validation (Ghana format)
    const mobileRegex = /^0[0-9]{9}$/;
    if (!mobileRegex.test(accountNumber)) {
      return { valid: false, message: 'Invalid mobile money number format' };
    }
  }
  
  return { valid: true };
};

// Bank withdrawal with intelligent processing
router.post('/withdraw/bank', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { amount, accountNumber, accountName, bankId } = req.body;
      const userId = req.user._id;

      logWithdrawalOperation('BANK_WITHDRAWAL_REQUEST', {
        userId,
        amount,
        accountNumber: accountNumber?.substring(0, 4) + '****',
        bankId
      });

      // Validation
      const amountValidation = validateWithdrawalAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({ success: false, message: amountValidation.message });
      }

      const accountValidation = validateAccountNumber(accountNumber, 'bank');
      if (!accountValidation.valid) {
        return res.status(400).json({ success: false, message: accountValidation.message });
      }

      if (!bankId) {
        return res.status(400).json({ success: false, message: 'Bank selection is required' });
      }

      // Get wallet with session
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }

      if (wallet.frozen) {
        return res.status(400).json({ 
          success: false, 
          message: 'Wallet is frozen', 
          reason: wallet.freezeReason 
        });
      }

      if (wallet.balance < amount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient balance',
          currentBalance: wallet.balance,
          requestedAmount: amount
        });
      }

      // Generate unique reference
      const clientReference = `WD_BANK_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Create withdrawal transaction (pending)
      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance - amount;
      
      const withdrawalTransaction = {
        type: 'withdrawal',
        amount: amount,
        balanceBefore,
        balanceAfter,
        description: `Bank withdrawal to ${accountNumber.substring(0, 4)}****`,
        reference: clientReference,
        status: 'pending',
        metadata: {
          withdrawalType: 'bank',
          accountNumber: accountNumber,
          accountName: accountName,
          bankId: bankId,
          requestedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        },
        createdAt: new Date()
      };

      // Deduct from wallet
      wallet.balance = balanceAfter;
      wallet.transactions.push(withdrawalTransaction);
      wallet.lastTransaction = new Date();
      await wallet.save({ session });

      logWithdrawalOperation('WALLET_UPDATED', {
        userId,
        balanceBefore,
        balanceAfter,
        reference: clientReference
      });

      // Commit transaction before API call
      await session.commitTransaction();
      session.endSession();

      // Call BulkClix API
      const bulkClixResult = await sendToBank(amount, accountNumber, accountName, bankId, clientReference);

      // Update transaction status based on API result
      const updatedWallet = await Wallet.findOne({ userId });
      const transaction = updatedWallet.transactions.find(t => t.reference === clientReference);
      
      if (bulkClixResult.success) {
        transaction.status = 'completed';
        transaction.metadata.bulkClixTransactionId = bulkClixResult.data.data.transaction_id;
        transaction.metadata.completedAt = new Date();
        
        logWithdrawalOperation('BANK_WITHDRAWAL_SUCCESS', {
          userId,
          reference: clientReference,
          bulkClixTransactionId: bulkClixResult.data.data.transaction_id
        });
      } else {
        // Refund to wallet
        updatedWallet.balance += amount;
        transaction.status = 'failed';
        transaction.metadata.error = bulkClixResult.error;
        transaction.metadata.failedAt = new Date();
        
        logWithdrawalOperation('BANK_WITHDRAWAL_FAILED', {
          userId,
          reference: clientReference,
          error: bulkClixResult.error
        });
      }
      
      await updatedWallet.save();

      // Send response
      if (bulkClixResult.success) {
        res.json({
          success: true,
          message: 'Withdrawal successful',
          data: {
            transactionId: bulkClixResult.data.data.transaction_id,
            amount: amount,
            reference: clientReference,
            status: 'completed'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Withdrawal failed',
          error: bulkClixResult.error,
          refunded: true
        });
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logWithdrawalOperation('BANK_WITHDRAWAL_ERROR', {
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

// Mobile money withdrawal
router.post('/withdraw/mobile', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { amount, accountNumber, channel, accountName } = req.body;
      const userId = req.user._id;

      logWithdrawalOperation('MOBILE_WITHDRAWAL_REQUEST', {
        userId,
        amount,
        accountNumber: accountNumber?.substring(0, 4) + '****',
        channel
      });

      // Validation
      const amountValidation = validateWithdrawalAmount(amount);
      if (!amountValidation.valid) {
        return res.status(400).json({ success: false, message: amountValidation.message });
      }

      const accountValidation = validateAccountNumber(accountNumber, 'mobile');
      if (!accountValidation.valid) {
        return res.status(400).json({ success: false, message: accountValidation.message });
      }

      const validChannels = ['MTN', 'VODAFONE', 'AIRTELTIGO'];
      if (!validChannels.includes(channel.toUpperCase())) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid mobile money channel',
          validChannels 
        });
      }

      // Get wallet with session
      const wallet = await Wallet.findOne({ userId }).session(session);
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }

      if (wallet.frozen) {
        return res.status(400).json({ 
          success: false, 
          message: 'Wallet is frozen', 
          reason: wallet.freezeReason 
        });
      }

      if (wallet.balance < amount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient balance',
          currentBalance: wallet.balance,
          requestedAmount: amount
        });
      }

      // Generate unique reference
      const clientReference = `WD_MOBILE_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      // Create withdrawal transaction (pending)
      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance - amount;
      
      const withdrawalTransaction = {
        type: 'withdrawal',
        amount: amount,
        balanceBefore,
        balanceAfter,
        description: `Mobile money withdrawal to ${accountNumber.substring(0, 4)}**** (${channel})`,
        reference: clientReference,
        status: 'pending',
        metadata: {
          withdrawalType: 'mobile',
          accountNumber: accountNumber,
          accountName: accountName,
          channel: channel.toUpperCase(),
          requestedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        },
        createdAt: new Date()
      };

      // Deduct from wallet
      wallet.balance = balanceAfter;
      wallet.transactions.push(withdrawalTransaction);
      wallet.lastTransaction = new Date();
      await wallet.save({ session });

      logWithdrawalOperation('WALLET_UPDATED', {
        userId,
        balanceBefore,
        balanceAfter,
        reference: clientReference
      });

      // Commit transaction before API call
      await session.commitTransaction();
      session.endSession();

      // Call BulkClix API
      const bulkClixResult = await sendToMobileMoney(amount, accountNumber, channel.toUpperCase(), accountName, clientReference);

      // Update transaction status based on API result
      const updatedWallet = await Wallet.findOne({ userId });
      const transaction = updatedWallet.transactions.find(t => t.reference === clientReference);
      
      if (bulkClixResult.success) {
        transaction.status = 'completed';
        transaction.metadata.bulkClixTransactionId = bulkClixResult.data.data.transaction_id;
        transaction.metadata.completedAt = new Date();
        
        logWithdrawalOperation('MOBILE_WITHDRAWAL_SUCCESS', {
          userId,
          reference: clientReference,
          bulkClixTransactionId: bulkClixResult.data.data.transaction_id
        });
      } else {
        // Refund to wallet
        updatedWallet.balance += amount;
        transaction.status = 'failed';
        transaction.metadata.error = bulkClixResult.error;
        transaction.metadata.failedAt = new Date();
        
        logWithdrawalOperation('MOBILE_WITHDRAWAL_FAILED', {
          userId,
          reference: clientReference,
          error: bulkClixResult.error
        });
      }
      
      await updatedWallet.save();

      // Send response
      if (bulkClixResult.success) {
        res.json({
          success: true,
          message: 'Withdrawal successful',
          data: {
            transactionId: bulkClixResult.data.data.transaction_id,
            amount: amount,
            reference: clientReference,
            status: 'completed'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Withdrawal failed',
          error: bulkClixResult.error,
          refunded: true
        });
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logWithdrawalOperation('MOBILE_WITHDRAWAL_ERROR', {
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

// Get banks list
router.get('/banks', async (req, res) => {
  try {
    const result = await getBanksList();
    if (result.success) {
      res.json({ 
        success: true, 
        data: result.data,
        cached: result.cached 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Failed to fetch banks', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Verify bank account
router.post('/verify-account', auth, async (req, res) => {
  try {
    const { accountNumber, bankId } = req.body;
    
    if (!accountNumber || !bankId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account number and bank ID are required' 
      });
    }

    const result = await verifyBankAccount(accountNumber, bankId);
    if (result.success) {
      res.json({ 
        success: true, 
        data: result.data 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Account verification failed', 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get withdrawal history
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const userId = req.user._id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0 } });
    }

    let withdrawals = wallet.transactions.filter(t => t.type === 'withdrawal');
    
    // Apply filters
    if (status) {
      withdrawals = withdrawals.filter(t => t.status === status);
    }
    
    if (type) {
      withdrawals = withdrawals.filter(t => t.metadata?.withdrawalType === type);
    }

    // Sort by date (newest first)
    withdrawals.sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const total = withdrawals.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWithdrawals = withdrawals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedWithdrawals,
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
