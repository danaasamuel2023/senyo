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
  },
  timeout: 10000 // 10 second timeout
});

// Mock DataMart API data for testing
const MOCK_DATAMART_PACKAGES = [
  // MTN Packages
  { network: 'MTN', capacity: 1, price: 3.50 },
  { network: 'MTN', capacity: 2, price: 6.00 },
  { network: 'MTN', capacity: 3, price: 8.50 },
  { network: 'MTN', capacity: 5, price: 13.00 },
  { network: 'MTN', capacity: 10, price: 24.00 },
  { network: 'MTN', capacity: 20, price: 45.00 },
  { network: 'MTN', capacity: 30, price: 65.00 },
  { network: 'MTN', capacity: 50, price: 95.00 },
  { network: 'MTN', capacity: 100, price: 180.00 },
  
  // Vodafone Packages
  { network: 'VODAFONE', capacity: 1, price: 3.20 },
  { network: 'VODAFONE', capacity: 2, price: 5.80 },
  { network: 'VODAFONE', capacity: 3, price: 8.20 },
  { network: 'VODAFONE', capacity: 5, price: 12.50 },
  { network: 'VODAFONE', capacity: 10, price: 23.00 },
  { network: 'VODAFONE', capacity: 20, price: 43.00 },
  { network: 'VODAFONE', capacity: 30, price: 62.00 },
  { network: 'VODAFONE', capacity: 50, price: 92.00 },
  { network: 'VODAFONE', capacity: 100, price: 175.00 },
  
  // AirtelTigo Packages
  { network: 'airteltigo', capacity: 1, price: 3.00 },
  { network: 'airteltigo', capacity: 2, price: 5.50 },
  { network: 'airteltigo', capacity: 3, price: 7.80 },
  { network: 'airteltigo', capacity: 5, price: 12.00 },
  { network: 'airteltigo', capacity: 10, price: 22.00 },
  { network: 'airteltigo', capacity: 20, price: 41.00 },
  { network: 'airteltigo', capacity: 30, price: 59.00 },
  { network: 'airteltigo', capacity: 50, price: 88.00 },
  { network: 'airteltigo', capacity: 100, price: 170.00 },
  
  // Telecel Packages
  { network: 'TELECEL', capacity: 1, price: 3.30 },
  { network: 'TELECEL', capacity: 2, price: 5.90 },
  { network: 'TELECEL', capacity: 3, price: 8.30 },
  { network: 'TELECEL', capacity: 5, price: 12.80 },
  { network: 'TELECEL', capacity: 10, price: 23.50 },
  { network: 'TELECEL', capacity: 20, price: 44.00 },
  { network: 'TELECEL', capacity: 30, price: 63.50 },
  { network: 'TELECEL', capacity: 50, price: 94.00 },
  { network: 'TELECEL', capacity: 100, price: 178.00 },
  
  // AT Premium Packages
  { network: 'AT_PREMIUM', capacity: 1, price: 3.40 },
  { network: 'AT_PREMIUM', capacity: 2, price: 6.10 },
  { network: 'AT_PREMIUM', capacity: 3, price: 8.60 },
  { network: 'AT_PREMIUM', capacity: 5, price: 13.20 },
  { network: 'AT_PREMIUM', capacity: 10, price: 24.50 },
  { network: 'AT_PREMIUM', capacity: 20, price: 45.50 },
  { network: 'AT_PREMIUM', capacity: 30, price: 66.00 },
  { network: 'AT_PREMIUM', capacity: 50, price: 96.50 },
  { network: 'AT_PREMIUM', capacity: 100, price: 182.00 }
];

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

/**
 * @route   GET /api/v1/admin/inventory
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
 * @route   GET /api/v1/admin/inventory/:network
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
 * @route   PUT /api/v1/admin/inventory/:network/toggle
 * @desc    Toggle inventory status for specific network
 * @access  Admin
 */
router.put('/inventory/:network/toggle', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.params;
    
    // Find or create inventory item
    let inventoryItem = await DataInventory.findOne({ network });
    
    if (!inventoryItem) {
      inventoryItem = new DataInventory({ network, inStock: true });
    }
    
    // Toggle the status
    inventoryItem.inStock = !inventoryItem.inStock;
    inventoryItem.updatedAt = new Date();
    
    await inventoryItem.save();
    
    res.json({
      success: true,
      message: `Inventory status for ${network} updated`,
      network: inventoryItem.network,
      inStock: inventoryItem.inStock,
      updatedAt: inventoryItem.updatedAt
    });
  } catch (err) {
    console.error('Toggle inventory error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
});

