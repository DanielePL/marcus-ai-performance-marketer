// server/src/models/PerformanceMetric.js
// MARCUS AI - Performance Metrics Model for Time-Series Data

const mongoose = require('mongoose');

// Performance Metric Schema for time-series data
const performanceMetricSchema = new mongoose.Schema({
  // Reference Fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },

  // Platform Information
  platform: {
    type: String,
    required: true,
    enum: ['google', 'meta', 'tiktok', 'linkedin', 'twitter', 'snapchat'],
    index: true
  },

  platformCampaignId: {
    type: String,
    trim: true,
    index: true
  },

  // Time Information
  date: {
    type: Date,
    required: true,
    index: true
  },

  hour: {
    type: Number,
    min: 0,
    max: 23,
    index: true
  },

  granularity: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily',
    index: true
  },

  // Core Performance Metrics
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },

  clicks: {
    type: Number,
    default: 0,
    min: 0
  },

  conversions: {
    type: Number,
    default: 0,
    min: 0
  },

  spend: {
    type: Number,
    default: 0,
    min: 0
  },

  // Video Metrics (for video campaigns)
  videoViews: {
    type: Number,
    default: 0,
    min: 0
  },

  videoViewsP25: {
    type: Number,
    default: 0,
    min: 0
  },

  videoViewsP50: {
    type: Number,
    default: 0,
    min: 0
  },

  videoViewsP75: {
    type: Number,
    default: 0,
    min: 0
  },

  videoViewsP100: {
    type: Number,
    default: 0,
    min: 0
  },

  // Engagement Metrics (for social platforms)
  likes: {
    type: Number,
    default: 0,
    min: 0
  },

  shares: {
    type: Number,
    default: 0,
    min: 0
  },

  comments: {
    type: Number,
    default: 0,
    min: 0
  },

  follows: {
    type: Number,
    default: 0,
    min: 0
  },

  saves: {
    type: Number,
    default: 0,
    min: 0
  },

  // E-commerce Metrics
  addToCarts: {
    type: Number,
    default: 0,
    min: 0
  },

  purchases: {
    type: Number,
    default: 0,
    min: 0
  },

  revenue: {
    type: Number,
    default: 0,
    min: 0
  },

  // Calculated Metrics (computed automatically)
  ctr: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  cpc: {
    type: Number,
    default: 0,
    min: 0
  },

  cpm: {
    type: Number,
    default: 0,
    min: 0
  },

  cpa: {
    type: Number,
    default: 0,
    min: 0
  },

  roas: {
    type: Number,
    default: 0,
    min: 0
  },

  conversionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Quality Metrics
  qualityScore: {
    type: Number,
    min: 1,
    max: 10
  },

  relevanceScore: {
    type: Number,
    min: 1,
    max: 10
  },

  // Device Breakdown
  deviceBreakdown: {
    desktop: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    mobile: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    tablet: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },

  // Age & Gender Breakdown
  demographicBreakdown: {
    age18to24: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    age25to34: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    age35to44: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    age45to54: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    age55plus: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    male: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    },

    female: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },

  // Geographic Breakdown (top locations)
  geographicBreakdown: [{
    location: String,
    locationType: { type: String, enum: ['country', 'region', 'city'] },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }],

  // Data Source & Quality
  dataSource: {
    type: String,
    enum: ['api', 'manual', 'import', 'estimated'],
    default: 'api'
  },

  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },

  // Timestamps
  syncedAt: {
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
  timestamps: true,
  collection: 'performanceMetrics'
});

// Compound Indexes for efficient querying
performanceMetricSchema.index({ userId: 1, date: -1 });
performanceMetricSchema.index({ campaignId: 1, date: -1 });
performanceMetricSchema.index({ platform: 1, date: -1 });
performanceMetricSchema.index({ userId: 1, granularity: 1, date: -1 });
performanceMetricSchema.index({ date: -1, granularity: 1 });

// Unique constraint to prevent duplicate entries
performanceMetricSchema.index(
  { campaignId: 1, date: 1, hour: 1, granularity: 1 },
  { unique: true }
);

// Virtual for engagement rate
performanceMetricSchema.virtual('engagementRate').get(function() {
  if (this.impressions === 0) return 0;
  const totalEngagements = (this.likes || 0) + (this.shares || 0) + (this.comments || 0) + (this.saves || 0);
  return (totalEngagements / this.impressions * 100);
});

// Virtual for video view rate
performanceMetricSchema.virtual('videoViewRate').get(function() {
  if (this.impressions === 0) return 0;
  return (this.videoViews / this.impressions * 100);
});

// Virtual for cost per mille (CPM)
performanceMetricSchema.virtual('costPerMille').get(function() {
  if (this.impressions === 0) return 0;
  return (this.spend / this.impressions * 1000);
});

