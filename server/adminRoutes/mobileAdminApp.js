const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/auth');

// Mobile Admin App routes
router.get('/dashboard', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile dashboard data
    const dashboard = {
      stats: {
        totalUsers: 1250,
        activeUsers: 1180,
        totalRevenue: 45000,
        todayRevenue: 1200,
        pendingOrders: 15,
        completedOrders: 125,
        lowStockItems: 8,
        outOfStockItems: 3
      },
      recentActivity: [
        {
          id: 'ACT-001',
          type: 'user_registration',
          message: 'New user registered: john.doe@example.com',
          timestamp: new Date(Date.now() - 5 * 60000),
          priority: 'low'
        },
        {
          id: 'ACT-002',
          type: 'payment_success',
          message: 'Payment received: GHS 50.00',
          timestamp: new Date(Date.now() - 10 * 60000),
          priority: 'medium'
        },
        {
          id: 'ACT-003',
          type: 'low_stock',
          message: 'Low stock alert: MTN 1GB Data Bundle',
          timestamp: new Date(Date.now() - 15 * 60000),
          priority: 'high'
        },
        {
          id: 'ACT-004',
          type: 'order_completed',
          message: 'Order completed: #ORD-001',
          timestamp: new Date(Date.now() - 20 * 60000),
          priority: 'medium'
        }
      ],
      quickActions: [
        { id: 'QA-001', name: 'Add User', icon: 'user-plus', action: 'add_user' },
        { id: 'QA-002', name: 'View Orders', icon: 'shopping-cart', action: 'view_orders' },
        { id: 'QA-003', name: 'Check Inventory', icon: 'package', action: 'check_inventory' },
        { id: 'QA-004', name: 'Send Notification', icon: 'bell', action: 'send_notification' }
      ],
      charts: {
        revenue: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [1200, 1500, 1800, 1600, 2000, 2200, 1900]
        },
        users: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [100, 150, 200, 250, 300, 350]
        }
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Mobile dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile dashboard data'
    });
  }
});

router.get('/notifications', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile notifications data
    const notifications = [
      {
        id: 'NOTIF-001',
        title: 'Low Stock Alert',
        message: 'MTN 1GB Data Bundle is running low (45 units remaining)',
        type: 'warning',
        priority: 'high',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        action: {
          type: 'navigate',
          screen: 'inventory',
          params: { productId: 'PROD-002' }
        }
      },
      {
        id: 'NOTIF-002',
        title: 'Payment Received',
        message: 'Payment of GHS 50.00 received from user@example.com',
        type: 'success',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1 * 3600000),
        read: false,
        action: {
          type: 'navigate',
          screen: 'transactions',
          params: { transactionId: 'TXN-001' }
        }
      },
      {
        id: 'NOTIF-003',
        title: 'New User Registration',
        message: 'New user registered: john.doe@example.com',
        type: 'info',
        priority: 'low',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
        action: {
          type: 'navigate',
          screen: 'users',
          params: { userId: 'USER-001' }
        }
      },
      {
        id: 'NOTIF-004',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM',
        type: 'info',
        priority: 'medium',
        timestamp: new Date(Date.now() - 3 * 3600000),
        read: true,
        action: null
      }
    ];

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Mobile notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile notifications'
    });
  }
});

router.get('/users', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile users data
    const users = [
      {
        id: 'USER-001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+233123456789',
        status: 'active',
        role: 'buyer',
        walletBalance: 150.00,
        lastLogin: new Date(Date.now() - 2 * 3600000),
        totalOrders: 25,
        totalSpent: 1250.00,
        registeredAt: new Date(Date.now() - 30 * 86400000)
      },
      {
        id: 'USER-002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+233987654321',
        status: 'active',
        role: 'buyer',
        walletBalance: 75.00,
        lastLogin: new Date(Date.now() - 1 * 3600000),
        totalOrders: 18,
        totalSpent: 890.00,
        registeredAt: new Date(Date.now() - 25 * 86400000)
      },
      {
        id: 'USER-003',
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        phone: '+233555666777',
        status: 'inactive',
        role: 'buyer',
        walletBalance: 0.00,
        lastLogin: new Date(Date.now() - 7 * 86400000),
        totalOrders: 5,
        totalSpent: 250.00,
        registeredAt: new Date(Date.now() - 60 * 86400000)
      }
    ];

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Mobile users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile users data'
    });
  }
});

router.get('/orders', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile orders data
    const orders = [
      {
        id: 'ORD-001',
        userId: 'USER-001',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        status: 'pending',
        totalAmount: 25.00,
        items: [
          { name: 'MTN 1GB Data Bundle', quantity: 1, price: 25.00 }
        ],
        paymentMethod: 'mobile_money',
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000)
      },
      {
        id: 'ORD-002',
        userId: 'USER-002',
        userName: 'Jane Smith',
        userEmail: 'jane.smith@example.com',
        status: 'completed',
        totalAmount: 50.00,
        items: [
          { name: 'Vodafone 2GB Data Bundle', quantity: 2, price: 50.00 }
        ],
        paymentMethod: 'card',
        createdAt: new Date(Date.now() - 1 * 3600000),
        updatedAt: new Date(Date.now() - 45 * 60000)
      },
      {
        id: 'ORD-003',
        userId: 'USER-003',
        userName: 'Bob Wilson',
        userEmail: 'bob.wilson@example.com',
        status: 'failed',
        totalAmount: 15.00,
        items: [
          { name: 'AirtelTigo 500MB Data Bundle', quantity: 1, price: 15.00 }
        ],
        paymentMethod: 'mobile_money',
        createdAt: new Date(Date.now() - 2 * 3600000),
        updatedAt: new Date(Date.now() - 2 * 3600000),
        failureReason: 'Insufficient funds'
      }
    ];

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Mobile orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile orders data'
    });
  }
});

