const express = require('express');
const router = express.Router();
const { User, DataPurchase, Transaction, ReferralBonus,DataInventory, AgentCatalog, ProductPricing } = require('../schema/schema');
const mongoose = require('mongoose');
const auth = require('../middlewareUser/middleware');
const adminAuth = require('../adminMiddleware/middleware');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; 
if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY not set. Admin Paystack operations may fail.');
}



// Middleware to check if user is admin

// const mongoose = require('mongoose');
const ARKESEL_API_KEY = 'QkNhS0l2ZUZNeUdweEtmYVRUREg';

const sendSMS = async (phoneNumber, message, options = {}) => {
  const {
    scheduleTime = null,
    useCase = null,
    senderID = 'Bundle'
  } = options;

  // Input validation
  if (!phoneNumber || !message) {
    throw new Error('Phone number and message are required');
  }

  // Base parameters
  const params = {
    action: 'send-sms',
    api_key: ARKESEL_API_KEY,
    to: phoneNumber,
    from: senderID,
    sms: message
  };

  // Add optional parameters
  if (scheduleTime) {
    params.schedule = scheduleTime;
  }

  if (useCase && ['promotional', 'transactional'].includes(useCase)) {
    params.use_case = useCase;
  }

  // Add Nigerian use case if phone number starts with 234
  if (phoneNumber.startsWith('234') && !useCase) {
    params.use_case = 'transactional';
  }

  try {
    const response = await axios.get('https://sms.arkesel.com/sms/api', {
      params,
      timeout: 10000 // 10 second timeout
    });

    // Map error codes to meaningful messages
    const errorCodes = {
      '100': 'Bad gateway request',
      '101': 'Wrong action',
      '102': 'Authentication failed',
      '103': 'Invalid phone number',
      '104': 'Phone coverage not active',
      '105': 'Insufficient balance',
      '106': 'Invalid Sender ID',
      '109': 'Invalid Schedule Time',
      '111': 'SMS contains spam word. Wait for approval'
    };

    if (response.data.code !== 'ok') {
      const errorMessage = errorCodes[response.data.code] || 'Unknown error occurred';
      throw new Error(`SMS sending failed: ${errorMessage}`);
    }

    console.log('SMS sent successfully:', {
      to: phoneNumber,
      status: response.data.code,
      balance: response.data.balance,
      mainBalance: response.data.main_balance
    });

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    // Handle specific error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('SMS API responded with error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SMS API:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('SMS request setup error:', error.message);
    }

    // Instead of swallowing the error, return error details
    return {
      success: false,
      error: {
        message: error.message,
        code: error.response?.data?.code,
        details: error.response?.data
      }
    };
  }
};


