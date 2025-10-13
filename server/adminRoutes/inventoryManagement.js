const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/unified-auth');

// Advanced Inventory Management routes
router.get('/products', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock product inventory data
    const products = [
      {
        id: 'PROD-001',
        name: 'MTN 1GB Data Bundle',
        category: 'data',
        provider: 'MTN',
        price: 15.00,
        cost: 12.00,
        stock: 1000,
        minStock: 100,
        maxStock: 5000,
        status: 'active',
        sku: 'MTN-1GB-001',
        description: '1GB MTN data bundle valid for 30 days',
        tags: ['mtn', 'data', '1gb'],
        lastRestocked: new Date(Date.now() - 5 * 86400000),
        lastSold: new Date(Date.now() - 2 * 3600000),
        totalSold: 2500,
        profitMargin: 20.0,
        lowStockAlert: false,
        outOfStock: false
      },
      {
        id: 'PROD-002',
        name: 'Vodafone 2GB Data Bundle',
        category: 'data',
        provider: 'Vodafone',
        price: 25.00,
        cost: 20.00,
        stock: 45,
        minStock: 50,
        maxStock: 3000,
        status: 'active',
        sku: 'VOD-2GB-001',
        description: '2GB Vodafone data bundle valid for 30 days',
        tags: ['vodafone', 'data', '2gb'],
        lastRestocked: new Date(Date.now() - 10 * 86400000),
        lastSold: new Date(Date.now() - 1 * 3600000),
        totalSold: 1800,
        profitMargin: 20.0,
        lowStockAlert: true,
        outOfStock: false
      },
      {
        id: 'PROD-003',
        name: 'AirtelTigo 500MB Data Bundle',
        category: 'data',
        provider: 'AirtelTigo',
        price: 8.00,
        cost: 6.50,
        stock: 0,
        minStock: 200,
        maxStock: 2000,
        status: 'inactive',
        sku: 'AT-500MB-001',
        description: '500MB AirtelTigo data bundle valid for 7 days',
        tags: ['airteltigo', 'data', '500mb'],
        lastRestocked: new Date(Date.now() - 15 * 86400000),
        lastSold: new Date(Date.now() - 3 * 86400000),
        totalSold: 3200,
        profitMargin: 18.75,
        lowStockAlert: true,
        outOfStock: true
      }
    ];

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

router.get('/suppliers', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock supplier data
    const suppliers = [
      {
        id: 'SUPP-001',
        name: 'MTN Ghana',
        contact: 'mtn-support@mtn.com.gh',
        phone: '+233 30 222 0000',
        address: 'MTN House, Independence Avenue, Accra',
        status: 'active',
        rating: 4.8,
        totalOrders: 150,
        totalValue: 45000.00,
        paymentTerms: 'Net 30',
        lastOrder: new Date(Date.now() - 3 * 86400000),
        reliability: 'excellent',
        categories: ['data', 'airtime']
      },
      {
        id: 'SUPP-002',
        name: 'Vodafone Ghana',
        contact: 'business@vodafone.com.gh',
        phone: '+233 30 222 2222',
        address: 'Vodafone House, Ring Road East, Accra',
        status: 'active',
        rating: 4.6,
        totalOrders: 120,
        totalValue: 38000.00,
        paymentTerms: 'Net 15',
        lastOrder: new Date(Date.now() - 7 * 86400000),
        reliability: 'good',
        categories: ['data', 'airtime']
      },
      {
        id: 'SUPP-003',
        name: 'AirtelTigo Ghana',
        contact: 'support@airteltigo.com.gh',
        phone: '+233 30 222 3333',
        address: 'AirtelTigo House, Airport City, Accra',
        status: 'inactive',
        rating: 4.2,
        totalOrders: 80,
        totalValue: 25000.00,
        paymentTerms: 'Net 45',
        lastOrder: new Date(Date.now() - 20 * 86400000),
        reliability: 'fair',
        categories: ['data', 'airtime']
      }
    ];

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Suppliers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suppliers'
    });
  }
});

