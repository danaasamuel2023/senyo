const mongoose = require("mongoose");
const { Schema } = mongoose;

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================

// Disable automatic index building in production
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

// Connection pool optimization
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 10000);

// Query optimization defaults
mongoose.set('lean', true);
mongoose.set('strictQuery', true);

// ============================================
// SHARED SCHEMAS & VALIDATORS
// ============================================

// Email validator
const emailValidator = {
  validator: function(v) {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
  },
  message: 'Invalid email format'
};

// Phone validator
const phoneValidator = {
  validator: function(v) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v);
  },
  message: 'Invalid phone number format'
};

// ============================================
// OPTIMIZED EMBEDDED SCHEMAS
// ============================================

// Lightweight Device Block Schema
const BlockedDeviceSchema = new Schema({
  deviceId: { type: String, required: true, maxlength: 100 },
  deviceFingerprint: { type: String, maxlength: 128, sparse: true },
  userAgent: { type: String, maxlength: 500 },
  ipAddress: { type: String, maxlength: 45 }, // IPv6 support
  reason: { type: String, maxlength: 200 },
  blockedAt: { type: Date, default: Date.now },
  blockedBy: { type: Schema.Types.ObjectId, ref: "Userdataunlimited" },
  autoUnblockAt: { type: Date, sparse: true },
  blockType: { type: String, enum: ["temporary", "permanent"], default: "permanent" }
}, { _id: false, timestamps: false });

// Optimized Friend Registration Schema
const RegisteredFriendSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Userdataunlimited", required: true },
  name: { type: String, maxlength: 100, trim: true },
  email: { type: String, maxlength: 255, lowercase: true, trim: true },
  phoneNumber: { type: String, maxlength: 20, trim: true },
  registeredAt: { type: Date, default: Date.now },
  bonusCredited: { type: Boolean, default: false }
}, { _id: false });

// Compact Notification Preferences
const NotificationPreferencesSchema = new Schema({
  channels: {
    email: { 
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ["instant", "daily", "weekly"], default: "instant" }
    },
    sms: { 
      enabled: { type: Boolean, default: false },
      onlyUrgent: { type: Boolean, default: true }
    },
    push: { 
      enabled: { type: Boolean, default: true },
      sound: { type: Boolean, default: true }
    },
    inApp: { 
      enabled: { type: Boolean, default: true }
    }
  },
  categories: {
    type: Map,
    of: Boolean,
    default: {
      purchases: true,
      deposits: true,
      withdrawals: true,
      referrals: true,
      security: true,
      promotions: false
    }
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: "22:00", maxlength: 5 },
    endTime: { type: String, default: "07:00", maxlength: 5 },
    timezone: { type: String, default: "Africa/Accra", maxlength: 50 }
  }
}, { _id: false, minimize: true });

// Optimized Push Token Schema
const PushTokenSchema = new Schema({
  token: { type: String, required: true, maxlength: 500 },
  platform: { type: String, enum: ["web", "ios", "android"], required: true },
  isActive: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now, expires: 7776000 }, // Auto-delete after 90 days
  lastUsed: { type: Date, default: Date.now },
  failureCount: { type: Number, default: 0, max: 10 }
}, { _id: false });

// ============================================
// OPTIMIZED USER SCHEMA
// ============================================

