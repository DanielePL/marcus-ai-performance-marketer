// server/src/models/Campaign.js
// MARCUS AI - Campaign Model for MongoDB

const mongoose = require('mongoose');

// Ad Set Schema (for Google Ads Ad Groups / Meta Ad Sets)
const adSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  platformAdSetId: {
    type: String, // External ID from Google/Meta/etc
    trim: true
  },

  budget: {
    dailyBudget: { type: Number, default: 0 },
    bidStrategy: {
      type: String,
      enum: ['manual_cpc', 'maximize_clicks', 'target_cpa', 'target_roas', 'maximize_conversions'],
      default: 'maximize_clicks'
    },
    bidAmount: { type: Number, default: 0 }
  },

  targeting: {
    demographics: {
      ageMin: { type: Number, min: 13, max: 100 },
      ageMax: { type: Number, min: 13, max: 100 },
      genders: [{ type: String, enum: ['male', 'female', 'all'] }]
    },

    locations: [{
      type: { type: String, enum: ['country', 'region', 'city', 'zipcode'] },
      name: String,
      radius: Number // for radius targeting
    }],

    interests: [String],
    behaviors: [String],
    customAudiences: [String],
    lookalikeSources: [String]
  },

  ads: [{
    headline: String,
    description: String,
    displayUrl: String,
    finalUrl: String,
    imageUrl: String,
    videoUrl: String,
    callToAction: String,
    adFormat: {
      type: String,
      enum: ['text', 'image', 'video', 'carousel', 'collection']
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'deleted'],
      default: 'active'
    }
  }],

  status: {
    type: String,
    enum: ['active', 'paused', 'deleted'],
    default: 'active'
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Main Campaign Schema
const campaignSchema = new mongoose.Schema({
  // Basic Campaign Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  platform: {
    type: String,
    required: true,
    enum: ['google', 'meta', 'tiktok', 'linkedin', 'twitter', 'snapchat'],
    index: true
  },

  platformCampaignId: {
    type: String, // External campaign ID from platform
    trim: true,
    sparse: true,
    index: true
  },

  // Campaign Objective & Type
  objective: {
    type: String,
    required: true,
    enum: [
      'awareness', 'traffic', 'engagement', 'leads', 'app_installs',
      'video_views', 'messages', 'conversions', 'catalog_sales', 'store_visits'
    ]
  },

  campaignType: {
    type: String,
    enum: ['search', 'display', 'shopping', 'video', 'app', 'smart', 'performance_max'],
    default: 'search'
  },

  // Budget & Bidding
  budget: {
    dailyBudget: {
      type: Number,
      required: true,
      min: 1
    },

    totalBudget: {
      type: Number,
      min: 0,
      default: 0
    },

    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY']
    },

    bidStrategy: {
      type: String,
      enum: ['manual_cpc', 'maximize_clicks', 'target_cpa', 'target_roas', 'maximize_conversions'],
      default: 'maximize_clicks'
    },

    targetCPA: { type: Number, min: 0 },
    targetROAS: { type: Number, min: 0 }
  },

  // Campaign Duration
  duration: {
    startDate: {
      type: Date,
      default: Date.now
    },

    endDate: {
      type: Date
    },

    isEndless: {
      type: Boolean,
      default: true
    }
  },

  // Target Audience
  targetAudience: {
    description: String,

    demographics: {
      ageMin: { type: Number, min: 13, max: 100, default: 18 },
      ageMax: { type: Number, min: 13, max: 100, default: 65 },
      genders: [{ type: String, enum: ['male', 'female', 'all'] }],
      languages: [String],
      education: [String],
      jobTitles: [String],
      interests: [String]
    },

    geographic: {
      countries: [String],
      regions: [String],
      cities: [String],
      zipcodes: [String],
      radius: Number,
      excludedLocations: [String]
    },

    behavioral: {
      deviceTypes: [{ type: String, enum: ['desktop', 'mobile', 'tablet'] }],
      operatingSystems: [String],
      browsers: [String],
      purchaseBehavior: [String],
      lifestyleInterests: [String]
    }
  },

  // Keywords (for Search campaigns)
  keywords: [{
    text: {
      type: String,
      required: true,
      trim: true
    },

    matchType: {
      type: String,
      enum: ['exact', 'phrase', 'broad', 'broad_modified'],
      default: 'broad'
    },

    bid: {
      type: Number,
      min: 0
    },

    quality: {
      qualityScore: { type: Number, min: 1, max: 10 },
      expectedCTR: { type: String, enum: ['below_average', 'average', 'above_average'] },
      adRelevance: { type: String, enum: ['below_average', 'average', 'above_average'] },
      landingPageExperience: { type: String, enum: ['below_average', 'average', 'above_average'] }
    },

    status: {
      type: String,
      enum: ['active', 'paused', 'deleted'],
      default: 'active'
    }
  }],

  // Negative Keywords
  negativeKeywords: [{
    text: String,
    matchType: { type: String, enum: ['exact', 'phrase', 'broad'], default: 'broad' }
  }],

  // Creative Assets
  creativeConcept: {
    type: String,
    maxlength: 500
  },

  creativeAssets: {
    headlines: [{
      text: {
        type: String,
        maxlength: 30
      }
    }],

    descriptions: [{
      text: {
        type: String,
        maxlength: 90
      }
    }],

    images: [{
      url: String,
      alt: String,
      dimensions: {
        width: Number,
        height: Number
      }
    }],

    videos: [{
      url: String,
      thumbnail: String,
      duration: Number // in seconds
    }],

    logos: [{
      url: String,
      alt: String
    }],

    callToActions: [String]
  },

  // Ad Sets / Ad Groups
  adSets: [adSetSchema],

  // Campaign Status
  status: {
    type: String,
    enum: ['draft', 'review', 'active', 'paused', 'completed', 'deleted'],
    default: 'draft',
    index: true
  },

  // Platform-specific settings
  platformSettings: {
    google: {
      networkSettings: {
        targetGoogleSearch: { type: Boolean, default: true },
        targetSearchPartners: { type: Boolean, default: false },
        targetContentNetwork: { type: Boolean, default: false },
        targetDisplayNetwork: { type: Boolean, default: false }
      },

      extensions: {
        sitelinks: [String],
        callouts: [String],
        structuredSnippets: [String],
        phoneNumber: String,
        address: String
      }
    },

    meta: {
      placementSettings: {
        feeds: { type: Boolean, default: true },
        stories: { type: Boolean, default: true },
        reels: { type: Boolean, default: true },
        instream: { type: Boolean, default: false },
        search: { type: Boolean, default: true },
        messages: { type: Boolean, default: false }
      },

      optimization: {
        optimizationGoal: String,
        billingEvent: String,
        deliveryType: { type: String, enum: ['standard', 'accelerated'], default: 'standard' }
      }
    }
  },

  // Performance Metrics (Live Data)
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },

    // Calculated Metrics
    ctr: { type: Number, default: 0 }, // Click-through rate
    cpc: { type: Number, default: 0 }, // Cost per click
    cpa: { type: Number, default: 0 }, // Cost per acquisition
    roas: { type: Number, default: 0 }, // Return on ad spend

    // Video Metrics (if applicable)
    videoViews: { type: Number, default: 0 },
    videoViewRate: { type: Number, default: 0 },
    videoQuartileViews: {
      q25: { type: Number, default: 0 },
      q50: { type: Number, default: 0 },
      q75: { type: Number, default: 0 },
      q100: { type: Number, default: 0 }
    },

    lastUpdated: { type: Date, default: Date.now }
  },

  // Marcus AI Insights & Recommendations
  marcusInsights: {
    performanceScore: { type: Number, min: 0, max: 100 },

    recommendations: [{
      type: {
        type: String,
        enum: ['budget_increase', 'budget_decrease', 'keyword_add', 'keyword_remove', 'bid_adjustment', 'audience_expansion', 'creative_refresh']
      },
      priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      message: String,
      expectedImpact: String,
      implemented: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],

    optimizations: [{
      type: String,
      description: String,
      appliedAt: { type: Date, default: Date.now },
      result: String
    }],

    alerts: [{
      type: { type: String, enum: ['budget', 'performance', 'compliance'] },
      severity: { type: String, enum: ['info', 'warning', 'error'] },
      message: String,
      acknowledged: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],

    lastAnalyzed: { type: Date, default: Date.now }
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  launchedAt: { type: Date },
  pausedAt: { type: Date },
  completedAt: { type: Date },
  deletedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'campaigns'
});

// Indexes for better performance
campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ platform: 1, status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ 'metrics.lastUpdated': -1 });
campaignSchema.index({ platformCampaignId: 1 }, { sparse: true });

