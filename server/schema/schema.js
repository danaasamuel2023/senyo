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
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    maxlength: 255,
    validate: emailValidator
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
    trim: true,
    maxlength: 20,
    validate: phoneValidator
  },
  role: { 
    type: String, 
    enum: ["buyer", "seller", "reporter", "admin", "Dealer", "agent"], 
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
  
  // Enhanced Two-Factor Authentication
  twoFactorEnabled: { type: Boolean, default: false, sparse: true },
  twoFactorSecret: { type: String, select: false, sparse: true },
  twoFactorBackupCodes: { 
    type: [String], 
    select: false, 
    validate: [arrayLimit10, '{PATH} exceeds the limit of 10'],
    sparse: true 
  },
  twoFactorSetupAt: { type: Date, sparse: true },
  
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
  
  // Enhanced Security Settings
  securitySettings: {
    sessionTimeout: { type: Number, default: 30, min: 5, max: 480 }, // minutes
    loginNotifications: { type: Boolean, default: true },
    deviceManagementEnabled: { type: Boolean, default: true },
    requirePasswordForSensitiveActions: { type: Boolean, default: true },
    allowMultipleSessions: { type: Boolean, default: true }
  },
  
  // Session Management
  activeSessions: {
    type: [{
      sessionId: { type: String, required: true, maxlength: 100 },
      deviceId: { type: String, maxlength: 100 },
      deviceName: { type: String, maxlength: 100 },
      ipAddress: { type: String, maxlength: 45 },
      userAgent: { type: String, maxlength: 500 },
      location: { type: String, maxlength: 200 },
      createdAt: { type: Date, default: Date.now },
      lastActivity: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true }
    }],
    validate: [arrayLimit20, '{PATH} exceeds the limit of 20'],
    select: false
  },
  
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
  
  // Enhanced User Preferences
  preferences: {
    language: { type: String, default: "en", maxlength: 5 },
    currency: { type: String, default: "GHS", maxlength: 3 },
    theme: { type: String, enum: ["light", "dark", "auto"], default: "light" },
    timezone: { type: String, default: "Africa/Accra", maxlength: 50 },
    dateFormat: { type: String, default: "DD/MM/YYYY", maxlength: 20 },
    numberFormat: { type: String, default: "1,000.00", maxlength: 10 }
  },
  
  // Activity Tracking
  activityLog: {
    type: [{
      action: { type: String, required: true, maxlength: 100 },
      details: { type: String, maxlength: 500 },
      ipAddress: { type: String, maxlength: 45 },
      userAgent: { type: String, maxlength: 500 },
      timestamp: { type: Date, default: Date.now }
    }],
    validate: [arrayLimit100, '{PATH} exceeds the limit of 100'],
    select: false
  },
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: { type: String, enum: ["public", "private", "friends"], default: "private" },
    showOnlineStatus: { type: Boolean, default: true },
    allowContactByEmail: { type: Boolean, default: true },
    allowContactBySMS: { type: Boolean, default: false },
    dataExportRequested: { type: Date, sparse: true },
    dataExportCompletedAt: { type: Date, sparse: true }
  },
  
  // Admin-Specific Fields
  adminMetadata: {
    assignedTerritory: { type: String, maxlength: 100 },
    permissions: {
      type: [String],
      enum: ["manage_users", "manage_orders", "manage_inventory", "manage_reports", "manage_settings", "view_analytics", "process_payments", "handle_refunds"],
      validate: [arrayLimit20, '{PATH} exceeds the limit of 20']
    },
    canApproveUsers: { type: Boolean, default: false },
    canManagePricing: { type: Boolean, default: false },
    canAccessReports: { type: Boolean, default: false },
    lastAdminAction: {
      action: { type: String, maxlength: 100 },
      targetId: { type: Schema.Types.ObjectId },
      timestamp: { type: Date }
    },
    adminNotes: { type: String, maxlength: 1000 }
  },
  
  // Business Metrics (for dealers and sellers)
  businessMetrics: {
    totalOrders: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    totalProfit: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0, min: 0 },
    customerCount: { type: Number, default: 0, min: 0 },
    successRate: { type: Number, default: 100, min: 0, max: 100 },
    responseTime: { type: Number, default: 0, min: 0 }, // in minutes
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    lastOrderDate: { type: Date },
    monthlyTarget: { type: Number, default: 0, min: 0 },
    monthlyAchievement: { type: Number, default: 0, min: 0 }
  },
  
  // Agent-Specific Fields
  agentMetadata: {
    agentCode: { type: String, unique: true, sparse: true, maxlength: 20 },
    customSlug: { type: String, unique: true, sparse: true, maxlength: 50 }, // Custom URL slug
    territory: { type: String, maxlength: 100 },
    commissionRate: { type: Number, default: 5, min: 0, max: 100 }, // percentage
    totalCommissions: { type: Number, default: 0, min: 0 },
    pendingCommissions: { type: Number, default: 0, min: 0 },
    paidCommissions: { type: Number, default: 0, min: 0 },
    customerBase: { type: Number, default: 0, min: 0 },
    activeCustomers: { type: Number, default: 0, min: 0 },
    // Store Customization
    storeCustomization: {
      storeName: { type: String, maxlength: 100 },
      storeDescription: { type: String, maxlength: 500 },
      brandColor: { type: String, default: '#FFCC08', maxlength: 7 },
      logoUrl: { type: String, maxlength: 500 },
      bannerUrl: { type: String, maxlength: 500 },
      socialLinks: {
        whatsapp: { type: String, maxlength: 20 },
        facebook: { type: String, maxlength: 200 },
        twitter: { type: String, maxlength: 200 },
        instagram: { type: String, maxlength: 200 }
      },
      welcomeMessage: { type: String, maxlength: 500 },
      showAgentInfo: { type: Boolean, default: true },
      showContactButton: { type: Boolean, default: true }
    },
    registeredCustomers: [{
      customerId: { type: Schema.Types.ObjectId, ref: "Userdataunlimited" },
      registeredAt: { type: Date, default: Date.now },
      totalPurchases: { type: Number, default: 0 },
      lastPurchase: { type: Date, sparse: true }
    }],
    performanceMetrics: {
      conversionRate: { type: Number, default: 0, min: 0, max: 100 },
      averageTicketSize: { type: Number, default: 0, min: 0 },
      monthlyTarget: { type: Number, default: 0, min: 0 },
      monthlyAchievement: { type: Number, default: 0, min: 0 },
      quarterlyBonus: { type: Number, default: 0, min: 0 }
    },
    bankDetails: {
      bankName: { type: String, maxlength: 100 },
      accountName: { type: String, maxlength: 100 },
      accountNumber: { type: String, maxlength: 20 },
      momoNumber: { type: String, maxlength: 20 }
    },
    documents: {
      idType: { type: String, enum: ["passport", "drivers_license", "voter_id", "ghana_card"], maxlength: 20 },
      idNumber: { type: String, maxlength: 50 },
      idVerified: { type: Boolean, default: false },
      idVerifiedAt: { type: Date, sparse: true }
    },
    agentStatus: { 
      type: String, 
      enum: ["pending", "active", "suspended", "terminated"], 
      default: "pending" 
    },
    agentLevel: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze"
    },
    joinedAsAgent: { type: Date, sparse: true },
    lastActivityAsAgent: { type: Date, sparse: true }
  },
  
  // Compliance and Verification
  compliance: {
    kycVerified: { type: Boolean, default: false },
    kycDocuments: {
      type: [{
        type: { type: String, enum: ["national_id", "drivers_license", "passport", "utility_bill"] },
        documentNumber: { type: String, maxlength: 50 },
        uploadedAt: { type: Date },
        verifiedAt: { type: Date },
        expiryDate: { type: Date },
        status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" }
      }],
      validate: [arrayLimit10, '{PATH} exceeds the limit of 10']
    },
    taxId: { type: String, maxlength: 50, sparse: true },
    businessLicense: { type: String, maxlength: 100, sparse: true },
    termsAcceptedAt: { type: Date },
    privacyPolicyAcceptedAt: { type: Date },
    lastComplianceCheck: { type: Date }
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

function arrayLimit100(val) {
  return val.length <= 100;
}

// Optimized Compound Indexes
UserSchema.index({ approvalStatus: 1, createdAt: -1 });
UserSchema.index({ role: 1, isDisabled: 1 });
UserSchema.index({ isOnline: 1, lastSeen: -1 });
UserSchema.index({ 'pushTokens.token': 1 }, { sparse: true });
UserSchema.index({ 'compliance.kycVerified': 1, role: 1 });
UserSchema.index({ 'businessMetrics.totalOrders': -1, role: 1 });
UserSchema.index({ 'businessMetrics.totalRevenue': -1, role: 1 });
UserSchema.index({ 'adminMetadata.permissions': 1 }, { sparse: true });

// Text index for search
UserSchema.index({ name: 'text', email: 'text', phoneNumber: 'text' });

// Virtual for active status (computed, not stored)
UserSchema.virtual('isActive').get(function() {
  return !this.isDisabled && this.approvalStatus === 'approved';
});

// Virtual for admin check
UserSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual for seller/dealer check
UserSchema.virtual('isBusinessUser').get(function() {
  return ['seller', 'Dealer', 'reporter'].includes(this.role);
});

// Virtual for agent check
UserSchema.virtual('isAgent').get(function() {
  return this.role === 'agent';
});

// Virtual for completion percentage
UserSchema.virtual('profileCompleteness').get(function() {
  let completed = 0;
  const total = 10;
  
  if (this.name) completed++;
  if (this.email && this.emailVerified) completed++;
  if (this.phoneNumber && this.phoneVerified) completed++;
  if (this.referralCode) completed++;
  if (this.compliance?.kycVerified) completed++;
  if (this.notificationPreferences) completed++;
  if (this.preferences) completed++;
  if (this.twoFactorEnabled) completed++;
  if (this.profilePicture) completed++;
  if (this.walletBalance > 0) completed++;
  
  return Math.round((completed / total) * 100);
});

// Pre-save optimization and business logic
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate business metrics
  if (this.isModified('businessMetrics.totalOrders') && this.businessMetrics.totalOrders > 0) {
    if (this.businessMetrics.totalRevenue > 0) {
      this.businessMetrics.averageOrderValue = this.businessMetrics.totalRevenue / this.businessMetrics.totalOrders;
    }
  }
  
  // Update last seen
  if (this.isModified('isOnline') && this.isOnline) {
    this.lastSeen = Date.now();
  }
  
  next();
});

