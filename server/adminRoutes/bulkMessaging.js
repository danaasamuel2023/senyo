const express = require('express');
const router = express.Router();
const adminAuth = require('../adminMiddleware/middleware');
const { User } = require('../schema/schema');

// Get all users for bulk messaging
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      phone: 1,
      role: 1,
      status: 1,
      createdAt: 1
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Send bulk SMS
router.post('/bulk-sms', adminAuth, async (req, res) => {
  try {
    const { content, userIds, metadata } = req.body;

    if (!content || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    // Get users with phone numbers
    const users = await User.find({
      _id: { $in: userIds },
      phone: { $exists: true, $ne: null }
    }, { _id: 1, name: 1, phone: 1 });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users with valid phone numbers found'
      });
    }

    // Here you would integrate with your SMS provider (e.g., Twilio, Africa's Talking, etc.)
    // For now, we'll simulate the SMS sending
    const smsResults = [];
    let sentCount = 0;

    for (const user of users) {
      try {
        // Simulate SMS sending
        // In production, replace this with actual SMS API call
        console.log(`Sending SMS to ${user.phone}: ${content}`);
        
        // Log the SMS in database or external service
        smsResults.push({
          userId: user._id,
          phone: user.phone,
          status: 'sent',
          timestamp: new Date()
        });
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send SMS to ${user.phone}:`, error);
        smsResults.push({
          userId: user._id,
          phone: user.phone,
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `SMS sent to ${sentCount} users`,
      sentCount: sentCount,
      totalUsers: users.length,
      results: smsResults
    });

  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk SMS'
    });
  }
});

// Send bulk email
router.post('/bulk-email', adminAuth, async (req, res) => {
  try {
    const { subject, content, userIds, metadata } = req.body;

    if (!subject || !content || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    // Get users with email addresses
    const users = await User.find({
      _id: { $in: userIds },
      email: { $exists: true, $ne: null }
    }, { _id: 1, name: 1, email: 1 });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users with valid email addresses found'
      });
    }

    // Here you would integrate with your email provider (e.g., SendGrid, Mailgun, etc.)
    // For now, we'll simulate the email sending
    const emailResults = [];
    let sentCount = 0;

    for (const user of users) {
      try {
        // Simulate email sending
        // In production, replace this with actual email API call
        console.log(`Sending email to ${user.email}: ${subject}`);
        
        // Log the email in database or external service
        emailResults.push({
          userId: user._id,
          email: user.email,
          status: 'sent',
          timestamp: new Date()
        });
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        emailResults.push({
          userId: user._id,
          email: user.email,
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Email sent to ${sentCount} users`,
      sentCount: sentCount,
      totalUsers: users.length,
      results: emailResults
    });

  } catch (error) {
    console.error('Error sending bulk email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk email'
    });
  }
});

// Unified bulk messaging endpoint
router.post('/bulk-message', adminAuth, async (req, res) => {
  try {
    const { type, content, subject, userIds, metadata } = req.body;

    if (!type || !content || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    if (type === 'email' && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required for email messages'
      });
    }

    let result;
    if (type === 'sms') {
      result = await sendBulkSMS(content, userIds, metadata);
    } else if (type === 'email') {
      result = await sendBulkEmail(subject, content, userIds, metadata);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid message type. Use "sms" or "email"'
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Error in bulk messaging:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk message'
    });
  }
});

// Helper function for bulk SMS
async function sendBulkSMS(content, userIds, metadata) {
  const users = await User.find({
    _id: { $in: userIds },
    phone: { $exists: true, $ne: null }
  }, { _id: 1, name: 1, phone: 1 });

  const smsResults = [];
  let sentCount = 0;

  for (const user of users) {
    try {
      // Simulate SMS sending - replace with actual SMS API
      console.log(`Sending SMS to ${user.phone}: ${content}`);
      
      smsResults.push({
        userId: user._id,
        phone: user.phone,
        status: 'sent',
        timestamp: new Date()
      });
      
      sentCount++;
    } catch (error) {
      console.error(`Failed to send SMS to ${user.phone}:`, error);
      smsResults.push({
        userId: user._id,
        phone: user.phone,
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  return {
    success: true,
    message: `SMS sent to ${sentCount} users`,
    sentCount: sentCount,
    totalUsers: users.length,
    results: smsResults
  };
}

// Helper function for bulk email
async function sendBulkEmail(subject, content, userIds, metadata) {
  const users = await User.find({
    _id: { $in: userIds },
    email: { $exists: true, $ne: null }
  }, { _id: 1, name: 1, email: 1 });

  const emailResults = [];
  let sentCount = 0;

  for (const user of users) {
    try {
      // Simulate email sending - replace with actual email API
      console.log(`Sending email to ${user.email}: ${subject}`);
      
      emailResults.push({
        userId: user._id,
        email: user.email,
        status: 'sent',
        timestamp: new Date()
      });
      
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
      emailResults.push({
        userId: user._id,
        email: user.email,
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  return {
    success: true,
    message: `Email sent to ${sentCount} users`,
    sentCount: sentCount,
    totalUsers: users.length,
    results: emailResults
  };
}

// Get messaging campaigns
router.get('/campaigns', adminAuth, async (req, res) => {
  try {
    // In a real implementation, you would have a Campaign model
    // For now, return empty array
    res.json({
      success: true,
      campaigns: []
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns'
    });
  }
});

module.exports = router;