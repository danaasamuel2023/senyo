const express = require('express');
const router = express.Router();
const auth = require('../middlewareUser/middleware');
const adminAuth = require('../adminMiddleware/middleware');
const mongoose = require('mongoose');

// Package Schema (you might want to move this to schema.js)
const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  network: { 
    type: String, 
    required: true,
    enum: ['MTN', 'AirtelTigo', 'Telecel', 'Vodafone']
  },
  capacity: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  agentPrice: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  category: { 
    type: String, 
    default: 'data',
    enum: ['data', 'voice', 'sms', 'bundle', 'promo']
  },
  tags: [{ type: String }],
  images: [{ type: String }],
  salesCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Package = mongoose.model('Package', PackageSchema);

// Get all packages
router.get('/packages', auth, adminAuth, async (req, res) => {
  try {
    const packages = await Package.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      packages: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    });
  }
});

// Get single package
router.get('/packages/:id', auth, adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const packageData = await Package.findById(packageId);
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package'
    });
  }
});

// Create new package
router.post('/packages', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      network,
      capacity,
      price,
      agentPrice,
      stock,
      isActive,
      category,
      tags,
      images
    } = req.body;

    // Validation
    if (!name || !network || !capacity || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, network, capacity, price'
      });
    }

    if (price < 0 || agentPrice < 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price, agent price, and stock must be non-negative'
      });
    }

    const newPackage = new Package({
      name,
      description: description || '',
      network,
      capacity,
      price,
      agentPrice: agentPrice || 0,
      stock: stock || 0,
      isActive: isActive !== undefined ? isActive : true,
      category: category || 'data',
      tags: tags || [],
      images: images || []
    });

    await newPackage.save();

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: newPackage
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package'
    });
  }
});

// Update package
router.put('/packages/:id', auth, adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.salesCount;
    delete updates.revenue;
    
    // Add updatedAt
    updates.updatedAt = new Date();

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
      package: updatedPackage
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package'
    });
  }
});

// Delete package
router.delete('/packages/:id', auth, adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const deletedPackage = await Package.findByIdAndDelete(packageId);

    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package'
    });
  }
});

// Toggle package status
router.patch('/packages/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const packageId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    const packageData = await Package.findById(packageId);
    
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    packageData.isActive = !packageData.isActive;
    packageData.updatedAt = new Date();
    await packageData.save();

    res.json({
      success: true,
      message: `Package ${packageData.isActive ? 'activated' : 'deactivated'} successfully`,
      package: packageData
    });
  } catch (error) {
    console.error('Error toggling package status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle package status'
    });
  }
});

// Bulk update packages
router.put('/packages/bulk', auth, adminAuth, async (req, res) => {
  try {
    const { packageIds, updates } = req.body;

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Package IDs array is required'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.salesCount;
    delete updates.revenue;
    
    // Add updatedAt
    updates.updatedAt = new Date();

    const result = await Package.updateMany(
      { _id: { $in: packageIds } },
      updates
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} packages updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update packages'
    });
  }
});

// Get package statistics
router.get('/packages/stats', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Package.aggregate([
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          activePackages: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalRevenue: { $sum: '$revenue' },
          totalSales: { $sum: '$salesCount' },
          averagePrice: { $avg: '$price' },
          lowStockPackages: {
            $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] }
          }
        }
      }
    ]);

    const networkStats = await Package.aggregate([
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          sales: { $sum: '$salesCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryStats = await Package.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          sales: { $sum: '$salesCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalPackages: 0,
        activePackages: 0,
        totalRevenue: 0,
        totalSales: 0,
        averagePrice: 0,
        lowStockPackages: 0
      },
      networkStats,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching package stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package statistics'
    });
  }
});

module.exports = router;