/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users',auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Debug authentication in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Admin Users API - Request from:', {
        userId: req.user?.userId,
        userRole: req.user?.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        authToken: req.header('x-auth-token') ? `${req.header('x-auth-token').substring(0, 20)}...` : 'NO TOKEN'
      });
    }
    
    const searchQuery = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { referralCode: { $regex: search, $options: 'i' } }
          ] 
        } 
      : {};
    
    const users = await User.find(searchQuery)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(searchQuery);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('👥 Admin Users API - Response:', {
        usersCount: users.length,
        totalUsers: total,
        currentPage: parseInt(page),
        searchQuery: searchQuery
      });
    }
    
    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalUsers: total
    });
  } catch (err) {
    console.error('Admin Users API Error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/users/:id',auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/v1/admin/users/:id
 * @desc    Update user details
 * @access  Admin
 */
router.put('/users/:id',auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phoneNumber, role, walletBalance, referralCode } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (phoneNumber) userFields.phoneNumber = phoneNumber;
    if (role) userFields.role = role;
    if (walletBalance !== undefined) userFields.walletBalance = walletBalance;
    if (referralCode) userFields.referralCode = referralCode;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/v1/admin/users/:id/add-money
 * @desc    Add money to user wallet
 * @access  Admin
 */
router.put('/users/:id/add-money',auth, adminAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Please provide a valid amount' });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find user and update wallet balance
      const user = await User.findById(req.params.id).session(session);
      
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Update wallet balance
      user.walletBalance += parseFloat(amount);
      await user.save({ session });
      
      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'completed',
        reference: `ADMIN-${Date.now()}`,
        gateway: 'admin-deposit'
      });
      
      await transaction.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      
      res.json({
        msg: `Successfully added ${amount} to ${user.name}'s wallet`,
        currentBalance: user.walletBalance,
        transaction
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


/**
 * @route   PUT /api/admin/users/:id/deduct-money
 * @desc    Deduct money from user wallet
 * @access  Admin
 */
router.put('/users/:id/deduct-money', auth, adminAuth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Please provide a valid amount' });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find user and update wallet balance
      const user = await User.findById(req.params.id).session(session);
      
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Check if user has sufficient balance
      if (user.walletBalance < parseFloat(amount)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          msg: 'Insufficient balance', 
          currentBalance: user.walletBalance,
          requestedDeduction: parseFloat(amount)
        });
      }
      
      // Update wallet balance
      user.walletBalance -= parseFloat(amount);
      await user.save({ session });
      
      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        type: 'withdrawal',
        amount: parseFloat(amount),
        status: 'completed',
        reference: `ADMIN-DEDUCT-${Date.now()}`,
        gateway: 'admin-deduction',
        metadata: {
          reason: reason || 'Administrative deduction',
          adminId: req.user.id,
          previousBalance: user.walletBalance + parseFloat(amount)
        }
      });
      
      await transaction.save({ session });
      
      // Optional: Send notification to user
      try {
        if (user.phoneNumber) {
          const formattedPhone = user.phoneNumber.replace(/^\+/, '');
          const message = `Unlimiteddatagh: GHS${amount.toFixed(2)} has been deducted from your wallet. Your new balance is GHS${user.walletBalance.toFixed(2)}. Reason: ${reason || 'Administrative adjustment'}.`;
          
          await sendSMS(formattedPhone, message, {
            useCase: 'transactional',
            senderID: 'Bundle'
          });
        }
      } catch (smsError) {
        console.error('Failed to send deduction SMS:', smsError.message);
        // Continue with the transaction even if SMS fails
      }
      
      await session.commitTransaction();
      session.endSession();
      
      res.json({
        msg: `Successfully deducted ${amount} from ${user.name}'s wallet`,
        currentBalance: user.walletBalance,
        transaction
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/users/:id',auth, adminAuth, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if user exists
      const user = await User.findById(req.params.id).session(session);
      
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Delete related records
      await Transaction.deleteMany({ userId: req.params.id }).session(session);
      await DataPurchase.deleteMany({ userId: req.params.id }).session(session);
      await ReferralBonus.deleteMany({ 
        $or: [
          { userId: req.params.id },
          { referredUserId: req.params.id }
        ]
      }).session(session);
      
      // Delete user
      await User.findByIdAndDelete(req.params.id).session(session);
      
      await session.commitTransaction();
      session.endSession();
      
      res.json({ msg: 'User and related data deleted' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Get all data purchase orders
 * @access  Admin
 */
router.get('/admin/orders',auth, adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      status = '',
      network = '',
      startDate = '',
      endDate = '',
      phoneNumber = ''
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (network) filter.network = network;
    if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber };
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include end date until midnight
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    const orders = await DataPurchase.find(filter)
      .populate('userId', 'name email phoneNumber')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await DataPurchase.countDocuments(filter);
    
    // Calculate total revenue from filtered orders
    const revenue = await DataPurchase.aggregate([
      { $match: filter },
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalOrders: total,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Admin
 */
router.put('/admin/orders/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    // Validate status
    if (!['pending', 'waiting', 'processing', 'failed', 'shipped', 'delivered', 'completed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    // Start a transaction for safety
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // First try to find by geonetReference (primary reference for orders)
      let order = await DataPurchase.findOne({ geonetReference: orderId })
        .populate('userId', 'name email phoneNumber walletBalance')
        .session(session);
      
      // If not found, try by MongoDB _id
      if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await DataPurchase.findById(orderId)
          .populate('userId', 'name email phoneNumber walletBalance')
          .session(session);
      }
      
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: `Order with ID/Reference ${orderId} not found` });
      }
      
      const previousStatus = order.status;
      
      // Log the status change for audit trail
      console.log(`Order ${orderId} status change: ${previousStatus} -> ${status} by admin ${req.user.id}`);
      
      // Process refund if status is being changed to failed
      if (status === 'failed' && previousStatus !== 'failed') {
        // Only process refund if the order was previously not failed
        // Find the user and update their wallet balance
        const user = await User.findById(order.userId._id).session(session);
        
        if (user) {
          // Add the refund amount to the user's wallet balance
          user.walletBalance += order.price;
          await user.save({ session });
          
          // Create refund transaction record
          const transaction = new Transaction({
            userId: user._id,
            type: 'refund',
            amount: order.price,
            status: 'completed',
            reference: `REFUND-${order._id}-${Date.now()}`,
            gateway: 'wallet-refund',
            metadata: {
              orderId: order._id,
              geonetReference: order.geonetReference,
              previousStatus,
              adminId: req.user.id
            }
          });
          
          await transaction.save({ session });
          
          console.log(`Refunded ${order.price} to user ${user._id} for order ${order._id}`);
          
          // Send refund SMS to the user
          try {
            // Format phone number for SMS if needed
            const formatPhoneForSms = (phone) => {
              // Remove the '+' if it exists or format as needed
              return phone.replace(/^\+/, '');
            };
            
            if (user.phoneNumber) {
              const userPhone = formatPhoneForSms(user.phoneNumber);
              const refundMessage = `Unlimiteddatagh: Your order for ${order.capacity}GB ${order.network} data bundle (Ref: ${order.geonetReference}) could not be processed. Your account has been refunded with GHS${order.price.toFixed(2)}. Thank you for choosing Unlimiteddatagh.`;
              
              await sendSMS(userPhone, refundMessage, {
                useCase: 'transactional',
                senderID: 'Bundle'
              });
            }
          } catch (smsError) {
            console.error('Failed to send refund SMS:', smsError.message);
            // Continue even if SMS fails
          }
        }
      }
      
      // Update the order status
      order.status = status;
      order.processedBy = req.user.id;
      order.updatedAt = Date.now();
      
      // Add status history for tracking
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: req.user.id,
        previousStatus
      });
      
      await order.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.json({
        success: true,
        msg: 'Order status updated successfully',
        order: {
          id: order._id,
          geonetReference: order.geonetReference,
          status: order.status,
          previousStatus,
          updatedAt: order.updatedAt
        }
      });
    } catch (txError) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw txError;
    }
  } catch (err) {
    console.error(`Error updating order ${req.params.id} status:`, err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server Error while updating order status',
      error: err.message
    });
  }
});