const UserSchema = new Schema({
  // Basic Information - Indexed fields
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    maxlength: 255,
    validate: emailValidator,
    index: true
  },
  password: { 
    type: String, 
    required: true,
    select: false,
    maxlength: 128
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    maxlength: 20,
    validate: phoneValidator,
    index: true
  },
  role: { 
    type: String, 
    enum: ["buyer", "seller", "reporter", "admin", "Dealer"], 
    default: "buyer",
    index: true
  },
  
  // Financial - Optimized for frequent updates
  walletBalance: { 
    type: Number, 
    default: 0, 
    min: 0,
    max: 999999999,
    index: true
  },
  walletLocked: { type: Boolean, default: false, sparse: true },
  
  // Referral System - Sparse indexes for optional fields
  referralCode: { 
    type: String, 
    unique: true, 
    sparse: true,
    maxlength: 20
  },
  referredBy: { 
    type: String, 
    sparse: true,
    maxlength: 20
  },
  
  // Friend Registration - Capped array
  registeredByUserId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited",
    sparse: true
  },
  registeredFriends: {
    type: [RegisteredFriendSchema],
    validate: [arrayLimit, '{PATH} exceeds the limit of 100']
  },
  
  // Notification Settings - Embedded for performance
  notificationPreferences: {
    type: NotificationPreferencesSchema,
    default: () => ({})
  },
  
  // Push Tokens - Limited array with auto-cleanup
  pushTokens: {
    type: [PushTokenSchema],
    validate: [arrayLimit20, '{PATH} exceeds the limit of 20']
  },
  
  // Real-time Status - Volatile data
  socketConnections: {
    type: [{
      socketId: { type: String, required: true, maxlength: 50 },
      connectedAt: { type: Date, default: Date.now }
    }],
    select: false,
    validate: [arrayLimit10, '{PATH} exceeds the limit of 10']
  },
  isOnline: { type: Boolean, default: false, index: true },
  lastSeen: { type: Date, default: Date.now, index: true },
  
  // Authentication - Separate for security
  emailVerified: { type: Boolean, default: false, sparse: true },
  phoneVerified: { type: Boolean, default: false, sparse: true },
  
  // Password Reset - TTL index for auto-cleanup
  resetPasswordOTP: { type: String, select: false, maxlength: 10 },
  resetPasswordOTPExpiry: { 
    type: Date, 
    select: false,
    expires: 3600 // Auto-delete after 1 hour
  },
  lastPasswordReset: { type: Date, sparse: true },
  
  // Two-Factor - Optional fields with sparse index
  twoFactorEnabled: { type: Boolean, default: false, sparse: true },
  twoFactorSecret: { type: String, select: false, sparse: true },
  
  // Account Status - Optimized for queries
  isDisabled: { type: Boolean, default: false, sparse: true },
  disableReason: { type: String, maxlength: 200, sparse: true },
  disabledAt: { type: Date, sparse: true },
  
  // Device Management - Limited arrays
  blockedDevices: {
    type: [BlockedDeviceSchema],
    validate: [arrayLimit50, '{PATH} exceeds the limit of 50']
  },
  
  // Login Tracking - Compact structure
  lastLogin: {
    deviceId: { type: String, maxlength: 100 },
    ipAddress: { type: String, maxlength: 45 },
    timestamp: { type: Date }
  },
  failedLoginAttempts: { 
    type: Number, 
    default: 0, 
    max: 100,
    sparse: true
  },
  lockoutUntil: { type: Date, sparse: true },
  
  // Admin Approval
  approvalStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending",
    index: true
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: "Userdataunlimited", sparse: true },
  approvedAt: { type: Date, sparse: true },
  rejectionReason: { type: String, maxlength: 200, sparse: true },
  
  // Minimal preferences
  preferences: {
    language: { type: String, default: "en", maxlength: 5 },
    currency: { type: String, default: "GHS", maxlength: 3 },
    theme: { type: String, enum: ["light", "dark", "auto"], default: "light" }
  }
}, {
  timestamps: true,
  minimize: true,
  strict: true,
  validateBeforeSave: true
});

// Array limit validators
function arrayLimit(val) {
  return val.length <= 100;
}

function arrayLimit20(val) {
  return val.length <= 20;
}

function arrayLimit10(val) {
  return val.length <= 10;
}

function arrayLimit50(val) {
  return val.length <= 50;
}

// Optimized Compound Indexes
UserSchema.index({ approvalStatus: 1, createdAt: -1 });
UserSchema.index({ role: 1, isDisabled: 1 });
UserSchema.index({ referralCode: 1 }, { sparse: true });
UserSchema.index({ isOnline: 1, lastSeen: -1 });
UserSchema.index({ 'pushTokens.token': 1 }, { sparse: true });

// Text index for search
UserSchema.index({ name: 'text', email: 'text' });

// Virtual for active status (computed, not stored)
UserSchema.virtual('isActive').get(function() {
  return !this.isDisabled && this.approvalStatus === 'approved';
});

// Pre-save optimization
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ============================================
// LIGHTWEIGHT NOTIFICATION SCHEMA
// ============================================

const NotificationSchema = new Schema({
  // Core fields only
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true 
  },
  
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  type: { 
    type: String, 
    required: true,
    maxlength: 50,
    index: true
  },
  
  priority: { 
    type: String, 
    enum: ["low", "normal", "high", "urgent"], 
    default: "normal",
    index: true
  },
  
  // Minimal data payload
  data: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  
  // Simple delivery tracking
  delivered: {
    push: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  
  // Read status
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date, sparse: true },
  
  // Auto-deletion
  expiresAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // 30 days
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  minimize: true
});

