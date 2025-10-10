const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const adminAuth = require('../adminMiddleware/middleware');
const { ProductPricing, DataInventory, PriceHistory, User } = require('../schema/schema');
const axios = require('axios');

// DataMart API Configuration
const DATAMART_BASE_URL = 'https://api.datamartgh.shop';
const DATAMART_API_KEY = process.env.DATAMART_API_KEY || 'f3d158934310f9c63f3f1b68f2f1ecda916ffada9ea984740c4f3902250f534d';

const datamartClient = axios.create({
  baseURL: DATAMART_BASE_URL,
  headers: {
    'x-api-key': DATAMART_API_KEY,
    'Content-Type': 'application/json'
  }
});

// ============================================
// PRICE HISTORY HELPER FUNCTIONS
// ============================================

// Helper function to log price changes
const logPriceChange = async (priceId, oldData, newData, changeType, changeReason, source = 'admin_panel', metadata = {}) => {
  try {
    const price = await ProductPricing.findById(priceId);
    if (!price) return;

    const historyEntry = new PriceHistory({
      priceId,
      network: price.network,
      capacity: price.capacity,
      oldPrice: oldData.price,
      newPrice: newData.price || price.price,
      oldEnabled: oldData.enabled,
      newEnabled: newData.enabled !== undefined ? newData.enabled : price.enabled,
      oldDescription: oldData.description,
      newDescription: newData.description !== undefined ? newData.description : price.description,
      changeType,
      changeReason,
      source,
      metadata
    });

    await historyEntry.save();
    console.log(`[PRICE_HISTORY] Logged ${changeType} for ${price.network} ${price.capacity}GB`);
  } catch (error) {
    console.error('[PRICE_HISTORY] Error logging price change:', error);
  }
};

// Helper function to get user info for audit trail
const getUserInfo = async (req) => {
  try {
    const token = req.headers['x-auth-token'];
    if (!token) return null;

    const user = await User.findOne({ token });
    return user ? {
      id: user._id,
      name: user.firstName + ' ' + user.lastName,
      email: user.email
    } : null;
  } catch (error) {
    console.error('[PRICE_HISTORY] Error getting user info:', error);
    return null;
  }
};

// ============================================
// PRICE MANAGEMENT ENDPOINTS
// ============================================

// Get all prices with filtering and pagination
router.get('/prices', auth, adminAuth, async (req, res) => {
  try {
    const { 
      network, 
      enabled, 
      page = 1, 
      limit = 50, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc',
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    if (network) filter.network = network;
    if (enabled !== undefined) filter.enabled = enabled === 'true';
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { capacity: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get prices with pagination
    const prices = await ProductPricing.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await ProductPricing.countDocuments(filter);

    // Get inventory status for each network
    const inventoryStatus = await DataInventory.find({}).lean();
    const inventoryMap = {};
    inventoryStatus.forEach(item => {
      inventoryMap[item.network] = item;
    });

    // Add inventory status to prices
    const pricesWithInventory = prices.map(price => ({
      ...price,
      inventory: inventoryMap[price.network] || { inStock: true, skipGeonettech: false }
    }));

    res.json({
      success: true,
      data: pricesWithInventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prices' });
  }
});

// Get single price by ID
router.get('/prices/:id', auth, adminAuth, async (req, res) => {
  try {
    const price = await ProductPricing.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Price not found' });
    }

    // Get inventory status
    const inventory = await DataInventory.findOne({ network: price.network });
    
    res.json({
      success: true,
      data: {
        ...price.toObject(),
        inventory: inventory || { inStock: true, skipGeonettech: false }
      }
    });
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch price' });
  }
});

// Create new price
router.post('/prices', auth, adminAuth, async (req, res) => {
  try {
    const { network, capacity, price, description, enabled = true } = req.body;

    // Validation
    if (!network || !capacity || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Network, capacity, and price are required' 
      });
    }

    if (price < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be non-negative' 
      });
    }

    // Check if price already exists
    const existing = await ProductPricing.findOne({ network, capacity });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price already exists for this network and capacity' 
      });
    }

    const newPrice = new ProductPricing({
      network,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      description,
      enabled
    });

    await newPrice.save();

    // Log price creation
    await logPriceChange(newPrice._id, {}, newPrice, 'create', 'New price created', 'admin_panel');

    res.status(201).json({
      success: true,
      message: 'Price created successfully',
      data: newPrice
    });
  } catch (error) {
    console.error('Create price error:', error);
    res.status(500).json({ success: false, message: 'Failed to create price' });
  }
});