/**
 * @route   POST /api/admin/orders/bulk-status-update
 * @desc    Bulk update order statuses with improved error handling
 * @access  Admin
 */
router.post('/admin/orders/bulk-status-update', auth, adminAuth, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ msg: 'Please provide an array of order IDs' });
    }
    
    if (!status || !['pending', 'waiting', 'processing', 'failed', 'shipped', 'delivered', 'completed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    // Results tracking
    const results = {
      success: [],
      failed: [],
      notFound: []
    };
    
    // Process orders in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < orderIds.length; i += batchSize) {
      batches.push(orderIds.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      // Process each batch with a new session
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        for (const orderId of batch) {
          // First try to find by geonetReference
          let order = await DataPurchase.findOne({ geonetReference: orderId })
            .session(session);
          
          // If not found, try by MongoDB _id
          if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
            order = await DataPurchase.findById(orderId)
              .session(session);
          }
          
          if (!order) {
            results.notFound.push(orderId);
            continue;
          }
          
          const previousStatus = order.status;
          
          // Skip if status is already the target status
          if (previousStatus === status) {
            results.success.push({
              id: order._id,
              geonetReference: order.geonetReference,
              status,
              message: 'Status already set (no change needed)'
            });
            continue;
          }
          
          // Process refund if status is being changed to failed
          if (status === 'failed' && previousStatus !== 'failed') {
            try {
              // Only process refund if the order was previously not failed
              const user = await User.findById(order.userId).session(session);
              
              if (user) {
                // Add the refund amount to the user's wallet balance
                user.walletBalance += order.price;
                await user.save({ session });
                
                // Create refund transaction record
                const transaction = new Transaction({
                  userId: user._id,
                  type: 'refund',
                  amount: order.price,
                  status: 'completed',
                  reference: `REFUND-${order._id}-${Date.now()}`,
                  gateway: 'wallet-refund',
                  metadata: {
                    orderId: order._id,
                    geonetReference: order.geonetReference,
                    previousStatus,
                    bulkUpdate: true,
                    adminId: req.user.id
                  }
                });
                
                await transaction.save({ session });
              }
            } catch (refundError) {
              console.error(`Refund error for order ${orderId}:`, refundError.message);
              results.failed.push({
                id: order._id,
                geonetReference: order.geonetReference,
                error: 'Refund processing failed'
              });
              continue;
            }
          }
          
          // Update the order status
          order.status = status;
          order.processedBy = req.user.id;
          order.updatedAt = Date.now();
          
          // Add status history for tracking
          if (!order.statusHistory) {
            order.statusHistory = [];
          }
          
          order.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user.id,
            previousStatus,
            bulkUpdate: true
          });
          
          await order.save({ session });
          
          results.success.push({
            id: order._id,
            geonetReference: order.geonetReference,
            previousStatus,
            status
          });
        }
        
        // Commit the transaction for this batch
        await session.commitTransaction();
        session.endSession();
      } catch (batchError) {
        // If an error occurs in this batch, abort its transaction
        await session.abortTransaction();
        session.endSession();
        console.error('Error processing batch:', batchError.message);
        
        // Mark all orders in this batch as failed
        batch.forEach(orderId => {
          if (!results.success.some(s => s.id.toString() === orderId || s.geonetReference === orderId) && 
              !results.notFound.includes(orderId)) {
            results.failed.push({
              id: orderId,
              error: 'Batch transaction error'
            });
          }
        });
      }
    }
    
    // Send response with detailed results
    res.json({
      msg: `Bulk update processed. Success: ${results.success.length}, Failed: ${results.failed.length}, Not Found: ${results.notFound.length}`,
      results
    });
  } catch (err) {
    console.error('Bulk update error:', err.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server Error during bulk update',
      error: err.message
    });
  }
});

// Schema update to track status history
// Add this to your schema.js file to track order status changes
/*
const DataPurchaseSchema = new mongoose.Schema({
  // ... existing fields
  
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'waiting', 'processing', 'failed', 'shipped', 'delivered', 'completed'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    previousStatus: String,
    bulkUpdate: Boolean
  }]
});
*/

