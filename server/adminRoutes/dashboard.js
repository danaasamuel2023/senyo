const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const User = require('../schema/schema').User;
const DataPurchase = require('../schema/schema').DataPurchase;

// Get dashboard statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // Get basic statistics
    const totalUsers = await User.countDocuments();
    const totalOrders = await DataPurchase.countDocuments();
    
    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await DataPurchase.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayRevenue = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await DataPurchase.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .select('orderId totalAmount status createdAt network type amount phoneNumber');

    // Get network statistics
    const networkStats = await DataPurchase.aggregate([
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          todayOrders,
          todayRevenue: todayRevenue[0]?.total || 0
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          customer: order.userId ? order.userId.name : 'Guest',
          email: order.userId ? order.userId.email : 'N/A',
          amount: order.totalAmount,
          status: order.status,
          network: order.network,
          type: order.type,
          phoneNumber: order.phoneNumber,
          createdAt: order.createdAt
        })),
        networkStats: networkStats.map(stat => ({
          network: stat._id || 'Unknown',
          orders: stat.count,
          revenue: stat.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
});

// Get daily summary
router.get('/daily-summary', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get daily statistics
    const dailyOrders = await DataPurchase.find({
      createdAt: { $gte: targetDate, $lt: nextDay }
    }).populate('userId', 'name email');

    const dailyRevenue = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: targetDate, $lt: nextDay },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const networkBreakdown = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: targetDate, $lt: nextDay }
        }
      },
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const statusBreakdown = await DataPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: targetDate, $lt: nextDay }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        summary: {
          totalOrders: dailyOrders.length,
          totalRevenue: dailyRevenue[0]?.total || 0,
          completedOrders: statusBreakdown.find(s => s._id === 'completed')?.count || 0,
          pendingOrders: statusBreakdown.find(s => s._id === 'pending')?.count || 0,
          failedOrders: statusBreakdown.find(s => s._id === 'failed')?.count || 0
        },
        networkBreakdown: networkBreakdown.map(stat => ({
          network: stat._id || 'Unknown',
          orders: stat.count,
          revenue: stat.revenue
        })),
        orders: dailyOrders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          customer: order.userId ? order.userId.name : 'Guest',
          email: order.userId ? order.userId.email : 'N/A',
          amount: order.totalAmount,
          status: order.status,
          network: order.network,
          type: order.type,
          phoneNumber: order.phoneNumber,
          createdAt: order.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch daily summary' 
    });
  }
});

module.exports = router;
