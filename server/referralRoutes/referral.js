const express = require('express');
const router = express.Router();
const { Referral, Wallet, User } = require('../schema/schema.js');
const verifyAuth = require('../middlewareUser/middleware.js');
const crypto = require('crypto');

// Generate unique referral code
const generateReferralCode = (name) => {
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  const namePrefix = name.substring(0, 3).toUpperCase();
  return `${namePrefix}${randomStr}`;
};

// Get user's referral code and stats
router.get('/my-code', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name);
      await user.save();
    }

    // Get referral stats
    const referrals = await Referral.find({ referrerId: req.user._id });
    const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'completed');
    const totalEarned = referrals.reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
    const pendingReferrals = referrals.filter(r => r.status === 'pending');

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralUrl: `${process.env.CLIENT_URL || 'https://unlimiteddata.gh'}/signup?ref=${user.referralCode}`,
      stats: {
        totalReferrals: referrals.length,
        activeReferrals: activeReferrals.length,
        pendingReferrals: pendingReferrals.length,
        totalEarned: parseFloat(totalEarned.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ message: 'Failed to fetch referral code' });
  }
});

// Get user's referral history
router.get('/history', verifyAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const referralList = referrals.map(ref => ({
      id: ref._id,
      userName: ref.referredUserId?.name || 'Unknown',
      userEmail: ref.referredUserId?.email,
      joinedDate: ref.createdAt,
      status: ref.status,
      bonusAwarded: ref.bonusAwarded,
      bonusAmount: ref.bonusAmount,
      firstPurchase: ref.referredUserFirstPurchase,
      totalSpent: ref.referredUserTotalSpent
    }));

    res.json({
      success: true,
      referrals: referralList
    });
  } catch (error) {
    console.error('Error fetching referral history:', error);
    res.status(500).json({ message: 'Failed to fetch referral history' });
  }
});

// Validate referral code during signup
router.post('/validate-code', async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code required' });
    }

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    res.json({
      success: true,
      referrerName: referrer.name,
      message: 'Valid referral code'
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ message: 'Failed to validate referral code' });
  }
});

// Create referral (called during user registration)
router.post('/create', async (req, res) => {
  try {
    const { referrerId, referredUserId, referralCode } = req.body;

    // Check if referral already exists
    const existingReferral = await Referral.findOne({ referredUserId });
    if (existingReferral) {
      return res.status(400).json({ message: 'User already referred' });
    }

    const referral = new Referral({
      referrerId,
      referredUserId,
      referralCode,
      status: 'pending'
    });

    await referral.save();

    res.json({
      success: true,
      message: 'Referral created successfully',
      referral
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ message: 'Failed to create referral' });
  }
});

// Award referral bonus (called after referred user makes first purchase)
router.post('/award-bonus', async (req, res) => {
  try {
    const { referredUserId, purchaseAmount } = req.body;

    const referral = await Referral.findOne({ referredUserId, status: 'pending' });
    
    if (!referral) {
      return res.json({ success: true, message: 'No pending referral found' });
    }

    // Calculate bonus (10% of first purchase, max GHS 5)
    const bonusAmount = Math.min(purchaseAmount * 0.1, 5);

    // Update referral
    referral.status = 'active';
    referral.bonusAwarded = true;
    referral.bonusAmount = bonusAmount;
    referral.referredUserFirstPurchase = new Date();
    referral.referredUserTotalSpent = purchaseAmount;
    await referral.save();

    // Add bonus to referrer's wallet
    let referrerWallet = await Wallet.findOne({ userId: referral.referrerId });
    if (!referrerWallet) {
      referrerWallet = new Wallet({ userId: referral.referrerId });
    }

    const balanceBefore = referrerWallet.balance;
    referrerWallet.balance += bonusAmount;
    const balanceAfter = referrerWallet.balance;

    referrerWallet.transactions.push({
      type: 'referral',
      amount: bonusAmount,
      balanceBefore,
      balanceAfter,
      description: 'Referral bonus',
      reference: `REF-${referral._id}`,
      status: 'completed',
      metadata: {
        referredUserId,
        purchaseAmount
      },
      createdAt: new Date()
    });

    referrerWallet.lastTransaction = new Date();
    await referrerWallet.save();

    res.json({
      success: true,
      message: 'Referral bonus awarded',
      bonusAmount,
      referrerId: referral.referrerId
    });
  } catch (error) {
    console.error('Error awarding referral bonus:', error);
    res.status(500).json({ message: 'Failed to award referral bonus' });
  }
});

// Update referral stats (called after each purchase by referred user)
router.post('/update-stats', async (req, res) => {
  try {
    const { referredUserId, purchaseAmount } = req.body;

    const referral = await Referral.findOne({ referredUserId });
    
    if (!referral) {
      return res.json({ success: true, message: 'No referral found' });
    }

    referral.referredUserTotalSpent += purchaseAmount;
    
    // Mark as completed if referred user has spent more than GHS 50
    if (referral.referredUserTotalSpent >= 50 && referral.status === 'active') {
      referral.status = 'completed';
    }

    await referral.save();

    res.json({
      success: true,
      message: 'Referral stats updated'
    });
  } catch (error) {
    console.error('Error updating referral stats:', error);
    res.status(500).json({ message: 'Failed to update referral stats' });
  }
});

module.exports = router;