router.put('/inventory/:network/toggle', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.params;
    
    // Find the inventory item
    let inventoryItem = await DataInventory.findOne({ network });
    
    if (!inventoryItem) {
      // Create new inventory item if it doesn't exist
      inventoryItem = new DataInventory({
        network,
        inStock: false, // Set to false since we're toggling from non-existent (assumed true)
        skipGeonettech: false
      });
    } else {
      // Toggle existing item
      inventoryItem.inStock = !inventoryItem.inStock;
      inventoryItem.updatedAt = Date.now();
    }
    
    await inventoryItem.save();
    
    res.json({ 
      network: inventoryItem.network, 
      inStock: inventoryItem.inStock,
      skipGeonettech: inventoryItem.skipGeonettech || false,
      message: `${network} is now ${inventoryItem.inStock ? 'in stock' : 'out of stock'}`
    });
  } catch (err) {
    console.error('Error toggling inventory:', err.message);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

/**
 * @route   PUT /api/admin/inventory/:network/toggle-geonettech
 * @desc    Toggle Geonettech API for specific network
 * @access  Admin
 */
router.put('/inventory/:network/toggle-geonettech', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.params;
    
    // Find the inventory item
    let inventoryItem = await DataInventory.findOne({ network });
    
    if (!inventoryItem) {
      // Create new inventory item if it doesn't exist
      inventoryItem = new DataInventory({
        network,
        inStock: true, // Default to in stock
        skipGeonettech: true // Set to true since we're toggling from non-existent (assumed false)
      });
    } else {
      // Toggle existing item
      inventoryItem.skipGeonettech = !inventoryItem.skipGeonettech;
      inventoryItem.updatedAt = Date.now();
    }
    
    await inventoryItem.save();
    
    res.json({ 
      network: inventoryItem.network, 
      inStock: inventoryItem.inStock,
      skipGeonettech: inventoryItem.skipGeonettech,
      message: `${network} Geonettech API is now ${inventoryItem.skipGeonettech ? 'disabled (orders will be pending)' : 'enabled (orders will be processed)'}`
    });
  } catch (err) {
    console.error('Error toggling Geonettech API:', err.message);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

/**
 * @route   GET /api/admin/inventory
 * @desc    Get all inventory items with current status
 * @access  Admin
 */
router.get('/inventory', auth, adminAuth, async (req, res) => {
  try {
    const inventoryItems = await DataInventory.find({}).sort({ network: 1 });
    
    // Predefined networks
    const NETWORKS = ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"];
    
    // Create response with all networks (create missing ones with defaults)
    const inventory = NETWORKS.map(network => {
      const existingItem = inventoryItems.find(item => item.network === network);
      
      if (existingItem) {
        return {
          network: existingItem.network,
          inStock: existingItem.inStock,
          skipGeonettech: existingItem.skipGeonettech || false,
          updatedAt: existingItem.updatedAt
        };
      } else {
        return {
          network,
          inStock: true, // Default to in stock
          skipGeonettech: false, // Default to API enabled
          updatedAt: null
        };
      }
    });
    
    res.json({
      inventory,
      totalNetworks: NETWORKS.length,
      message: 'Inventory data retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
});

/**
 * @route   GET /api/admin/inventory/:network
 * @desc    Get specific network inventory status
 * @access  Admin
 */
router.get('/inventory/:network', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.params;
    
    const inventoryItem = await DataInventory.findOne({ network });
    
    if (!inventoryItem) {
      return res.json({
        network,
        inStock: true, // Default to in stock
        skipGeonettech: false, // Default to API enabled
        updatedAt: null,
        message: 'Network not found in inventory - showing defaults'
      });
    }
    
    res.json({
      network: inventoryItem.network,
      inStock: inventoryItem.inStock,
      skipGeonettech: inventoryItem.skipGeonettech || false,
      updatedAt: inventoryItem.updatedAt
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with pagination, filtering and sorting
 * @access  Admin
 */
router.get('/admin/transactions', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      type = '',
      status = '',
      gateway = '',
      startDate = '',
      endDate = '',
      search = '',
      phoneNumber = '' // Add phoneNumber parameter
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (gateway) filter.gateway = gateway;
    
    // Search by reference or userId
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter.userId = search;
      } else {
        filter.reference = { $regex: search, $options: 'i' };
      }
    }

    // Phone number search - use aggregation to find users by phone
    let userIdsByPhone = [];
    if (phoneNumber) {
      const users = await User.find({
        phoneNumber: { $regex: phoneNumber, $options: 'i' }
      }).select('_id');
      
      userIdsByPhone = users.map(user => user._id);
      
      if (userIdsByPhone.length > 0) {
        filter.userId = { $in: userIdsByPhone };
      } else {
        // No users with this phone number, return empty result
        return res.json({
          transactions: [],
          totalPages: 0,
          currentPage: parseInt(page),
          totalTransactions: 0,
          amountByType: {}
        });
      }
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include end date until midnight
        filter.createdAt.$lte = endDateObj;
      }
    }
    
    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email phoneNumber')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Transaction.countDocuments(filter);
    
    // Calculate total transaction amount for filtered transactions
    const totalAmount = await Transaction.aggregate([
      { $match: filter },
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Format the totals by type (deposit, payment, etc.)
    const amountByType = {};
    totalAmount.forEach(item => {
      amountByType[item._id] = item.total;
    });
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalTransactions: total,
      amountByType
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/**
 * @route   GET /api/admin/transactions/:id
 * @desc    Get transaction details by ID
 * @access  Admin
 */
router.get('/admin/transactions/:id', auth, adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/admin/verify-paystack/:reference
 * @desc    Verify payment status from Paystack
 * @access  Admin
 */
router.get('/verify-paystack/:reference', auth, adminAuth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    // First check if transaction exists in our database
    const transaction = await Transaction.findOne({ reference })
      .populate('userId', 'name email phoneNumber');
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction reference not found in database' });
    }
    
    // Only verify Paystack transactions
    if (transaction.gateway !== 'paystack') {
      return res.status(400).json({ 
        msg: 'This transaction was not processed through Paystack',
        transaction
      });
    }
    
    // Verify with Paystack API
    try {
      const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const paystackData = paystackResponse.data;
      
      // Update transaction status based on Paystack response
      if (paystackData.status && paystackData.data.status === 'success') {
        // Update transaction in database if needed
        if (transaction.status !== 'completed') {
          transaction.status = 'completed';
          transaction.metadata = {
            ...transaction.metadata,
            paystackVerification: paystackData.data
          };
          await transaction.save();
          
          // Update user's wallet balance for successful payment
          const user = await User.findById(transaction.userId);
          if (user) {
            const previousBalance = user.walletBalance;
            user.walletBalance += transaction.amount;
            await user.save();
            
            console.log(`[ADMIN_VERIFY] ✅ User ${user._id} wallet updated via admin verification`);
            console.log(`[ADMIN_VERIFY]    Previous balance: GHS ${previousBalance}`);
            console.log(`[ADMIN_VERIFY]    Deposit amount: GHS ${transaction.amount}`);
            console.log(`[ADMIN_VERIFY]    New balance: GHS ${user.walletBalance}`);
          }
        }
        
        return res.json({
          transaction,
          paystackVerification: paystackData.data,
          verified: true,
          message: 'Payment was successfully verified on Paystack'
        });
      } else {
        // Update transaction in database if needed
        if (transaction.status !== 'failed') {
          transaction.status = 'failed';
          transaction.metadata = {
            ...transaction.metadata,
            paystackVerification: paystackData.data
          };
          await transaction.save();
        }
        
        return res.json({
          transaction,
          paystackVerification: paystackData.data,
          verified: false,
          message: 'Payment verification failed on Paystack'
        });
      }
    } catch (verifyError) {
      console.error('Paystack verification error:', verifyError.message);
      return res.status(500).json({
        msg: 'Error verifying payment with Paystack',
        error: verifyError.message,
        transaction
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/admin/transactions/:id/update-status
 * @desc    Manually update transaction status
 * @access  Admin
 */
router.put('/admin/transactions/:id/update-status', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['pending', 'completed', 'failed', 'processing', 'refunded'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    
    // Update transaction fields
    transaction.status = status;
    transaction.updatedAt = Date.now();
    
    // Add admin notes if provided
    if (adminNotes) {
      transaction.metadata = {
        ...transaction.metadata,
        adminNotes,
        updatedBy: req.user.id,
        updateDate: new Date()
      };
    }
    
    await transaction.save();
    
    res.json({
      msg: 'Transaction status updated successfully',
      transaction
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

router.put('/users/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const { disableReason } = req.body;
    const userId = req.params.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get current admin for tracking
    const admin = await User.findById(req.user.id).select('name');
    
    // Toggle the isDisabled status
    user.isDisabled = !user.isDisabled;
    
    // Update related fields
    if (user.isDisabled) {
      // Disabling the account
      user.disableReason = disableReason || 'Administrative action';
      user.disabledAt = new Date();
      user.disabledBy = req.user.id;
    } else {
      // Re-enabling the account
      user.disableReason = null;
      user.disabledAt = null;
      user.enabledBy = req.user.id;
      user.enabledAt = new Date();
    }
    
    await user.save();
    
    // Send notification SMS to the user
    try {
      if (user.phoneNumber) {
        const formattedPhone = user.phoneNumber.replace(/^\+/, '');
        let message;
        
        if (user.isDisabled) {
          message = `Unlimiteddatagh: Your account has been disabled. Reason: ${user.disableReason}. Contact support for assistance.`;
        } else {
          message = `Unlimiteddatagh: Your account has been re-enabled. You can now access all platform features. Thank you for choosing Unlimiteddatagh.`;
        }
        
        await sendSMS(formattedPhone, message, {
          useCase: 'transactional',
          senderID: 'Bundle'
        });
      }
    } catch (smsError) {
      console.error('Failed to send account status SMS:', smsError.message);
      // Continue even if SMS fails
    }
    
    return res.json({
      success: true,
      message: user.isDisabled ? 'User account has been disabled' : 'User account has been enabled',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isDisabled: user.isDisabled,
        disableReason: user.disableReason,
        disabledAt: user.disabledAt,
        disabledBy: admin ? admin.name : req.user.id
      }
    });
    
  } catch (err) {
    console.error('Toggle user status error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

router.get('/admin/daily-summary', auth, adminAuth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    // Create date range for the specified date (full day)
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    // Query filter for the date range
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    };
    
    // Get total orders for the day
    const totalOrders = await DataPurchase.countDocuments(dateFilter);
    
    // Get total revenue from completed orders
    const revenueAgg = await DataPurchase.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    
    // Get total deposits
    const depositsAgg = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, totalDeposits: { $sum: '$amount' } } }
    ]);
    const totalDeposits = depositsAgg.length > 0 ? depositsAgg[0].totalDeposits : 0;
    
    // Get total data capacity sold for each network & capacity
    const capacityByNetworkAgg = await DataPurchase.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { 
        $group: { 
          _id: {
            network: '$network',
            capacity: '$capacity'
          },
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' }
        }
      },
      { $sort: { '_id.network': 1, '_id.capacity': 1 } }
    ]);
    
    // Format the capacity data for easier frontend consumption
    const capacityData = capacityByNetworkAgg.map(item => ({
      network: item._id.network,
      capacity: item._id.capacity,
      count: item.count,
      totalGB: item.totalCapacity
    }));
    
    // Get summary by network
    const networkSummaryAgg = await DataPurchase.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { 
        $group: { 
          _id: '$network',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalRevenue: { $sum: '$price' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    const networkSummary = networkSummaryAgg.map(item => ({
      network: item._id,
      count: item.count,
      totalGB: item.totalCapacity,
      revenue: item.totalRevenue
    }));
    
    // Get total capacity for all networks
    const totalCapacityAgg = await DataPurchase.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, totalGB: { $sum: '$capacity' } } }
    ]);
    const totalCapacity = totalCapacityAgg.length > 0 ? totalCapacityAgg[0].totalGB : 0;
    
    // Get order statuses summary
    const statusSummaryAgg = await DataPurchase.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const statusSummary = statusSummaryAgg.map(item => ({
      status: item._id,
      count: item.count
    }));
    
    // Count unique customers for the day
    const uniqueCustomersAgg = await DataPurchase.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueCustomers' }
    ]);
    const uniqueCustomers = uniqueCustomersAgg.length > 0 ? uniqueCustomersAgg[0].uniqueCustomers : 0;
    
    // Compile the complete response
    res.json({
      date,
      summary: {
        totalOrders,
        totalRevenue,
        totalDeposits,
        totalCapacityGB: totalCapacity,
        uniqueCustomers
      },
      networkSummary,
      capacityDetails: capacityData,
      statusSummary
    });
    
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: err.message
    });
  }
});

router.get('/admin/user-orders/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Fetch orders for the user
    const orders = await DataPurchase.find({ userId })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await DataPurchase.countDocuments({ userId });
    
    // Calculate total spent by the user
    const totalSpent = await DataPurchase.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalOrders: total,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
    });
  } catch (err) {
    console.error('Error fetching user orders:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/admin/dashboard/statistics
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/admin/dashboard/statistics', auth, adminAuth, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total wallet balance across all users
    const walletBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$walletBalance' } } }
    ]);
    const totalWalletBalance = walletBalance.length > 0 ? walletBalance[0].total : 0;
    
    // Get total completed orders
    const completedOrders = await DataPurchase.countDocuments({ status: 'completed' });
    
    // Get total revenue from completed orders
    const revenue = await DataPurchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
    
    // Get total by network
    const networkStats = await DataPurchase.aggregate([
      { $match: { status: 'completed' } },
      { 
        $group: { 
          _id: '$network',
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Get recent orders
    const recentOrders = await DataPurchase.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    res.json({
      userStats: {
        totalUsers,
        totalWalletBalance
      },
      orderStats: {
        totalOrders: await DataPurchase.countDocuments(),
        completedOrders,
        pendingOrders: await DataPurchase.countDocuments({ status: 'pending' }),
        failedOrders: await DataPurchase.countDocuments({ status: 'failed' })
      },
      financialStats: {
        totalRevenue,
        averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0
      },
      networkStats,
      recentOrders
    });
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err.message);
    res.status(500).send('Server Error');
  }
});


// Generate Unique Referral Code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

/**
 * @route   POST /api/create-admin
 * @desc    Create a new admin user (requires existing admin)
 * @access  Admin only
 */
router.post('/create-admin', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check if email already exists (only email needs to be unique)
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: 'admin',
      referralCode: generateReferralCode(),
      approvalStatus: 'approved',
      isVerified: true,
      walletBalance: 0,
      adminMetadata: {
        permissions: [
          'manage_users',
          'manage_orders',
          'manage_inventory',
          'manage_reports',
          'manage_settings',
          'view_analytics',
          'process_payments',
          'handle_refunds'
        ],
        canApproveUsers: true,
        canManagePricing: true,
        canAccessReports: true,
        adminNotes: `Created by admin ${req.user.name} on ${new Date().toISOString()}`
      }
    });

    await newAdmin.save();

    // Log admin creation
    console.log(`New admin created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phoneNumber: newAdmin.phoneNumber,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating admin user",
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/make-admin/:userId
 * @desc    Convert existing user to admin (requires existing admin)
 * @access  Admin only
 */
router.put('/make-admin/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: "User is already an admin" });
    }

    // Update user to admin
    user.role = 'admin';
    user.approvalStatus = 'approved';
    user.isVerified = true;
    user.adminMetadata = {
      permissions: [
        'manage_users',
        'manage_orders',
        'manage_inventory',
        'manage_reports',
        'manage_settings',
        'view_analytics',
        'process_payments',
        'handle_refunds'
      ],
      canApproveUsers: true,
      canManagePricing: true,
      canAccessReports: true,
      adminNotes: `Promoted to admin by ${req.user.name} on ${new Date().toISOString()}`
    };

    await user.save();

    // Log admin promotion
    console.log(`User promoted to admin: ${user.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: "User successfully promoted to admin",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ 
      success: false,
      message: "Error promoting user to admin",
      error: error.message 
    });
  }
});