// Virtual for campaign duration in days
campaignSchema.virtual('durationDays').get(function() {
  if (!this.duration.endDate) return null;
  const diffTime = Math.abs(this.duration.endDate - this.duration.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days running
campaignSchema.virtual('daysRunning').get(function() {
  if (!this.launchedAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.launchedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for budget utilization
campaignSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.totalBudget || this.budget.totalBudget === 0) return null;
  return (this.metrics.spend / this.budget.totalBudget * 100).toFixed(2);
});

// Pre-save middleware
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate derived metrics
  if (this.metrics.impressions && this.metrics.clicks) {
    this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions * 100);
  }

  if (this.metrics.spend && this.metrics.clicks) {
    this.metrics.cpc = (this.metrics.spend / this.metrics.clicks);
  }

  if (this.metrics.spend && this.metrics.conversions) {
    this.metrics.cpa = (this.metrics.spend / this.metrics.conversions);
  }

  // Calculate ROAS (assuming $50 average conversion value for now)
  if (this.metrics.conversions && this.metrics.spend) {
    const estimatedRevenue = this.metrics.conversions * 50; // TODO: Make this configurable
    this.metrics.roas = (estimatedRevenue / this.metrics.spend);
  }

  next();
});

// Instance method to update metrics
campaignSchema.methods.updateMetrics = function(newMetrics) {
  Object.assign(this.metrics, newMetrics);
  this.metrics.lastUpdated = new Date();
  return this.save();
};

