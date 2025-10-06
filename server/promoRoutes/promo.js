const express = require('express');
const router = express.Router();
const { PromoCode } = require('../schema/schema.js');
const adminAuth = require('../adminMiddleware/middleware.js');
const verifyAuth = require('../middlewareUser/middleware.js');

// Create promo code (Admin only)
router.post('/create', adminAuth, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      applicableNetworks
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({ 
        message: 'Code, discount type, discount value, and validity dates are required' 
      });
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount,
      usageLimit,
      perUserLimit: perUserLimit || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableNetworks: applicableNetworks || ['ALL'],
      createdBy: req.user._id,
      isActive: true
    });

    await promoCode.save();

    res.json({
      success: true,
      message: 'Promo code created successfully',
      promoCode
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ message: 'Failed to create promo code' });
  }
});

// Get all promo codes (Admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const promoCodes = await PromoCode.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await PromoCode.countDocuments(query);

    res.json({
      success: true,
      promoCodes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ message: 'Failed to fetch promo codes' });
  }
});

// Get single promo code details (Admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('usedBy.userId', 'name email');

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    res.json({
      success: true,
      promoCode
    });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ message: 'Failed to fetch promo code' });
  }
});

// Update promo code (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      isActive,
      applicableNetworks
    } = req.body;

    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    // Update fields
    if (description !== undefined) promoCode.description = description;
    if (discountType !== undefined) promoCode.discountType = discountType;
    if (discountValue !== undefined) promoCode.discountValue = discountValue;
    if (minPurchase !== undefined) promoCode.minPurchase = minPurchase;
    if (maxDiscount !== undefined) promoCode.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
    if (perUserLimit !== undefined) promoCode.perUserLimit = perUserLimit;
    if (validFrom !== undefined) promoCode.validFrom = new Date(validFrom);
    if (validUntil !== undefined) promoCode.validUntil = new Date(validUntil);
    if (isActive !== undefined) promoCode.isActive = isActive;
    if (applicableNetworks !== undefined) promoCode.applicableNetworks = applicableNetworks;

    await promoCode.save();

    res.json({
      success: true,
      message: 'Promo code updated successfully',
      promoCode
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ message: 'Failed to update promo code' });
  }
});

// Delete promo code (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ message: 'Failed to delete promo code' });
  }
});

// Toggle promo code status (Admin only)
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    promoCode.isActive = !promoCode.isActive;
    await promoCode.save();

    res.json({
      success: true,
      message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'}`,
      isActive: promoCode.isActive
    });
  } catch (error) {
    console.error('Error toggling promo code:', error);
    res.status(500).json({ message: 'Failed to toggle promo code status' });
  }
});

// Get promo code statistics (Admin only)
router.get('/:id/stats', adminAuth, async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    const totalRevenue = promoCode.usedBy.reduce((sum, usage) => sum + usage.orderAmount, 0);
    const totalDiscount = promoCode.usedBy.reduce((sum, usage) => sum + usage.discountApplied, 0);
    const uniqueUsers = new Set(promoCode.usedBy.map(u => u.userId.toString())).size;

    res.json({
      success: true,
      stats: {
        code: promoCode.code,
        usageCount: promoCode.usageCount,
        usageLimit: promoCode.usageLimit || 'Unlimited',
        remainingUses: promoCode.usageLimit ? promoCode.usageLimit - promoCode.usageCount : 'Unlimited',
        uniqueUsers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        isActive: promoCode.isActive,
        validFrom: promoCode.validFrom,
        validUntil: promoCode.validUntil,
        isExpired: promoCode.validUntil < new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching promo stats:', error);
    res.status(500).json({ message: 'Failed to fetch promo code statistics' });
  }
});

// Validate promo code (Public - for users during checkout)
router.post('/validate', verifyAuth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Promo code required' });
    }

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Invalid or expired promo code' });
    }

    // Check usage limits
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    // Check per-user limit
    const userUsageCount = promoCode.usedBy.filter(
      u => u.userId.toString() === req.user._id.toString()
    ).length;

    if (userUsageCount >= promoCode.perUserLimit) {
      return res.status(400).json({ message: 'You have already used this promo code' });
    }

    res.json({
      success: true,
      valid: true,
      promoCode: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        minPurchase: promoCode.minPurchase,
        maxDiscount: promoCode.maxDiscount,
        applicableNetworks: promoCode.applicableNetworks
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ message: 'Failed to validate promo code' });
  }
});

module.exports = router;

