#!/usr/bin/env node

/**
 * Create Sample MTN Style Notification
 * This script creates a sample MTN-style notification for testing
 */

const mongoose = require('mongoose');
const { Announcement, NotificationSystem } = require('./server/schema/schema');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0';

const createSampleMTNNotification = async () => {
  try {
    console.log('🔔 Creating Sample MTN Style Notification...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create sample MTN-style notification
    const sampleNotification = new Announcement({
      title: "Information",
      message: `🟡 MTN Yellow Portal Update
The MTN Yellow portal is facing new restrictions after recent downtime, causing delays of up to 4 hours. You can still place your orders, but please don't promise customers fast delivery. We're working hard to restore normal speed soon. Thanks for your patience and support.`,
      type: "system",
      priority: "high",
      targetAudience: "all",
      displaySettings: {
        showOnLogin: true,
        dismissible: true,
        autoDismiss: false,
        autoDismissDelay: 15000,
        showIcon: true,
        style: "mtn-popup"
      },
      actionButton: {
        text: "I've Read This - Dismiss Forever"
      },
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      analytics: {
        totalViews: 0,
        totalDismissals: 0,
        totalClicks: 0,
        uniqueViews: 0,
        conversionRate: 0
      },
      sentBy: new mongoose.Types.ObjectId(), // You'll need to replace this with actual admin user ID
      tags: ["mtn", "portal", "update"],
      notes: "Sample MTN Yellow Portal notification for testing"
    });

    await sampleNotification.save();
    console.log('✅ Sample MTN notification created successfully');
    console.log(`   ID: ${sampleNotification._id}`);
    console.log(`   Title: ${sampleNotification.title}`);
    console.log(`   Type: ${sampleNotification.type}`);
    console.log(`   Style: ${sampleNotification.displaySettings.style}`);

    // Update system settings to include WhatsApp number
    const systemSettings = await NotificationSystem.findOneAndUpdate(
      {},
      {
        $set: {
          'globalSettings.whatsappNumber': '233123456789',
          'displaySettings.style': 'mtn-popup',
          lastUpdatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ System settings updated with WhatsApp number');
    console.log(`   WhatsApp Number: ${systemSettings.globalSettings.whatsappNumber}`);
    console.log(`   Default Style: ${systemSettings.displaySettings.style}`);

    console.log('\n🎉 MTN Style Notification System Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to /admin/notifications to manage notifications');
    console.log('2. Test the notification at /test-mtn-notification');
    console.log('3. Configure WhatsApp number in admin settings');
    console.log('4. Create more MTN-style notifications as needed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  createSampleMTNNotification();
}

module.exports = { createSampleMTNNotification };