// Instance method to add Marcus recommendation
campaignSchema.methods.addRecommendation = function(recommendation) {
  this.marcusInsights.recommendations.push({
    ...recommendation,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to check if campaign is active
campaignSchema.methods.isActive = function() {
  return this.status === 'active' &&
         (!this.duration.endDate || this.duration.endDate > new Date());
};

// Instance method to calculate daily spend rate
campaignSchema.methods.getDailySpendRate = function() {
  if (!this.launchedAt || this.metrics.spend === 0) return 0;

  const daysRunning = this.daysRunning;
  return daysRunning > 0 ? this.metrics.spend / daysRunning : 0;
};

// Static method to find campaigns needing optimization
campaignSchema.statics.findCampaignsNeedingOptimization = function(userId) {
  return this.find({
    userId,
    status: 'active',
    $or: [
      { 'metrics.ctr': { $lt: 2.0 } }, // Low CTR
      { 'metrics.roas': { $lt: 2.0 } }, // Low ROAS
      { 'marcusInsights.lastAnalyzed': { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Not analyzed in 24h
    ]
  });
};

// Static method to get performance summary
campaignSchema.statics.getPerformanceSummary = async function(userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        totalSpend: { $sum: '$metrics.spend' },
        totalImpressions: { $sum: '$metrics.impressions' },
        totalClicks: { $sum: '$metrics.clicks' },
        totalConversions: { $sum: '$metrics.conversions' },
        avgCTR: { $avg: '$metrics.ctr' },
        avgCPC: { $avg: '$metrics.cpc' },
        avgROAS: { $avg: '$metrics.roas' }
      }
    }
  ]);
};

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;