/**
 * @route   PUT /api/v1/admin/inventory/:network/toggle-geonettech
 * @desc    Toggle Geonettech API for specific network
 * @access  Admin
 */
router.put('/inventory/:network/toggle-geonettech', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.params;
    
    // Find or create inventory item
    let inventoryItem = await DataInventory.findOne({ network });
    
    if (!inventoryItem) {
      inventoryItem = new DataInventory({ network, inStock: true, skipGeonettech: false });
    }
    
    // Toggle the Geonettech API status
    inventoryItem.skipGeonettech = !inventoryItem.skipGeonettech;
    inventoryItem.updatedAt = new Date();
    
    await inventoryItem.save();
    
    res.json({
      success: true,
      message: `Geonettech API status for ${network} updated`,
      network: inventoryItem.network,
      skipGeonettech: inventoryItem.skipGeonettech,
      updatedAt: inventoryItem.updatedAt
    });
  } catch (err) {
    console.error('Toggle Geonettech error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
});

// ============================================
// DATAMART API SYNCHRONIZATION
// ============================================

// Sync prices from DataMart API
router.post('/sync-datamart', auth, adminAuth, async (req, res) => {
  try {
    const { network } = req.body; // Optional: sync specific network

    console.log(`[PRICE_SYNC] Starting DataMart sync${network ? ` for ${network}` : ' for all networks'}`);

    let datamartPackages = [];
    let apiSource = 'mock';

    try {
      // Try to get data packages from DataMart API
      const datamartResponse = await datamartClient.get('/api/data-packages', {
        params: network ? { network } : {}
      });

      if (datamartResponse.data && datamartResponse.data.success) {
        datamartPackages = datamartResponse.data.data || [];
        apiSource = 'datamart_api';
        console.log(`[PRICE_SYNC] Found ${datamartPackages.length} packages from DataMart API`);
      } else {
        throw new Error('Invalid response from DataMart API');
      }
    } catch (apiError) {
      console.log(`[PRICE_SYNC] DataMart API failed: ${apiError.message}, using mock data`);
      
      // Use mock data as fallback
      datamartPackages = MOCK_DATAMART_PACKAGES.filter(pkg => 
        !network || pkg.network === network
      );
      apiSource = 'mock_data';
      console.log(`[PRICE_SYNC] Using ${datamartPackages.length} mock packages`);
    }

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
            const oldPrice = existingPrice.price;
            existingPrice.price = parseFloat(price);
            existingPrice.updatedAt = new Date();
            await existingPrice.save();
            
            // Log price change
            await logPriceChange(
              existingPrice._id,
              { price: oldPrice, enabled: existingPrice.enabled, description: existingPrice.description },
              { price: parseFloat(price) },
              'price_update',
              `Synced from ${apiSource}`,
              'datamart_sync',
              { apiSource, oldPrice, newPrice: parseFloat(price) }
            );
            
            results.updated++;
            console.log(`[PRICE_SYNC] Updated ${pkgNetwork} ${capacity}GB: ${oldPrice} → ${price} (${apiSource})`);
          }
        } else {
          // Create new price
          const newPrice = new ProductPricing({
            network: pkgNetwork,
            capacity: parseInt(capacity),
            price: parseFloat(price),
            description: `Synced from ${apiSource}`,
            enabled: true
          });
          await newPrice.save();
          
          // Log price creation
          await logPriceChange(
            newPrice._id,
            { price: 0, enabled: false, description: '' },
            { price: parseFloat(price), enabled: true, description: `Synced from ${apiSource}` },
            'create',
            `Created from ${apiSource}`,
            'datamart_sync',
            { apiSource }
          );
          
          results.created++;
          console.log(`[PRICE_SYNC] Created ${pkgNetwork} ${capacity}GB: ${price} (${apiSource})`);
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
      message: `DataMart sync completed using ${apiSource}. Created: ${results.created}, Updated: ${results.updated}`,
      data: {
        ...results,
        apiSource,
        totalProcessed: datamartPackages.length
      }
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
