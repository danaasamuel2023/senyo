const express = require('express');
const router = express.Router();
const adminAuth = require('../adminMiddleware/middleware');
const { User, AgentCatalog, ProductPricing } = require('../schema/schema');

// ============================================
// PRODUCT ASSIGNMENT SYSTEM
// ============================================

// Get all products available for assignment
router.get('/products', adminAuth, async (req, res) => {
  try {
    // Get all products from the main product collection
    // This would typically come from your main product database
    const products = [
      {
        id: 'mtn_1gb',
        name: 'MTN 1GB',
        network: 'MTN',
        capacity: 1,
        basePrice: 5.00,
        category: 'data'
      },
      {
        id: 'mtn_2gb',
        name: 'MTN 2GB',
        network: 'MTN',
        capacity: 2,
        basePrice: 10.00,
        category: 'data'
      },
      {
        id: 'mtn_5gb',
        name: 'MTN 5GB',
        network: 'MTN',
        capacity: 5,
        basePrice: 25.00,
        category: 'data'
      },
      {
        id: 'mtn_10gb',
        name: 'MTN 10GB',
        network: 'MTN',
        capacity: 10,
        basePrice: 50.00,
        category: 'data'
      },
      {
        id: 'airteltigo_1gb',
        name: 'AirtelTigo 1GB',
        network: 'AirtelTigo',
        capacity: 1,
        basePrice: 5.00,
        category: 'data'
      },
      {
        id: 'airteltigo_2gb',
        name: 'AirtelTigo 2GB',
        network: 'AirtelTigo',
        capacity: 2,
        basePrice: 10.00,
        category: 'data'
      },
      {
        id: 'telecel_1gb',
        name: 'Telecel 1GB',
        network: 'Telecel',
        capacity: 1,
        basePrice: 5.00,
        category: 'data'
      },
      {
        id: 'telecel_2gb',
        name: 'Telecel 2GB',
        network: 'Telecel',
        capacity: 2,
        basePrice: 10.00,
        category: 'data'
      }
    ];

    res.json({
      success: true,
      products: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get agent's current catalog
router.get('/agent/:agentId/catalog', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;

    const catalog = await AgentCatalog.findOne({ agentId: agentId });
    const productPricing = await ProductPricing.find({ agentId: agentId });

    if (!catalog) {
      return res.json({
        success: true,
        catalog: {
          products: [],
          productPricing: []
        }
      });
    }

    res.json({
      success: true,
      catalog: {
        products: catalog.products || [],
        productPricing: productPricing
      }
    });

  } catch (error) {
    console.error('Get agent catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent catalog'
    });
  }
});

// Add product to agent catalog
router.post('/agent/:agentId/catalog', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { productId, network, capacity, basePrice, agentPrice, isActive = true } = req.body;

    // Find or create agent catalog
    let catalog = await AgentCatalog.findOne({ agentId: agentId });
    if (!catalog) {
      catalog = new AgentCatalog({
        agentId: agentId,
        products: [],
        isActive: true,
        createdAt: new Date()
      });
    }

    // Check if product already exists
    const existingProduct = catalog.products.find(p => p.productId === productId);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists in agent catalog'
      });
    }

    // Add product to catalog
    const newProduct = {
      productId: productId,
      network: network,
      capacity: capacity,
      basePrice: basePrice,
      agentPrice: agentPrice || basePrice,
      isActive: isActive,
      addedAt: new Date(),
      addedBy: req.admin._id
    };

    catalog.products.push(newProduct);
    await catalog.save();

    // Create or update product pricing
    let pricing = await ProductPricing.findOne({ 
      agentId: agentId, 
      productId: productId 
    });

    if (!pricing) {
      pricing = new ProductPricing({
        agentId: agentId,
        productId: productId,
        basePrice: basePrice,
        agentPrice: agentPrice || basePrice,
        isActive: isActive,
        createdAt: new Date()
      });
    } else {
      pricing.agentPrice = agentPrice || basePrice;
      pricing.isActive = isActive;
      pricing.updatedAt = new Date();
    }

    await pricing.save();

    res.json({
      success: true,
      message: 'Product added to agent catalog successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Add product to catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to catalog'
    });
  }
});