// Optimized compound indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================
// EFFICIENT NOTIFICATION QUEUE
// ============================================

const NotificationQueueSchema = new Schema({
  notificationId: { 
    type: Schema.Types.ObjectId, 
    ref: "Notification",
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited",
    required: true
  },
  channel: { 
    type: String, 
    enum: ["email", "sms", "push"],
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
    index: true
  },
  priority: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10,
    index: true
  },
  
  attempts: { type: Number, default: 0, max: 5 },
  nextRetryAt: { type: Date, index: true },
  lastError: { type: String, maxlength: 500 }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Priority queue index
NotificationQueueSchema.index({ status: 1, priority: -1, nextRetryAt: 1 });

// Auto-cleanup old queue items
NotificationQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

// ============================================
// OPTIMIZED SITE SETTINGS (SINGLETON)
// ============================================

const SiteSettingsSchema = new Schema({
  _id: { type: String, default: 'singleton' }, // Force single document
  
  // Essential settings only
  general: {
    siteName: { type: String, default: "DataUnlimited", maxlength: 100 },
    siteUrl: { type: String, default: "https://dataunlimited.com", maxlength: 255 },
    supportEmail: { type: String, default: "support@dataunlimited.com", maxlength: 255 },
    timezone: { type: String, default: "Africa/Accra", maxlength: 50 }
  },
  
  // Maintenance
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: { type: String, maxlength: 500 },
    allowedIPs: [{ type: String, maxlength: 45 }]
  },
  
  // Core business rules
  limits: {
    minDeposit: { type: Number, default: 10, min: 0 },
    maxDeposit: { type: Number, default: 10000, min: 0 },
    minWithdrawal: { type: Number, default: 50, min: 0 },
    maxWithdrawal: { type: Number, default: 5000, min: 0 },
    dailyPurchaseLimit: { type: Number, default: 5000, min: 0 },
    referralBonus: { type: Number, default: 5, min: 0 },
    maxLoginAttempts: { type: Number, default: 5, min: 1, max: 10 }
  },
  
  // Payment config (stored as JSON for flexibility)
  paymentGateways: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  
  // Notification config (stored as JSON)
  notifications: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  
  // Feature flags
  features: {
    type: Map,
    of: Boolean,
    default: {
      registration: true,
      purchases: true,
      deposits: true,
      withdrawals: true,
      referrals: true
    }
  },
  
  // Pricing (cached separately)
  pricingVersion: { type: Number, default: 1 },
  lastPricingUpdate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  minimize: true,
  strict: false // Allow dynamic fields
});

// Ensure singleton
SiteSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findById('singleton').lean().exec();
  if (!settings) {
    settings = await this.create({ _id: 'singleton' });
  }
  return settings;
};

// ============================================
// HIGH-PERFORMANCE DATA PURCHASE SCHEMA
// ============================================

const DataPurchaseSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true
  },
  phoneNumber: { 
    type: String, 
    required: true,
    maxlength: 20,
    index: true 
  },
  network: { 
    type: String, 
    enum: ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
    required: true,
    index: true
  },
  capacity: { type: Number, required: true, min: 0 },
  gateway: { type: String, required: true, maxlength: 50 },
  method: { type: String, enum: ["web", "api", "bulk"], default: "web" },
  price: { type: Number, required: true, min: 0 },
  geonetReference: { 
    type: String, 
    required: true, 
    unique: true,
    maxlength: 100
  },
  
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
    index: true
  },
  
  // Prevent double processing
  processing: { type: Boolean, default: false, sparse: true },
  
  // Optional fields with sparse indexes
  adminNotes: { type: String, maxlength: 500, sparse: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "Userdataunlimited", sparse: true }
}, {
  timestamps: true,
  minimize: true
});

// Compound indexes for common queries
DataPurchaseSchema.index({ userId: 1, status: 1, createdAt: -1 });
DataPurchaseSchema.index({ phoneNumber: 1, createdAt: -1 });
DataPurchaseSchema.index({ network: 1, status: 1 });
DataPurchaseSchema.index({ createdAt: -1 });

