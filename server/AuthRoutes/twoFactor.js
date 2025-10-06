const express = require('express');
const router = express.Router();
const { TwoFactorAuth, User } = require('../schema/schema.js');
const verifyAuth = require('../middlewareUser/middleware.js');
const { send2FACode } = require('../services/emailService.js');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate 6-digit code
const generate2FACode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Get 2FA status
router.get('/status', verifyAuth, async (req, res) => {
  try {
    const twoFA = await TwoFactorAuth.findOne({ userId: req.user._id });
    
    res.json({
      success: true,
      enabled: twoFA?.enabled || false,
      method: twoFA?.method || 'email'
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    res.status(500).json({ message: 'Failed to fetch 2FA status' });
  }
});

// Enable 2FA via email
router.post('/enable-email', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let twoFA = await TwoFactorAuth.findOne({ userId: req.user._id });
    if (!twoFA) {
      twoFA = new TwoFactorAuth({ userId: req.user._id });
    }

    twoFA.enabled = true;
    twoFA.method = 'email';
    await twoFA.save();

    res.json({
      success: true,
      message: '2FA enabled via email',
      method: 'email'
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({ message: 'Failed to enable 2FA' });
  }
});

// Enable 2FA via authenticator app
router.post('/enable-authenticator', verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `UnlimitedData GH (${user.email})`,
      issuer: 'UnlimitedData GH'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret temporarily (not enabled until verified)
    let twoFA = await TwoFactorAuth.findOne({ userId: req.user._id }).select('+secret');
    if (!twoFA) {
      twoFA = new TwoFactorAuth({ userId: req.user._id });
    }

    twoFA.secret = secret.base32;
    twoFA.method = 'authenticator';
    twoFA.enabled = false; // Will be enabled after verification
    await twoFA.save();

    res.json({
      success: true,
      message: 'Scan QR code with your authenticator app',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      manualEntry: secret.otpauth_url
    });
  } catch (error) {
    console.error('Error setting up authenticator:', error);
    res.status(500).json({ message: 'Failed to setup authenticator' });
  }
});

// Verify and complete authenticator setup
router.post('/verify-authenticator', verifyAuth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code required' });
    }

    const twoFA = await TwoFactorAuth.findOne({ userId: req.user._id }).select('+secret');
    
    if (!twoFA || !twoFA.secret) {
      return res.status(400).json({ message: '2FA not setup' });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: twoFA.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }

    twoFA.enabled = true;
    twoFA.backupCodes = backupCodes;
    twoFA.lastUsed = new Date();
    await twoFA.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: backupCodes,
      warning: 'Save these backup codes in a safe place. You won\'t be able to see them again.'
    });
  } catch (error) {
    console.error('Error verifying authenticator:', error);
    res.status(500).json({ message: 'Failed to verify authenticator' });
  }
});

// Disable 2FA
router.post('/disable', verifyAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password required to disable 2FA' });
    }

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const twoFA = await TwoFactorAuth.findOne({ userId: req.user._id });
    if (twoFA) {
      twoFA.enabled = false;
      await twoFA.save();
    }

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

// Send 2FA code (for email method)
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const twoFA = await TwoFactorAuth.findOne({ userId: user._id }).select('+verificationCode');
    
    if (!twoFA || !twoFA.enabled || twoFA.method !== 'email') {
      return res.status(400).json({ message: '2FA not enabled for this user' });
    }

    // Check if locked
    if (twoFA.lockedUntil && twoFA.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((twoFA.lockedUntil - new Date()) / 60000);
      return res.status(429).json({ 
        message: `Account locked. Try again in ${minutesLeft} minutes.` 
      });
    }

    // Generate and save code
    const code = generate2FACode();
    twoFA.verificationCode = code;
    twoFA.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await twoFA.save();

    // Send email
    await send2FACode(email, code, user.name);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 600 // seconds
    });
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Verify 2FA code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const twoFA = await TwoFactorAuth.findOne({ userId: user._id })
      .select('+verificationCode +secret +backupCodes');
    
    if (!twoFA || !twoFA.enabled) {
      return res.status(400).json({ message: '2FA not enabled' });
    }

    // Check if locked
    if (twoFA.lockedUntil && twoFA.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((twoFA.lockedUntil - new Date()) / 60000);
      return res.status(429).json({ 
        message: `Account locked. Try again in ${minutesLeft} minutes.` 
      });
    }

    let isValid = false;

    // Verify based on method
    if (twoFA.method === 'email') {
      // Check if code expired
      if (!twoFA.codeExpiresAt || twoFA.codeExpiresAt < new Date()) {
        return res.status(400).json({ message: 'Verification code expired' });
      }

      isValid = twoFA.verificationCode === code;
    } else if (twoFA.method === 'authenticator') {
      // Verify TOTP code
      isValid = speakeasy.totp.verify({
        secret: twoFA.secret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      // If TOTP fails, check backup codes
      if (!isValid && twoFA.backupCodes) {
        const backupIndex = twoFA.backupCodes.indexOf(code.toUpperCase());
        if (backupIndex !== -1) {
          isValid = true;
          // Remove used backup code
          twoFA.backupCodes.splice(backupIndex, 1);
        }
      }
    }

    if (!isValid) {
      // Increment failed attempts
      twoFA.failedAttempts += 1;

      // Lock account after 5 failed attempts
      if (twoFA.failedAttempts >= 5) {
        twoFA.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await twoFA.save();
        return res.status(429).json({ 
          message: 'Too many failed attempts. Account locked for 30 minutes.' 
        });
      }

      await twoFA.save();
      return res.status(400).json({ 
        message: 'Invalid verification code',
        attemptsLeft: 5 - twoFA.failedAttempts
      });
    }

    // Reset failed attempts on success
    twoFA.failedAttempts = 0;
    twoFA.lockedUntil = null;
    twoFA.lastUsed = new Date();
    
    // Clear verification code after use
    if (twoFA.method === 'email') {
      twoFA.verificationCode = null;
      twoFA.codeExpiresAt = null;
    }
    
    await twoFA.save();

    res.json({
      success: true,
      message: 'Verification successful',
      userId: user._id
    });
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    res.status(500).json({ message: 'Failed to verify code' });
  }
});

module.exports = router;