// Pre-save middleware to calculate derived metrics
performanceMetricSchema.pre('save', function(next) {
  // Calculate CTR (Click-Through Rate)
  if (this.impressions > 0) {
    this.ctr = Number(((this.clicks / this.impressions) * 100).toFixed(4));
  }

  // Calculate CPC (Cost Per Click)
  if (this.clicks > 0) {
    this.cpc = Number((this.spend / this.clicks).toFixed(4));
  }

  // Calculate CPM (Cost Per Mille)
  if (this.impressions > 0) {
    this.cpm = Number((this.spend / this.impressions * 1000).toFixed(4));
  }

  // Calculate CPA (Cost Per Acquisition)
  if (this.conversions > 0) {
    this.cpa = Number((this.spend / this.conversions).toFixed(4));
  }

  // Calculate Conversion Rate
  if (this.clicks > 0) {
    this.conversionRate = Number(((this.conversions / this.clicks) * 100).toFixed(4));
  }

  // Calculate ROAS (Return on Ad Spend)
  if (this.spend > 0 && this.revenue > 0) {
    this.roas = Number((this.revenue / this.spend).toFixed(4));
  } else if (this.spend > 0 && this.conversions > 0) {
    // Estimate ROAS using average conversion value of $50
    const estimatedRevenue = this.conversions * 50;
    this.roas = Number((estimatedRevenue / this.spend).toFixed(4));
  }

  this.updatedAt = new Date();
  next();
});

// Static method to get aggregated metrics for a campaign
performanceMetricSchema.statics.getAggregatedMetrics = function(campaignId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        campaignId: new mongoose.Types.ObjectId(campaignId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalConversions: { $sum: '$conversions' },
        totalSpend: { $sum: '$spend' },
        totalRevenue: { $sum: '$revenue' },
        totalVideoViews: { $sum: '$videoViews' },
        avgQualityScore: { $avg: '$qualityScore' },
        avgRelevanceScore: { $avg: '$relevanceScore' },
        dataPoints: { $sum: 1 }
      }
    },
    {
      $addFields: {
        averageCTR: {
          $cond: [
            { $gt: ['$totalImpressions', 0] },
            { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
            0
          ]
        },
        averageCPC: {
          $cond: [
            { $gt: ['$totalClicks', 0] },
            { $divide: ['$totalSpend', '$totalClicks'] },
            0
          ]
        },
        averageCPA: {
          $cond: [
            { $gt: ['$totalConversions', 0] },
            { $divide: ['$totalSpend', '$totalConversions'] },
            0
          ]
        },
        overallROAS: {
          $cond: [
            { $gt: ['$totalSpend', 0] },
            { $divide: ['$totalRevenue', '$totalSpend'] },
            0
          ]
        },
        conversionRate: {
          $cond: [
            { $gt: ['$totalClicks', 0] },
            { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] },
            0
          ]
        }
      }
    }
  ]);
};

// Static method to get daily metrics for a date range
performanceMetricSchema.statics.getDailyMetrics = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        granularity: 'daily',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalConversions: { $sum: '$conversions' },
        totalSpend: { $sum: '$spend' },
        totalRevenue: { $sum: '$revenue' },
        campaigns: { $addToSet: '$campaignId' }
      }
    },
    {
      $addFields: {
        date: '$_id',
        campaignCount: { $size: '$campaigns' },
        ctr: {
          $cond: [
            { $gt: ['$totalImpressions', 0] },
            { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
            0
          ]
        },
        cpc: {
          $cond: [
            { $gt: ['$totalClicks', 0] },
            { $divide: ['$totalSpend', '$totalClicks'] },
            0
          ]
        },
        roas: {
          $cond: [
            { $gt: ['$totalSpend', 0] },
            { $divide: ['$totalRevenue', '$totalSpend'] },
            0
          ]
        }
      }
    },
    {
      $sort: { date: 1 }
    },
    {
      $project: {
        _id: 0,
        campaigns: 0
      }
    }
  ]);
};

// Static method to get top performing campaigns
performanceMetricSchema.statics.getTopPerformingCampaigns = function(userId, metric = 'roas', limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$campaignId',
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalConversions: { $sum: '$conversions' },
        totalSpend: { $sum: '$spend' },
        totalRevenue: { $sum: '$revenue' },
        platform: { $first: '$platform' }
      }
    },
    {
      $addFields: {
        ctr: {
          $cond: [
            { $gt: ['$totalImpressions', 0] },
            { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
            0
          ]
        },
        cpc: {
          $cond: [
            { $gt: ['$totalClicks', 0] },
            { $divide: ['$totalSpend', '$totalClicks'] },
            0
          ]
        },
        roas: {
          $cond: [
            { $gt: ['$totalSpend', 0] },
            { $divide: ['$totalRevenue', '$totalSpend'] },
            0
          ]
        }
      }
    },
    {
      $sort: { [metric]: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'campaigns',
        localField: '_id',
        foreignField: '_id',
        as: 'campaign'
      }
    },
    {
      $unwind: '$campaign'
    },
    {
      $project: {
        campaignId: '$_id',
        campaignName: '$campaign.name',
        platform: 1,
        totalImpressions: 1,
        totalClicks: 1,
        totalConversions: 1,
        totalSpend: 1,
        totalRevenue: 1,
        ctr: 1,
        cpc: 1,
        roas: 1,
        _id: 0
      }
    }
  ]);
};

// Instance method to get previous period for comparison
performanceMetricSchema.methods.getPreviousPeriod = function() {
  const currentDate = this.date;
  const previousDate = new Date(currentDate);

  if (this.granularity === 'daily') {
    previousDate.setDate(previousDate.getDate() - 1);
  } else if (this.granularity === 'weekly') {
    previousDate.setDate(previousDate.getDate() - 7);
  } else if (this.granularity === 'monthly') {
    previousDate.setMonth(previousDate.getMonth() - 1);
  }

  return this.constructor.findOne({
    campaignId: this.campaignId,
    granularity: this.granularity,
    date: previousDate
  });
};

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

module.exports = PerformanceMetric;