module.exports = router;
/**
 * Agent Management & Catalog Routes
 */

// List agents (admin only)
router.get('/agents', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;

    const searchQuery = {
      role: 'agent',
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { phoneNumber: { $regex: search, $options: 'i' } },
              { 'agentMetadata.agentCode': { $regex: search, $options: 'i' } }
            ]
          }
        : {})
    };

    const agents = await User.find(searchQuery)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchQuery);

    res.json({
      agents,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('List agents error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Ensure catalog exists helper
async function ensureAgentCatalog(agentId) {
  let catalog = await AgentCatalog.findOne({ agentId });
  if (!catalog) {
    catalog = new AgentCatalog({ agentId, items: [] });
    await catalog.save();
  }
  return catalog;
}

// Get agent catalog (admin)
router.get('/agents/:id/catalog', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'agent') {
      return res.status(404).json({ msg: 'Agent not found' });
    }
    const catalog = await ensureAgentCatalog(id);
    res.json({ agentId: id, items: catalog.items });
  } catch (err) {
    console.error('Get agent catalog error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add catalog item (admin)
router.post('/agents/:id/catalog/item', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { network, capacity, price, title, description, enabled = true } = req.body;

    if (!network || !capacity || price === undefined) {
      return res.status(400).json({ msg: 'network, capacity and price are required' });
    }

    const user = await User.findById(id);
    if (!user || user.role !== 'agent') {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    const catalog = await ensureAgentCatalog(id);

    // Prevent duplicates by network+capacity
    const exists = catalog.items.find(
      (it) => it.network === network && Number(it.capacity) === Number(capacity)
    );
    if (exists) {
      return res.status(400).json({ msg: 'Item already exists for this network and capacity' });
    }

    catalog.items.push({ network, capacity, price, title, description, enabled, updatedAt: new Date() });
    catalog.updatedAt = new Date();
    await catalog.save();

    res.status(201).json({ agentId: id, items: catalog.items });
  } catch (err) {
    console.error('Add catalog item error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update catalog item (admin)
router.put('/agents/:id/catalog/item/:itemId', auth, adminAuth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const updates = req.body || {};

    const user = await User.findById(id);
    if (!user || user.role !== 'agent') {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    const catalog = await ensureAgentCatalog(id);
    const item = catalog.items.find((it) => String(it.id) === String(itemId));
    if (!item) {
      return res.status(404).json({ msg: 'Catalog item not found' });
    }

    // Apply allowed fields
    ['network', 'capacity', 'price', 'title', 'description', 'enabled'].forEach((field) => {
      if (updates[field] !== undefined) item[field] = updates[field];
    });
    item.updatedAt = new Date();
    catalog.updatedAt = new Date();
    await catalog.save();

    res.json({ agentId: id, item, items: catalog.items });
  } catch (err) {
    console.error('Update catalog item error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete catalog item (admin)
router.delete('/agents/:id/catalog/item/:itemId', auth, adminAuth, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const catalog = await ensureAgentCatalog(id);
    const beforeCount = catalog.items.length;
    catalog.items = catalog.items.filter((it) => String(it.id) !== String(itemId));
    if (catalog.items.length === beforeCount) {
      return res.status(404).json({ msg: 'Catalog item not found' });
    }
    catalog.updatedAt = new Date();
    await catalog.save();
    res.json({ agentId: id, items: catalog.items });
  } catch (err) {
    console.error('Delete catalog item error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Agent self: get my catalog (agent only)
router.get('/agent/catalog', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'agent') {
      return res.status(403).json({ msg: 'Agent access required' });
    }
    const catalog = await ensureAgentCatalog(req.user.id);
    res.json({ agentId: req.user.id, items: catalog.items });
  } catch (err) {
    console.error('Get my catalog error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Public: get agent store by agent code or custom slug (no auth required)
router.get('/public/agent-store/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Find agent by agent code OR custom slug
    const agent = await User.findOne({ 
      $or: [
        { 'agentMetadata.agentCode': identifier },
        { 'agentMetadata.customSlug': identifier }
      ],
      role: 'agent'
    }).select('name email phoneNumber approvalStatus agentMetadata');
    
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent store not found' 
      });
    }
    
    // Check if agent is active (treat approved agents without explicit agentStatus as active)
    const isActive = agent.agentMetadata?.agentStatus === 'active' || agent.approvalStatus === 'approved';
    if (!isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'This agent store is not currently available' 
      });
    }
    
    // Get agent catalog
    const catalog = await AgentCatalog.findOne({ agentId: agent._id });
    // Use new products array if available, fallback to legacy items
    const items = catalog ? (catalog.products || catalog.items || []) : [];
    
    res.json({
      success: true,
      agent: {
        name: agent.name,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentMetadata?.agentCode,
        customSlug: agent.agentMetadata?.customSlug,
        territory: agent.agentMetadata?.territory,
        agentLevel: agent.agentMetadata?.agentLevel,
        storeCustomization: agent.agentMetadata?.storeCustomization || {}
      },
      catalog: items
    });
  } catch (err) {
    console.error('Get public agent store error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
});

/**
+ * Product Pricing Management Routes (Admin Only)
+ */

// Get all products
router.get('/products', auth, adminAuth, async (req, res) => {
  try {
    const products = await ProductPricing.find({}).sort({ network: 1, capacity: 1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Add new product/package
router.post('/products', auth, adminAuth, async (req, res) => {
  try {
    const { network, capacity, price, description, enabled = true } = req.body;
    
    if (!network || !capacity || price === undefined) {
      return res.status(400).json({ message: 'Network, capacity, and price are required' });
    }
    
    // Check if product already exists
    const existing = await ProductPricing.findOne({ network, capacity });
    if (existing) {
      return res.status(400).json({ message: 'Product already exists for this network and capacity' });
    }
    
    const product = new ProductPricing({
      network,
      capacity,
      price,
      description,
      enabled
    });
    
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Add product error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update product price/details
router.put('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const { price, description, enabled } = req.body;
    const product = await ProductPricing.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (enabled !== undefined) product.enabled = enabled;
    product.updatedAt = new Date();
    
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete product
router.delete('/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await ProductPricing.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Agent: update store customization (agent only)
router.put('/agent/customize-store', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'agent') {
      return res.status(403).json({ msg: 'Agent access required' });
    }
    
    const {
      customSlug,
      storeName,
      storeDescription,
      brandColor,
      logoUrl,
      bannerUrl,
      socialLinks,
      welcomeMessage,
      showAgentInfo,
      showContactButton
    } = req.body;
    
    const agent = await User.findById(req.user.id);
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }
    
    // Validate custom slug if provided
    if (customSlug) {
      // Check if slug is valid (alphanumeric, hyphens, underscores only)
      if (!/^[a-zA-Z0-9-_]+$/.test(customSlug)) {
        return res.status(400).json({ 
          msg: 'Invalid slug. Use only letters, numbers, hyphens, and underscores' 
        });
      }
      
      // Check if slug is already taken
      const existingAgent = await User.findOne({
        'agentMetadata.customSlug': customSlug,
        _id: { $ne: req.user.id }
      });
      
      if (existingAgent) {
        return res.status(400).json({ msg: 'This URL is already taken' });
      }
      
      agent.agentMetadata.customSlug = customSlug;
    }
    
    // Update customization fields
    if (!agent.agentMetadata.storeCustomization) {
      agent.agentMetadata.storeCustomization = {};
    }
    
    if (storeName !== undefined) agent.agentMetadata.storeCustomization.storeName = storeName;
    if (storeDescription !== undefined) agent.agentMetadata.storeCustomization.storeDescription = storeDescription;
    if (brandColor !== undefined) agent.agentMetadata.storeCustomization.brandColor = brandColor;
    if (logoUrl !== undefined) agent.agentMetadata.storeCustomization.logoUrl = logoUrl;
    if (bannerUrl !== undefined) agent.agentMetadata.storeCustomization.bannerUrl = bannerUrl;
    if (welcomeMessage !== undefined) agent.agentMetadata.storeCustomization.welcomeMessage = welcomeMessage;
    if (showAgentInfo !== undefined) agent.agentMetadata.storeCustomization.showAgentInfo = showAgentInfo;
    if (showContactButton !== undefined) agent.agentMetadata.storeCustomization.showContactButton = showContactButton;
    
    if (socialLinks) {
      if (!agent.agentMetadata.storeCustomization.socialLinks) {
        agent.agentMetadata.storeCustomization.socialLinks = {};
      }
      if (socialLinks.whatsapp !== undefined) agent.agentMetadata.storeCustomization.socialLinks.whatsapp = socialLinks.whatsapp;
      if (socialLinks.facebook !== undefined) agent.agentMetadata.storeCustomization.socialLinks.facebook = socialLinks.facebook;
      if (socialLinks.twitter !== undefined) agent.agentMetadata.storeCustomization.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.instagram !== undefined) agent.agentMetadata.storeCustomization.socialLinks.instagram = socialLinks.instagram;
    }
    
    await agent.save();
    
    res.json({
      success: true,
      message: 'Store customization updated successfully',
      customization: agent.agentMetadata.storeCustomization,
      customSlug: agent.agentMetadata.customSlug,
      storeUrl: agent.agentMetadata.customSlug 
        ? `/agent-store/${agent.agentMetadata.customSlug}`
        : `/agent-store/${agent.agentMetadata.agentCode}`
    });
  } catch (err) {
    console.error('Update store customization error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
});

module.exports = router;