// Update product in agent catalog
router.put('/agent/:agentId/catalog/:productId', adminAuth, async (req, res) => {
  try {
    const { agentId, productId } = req.params;
    const { agentPrice, isActive } = req.body;

    // Update catalog
    const catalog = await AgentCatalog.findOne({ agentId: agentId });
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Agent catalog not found'
      });
    }

    const product = catalog.products.find(p => p.productId === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in catalog'
      });
    }

    // Update product
    product.agentPrice = agentPrice || product.agentPrice;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.updatedAt = new Date();
    product.updatedBy = req.admin._id;

    await catalog.save();

    // Update pricing
    const pricing = await ProductPricing.findOne({ 
      agentId: agentId, 
      productId: productId 
    });

    if (pricing) {
      pricing.agentPrice = agentPrice || pricing.agentPrice;
      pricing.isActive = isActive !== undefined ? isActive : pricing.isActive;
      pricing.updatedAt = new Date();
      await pricing.save();
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: product
    });

  } catch (error) {
    console.error('Update product in catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Remove product from agent catalog
router.delete('/agent/:agentId/catalog/:productId', adminAuth, async (req, res) => {
  try {
    const { agentId, productId } = req.params;

    // Update catalog
    const catalog = await AgentCatalog.findOne({ agentId: agentId });
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Agent catalog not found'
      });
    }

    catalog.products = catalog.products.filter(p => p.productId !== productId);
    await catalog.save();

    // Remove pricing
    await ProductPricing.deleteOne({ 
      agentId: agentId, 
      productId: productId 
    });

    res.json({
      success: true,
      message: 'Product removed from catalog successfully'
    });

  } catch (error) {
    console.error('Remove product from catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from catalog'
    });
  }
});

// Bulk assign products to agent
router.post('/agent/:agentId/catalog/bulk', adminAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { products } = req.body;

    // Find or create agent catalog
    let catalog = await AgentCatalog.findOne({ agentId: agentId });
    if (!catalog) {
      catalog = new AgentCatalog({
        agentId: agentId,
        products: [],
        isActive: true,
        createdAt: new Date()
      });
    }

    const results = [];
    
    for (const productData of products) {
      try {
        const { productId, network, capacity, basePrice, agentPrice, isActive = true } = productData;

        // Check if product already exists
        const existingProduct = catalog.products.find(p => p.productId === productId);
        if (existingProduct) {
          results.push({ productId, status: 'skipped', reason: 'Already exists' });
          continue;
        }

        // Add product to catalog
        const newProduct = {
          productId: productId,
          network: network,
          capacity: capacity,
          basePrice: basePrice,
          agentPrice: agentPrice || basePrice,
          isActive: isActive,
          addedAt: new Date(),
          addedBy: req.admin._id
        };

        catalog.products.push(newProduct);

        // Create pricing
        const pricing = new ProductPricing({
          agentId: agentId,
          productId: productId,
          basePrice: basePrice,
          agentPrice: agentPrice || basePrice,
          isActive: isActive,
          createdAt: new Date()
        });

        await pricing.save();
        results.push({ productId, status: 'added', product: newProduct });

      } catch (error) {
        results.push({ productId: productData.productId, status: 'error', error: error.message });
      }
    }

    await catalog.save();

    res.json({
      success: true,
      message: 'Bulk assignment completed',
      results: results
    });

  } catch (error) {
    console.error('Bulk assign products error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk assignment failed'
    });
  }
});

// Get product assignment statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalAgents = await User.countDocuments({ role: 'agent', 'agentMetadata.status': 'active' });
    const totalCatalogs = await AgentCatalog.countDocuments({ isActive: true });
    const totalProductAssignments = await ProductPricing.countDocuments({ isActive: true });

    // Get top agents by product count
    const topAgents = await AgentCatalog.aggregate([
      { $match: { isActive: true } },
      { $project: { agentId: 1, productCount: { $size: '$products' } } },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'agentId',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: '$agent' },
      {
        $project: {
          agentId: 1,
          agentName: '$agent.name',
          agentCode: '$agent.agentMetadata.agentCode',
          productCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalAgents: totalAgents,
        totalCatalogs: totalCatalogs,
        totalProductAssignments: totalProductAssignments,
        topAgents: topAgents
      }
    });

  } catch (error) {
    console.error('Get product assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