router.get('/orders', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock purchase orders data
    const orders = [
      {
        id: 'PO-001',
        supplierId: 'SUPP-001',
        supplierName: 'MTN Ghana',
        status: 'completed',
        orderDate: new Date(Date.now() - 5 * 86400000),
        deliveryDate: new Date(Date.now() - 2 * 86400000),
        totalAmount: 15000.00,
        items: [
          { productId: 'PROD-001', quantity: 1000, unitPrice: 12.00, totalPrice: 12000.00 },
          { productId: 'PROD-004', quantity: 500, unitPrice: 6.00, totalPrice: 3000.00 }
        ],
        paymentStatus: 'paid',
        notes: 'Regular monthly restock',
        createdBy: 'Admin User'
      },
      {
        id: 'PO-002',
        supplierId: 'SUPP-002',
        supplierName: 'Vodafone Ghana',
        status: 'pending',
        orderDate: new Date(Date.now() - 2 * 86400000),
        deliveryDate: new Date(Date.now() + 3 * 86400000),
        totalAmount: 8000.00,
        items: [
          { productId: 'PROD-002', quantity: 400, unitPrice: 20.00, totalPrice: 8000.00 }
        ],
        paymentStatus: 'pending',
        notes: 'Urgent restock needed',
        createdBy: 'Admin User'
      }
    ];

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

router.get('/analytics', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock inventory analytics data
    const analytics = [
      {
        metric: 'Total Stock Value',
        value: 125000.00,
        change: 8.5,
        trend: 'up',
        currency: 'GHS'
      },
      {
        metric: 'Low Stock Items',
        value: 8,
        change: -2,
        trend: 'down'
      },
      {
        metric: 'Out of Stock Items',
        value: 3,
        change: 1,
        trend: 'up'
      },
      {
        metric: 'Average Profit Margin',
        value: 19.8,
        change: 2.1,
        trend: 'up',
        unit: '%'
      }
    ];

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory analytics'
    });
  }
});

router.get('/stats', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock inventory statistics
    const stats = {
      totalProducts: 45,
      activeProducts: 42,
      inactiveProducts: 3,
      totalStockValue: 125000.00,
      lowStockItems: 8,
      outOfStockItems: 3,
      totalSuppliers: 12,
      activeSuppliers: 10,
      pendingOrders: 5,
      completedOrders: 150,
      avgProfitMargin: 19.8,
      topSellingProduct: 'MTN 1GB Data Bundle',
      slowMovingItems: 12,
      fastMovingItems: 18
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Inventory stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory statistics'
    });
  }
});

router.get('/alerts', authMiddleware, adminAuth, async (req, res) => {
  try {
    // Mock inventory alerts
    const alerts = [
      {
        id: 'ALERT-001',
        type: 'low_stock',
        severity: 'warning',
        title: 'Low Stock Alert',
        message: 'Vodafone 2GB Data Bundle is running low (45 units remaining)',
        productId: 'PROD-002',
        productName: 'Vodafone 2GB Data Bundle',
        threshold: 50,
        currentStock: 45,
        createdAt: new Date(Date.now() - 2 * 3600000),
        acknowledged: false
      },
      {
        id: 'ALERT-002',
        type: 'out_of_stock',
        severity: 'critical',
        title: 'Out of Stock Alert',
        message: 'AirtelTigo 500MB Data Bundle is out of stock',
        productId: 'PROD-003',
        productName: 'AirtelTigo 500MB Data Bundle',
        threshold: 0,
        currentStock: 0,
        createdAt: new Date(Date.now() - 1 * 86400000),
        acknowledged: false
      },
      {
        id: 'ALERT-003',
        type: 'supplier_issue',
        severity: 'medium',
        title: 'Supplier Payment Overdue',
        message: 'Payment to AirtelTigo Ghana is 15 days overdue',
        supplierId: 'SUPP-003',
        supplierName: 'AirtelTigo Ghana',
        amount: 5000.00,
        dueDate: new Date(Date.now() - 15 * 86400000),
        createdAt: new Date(Date.now() - 5 * 86400000),
        acknowledged: false
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory alerts'
    });
  }
});

// Create new product
router.post('/products', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { name, category, provider, price, cost, stock, minStock, maxStock, sku, description, tags } = req.body;
    
    // In real implementation, this would create a product in the database
    const newProduct = {
      id: `PROD-${Date.now()}`,
      name,
      category,
      provider,
      price,
      cost,
      stock: stock || 0,
      minStock: minStock || 10,
      maxStock: maxStock || 1000,
      status: 'active',
      sku,
      description,
      tags: tags || [],
      lastRestocked: null,
      lastSold: null,
      totalSold: 0,
      profitMargin: ((price - cost) / price * 100).toFixed(2),
      lowStockAlert: false,
      outOfStock: false,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update product
router.put('/products/:id', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, cost, stock, minStock, maxStock, status } = req.body;
    
    // In real implementation, this would update the product in the database
    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Create purchase order
router.post('/orders', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { supplierId, items, notes, deliveryDate } = req.body;
    
    // In real implementation, this would create a purchase order in the database
    const newOrder = {
      id: `PO-${Date.now()}`,
      supplierId,
      status: 'pending',
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      items,
      paymentStatus: 'pending',
      notes,
      createdBy: 'Admin User',
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: newOrder,
      message: 'Purchase order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create purchase order'
    });
  }
});

// Restock product
router.post('/products/:id/restock', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, cost, supplierId, notes } = req.body;
    
    // In real implementation, this would update stock and create transaction
    res.json({
      success: true,
      message: 'Product restocked successfully'
    });
  } catch (error) {
    console.error('Restock product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restock product'
    });
  }
});

// Acknowledge alert
router.put('/alerts/:id/acknowledge', authMiddleware, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In real implementation, this would mark the alert as acknowledged
    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

module.exports = router;