// Update price
router.put('/prices/:id', auth, adminAuth, async (req, res) => {
  try {
    const { price, description, enabled } = req.body;
    const priceDoc = await ProductPricing.findById(req.params.id);

    if (!priceDoc) {
      return res.status(404).json({ success: false, message: 'Price not found' });
    }

    // Store old data for history
    const oldData = {
      price: priceDoc.price,
      description: priceDoc.description,
      enabled: priceDoc.enabled
    };

    // Update fields
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Price must be non-negative' 
        });
      }
      priceDoc.price = parseFloat(price);
    }
    if (description !== undefined) priceDoc.description = description;
    if (enabled !== undefined) priceDoc.enabled = enabled;
    priceDoc.updatedAt = new Date();

    await priceDoc.save();

    // Log price update
    const userInfo = await getUserInfo(req);
    await logPriceChange(priceDoc._id, oldData, { price, description, enabled }, 'price_update', 'Price updated via admin panel', 'admin_panel', { userInfo });

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: priceDoc
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ success: false, message: 'Failed to update price' });
  }
});

// Bulk update prices
router.put('/prices/bulk', auth, adminAuth, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, price, enabled, description }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Updates array is required' 
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, price, enabled, description } = update;
        const priceDoc = await ProductPricing.findById(id);

        if (!priceDoc) {
          errors.push({ id, error: 'Price not found' });
          continue;
        }

        if (price !== undefined) {
          if (price < 0) {
            errors.push({ id, error: 'Price must be non-negative' });
            continue;
          }
          priceDoc.price = parseFloat(price);
        }
        if (description !== undefined) priceDoc.description = description;
        if (enabled !== undefined) priceDoc.enabled = enabled;
        priceDoc.updatedAt = new Date();

        await priceDoc.save();
        results.push(priceDoc);
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} prices successfully`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk update prices error:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk update prices' });
  }
});

// Delete price
router.delete('/prices/:id', auth, adminAuth, async (req, res) => {
  try {
    const price = await ProductPricing.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Price not found' });
    }

    await ProductPricing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Price deleted successfully'
    });
  } catch (error) {
    console.error('Delete price error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete price' });
  }
});

// Toggle price enabled/disabled
router.patch('/prices/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const price = await ProductPricing.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Price not found' });
    }

    const oldEnabled = price.enabled;
    price.enabled = !price.enabled;
    price.updatedAt = new Date();
    await price.save();

    // Log status toggle
    const userInfo = await getUserInfo(req);
    await logPriceChange(price._id, { enabled: oldEnabled }, { enabled: price.enabled }, 'status_toggle', `Price ${price.enabled ? 'enabled' : 'disabled'}`, 'admin_panel', { userInfo });

    res.json({
      success: true,
      message: `Price ${price.enabled ? 'enabled' : 'disabled'} successfully`,
      data: price
    });
  } catch (error) {
    console.error('Toggle price error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle price' });
  }
});

// ============================================
// INVENTORY MANAGEMENT ENDPOINTS
// ============================================
// Note: Inventory endpoints are handled by adminManagemet.js
// to avoid route conflicts. These endpoints are available at:
// GET /api/v1/admin/inventory
// PUT /api/v1/admin/inventory/:network/toggle
// PUT /api/v1/admin/inventory/:network/toggle-geonettech

// ============================================
// DATAMART API SYNCHRONIZATION
// ============================================

// Sync prices from DataMart API
router.post('/sync-datamart', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.body; // Optional: sync specific network

    console.log(`[PRICE_SYNC] Starting DataMart sync${network ? ` for ${network}` : ' for all networks'}`);

    // Get data packages from DataMart
    const datamartResponse = await datamartClient.get('/api/data-packages', {
      params: network ? { network } : {}
    });

    if (!datamartResponse.data || !datamartResponse.data.success) {
      throw new Error('Failed to fetch data from DataMart API');
    }

    const datamartPackages = datamartResponse.data.data || [];
    console.log(`[PRICE_SYNC] Found ${datamartPackages.length} packages from DataMart`);

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const pkg of datamartPackages) {
      try {
        const { network: pkgNetwork, capacity, price } = pkg;

        if (!pkgNetwork || !capacity || price === undefined) {
          results.errors.push({
            package: pkg,
            error: 'Missing required fields (network, capacity, price)'
          });
          continue;
        }

        // Check if price exists
        const existingPrice = await ProductPricing.findOne({ 
          network: pkgNetwork, 
          capacity: parseInt(capacity) 
        });

        if (existingPrice) {
          // Update existing price if different
          if (existingPrice.price !== parseFloat(price)) {
            existingPrice.price = parseFloat(price);
            existingPrice.updatedAt = new Date();
            await existingPrice.save();
            results.updated++;
            console.log(`[PRICE_SYNC] Updated ${pkgNetwork} ${capacity}GB: ${price}`);
          }
        } else {
          // Create new price
          const newPrice = new ProductPricing({
            network: pkgNetwork,
            capacity: parseInt(capacity),
            price: parseFloat(price),
            description: `Synced from DataMart API`,
            enabled: true
          });
          await newPrice.save();
          results.created++;
          console.log(`[PRICE_SYNC] Created ${pkgNetwork} ${capacity}GB: ${price}`);
        }
      } catch (error) {
        results.errors.push({
          package: pkg,
          error: error.message
        });
        console.error(`[PRICE_SYNC] Error processing package:`, error);
      }
    }

    res.json({
      success: true,
      message: `DataMart sync completed. Created: ${results.created}, Updated: ${results.updated}`,
      data: results
    });
  } catch (error) {
    console.error('DataMart sync error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync with DataMart API',
      error: error.message 
    });
  }
});

// Get DataMart API status and test connection
router.get('/datamart-status', auth, adminAuth, async (req, res) => {
  try {
    const testResponse = await datamartClient.get('/api/data-packages', {
      params: { network: 'MTN' },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'DataMart API connection successful',
      data: {
        status: 'connected',
        responseTime: Date.now(),
        packagesFound: testResponse.data?.data?.length || 0,
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'DataMart API connection failed',
      data: {
        status: 'disconnected',
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    });
  }
});

// ============================================
// PRICE ANALYTICS AND REPORTS
// ============================================

// Get price statistics
router.get('/prices/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await ProductPricing.aggregate([
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          enabled: { $sum: { $cond: ['$enabled', 1, 0] } },
          disabled: { $sum: { $cond: ['$enabled', 0, 1] } },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalCapacity: { $sum: '$capacity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalStats = await ProductPricing.aggregate([
      {
        $group: {
          _id: null,
          totalPrices: { $sum: 1 },
          totalEnabled: { $sum: { $cond: ['$enabled', 1, 0] } },
          totalDisabled: { $sum: { $cond: ['$enabled', 0, 1] } },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byNetwork: stats,
        totals: totalStats[0] || {
          totalPrices: 0,
          totalEnabled: 0,
          totalDisabled: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0
        }
      }
    });
  } catch (error) {
    console.error('Get price stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch price statistics' });
  }
});

// ============================================
// PRICE HISTORY ENDPOINTS
// ============================================

// Get price history
router.get('/prices/:id/history', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const history = await PriceHistory.find({ priceId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('changedBy', 'firstName lastName email')
      .lean();

    const total = await PriceHistory.countDocuments({ priceId: id });

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch price history' });
  }
});

// Get all price history with filtering
router.get('/price-history', auth, adminAuth, async (req, res) => {
  try {
    const { 
      network, 
      changeType, 
      source, 
      page = 1, 
      limit = 50,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    if (network) filter.network = network;
    if (changeType) filter.changeType = changeType;
    if (source) filter.source = source;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const history = await PriceHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('changedBy', 'firstName lastName email')
      .populate('priceId', 'network capacity price')
      .lean();

    const total = await PriceHistory.countDocuments(filter);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch price history' });
  }
});

// Get price history statistics
router.get('/price-history/stats', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await PriceHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$changeType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const networkStats = await PriceHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const sourceStats = await PriceHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalChanges = await PriceHistory.countDocuments(filter);

    res.json({
      success: true,
      data: {
        totalChanges,
        byChangeType: stats,
        byNetwork: networkStats,
        bySource: sourceStats
      }
    });
  } catch (error) {
    console.error('Get price history stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch price history statistics' });
  }
});

module.exports = router;
