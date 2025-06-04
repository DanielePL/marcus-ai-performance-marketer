// server/src/models/User.js
// MARCUS AI - User Model for MongoDB

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic User Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },

  company: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // Account Status & Role
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'],
    default: 'user'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Trial & Subscription
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial'
  },

  trialStartDate: {
    type: Date,
    default: Date.now
  },

  trialEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
  },

  subscriptionStartDate: {
    type: Date
  },

  subscriptionEndDate: {
    type: Date
  },

  // API Credentials & Settings
  googleAdsCustomerId: {
    type: String,
    trim: true
  },

  metaAdAccountId: {
    type: String,
    trim: true
  },

  preferredCurrency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD']
  },

  timezone: {
    type: String,
    default: 'UTC'
  },

  // Marcus AI Settings
  marcusSettings: {
    autoOptimization: {
      type: Boolean,
      default: true
    },

    budgetAlerts: {
      type: Boolean,
      default: true
    },

    performanceAlerts: {
      type: Boolean,
      default: true
    },

    weeklyReports: {
      type: Boolean,
      default: true
    },

    riskTolerance: {
      type: String,
      enum: ['conservative', 'moderate', 'aggressive'],
      default: 'moderate'
    },

    maxDailyBudget: {
      type: Number,
      default: 1000
    }
  },

  // Usage Statistics
  stats: {
    campaignsCreated: {
      type: Number,
      default: 0
    },

    totalSpend: {
      type: Number,
      default: 0
    },

    totalConversions: {
      type: Number,
      default: 0
    },

    lastCampaignDate: {
      type: Date
    },

    apiCallsThisMonth: {
      type: Number,
      default: 0
    }
  },

  // Timestamps
  lastLogin: {
    type: Date
  },

  lastActive: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manages createdAt and updatedAt
  collection: 'users'
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ subscriptionStatus: 1 });
userSchema.index({ trialEndDate: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Virtual for trial days remaining
userSchema.virtual('trialDaysRemaining').get(function() {
  if (this.subscriptionStatus !== 'trial') return 0;
  const now = new Date();
  const daysLeft = Math.ceil((this.trialEndDate - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
});

// Virtual for trial status
userSchema.virtual('isTrialActive').get(function() {
  const now = new Date();
  return this.subscriptionStatus === 'trial' && now < this.trialEndDate;
});

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if user can access premium features
userSchema.methods.canAccessPremiumFeatures = function() {
  return this.subscriptionStatus === 'active' ||
         this.role === 'admin' ||
         this.isTrialActive;
};

// Instance method to check if user can create campaigns
userSchema.methods.canCreateCampaigns = function() {
  return this.isActive &&
         (this.subscriptionStatus === 'active' || this.isTrialActive) &&
         this.stats.apiCallsThisMonth < this.getMonthlyLimit();
};

// Instance method to get monthly API call limit
userSchema.methods.getMonthlyLimit = function() {
  switch (this.subscriptionStatus) {
    case 'trial':
      return 100; // 100 API calls during trial
    case 'active':
      return this.role === 'premium' ? 10000 : 1000;
    default:
      return 0;
  }
};

// Instance method to increment campaign stats
userSchema.methods.incrementCampaignStats = function(spend = 0, conversions = 0) {
  this.stats.campaignsCreated += 1;
  this.stats.totalSpend += spend;
  this.stats.totalConversions += conversions;
  this.stats.lastCampaignDate = new Date();
  this.stats.apiCallsThisMonth += 1;
  return this.save();
};

// Static method to find users with expiring trials
userSchema.statics.findExpiringTrials = function(days = 3) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);

  return this.find({
    subscriptionStatus: 'trial',
    trialEndDate: { $lte: expirationDate, $gte: new Date() }
  });
};

// Static method to find active subscribers
userSchema.statics.findActiveSubscribers = function() {
  return this.find({
    subscriptionStatus: 'active',
    isActive: true
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;