router.get('/inventory', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile inventory data
    const inventory = [
      {
        id: 'PROD-001',
        name: 'MTN 1GB Data Bundle',
        category: 'data',
        provider: 'MTN',
        stock: 1000,
        minStock: 100,
        status: 'active',
        price: 25.00,
        lowStockAlert: false,
        outOfStock: false
      },
      {
        id: 'PROD-002',
        name: 'Vodafone 2GB Data Bundle',
        category: 'data',
        provider: 'Vodafone',
        stock: 45,
        minStock: 50,
        status: 'active',
        price: 50.00,
        lowStockAlert: true,
        outOfStock: false
      },
      {
        id: 'PROD-003',
        name: 'AirtelTigo 500MB Data Bundle',
        category: 'data',
        provider: 'AirtelTigo',
        stock: 0,
        minStock: 200,
        status: 'inactive',
        price: 15.00,
        lowStockAlert: true,
        outOfStock: true
      }
    ];

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Mobile inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile inventory data'
    });
  }
});

router.get('/transactions', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile transactions data
    const transactions = [
      {
        id: 'TXN-001',
        userId: 'USER-001',
        userName: 'John Doe',
        type: 'payment',
        amount: 25.00,
        status: 'success',
        method: 'mobile_money',
        description: 'Payment for MTN 1GB Data Bundle',
        timestamp: new Date(Date.now() - 30 * 60000),
        reference: 'TXN-001-REF'
      },
      {
        id: 'TXN-002',
        userId: 'USER-002',
        userName: 'Jane Smith',
        type: 'payment',
        amount: 50.00,
        status: 'success',
        method: 'card',
        description: 'Payment for Vodafone 2GB Data Bundle',
        timestamp: new Date(Date.now() - 1 * 3600000),
        reference: 'TXN-002-REF'
      },
      {
        id: 'TXN-003',
        userId: 'USER-003',
        userName: 'Bob Wilson',
        type: 'payment',
        amount: 15.00,
        status: 'failed',
        method: 'mobile_money',
        description: 'Payment for AirtelTigo 500MB Data Bundle',
        timestamp: new Date(Date.now() - 2 * 3600000),
        reference: 'TXN-003-REF',
        failureReason: 'Insufficient funds'
      }
    ];

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Mobile transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile transactions data'
    });
  }
});

router.get('/analytics', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile analytics data
    const analytics = {
      overview: {
        totalUsers: 1250,
        activeUsers: 1180,
        totalRevenue: 45000,
        todayRevenue: 1200,
        pendingOrders: 15,
        completedOrders: 125
      },
      charts: {
        revenue: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [1200, 1500, 1800, 1600, 2000, 2200, 1900]
        },
        users: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [100, 150, 200, 250, 300, 350]
        },
        orders: {
          labels: ['Pending', 'Processing', 'Completed', 'Failed'],
          data: [15, 25, 125, 5]
        }
      },
      trends: [
        { metric: 'Revenue', change: 12.5, trend: 'up' },
        { metric: 'Users', change: 8.3, trend: 'up' },
        { metric: 'Orders', change: -2.1, trend: 'down' }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Mobile analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile analytics data'
    });
  }
});

router.get('/settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock mobile settings data
    const settings = {
      notifications: {
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        lowStockAlerts: true,
        paymentAlerts: true,
        userRegistrationAlerts: false
      },
      display: {
        theme: 'light',
        language: 'en',
        currency: 'GHS',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      },
      security: {
        biometricAuth: true,
        autoLock: true,
        lockTimeout: 300,
        twoFactorAuth: false
      },
      sync: {
        autoSync: true,
        syncInterval: 300,
        lastSync: new Date(Date.now() - 5 * 60000),
        syncStatus: 'success'
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Mobile settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile settings'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In real implementation, this would mark the notification as read
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Update mobile settings
router.put('/settings', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { notifications, display, security, sync } = req.body;
    
    // In real implementation, this would update the mobile settings
    res.json({
      success: true,
      message: 'Mobile settings updated successfully'
    });
  } catch (error) {
    console.error('Update mobile settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mobile settings'
    });
  }
});

// Sync mobile data
router.post('/sync', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { data } = req.body;
    
    // In real implementation, this would sync mobile data
    const syncResult = {
      status: 'success',
      syncedAt: new Date(),
      recordsSynced: 150,
      message: 'Mobile data sync completed successfully'
    };

    res.json({
      success: true,
      data: syncResult,
      message: 'Mobile data sync completed'
    });
  } catch (error) {
    console.error('Mobile sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync mobile data'
    });
  }
});

// Get mobile app version info
router.get('/version', authMiddleware, adminAuth, async (req, res) => {
  try {
    const versionInfo = {
      currentVersion: '1.2.0',
      latestVersion: '1.2.0',
      updateAvailable: false,
      updateRequired: false,
      releaseNotes: [
        'Bug fixes and performance improvements',
        'New inventory management features',
        'Enhanced notification system'
      ],
      lastUpdated: new Date(Date.now() - 7 * 86400000)
    };

    res.json({
      success: true,
      data: versionInfo
    });
  } catch (error) {
    console.error('Mobile version error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mobile version info'
    });
  }
});

module.exports = router;