// Post-save hook for logging
UserSchema.post('save', function(doc) {
  // Log important changes (can be connected to audit system)
  if (doc.isModified('role')) {
    console.log(`User role changed: ${doc._id} -> ${doc.role}`);
  }
  if (doc.isModified('isDisabled')) {
    console.log(`User status changed: ${doc._id} -> ${doc.isDisabled ? 'disabled' : 'enabled'}`);
  }
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
  agentId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
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
    enum: ["MTN", "YELLO", "VODAFONE", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
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
    enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
    default: "pending",
    index: true
  },
  
  // Payment fields
  paymentMethod: { 
    type: String, 
    enum: ['wallet', 'mobile_money', 'card', 'bank_transfer'], 
    index: true
  },
  paymentProvider: { 
    type: String, 
    maxlength: 100 
  },
  paymentReference: { 
    type: String, 
    maxlength: 200, 
    index: true 
  },
  paystackReference: { 
    type: String, 
    maxlength: 200, 
    index: true 
  },
  paystackTransactionId: { 
    type: String, 
    maxlength: 200 
  },
  paystackFees: { 
    type: Number, 
    min: 0 
  },
  paymentFailureReason: { 
    type: String, 
    maxlength: 500 
  },
  paidAt: { 
    type: Date 
  },
  refundedAt: { 
    type: Date 
  },
  refundReference: { 
    type: String, 
    maxlength: 200 
  },
  refundReason: { 
    type: String, 
    maxlength: 500 
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
    enum: ['paystack', 'momo', 'moolre', 'bulkclix', 'bulkclix_momo', 'manual', 'system', 'wallet'],
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
    enum: ["MTN", "YELLO", "VODAFONE", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
    required: true,
    unique: true
  },
  inStock: { type: Boolean, default: true, index: true },
  skipGeonettech: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// PRODUCT PRICING SCHEMA (Global Price Management)
// ============================================

const ProductPricingSchema = new Schema({
  network: { 
    type: String, 
    enum: ["MTN", "YELLO", "VODAFONE", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
    required: true,
    index: true
  },
  capacity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  enabled: { type: Boolean, default: true, index: true },
  description: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound unique index
ProductPricingSchema.index({ network: 1, capacity: 1 }, { unique: true });

// ============================================
// REVIEWS AND RATINGS SCHEMA
// ============================================

const ReviewSchema = new Schema({
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true
  },
  agentId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true
  },
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: "DataPurchasedataunlimited", 
    required: true,
    index: true
  },
  productId: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5,
    index: true
  },
  title: { 
    type: String, 
    maxlength: 100, 
    trim: true 
  },
  comment: { 
    type: String, 
    maxlength: 1000, 
    trim: true 
  },
  images: [{ 
    type: String, 
    maxlength: 500 
  }],
  verified: { 
    type: Boolean, 
    default: false 
  },
  helpful: { 
    type: Number, 
    default: 0 
  },
  reported: { 
    type: Boolean, 
    default: false 
  },
  response: {
    agentId: { type: Schema.Types.ObjectId, ref: "Userdataunlimited" },
    comment: { type: String, maxlength: 1000 },
    respondedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ agentId: 1, createdAt: -1 });
ReviewSchema.index({ productId: 1, rating: -1 });
ReviewSchema.index({ customerId: 1, agentId: 1, orderId: 1 }, { unique: true });

// ============================================
// AGENT CATALOG SCHEMA
// ============================================

const AgentCatalogSchema = new Schema({
  agentId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true,
    unique: true
  },
  // Legacy items array for backward compatibility
  items: [{
    _id: false,
    id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    network: { type: String, enum: ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], required: true },
    capacity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
    title: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  // New enhanced products array
  products: [{
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, maxlength: 500, trim: true },
    network: { 
      type: String, 
      enum: ["MTN", "AT", "Telecel", "YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at"], 
      required: true 
    },
    capacity: { type: String, required: true }, // Changed to String to support "5GB", "10GB" etc
    basePrice: { type: Number, required: true, min: 0 }, // Admin-set minimum price
    agentPrice: { type: Number, required: true, min: 0 }, // Agent's custom price
    stock: { type: Number, default: 0 }, // 0 = unlimited
    isActive: { type: Boolean, default: true },
    category: { 
      type: String, 
      enum: ["data", "voice", "sms", "bundle"], 
      default: "data" 
    },
    tags: [{ type: String, maxlength: 50 }],
    images: [{ type: String, maxlength: 500 }], // URLs to product images
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  // Store analytics
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    topProducts: [{ type: String }],
    customerCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  // Store settings
  settings: {
    acceptGuestCheckout: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: false },
    autoAcceptOrders: { type: Boolean, default: false },
    businessHours: {
      monday: { 
        open: { type: String, default: "08:00" }, 
        close: { type: String, default: "18:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      tuesday: { 
        open: { type: String, default: "08:00" }, 
        close: { type: String, default: "18:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      wednesday: { 
        open: { type: String, default: "08:00" }, 
        close: { type: String, default: "18:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      thursday: { 
        open: { type: String, default: "08:00" }, 
        close: { type: String, default: "18:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      friday: { 
        open: { type: String, default: "08:00" }, 
        close: { type: String, default: "18:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      saturday: { 
        open: { type: String, default: "09:00" }, 
        close: { type: String, default: "16:00" }, 
        isOpen: { type: Boolean, default: true } 
      },
      sunday: { 
        open: { type: String, default: "10:00" }, 
        close: { type: String, default: "14:00" }, 
        isOpen: { type: Boolean, default: false } 
      }
    },
    deliveryOptions: [{
      name: { type: String, maxlength: 100 },
      description: { type: String, maxlength: 300 },
      price: { type: Number, min: 0 },
      estimatedTime: { type: String, maxlength: 50 }
    }],
    paymentMethods: [{ 
      type: String, 
      enum: ["mobile_money", "bank_transfer", "cash", "card"] 
    }]
  },
  updatedAt: { type: Date, default: Date.now }
});

AgentCatalogSchema.index({ "items.network": 1, "items.capacity": 1 });
AgentCatalogSchema.index({ "products.network": 1, "products.capacity": 1 });
AgentCatalogSchema.index({ "products.isActive": 1 });
AgentCatalogSchema.index({ "products.category": 1 });

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
const ProductPricing = getModel("ProductPricing", ProductPricingSchema);
const OrderReport = getModel("OrderReportunlimited", OrderReportSchema);
const AgentCatalog = getModel("AgentCatalog", AgentCatalogSchema);
const Review = getModel("Review", ReviewSchema);
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
// SETTINGS SCHEMA
// ============================================

const SettingsSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['payment_gateway', 'system', 'api', 'notification']
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for faster lookups with uniqueness
SettingsSchema.index({ type: 1 }, { unique: true });

// Static method to get settings by type
SettingsSchema.statics.getByType = async function(type) {
  return await this.findOne({ type });
};

// Static method to update settings by type
SettingsSchema.statics.updateByType = async function(type, data) {
  return await this.findOneAndUpdate(
    { type },
    { 
      data,
      $inc: { version: 1 }
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

const Settings = getModel("Settings", SettingsSchema);

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
  ProductPricing,
  OrderReport,
  Notification,
  NotificationQueue,
  SiteSettings,
  Settings,
  AgentCatalog,
  Review,
  
  // Performance helpers
  bulkWrite,
  leanQuery,
  
  // Mongoose instance for raw operations
  mongoose
};

// ============================================
// WALLET SCHEMA
// ============================================
const WalletSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true, 
    unique: true,
    index: true 
  },
  balance: { 
    type: Number, 
    default: 0, 
    min: 0,
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },
  currency: { 
    type: String, 
    default: 'GHS',
    enum: ['GHS']
  },
  transactions: [{
    type: { 
      type: String, 
      enum: ['deposit', 'purchase', 'refund', 'bonus', 'referral', 'withdrawal'],
      required: true 
    },
    amount: { 
      type: Number, 
      required: true,
      get: v => parseFloat(v.toFixed(2))
    },
    balanceBefore: { 
      type: Number, 
      required: true,
      get: v => parseFloat(v.toFixed(2))
    },
    balanceAfter: { 
      type: Number, 
      required: true,
      get: v => parseFloat(v.toFixed(2))
    },
    description: { 
      type: String, 
      maxlength: 500 
    },
    reference: { 
      type: String, 
      maxlength: 100,
      index: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'],
      default: 'completed' 
    },
    metadata: { 
      type: Map, 
      of: Schema.Types.Mixed 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  frozen: { 
    type: Boolean, 
    default: false 
  },
  freezeReason: { 
    type: String, 
    maxlength: 500 
  },
  lastTransaction: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for wallet
WalletSchema.index({ userId: 1, 'transactions.createdAt': -1 });

const Wallet = mongoose.model("Wallet", WalletSchema);

// ============================================
// REFERRAL SCHEMA
// ============================================
const ReferralSchema = new Schema({
  referrerId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    index: true 
  },
  referredUserId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    unique: true,
    index: true 
  },
  referralCode: { 
    type: String, 
    required: true,
    maxlength: 20,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending',
    index: true 
  },
  bonusAwarded: { 
    type: Boolean, 
    default: false 
  },
  bonusAmount: { 
    type: Number, 
    default: 0,
    get: v => parseFloat(v.toFixed(2))
  },
  referredUserFirstPurchase: { 
    type: Date 
  },
  referredUserTotalSpent: { 
    type: Number, 
    default: 0,
    get: v => parseFloat(v.toFixed(2))
  },
  expiresAt: { 
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compound indexes for referral
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ referralCode: 1, createdAt: -1 });

const Referral = mongoose.model("Referral", ReferralSchema);

// ============================================
// PROMO CODE SCHEMA
// ============================================
const PromoCodeSchema = new Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 50,
    index: true 
  },
  description: { 
    type: String, 
    maxlength: 500 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'],
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0 
  },
  minPurchase: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  maxDiscount: { 
    type: Number,
    min: 0 
  },
  usageLimit: { 
    type: Number,
    min: 1 
  },
  usageCount: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  usedBy: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "Userdataunlimited" 
    },
    usedAt: { 
      type: Date, 
      default: Date.now 
    },
    orderAmount: { 
      type: Number 
    },
    discountApplied: { 
      type: Number 
    }
  }],
  perUserLimit: { 
    type: Number,
    default: 1,
    min: 1 
  },
  validFrom: { 
    type: Date, 
    required: true 
  },
  validUntil: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  applicableNetworks: [{ 
    type: String, 
    enum: ['MTN', 'VODAFONE', 'AIRTELTIGO', 'ALL'] 
  }],
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited" 
  }
}, { 
  timestamps: true 
});

// Indexes for promo codes
PromoCodeSchema.index({ code: 1, isActive: 1 });
PromoCodeSchema.index({ validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ 'usedBy.userId': 1 });

const PromoCode = mongoose.model("PromoCode", PromoCodeSchema);

// ============================================
// 2FA SCHEMA
// ============================================
const TwoFactorAuthSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "Userdataunlimited", 
    required: true,
    unique: true,
    index: true 
  },
  enabled: { 
    type: Boolean, 
    default: false 
  },
  method: { 
    type: String, 
    enum: ['email', 'sms', 'authenticator'],
    default: 'email' 
  },
  secret: { 
    type: String,
    select: false // Don't return in queries by default
  },
  backupCodes: [{ 
    type: String,
    select: false 
  }],
  verificationCode: { 
    type: String,
    select: false 
  },
  codeExpiresAt: { 
    type: Date 
  },
  lastUsed: { 
    type: Date 
  },
  failedAttempts: { 
    type: Number, 
    default: 0 
  },
  lockedUntil: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

const TwoFactorAuth = mongoose.model("TwoFactorAuth", TwoFactorAuthSchema);

// Export new models
module.exports.Wallet = Wallet;
module.exports.Referral = Referral;
module.exports.PromoCode = PromoCode;
module.exports.TwoFactorAuth = TwoFactorAuth;