// ============================================
// STREAMLINED TRANSACTION SCHEMA
// ============================================

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Userdataunlimited',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'refund', 'purchase', 'bonus'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  gateway: {
    type: String,
    enum: ['paystack', 'momo', 'manual', 'system', 'wallet'],
    default: 'system'
  },
  
  // Prevent double processing
  processing: { type: Boolean, default: false, sparse: true },
  
  // Optional metadata
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    sparse: true
  }
}, {
  timestamps: true,
  minimize: true
});

// Optimized indexes
TransactionSchema.index({ userId: 1, type: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

// ============================================
// SIMPLE REFERRAL BONUS SCHEMA
// ============================================

const ReferralBonusSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true
  },
  referredUserId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ["pending", "credited"], 
    default: "pending",
    index: true
  },
  registrationType: { 
    type: String, 
    enum: ["referral", "friend"], 
    default: "referral" 
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// ============================================
// INVENTORY SCHEMA
// ============================================

const DataInventorySchema = new Schema({
  network: { 
    type: String, 
    enum: ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
    required: true,
    unique: true
  },
  inStock: { type: Boolean, default: true, index: true },
  skipGeonettech: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// API KEY SCHEMA
// ============================================

const ApiKeySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Userdataunlimited',
    required: true,
    index: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUsed: {
    type: Date,
    sparse: true
  },
  expiresAt: {
    type: Date,
    sparse: true,
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// ============================================
// ORDER REPORT SCHEMA
// ============================================

const OrderReportSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true
  },
  purchaseId: { 
    type: Schema.Types.ObjectId, 
    ref: "DataPurchasedataunlimited", 
    required: true,
    index: true
  },
  reason: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  status: { 
    type: String, 
    enum: ["pending", "investigating", "resolved", "rejected"], 
    default: "pending",
    index: true
  },
  adminNotes: { 
    type: String,
    maxlength: 500,
    sparse: true
  },
  resolution: { 
    type: String, 
    enum: ["refunded", "resent", "other", null], 
    default: null,
    sparse: true
  }
}, {
  timestamps: true
});

// Compound index for admin queries
OrderReportSchema.index({ status: 1, createdAt: -1 });

// ============================================
// OPTIMIZED MODEL CREATION
// ============================================

// Cache models to prevent re-compilation
const models = {};

function getModel(name, schema) {
  if (!models[name]) {
    models[name] = mongoose.models[name] || mongoose.model(name, schema);
  }
  return models[name];
}

// Create models with caching
const User = getModel("Userdataunlimited", UserSchema);
const DataPurchase = getModel("DataPurchasedataunlimited", DataPurchaseSchema);
const Transaction = getModel("Transactiondataunlimited", TransactionSchema);
const ReferralBonus = getModel("ReferralBonusdataunlimited", ReferralBonusSchema);
const ApiKey = getModel("ApiKeydatahusle", ApiKeySchema);
const DataInventory = getModel("DataInventorydataunlimited", DataInventorySchema);
const OrderReport = getModel("OrderReportunlimited", OrderReportSchema);
const Notification = getModel("Notification", NotificationSchema);
const NotificationQueue = getModel("NotificationQueue", NotificationQueueSchema);
const SiteSettings = getModel("SiteSettings", SiteSettingsSchema);

// ============================================
// PERFORMANCE HELPERS
// ============================================

// Bulk write helper for better performance
async function bulkWrite(model, operations, options = {}) {
  const defaultOptions = {
    ordered: false,
    writeConcern: { w: 1, j: false }
  };
  return model.bulkWrite(operations, { ...defaultOptions, ...options });
}

// Lean query helper
function leanQuery(model) {
  return {
    find: (filter = {}, projection = null) => {
      return model.find(filter, projection).lean().exec();
    },
    findOne: (filter = {}, projection = null) => {
      return model.findOne(filter, projection).lean().exec();
    },
    findById: (id, projection = null) => {
      return model.findById(id, projection).lean().exec();
    }
  };
}

// Connection pool monitoring
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected with optimized settings');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// ============================================
// EXPORTS
// ============================================

module.exports = { 
  // Models
  User, 
  DataPurchase, 
  Transaction, 
  ReferralBonus, 
  ApiKey, 
  DataInventory, 
  OrderReport,
  Notification,
  NotificationQueue,
  SiteSettings,
  
  // Performance helpers
  bulkWrite,
  leanQuery,
  
  // Mongoose instance for raw operations
  mongoose
};