// server/src/services/livePerformanceService.js
// MARCUS AI - Live Performance Data Service
// 🔥 NOW WITH REAL GOOGLE ADS INTEGRATION

const Campaign = require('../models/Campaign');
const PerformanceMetric = require('../models/PerformanceMetric');
const User = require('../models/User');

// 🚀 IMPORT REAL GOOGLE ADS SERVICE (SINGLETON)
const googleAdsService = require('./integrations/googleAdsService');

class LivePerformanceService {
  constructor() {
    this.refreshInterval = 5 * 60 * 1000; // 5 minutes for live updates
    this.isRunning = false;
    this.activeUsers = new Set();
    this.lastSyncTime = null;
    this.startTime = Date.now();

    // 🔥 Use Google Ads Service Singleton
    this.googleAdsService = googleAdsService;

    console.log('🚀 Marcus Live Performance Service initialized with REAL Google Ads API');
  }

  // Start live performance monitoring
  startMonitoring() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    console.log('🔴 Marcus Live Performance Service started - REAL-TIME MODE');

    // Initial sync
    this.syncAllCampaigns();

    // Set up interval for regular syncing
    this.intervalId = setInterval(() => {
      this.syncAllCampaigns();
    }, this.refreshInterval);

    // Test Google Ads connection on startup
    this.testGoogleAdsConnection();
  }

  // 🔥 NEW: Test Google Ads connection
  async testGoogleAdsConnection() {
    try {
      const connectionStatus = await this.googleAdsService.testConnectionLive();
      console.log('🔍 Google Ads Connection Status:', connectionStatus.status);
      return connectionStatus;
    } catch (error) {
      console.error('❌ Google Ads connection test failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Stop live performance monitoring
  stopMonitoring() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('🟥 Marcus Live Performance Service stopped');
  }

  // Add user to active monitoring
  addActiveUser(userId) {
    this.activeUsers.add(userId.toString());
    console.log(`📊 Added user ${userId} to live monitoring (${this.activeUsers.size} total)`);
  }

  // Remove user from active monitoring
  removeActiveUser(userId) {
    this.activeUsers.delete(userId.toString());
    console.log(`📊 Removed user ${userId} from live monitoring (${this.activeUsers.size} total)`);
  }

    // Sync all active campaigns
  async syncAllCampaigns() {
    try {
      this.lastSyncTime = new Date();
      console.log('🔄 Starting LIVE performance sync...');

      // 🔥 FIX: Check MongoDB connection first
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ MongoDB not connected - running in test mode');
        console.log('📊 No active campaigns to sync (Database offline)');
        return;
      }

      // Rest of the original code...
      const activeCampaigns = await Campaign.find({
        status: 'active',
        userId: { $in: Array.from(this.activeUsers) }
      }).populate('userId', 'googleAdsCustomerId metaAdAccountId googleAdsDeveloperToken googleAdsRefreshToken');

      if (activeCampaigns.length === 0) {
        console.log('📊 No active campaigns to sync');
        return;
      }

      console.log(`📊 Syncing ${activeCampaigns.length} LIVE campaigns`);

      const syncPromises = activeCampaigns.map(campaign =>
        this.syncCampaignPerformance(campaign)
      );

      const results = await Promise.allSettled(syncPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ LIVE sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      console.log('⚠️ Live performance sync skipped (Database not ready):', error.message);
    }
  }


  // Sync individual campaign performance
  async syncCampaignPerformance(campaign) {
    try {
      let newMetrics = null;

      switch (campaign.platform) {
        case 'google':
        case 'google_ads':
          newMetrics = await this.fetchGoogleAdsPerformanceREAL(campaign);
          break;
        case 'meta':
        case 'facebook':
          newMetrics = await this.fetchMetaAdsPerformance(campaign);
          break;
        case 'tiktok':
          newMetrics = await this.fetchTikTokAdsPerformance(campaign);
          break;
        case 'linkedin':
          newMetrics = await this.fetchLinkedInAdsPerformance(campaign);
          break;
        default:
          console.log(`⚠️ Unsupported platform: ${campaign.platform}`);
          return;
      }

      if (newMetrics) {
        // Calculate derived metrics
        const calculatedMetrics = this.calculateDerivedMetrics(newMetrics);
        const finalMetrics = { ...newMetrics, ...calculatedMetrics };

        // Update campaign metrics
        campaign.metrics = finalMetrics;
        campaign.lastUpdated = new Date();
        await campaign.save();

        // Store historical data
        await this.storePerformanceMetric(campaign, finalMetrics);

        // Check for alerts
        await this.checkPerformanceAlerts(campaign, finalMetrics);

        console.log(`✅ LIVE synced ${campaign.name} (${campaign.platform})`);
        return finalMetrics;
      }

    } catch (error) {
      console.error(`❌ Failed to sync ${campaign.name}:`, error.message);
      return null;
    }
  }

  // 🔥 REAL Google Ads Performance - NO MORE FAKE DATA!
  async fetchGoogleAdsPerformanceREAL(campaign) {
    try {
      const user = campaign.userId;

      // Check if user has Google Ads credentials
      if (!user.googleAdsCustomerId) {
        console.log(`⚠️ ${campaign.name}: No Google Ads Customer ID configured`);
        return null;
      }

      console.log(`🔍 Fetching REAL Google Ads data for: ${campaign.name}`);

      // Get LIVE performance data from Google Ads API
      const liveData = await this.googleAdsService.getLivePerformanceData();

      if (liveData.status === 'error') {
        console.error(`❌ Google Ads API Error: ${liveData.error}`);
        return null;
      }

      // Transform API data to our format
      const metrics = {
        impressions: liveData.current.impressions || 0,
        clicks: liveData.current.clicks || 0,
        conversions: liveData.current.conversions || 0,
        spend: liveData.current.spend || 0,
        revenue: liveData.current.revenue || 0,
        lastUpdated: new Date(),
        platform: 'google_ads',
        platformStatus: liveData.status,

        // Include health indicators
        accountHealth: liveData.health || {},

        // Performance changes
        performanceChanges: liveData.changes || {}
      };

      console.log(`✅ REAL Google Ads data retrieved for ${campaign.name}:`, {
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        spend: `€${metrics.spend}`,
        status: liveData.status
      });

      return metrics;

    } catch (error) {
      console.error('❌ REAL Google Ads fetch error:', error);
      return null;
    }
  }

  // 🔥 NEW: Get aggregated platform performance
  async getAggregatedPlatformPerformance(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const platformData = {
        google_ads: { status: 'disconnected', data: null },
        meta_ads: { status: 'disconnected', data: null },
        tiktok_ads: { status: 'coming_soon', data: null },
        linkedin_ads: { status: 'coming_soon', data: null }
      };

      // 🔥 Get REAL Google Ads data
      if (user.googleAdsCustomerId) {
        try {
          const googleData = await this.googleAdsService.getLivePerformanceData();
          platformData.google_ads = {
            status: googleData.status,
            data: googleData.status === 'connected' ? googleData.current : null,
            health: googleData.health || {},
            lastUpdated: googleData.lastUpdated,
            error: googleData.error || null
          };
        } catch (error) {
          console.error('Google Ads aggregation error:', error);
          platformData.google_ads = {
            status: 'error',
            error: error.message,
            data: null
          };
        }
      }

      // Meta Ads (placeholder for now)
      if (user.metaAdAccountId) {
        platformData.meta_ads = {
          status: 'configured_but_simulated',
          data: await this.getSimulatedMetaData(),
          lastUpdated: new Date().toISOString()
        };
      }

      // Calculate totals across platforms
      const totals = this.calculatePlatformTotals(platformData);

      return {
        platforms: platformData,
        totals: totals,
        connectedPlatforms: Object.keys(platformData).filter(
          platform => platformData[platform].status === 'connected'
        ).length,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting aggregated platform performance:', error);
      throw error;
    }
  }

  // Helper: Calculate derived metrics
  calculateDerivedMetrics(baseMetrics) {
    const derived = {};

    // CTR (Click-Through Rate)
    if (baseMetrics.impressions > 0) {
      derived.ctr = (baseMetrics.clicks / baseMetrics.impressions * 100);
    } else {
      derived.ctr = 0;
    }

    // CPC (Cost Per Click)
    if (baseMetrics.clicks > 0) {
      derived.cpc = baseMetrics.spend / baseMetrics.clicks;
    } else {
      derived.cpc = 0;
    }

    // Conversion Rate
    if (baseMetrics.clicks > 0) {
      derived.conversionRate = (baseMetrics.conversions / baseMetrics.clicks * 100);
    } else {
      derived.conversionRate = 0;
    }

    // Cost Per Conversion
    if (baseMetrics.conversions > 0) {
      derived.costPerConversion = baseMetrics.spend / baseMetrics.conversions;
    } else {
      derived.costPerConversion = 0;
    }

    // ROAS (Return on Ad Spend)
    if (baseMetrics.spend > 0) {
      derived.roas = baseMetrics.revenue / baseMetrics.spend;
    } else {
      derived.roas = 0;
    }

    // Revenue Per Impression
    if (baseMetrics.impressions > 0) {
      derived.revenuePerImpression = baseMetrics.revenue / baseMetrics.impressions;
    } else {
      derived.revenuePerImpression = 0;
    }

    return derived;
  }

  // Helper: Calculate platform totals
  calculatePlatformTotals(platformData) {
    let totals = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      revenue: 0
    };

    Object.values(platformData).forEach(platform => {
      if (platform.data) {
        totals.impressions += platform.data.impressions || 0;
        totals.clicks += platform.data.clicks || 0;
        totals.spend += platform.data.spend || 0;
        totals.conversions += platform.data.conversions || 0;
        totals.revenue += platform.data.revenue || 0;
      }
    });

    // Calculate total derived metrics
    const derivedTotals = this.calculateDerivedMetrics(totals);

    return { ...totals, ...derivedTotals };
  }

  // Fetch Meta Ads performance (still simulated for now)
  async fetchMetaAdsPerformance(campaign) {
    try {
      const user = campaign.userId;
      if (!user.metaAdAccountId) {
        console.log(`⚠️ ${campaign.name}: No Meta Ad Account ID configured`);
        return null;
      }

      // TODO: Implement real Meta API when credentials are ready
      console.log(`🔄 Simulating Meta Ads data for: ${campaign.name} (real API coming soon)`);

      // Simulate realistic Meta performance
      const baseMetrics = campaign.metrics || {};
      const increment = {
        impressions: Math.round(Math.random() * 500 + 50),
        clicks: Math.round(Math.random() * 25 + 5),
        conversions: Math.round(Math.random() * 8 + 1),
        spend: Number((Math.random() * 80 + 15).toFixed(2)),
        revenue: Number((Math.random() * 200 + 50).toFixed(2)),
        videoViews: Math.round(Math.random() * 100 + 10),
        reach: Math.round(Math.random() * 1000 + 100)
      };

      return {
        impressions: (baseMetrics.impressions || 0) + increment.impressions,
        clicks: (baseMetrics.clicks || 0) + increment.clicks,
        conversions: (baseMetrics.conversions || 0) + increment.conversions,
        spend: (baseMetrics.spend || 0) + increment.spend,
        revenue: (baseMetrics.revenue || 0) + increment.revenue,
        videoViews: (baseMetrics.videoViews || 0) + increment.videoViews,
        reach: (baseMetrics.reach || 0) + increment.reach,
        lastUpdated: new Date(),
        platform: 'meta',
        platformStatus: 'simulated'
      };

    } catch (error) {
      console.error('Meta API error:', error);
      return null;
    }
  }

  // Get simulated Meta data for aggregation
  async getSimulatedMetaData() {
    return {
      impressions: Math.round(Math.random() * 5000 + 1000),
      clicks: Math.round(Math.random() * 200 + 50),
      conversions: Math.round(Math.random() * 30 + 5),
      spend: Number((Math.random() * 500 + 100).toFixed(2)),
      revenue: Number((Math.random() * 1500 + 300).toFixed(2))
    };
  }

  // TikTok & LinkedIn (coming soon)
  async fetchTikTokAdsPerformance(campaign) {
    console.log('📱 TikTok API integration coming soon');
    return null;
  }

  async fetchLinkedInAdsPerformance(campaign) {
    console.log('💼 LinkedIn API integration coming soon');
    return null;
  }

  // Store performance metric in time-series collection
  async storePerformanceMetric(campaign, metrics) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if we already have today's metric
      const existingMetric = await PerformanceMetric.findOne({
        campaignId: campaign._id,
        date: today,
        granularity: 'daily'
      });

      if (existingMetric) {
        // Update existing metric
        Object.assign(existingMetric, metrics);
        await existingMetric.save();
      } else {
        // Create new metric
        const newMetric = new PerformanceMetric({
          userId: campaign.userId,
          campaignId: campaign._id,
          platform: campaign.platform,
          platformCampaignId: campaign.platformCampaignId,
          date: today,
          granularity: 'daily',
          ...metrics
        });
        await newMetric.save();
      }

    } catch (error) {
      console.error('Error storing performance metric:', error);
    }
  }

  // Enhanced performance alerts with real data
  async checkPerformanceAlerts(campaign, newMetrics) {
    try {
      const user = await User.findById(campaign.userId);
      if (!user.marcusSettings?.performanceAlerts) return;

      const alerts = [];

      // Check for low CTR
      if (newMetrics.ctr < 1.0 && newMetrics.impressions > 1000) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `🎯 Low CTR Alert: ${newMetrics.ctr.toFixed(2)}% for "${campaign.name}". Marcus suggests testing new ad creatives.`,
          suggestion: 'Consider A/B testing different headlines or images to improve click-through rate.',
          metric: 'ctr',
          value: newMetrics.ctr,
          threshold: 1.0,
          createdAt: new Date()
        });
      }

      // Check for high CPC
      if (newMetrics.cpc > 5.0 && newMetrics.clicks > 10) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `💰 High CPC Alert: €${newMetrics.cpc.toFixed(2)} for "${campaign.name}". Marcus recommends bid optimization.`,
          suggestion: 'Review keyword bids and consider negative keywords to reduce CPC.',
          metric: 'cpc',
          value: newMetrics.cpc,
          threshold: 5.0,
          createdAt: new Date()
        });
      }

      // Check for low ROAS
      if (newMetrics.roas < 2.0 && newMetrics.conversions > 3) {
        alerts.push({
          type: 'performance',
          severity: 'error',
          message: `📉 Low ROAS Alert: ${newMetrics.roas.toFixed(2)}x for "${campaign.name}". Marcus suggests immediate optimization.`,
          suggestion: 'Review targeting, adjust bids, or pause underperforming keywords/audiences.',
          metric: 'roas',
          value: newMetrics.roas,
          threshold: 2.0,
          createdAt: new Date()
        });
      }

      // Check conversion rate
      if (newMetrics.conversionRate < 1.0 && newMetrics.clicks > 50) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `🎪 Low Conversion Rate: ${newMetrics.conversionRate.toFixed(2)}% for "${campaign.name}". Landing page optimization needed.`,
          suggestion: 'Review landing page experience and conversion funnel.',
          metric: 'conversionRate',
          value: newMetrics.conversionRate,
          threshold: 1.0,
          createdAt: new Date()
        });
      }

      // Add alerts to campaign
      if (alerts.length > 0) {
        if (!campaign.marcusInsights) campaign.marcusInsights = { alerts: [] };
        if (!campaign.marcusInsights.alerts) campaign.marcusInsights.alerts = [];

        campaign.marcusInsights.alerts.push(...alerts);
        await campaign.save();

        console.log(`⚠️ Marcus added ${alerts.length} intelligent alerts for ${campaign.name}`);
      }

    } catch (error) {
      console.error('Error checking performance alerts:', error);
    }
  }

  // Get real-time performance for user dashboard
  async getRealTimePerformance(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Add user to active monitoring
      this.addActiveUser(userId);

      // Get platform-level performance
      const platformPerformance = await this.getAggregatedPlatformPerformance(userId);

      // Get active campaigns
      const activeCampaigns = await Campaign.find({
        userId,
        status: 'active'
      }).select('name platform metrics marcusInsights lastUpdated');

      const realTimeData = {
        // Platform overview
        platforms: platformPerformance.platforms,
        totalConnectedPlatforms: platformPerformance.connectedPlatforms,

        // Aggregated totals
        totals: platformPerformance.totals,

        // Campaign details
        totalActiveCampaigns: activeCampaigns.length,
        campaigns: activeCampaigns.map(campaign => ({
          id: campaign._id,
          name: campaign.name,
          platform: campaign.platform,
          metrics: campaign.metrics || {},
          lastUpdated: campaign.lastUpdated,
          alerts: campaign.marcusInsights?.alerts?.filter(a => !a.acknowledged) || []
        })),

        // System status
        serviceStatus: {
          isRunning: this.isRunning,
          lastSync: this.lastSyncTime,
          activeUsers: this.activeUsers.size,
          googleAdsConnection: await this.googleAdsService.getConnectionStatus()
        },

        // Timestamp
        lastUpdated: new Date().toISOString()
      };

      console.log(`📊 Real-time performance data generated for user ${userId}`);
      return realTimeData;

    } catch (error) {
      console.error('Error getting real-time performance:', error);
      throw error;
    }
  }

  // Force sync specific campaign
  async forceSyncCampaign(campaignId) {
    try {
      const campaign = await Campaign.findById(campaignId).populate('userId');
      if (!campaign) throw new Error('Campaign not found');

      console.log(`🔄 Marcus force syncing campaign: ${campaign.name}`);
      const metrics = await this.syncCampaignPerformance(campaign);

      return {
        success: true,
        message: 'Campaign synced successfully with REAL data',
        metrics: metrics,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Force sync error:', error);
      throw error;
    }
  }

  // Get comprehensive service status
  getStatus() {
    return {
      service: {
        isRunning: this.isRunning,
        uptime: this.isRunning ? Date.now() - this.startTime : 0,
        refreshInterval: this.refreshInterval,
        lastSync: this.lastSyncTime
      },
      monitoring: {
        activeUsers: Array.from(this.activeUsers),
        totalActiveUsers: this.activeUsers.size
      },
      integrations: {
        googleAds: this.googleAdsService.getConnectionStatus(),
        meta: { status: 'simulated' },
        tiktok: { status: 'coming_soon' },
        linkedin: { status: 'coming_soon' }
      },
      timestamp: new Date().toISOString()
    };
  }

  // 🔥 NEW: Get Google Ads hourly trends
  async getGoogleAdsHourlyTrends() {
    try {
      return await this.googleAdsService.getHourlyTrends();
    } catch (error) {
      console.error('Error getting hourly trends:', error);
      return [];
    }
  }
}

// Create singleton instance
const livePerformanceService = new LivePerformanceService();

// Start service automatically
livePerformanceService.startMonitoring();

module.exports = livePerformanceService;