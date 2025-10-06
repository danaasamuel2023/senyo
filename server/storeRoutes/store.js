const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { ProductPricing, Order } = require('../schema/schema');

// ============================================
// PUBLIC STORE ROUTES (No Auth Required)
// ============================================

// Get all available products for the main store
router.get('/products', async (req, res) => {
  try {
    const { network, category, search } = req.query;
    
    // Build filter object
    const filter = { enabled: true };
    
    if (network && network !== 'all') {
      filter.network = network.toUpperCase();
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { network: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await ProductPricing.find(filter)
      .sort({ network: 1, capacity: 1 })
      .lean();

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: `${product.network} ${product.capacity}GB Bundle`,
      network: product.network,
      capacity: `${product.capacity}GB`,
      price: product.price,
      description: product.description || `${product.capacity}GB ${product.network} data bundle`,
      category: 'data',
      isActive: product.enabled,
      validity: '30 days',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    res.json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length
    });

  } catch (error) {
    console.error('Get store products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get store statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await ProductPricing.countDocuments({ enabled: true });
    const networkStats = await ProductPricing.aggregate([
      { $match: { enabled: true } },
      { $group: { _id: '$network', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { _id: 1 } }
    ]);

    const priceRange = await ProductPricing.aggregate([
      { $match: { enabled: true } },
      { $group: { 
        _id: null, 
        minPrice: { $min: '$price' }, 
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }}
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        networkStats,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
      }
    });

  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get featured products (most popular or cheapest)
router.get('/featured', async (req, res) => {
  try {
    const { type = 'popular', limit = 8 } = req.query;
    
    let sortCriteria = {};
    
    if (type === 'popular') {
      // Sort by capacity (assuming higher capacity = more popular)
      sortCriteria = { capacity: -1 };
    } else if (type === 'cheapest') {
      sortCriteria = { price: 1 };
    } else if (type === 'newest') {
      sortCriteria = { createdAt: -1 };
    }

    const products = await ProductPricing.find({ enabled: true })
      .sort(sortCriteria)
      .limit(parseInt(limit))
      .lean();

    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: `${product.network} ${product.capacity}GB Bundle`,
      network: product.network,
      capacity: `${product.capacity}GB`,
      price: product.price,
      description: product.description || `${product.capacity}GB ${product.network} data bundle`,
      category: 'data',
      isActive: product.enabled,
      validity: '30 days',
      featured: true
    }));

    res.json({
      success: true,
      products: transformedProducts
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// STORE ORDER PROCESSING
// ============================================

// Process store order (similar to existing order processing)
router.post('/order', auth, async (req, res) => {
  try {
    const { items, totalAmount, customerInfo } = req.body;
    const userId = req.user._id;

    // Validate order data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total amount is required'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.phoneNumber || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have id, phoneNumber, and price'
        });
      }

      // Verify product exists and is enabled
      const product = await ProductPricing.findById(item.id);
      if (!product || !product.enabled) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.id} not found or disabled`
        });
      }
    }

    // Create order (using existing order schema)
    
    const order = new Order({
      userId,
      items: items.map(item => ({
        productId: item.id,
        network: item.network,
        capacity: item.capacity,
        phoneNumber: item.phoneNumber,
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount,
      status: 'pending',
      orderType: 'store',
      source: 'main-store',
      customerInfo: {
        name: customerInfo?.name || req.user.name,
        email: customerInfo?.email || req.user.email,
        phone: customerInfo?.phone || req.user.phoneNumber
      }
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Create store order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user's store orders
router.get('/orders', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    
    const filter = { 
      userId, 
      orderType: 'store',
      source: 'main-store'
    };
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get store orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// STORE ANALYTICS (Admin Only)
// ============================================

// Get store analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    
    // Get store order statistics
    const storeOrders = await Order.aggregate([
      { $match: { orderType: 'store', source: 'main-store' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get network popularity
    const networkStats = await Order.aggregate([
      { $match: { orderType: 'store', source: 'main-store' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.network',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.price' }
        }
      },
      { $sort: { totalOrders: -1 } }
    ]);

    // Get daily sales for last 30 days
    const dailySales = await Order.aggregate([
      { 
        $match: { 
          orderType: 'store', 
          source: 'main-store',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: storeOrders[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          pendingOrders: 0,
          completedOrders: 0
        },
        networkStats,
        dailySales
      }
    });

  } catch (error) {
    console.error('Get store analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// STORE CONFIGURATION
// ============================================

// Get store configuration
router.get('/config', async (req, res) => {
  try {
    const storeConfig = {
      name: 'DATAMART',
      tagline: 'Your one-stop shop for affordable data bundles',
      description: 'Powered by SamTech',
      brandColor: '#EAB308',
      contact: {
        phone: '+233 24 123 4567',
        email: 'datamartghana@gmail.com',
        address: 'SamTech Building, Digital Street, Accra',
        hours: 'Mon-Sun: 8AM - 9PM'
      },
      socialLinks: {
        whatsapp: '+233241234567',
        facebook: 'https://facebook.com/datamartgh',
        twitter: 'https://twitter.com/datamartgh',
        instagram: 'https://instagram.com/datamartgh'
      },
      features: [
        {
          icon: 'Zap',
          title: 'Instant Delivery',
          description: 'Get your data bundles instantly after payment'
        },
        {
          icon: 'Shield',
          title: 'Secure Payment',
          description: 'Safe and secure payment processing'
        },
        {
          icon: 'Headphones',
          title: '24/7 Support',
          description: 'Round-the-clock customer support'
        },
        {
          icon: 'Award',
          title: 'Best Prices',
          description: 'Competitive prices for all networks'
        }
      ],
      networks: ['MTN', 'TELECEL', 'AT'],
      supportedCurrencies: ['GHS'],
      paymentMethods: ['mobile_money', 'card', 'bank_transfer']
    };

    res.json({
      success: true,
      config: storeConfig
    });

  } catch (error) {
    console.error('Get store config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;