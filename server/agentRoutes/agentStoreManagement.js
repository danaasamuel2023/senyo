const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const { User, AgentCatalog, ProductPricing } = require('../schema/schema');

// ============================================
// AGENT STORE CUSTOMIZATION
// ============================================

// Update agent store customization
router.put('/customization', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { storeName, brandColor, logoUrl, socialLinks, businessHours, welcomeMessage } = req.body;

    // Update agent's store customization
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Initialize agentMetadata if it doesn't exist
    if (!agent.agentMetadata) {
      agent.agentMetadata = {};
    }

    // Initialize storeCustomization if it doesn't exist
    if (!agent.agentMetadata.storeCustomization) {
      agent.agentMetadata.storeCustomization = {};
    }

    // Update store customization
    if (storeName) agent.agentMetadata.storeCustomization.storeName = storeName;
    if (brandColor) agent.agentMetadata.storeCustomization.brandColor = brandColor;
    if (logoUrl) agent.agentMetadata.storeCustomization.logoUrl = logoUrl;
    if (welcomeMessage) agent.agentMetadata.storeCustomization.welcomeMessage = welcomeMessage;
    if (socialLinks) agent.agentMetadata.storeCustomization.socialLinks = socialLinks;
    if (businessHours) agent.agentMetadata.storeCustomization.businessHours = businessHours;

    await agent.save();

    res.json({
      success: true,
      message: 'Store customization updated successfully',
      customization: agent.agentMetadata.storeCustomization
    });

  } catch (error) {
    console.error('Update store customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get agent store customization
router.get('/customization', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    
    const agent = await User.findById(agentId).select('agentMetadata');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const customization = agent.agentMetadata?.storeCustomization || {
      storeName: `${agent.name}'s Data Store`,
      brandColor: '#EAB308',
      welcomeMessage: 'Welcome to my data store!',
      socialLinks: {},
      businessHours: 'Mon-Sun: 8AM - 9PM'
    };

    res.json({
      success: true,
      customization
    });

  } catch (error) {
    console.error('Get store customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// AGENT PRODUCT CATALOG MANAGEMENT
// ============================================

// Get agent's product catalog
router.get('/catalog', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { network, category, search } = req.query;

    // Get agent catalog
    let catalog = await AgentCatalog.findOne({ agentId });
    
    if (!catalog) {
      // Create default catalog with all available products
      const allProducts = await ProductPricing.find({ enabled: true }).lean();
      catalog = new AgentCatalog({
        agentId,
        products: allProducts.map(product => ({
          productId: product._id,
          name: `${product.network} ${product.capacity}GB Bundle`,
          network: product.network,
          capacity: product.capacity,
          basePrice: product.price,
          agentPrice: product.price,
          profit: 0,
          isActive: true,
          stock: 100,
          sales: 0
        }))
      });
      await catalog.save();
    }

    // Filter products
    let products = catalog.products || catalog.items || [];
    
    if (network && network !== 'all') {
      products = products.filter(p => p.network === network.toUpperCase());
    }
    
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.network.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      products,
      total: products.length
    });

  } catch (error) {
    console.error('Get agent catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update product in agent catalog
router.put('/catalog/:productId', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { productId } = req.params;
    const { agentPrice, isActive, stock } = req.body;

    // Get agent catalog
    let catalog = await AgentCatalog.findOne({ agentId });
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    // Find and update product
    const productIndex = catalog.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in catalog'
      });
    }

    const product = catalog.products[productIndex];
    
    if (agentPrice !== undefined) {
      product.agentPrice = agentPrice;
      product.profit = agentPrice - product.basePrice;
    }
    
    if (isActive !== undefined) {
      product.isActive = isActive;
    }
    
    if (stock !== undefined) {
      product.stock = stock;
    }

    await catalog.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add product to agent catalog
router.post('/catalog', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { productId, agentPrice, stock = 100 } = req.body;

    // Verify product exists
    const product = await ProductPricing.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create agent catalog
    let catalog = await AgentCatalog.findOne({ agentId });
    if (!catalog) {
      catalog = new AgentCatalog({ agentId, products: [] });
    }

    // Check if product already exists in catalog
    const existingProduct = catalog.products.find(p => p.productId.toString() === productId);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists in catalog'
      });
    }

    // Add product to catalog
    const catalogProduct = {
      productId: product._id,
      name: `${product.network} ${product.capacity}GB Bundle`,
      network: product.network,
      capacity: product.capacity,
      basePrice: product.price,
      agentPrice: agentPrice || product.price,
      profit: (agentPrice || product.price) - product.price,
      isActive: true,
      stock,
      sales: 0
    };

    catalog.products.push(catalogProduct);
    await catalog.save();

    res.json({
      success: true,
      message: 'Product added to catalog successfully',
      product: catalogProduct
    });

  } catch (error) {
    console.error('Add product to catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove product from agent catalog
router.delete('/catalog/:productId', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { productId } = req.params;

    // Get agent catalog
    const catalog = await AgentCatalog.findOne({ agentId });
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    // Remove product from catalog
    catalog.products = catalog.products.filter(p => p.productId.toString() !== productId);
    await catalog.save();

    res.json({
      success: true,
      message: 'Product removed from catalog successfully'
    });

  } catch (error) {
    console.error('Remove product from catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// AGENT STORE ANALYTICS
// ============================================

// Get agent store analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const agentId = req.user._id;
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get agent's orders for the period
    const orders = await Order.find({
      agentId: agentId,
      createdAt: { $gte: startDate }
    });

    // Get agent data to get commission rate
    const agent = await User.findById(agentId);
    const commissionRate = agent.agentMetadata?.commissionRate || 10; // Default 10% if not set

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const failedOrders = orders.filter(order => order.status === 'failed').length;

    // Calculate commission using actual commission rate
    const totalCommission = totalRevenue * (commissionRate / 100);

    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const key = `${item.network}-${item.capacity}`;
          if (!productSales[key]) {
            productSales[key] = { network: item.network, capacity: item.capacity, sales: 0, revenue: 0 };
          }
          productSales[key].sales += item.quantity || 1;
          productSales[key].revenue += item.price * (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Get daily sales for the period
    const dailySales = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { orders: 0, revenue: 0 };
      }
      dailySales[date].orders += 1;
      dailySales[date].revenue += order.totalAmount || 0;
    });

    const dailySalesArray = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          totalCommission,
          commissionRate,
          conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        topProducts,
        dailySales: dailySalesArray,
        period: {
          current: period,
          startDate,
          endDate: now
        }
      }
    });

  } catch (error) {
    console.error('Get agent store analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// PUBLIC AGENT STORE ENDPOINTS
// ============================================

// Get agent store data (public endpoint)
router.get('/store/:agentCode', async (req, res) => {
  try {
    const { agentCode } = req.params;
    
    // Find agent by agentCode
    const agent = await User.findOne({ agentCode: agentCode });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent store not found'
      });
    }

    // Return agent data with store customization
    res.json({
      success: true,
      agent: {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        agentCode: agent.agentCode,
        agentMetadata: agent.agentMetadata,
        storeCustomization: agent.agentMetadata?.storeCustomization || {}
      }
    });
  } catch (error) {
    console.error('Error fetching agent store:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get agent store products (public endpoint)
router.get('/store/:agentCode/products', async (req, res) => {
  try {
    const { agentCode } = req.params;
    
    // Find agent by agentCode
    const agent = await User.findOne({ agentCode: agentCode });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent store not found'
      });
    }

    // Get agent's products from their catalog
    const agentProducts = await AgentCatalog.find({ agentId: agent._id });
    
    // Get product pricing for agent
    const productPricing = await ProductPricing.find({ agentId: agent._id });
    
    // Combine products with pricing
    const products = agentProducts.map(product => {
      const pricing = productPricing.find(p => p.productId.toString() === product.productId.toString());
      return {
        ...product.toObject(),
        price: pricing ? pricing.agentPrice : product.basePrice,
        agentPrice: pricing ? pricing.agentPrice : product.basePrice,
        isActive: product.isActive
      };
    });

    res.json({
      success: true,
      products: products.filter(p => p.isActive)
    });
  } catch (error) {
    console.error('Error fetching agent store products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create order from agent store (public endpoint)
router.post('/store/:agentCode/order', auth, async (req, res) => {
  try {
    const { agentCode } = req.params;
    const { items, totalAmount, customerInfo } = req.body;
    
    // Find agent by agentCode
    const agent = await User.findOne({ agentCode: agentCode });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent store not found'
      });
    }

    // Create order with agent information
    const Order = require('../schema/schema').Order;
    const order = new Order({
      userId: req.user._id,
      agentId: agent._id,
      items: items,
      totalAmount: totalAmount,
      customerInfo: customerInfo,
      status: 'pending',
      source: 'agent-store',
      agentCode: agentCode
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      order: order
    });
  } catch (error) {
    console.error('Error creating agent store order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
