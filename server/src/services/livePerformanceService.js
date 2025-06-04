// server/src/services/livePerformanceService.js
// MARCUS AI - Live Performance Data Service

const Campaign = require('../models/Campaign');
const PerformanceMetric = require('../models/PerformanceMetric');
const User = require('../models/User');

class LivePerformanceService {
  constructor() {
    this.refreshInterval = 15 * 60 * 1000; // 15 minutes
    this.isRunning = false;
    this.activeUsers = new Set();
  }

  // Start live performance monitoring
  startMonitoring() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔴 Marcus Live Performance Service started');

    // Initial sync
    this.syncAllCampaigns();

    // Set up interval for regular syncing
    this.intervalId = setInterval(() => {
      this.syncAllCampaigns();
    }, this.refreshInterval);
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
    console.log(`📊 Added user ${userId} to live monitoring`);
  }

  // Remove user from active monitoring
  removeActiveUser(userId) {
    this.activeUsers.delete(userId.toString());
    console.log(`📊 Removed user ${userId} from live monitoring`);
  }

  // Sync all active campaigns
  async syncAllCampaigns() {
    try {
      console.log('🔄 Starting live performance sync...');

      // Get all active campaigns from monitored users
      const activeCampaigns = await Campaign.find({
        status: 'active',
        userId: { $in: Array.from(this.activeUsers) }
      }).populate('userId', 'googleAdsCustomerId metaAdAccountId');

      if (activeCampaigns.length === 0) {
        console.log('📊 No active campaigns to sync');
        return;
      }

      console.log(`📊 Syncing ${activeCampaigns.length} active campaigns`);

      const syncPromises = activeCampaigns.map(campaign =>
        this.syncCampaignPerformance(campaign)
      );

      const results = await Promise.allSettled(syncPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Live sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      console.error('❌ Live performance sync error:', error);
    }
  }

  // Sync individual campaign performance
  async syncCampaignPerformance(campaign) {
    try {
      let newMetrics = null;

      switch (campaign.platform) {
        case 'google':
          newMetrics = await this.fetchGoogleAdsPerformance(campaign);
          break;
        case 'meta':
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
        // Update campaign metrics
        await campaign.updateMetrics(newMetrics);

        // Store historical data
        await this.storePerformanceMetric(campaign, newMetrics);

        // Check for alerts
        await this.checkPerformanceAlerts(campaign, newMetrics);

        console.log(`✅ Synced ${campaign.name} (${campaign.platform})`);
      }

    } catch (error) {
      console.error(`❌ Failed to sync ${campaign.name}:`, error.message);
    }
  }

  // Fetch Google Ads performance (simulate for now)
  async fetchGoogleAdsPerformance(campaign) {
    try {
      // TODO: Implement actual Google Ads API call
      // For now, simulate realistic performance data

      const user = campaign.userId;
      if (!user.googleAdsCustomerId) {
        throw new Error('Google Ads Customer ID not configured');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate realistic incremental data
      const baseMetrics = campaign.metrics || {};
      const increment = {
        impressions: Math.round(Math.random() * 100 + 10),
        clicks: Math.round(Math.random() * 10 + 1),
        conversions: Math.round(Math.random() * 3),
        spend: Number((Math.random() * 50 + 5).toFixed(2))
      };

      return {
        impressions: (baseMetrics.impressions || 0) + increment.impressions,
        clicks: (baseMetrics.clicks || 0) + increment.clicks,
        conversions: (baseMetrics.conversions || 0) + increment.conversions,
        spend: (baseMetrics.spend || 0) + increment.spend,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Google Ads API error:', error);
      return null;
    }
  }

  // Fetch Meta Ads performance (simulate for now)
  async fetchMetaAdsPerformance(campaign) {
    try {
      // TODO: Implement actual Meta API call

      const user = campaign.userId;
      if (!user.metaAdAccountId) {
        throw new Error('Meta Ad Account ID not configured');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Generate realistic incremental data
      const baseMetrics = campaign.metrics || {};
      const increment = {
        impressions: Math.round(Math.random() * 200 + 20),
        clicks: Math.round(Math.random() * 15 + 2),
        conversions: Math.round(Math.random() * 4),
        spend: Number((Math.random() * 40 + 8).toFixed(2)),
        videoViews: Math.round(Math.random() * 50 + 5),
        likes: Math.round(Math.random() * 10 + 1),
        shares: Math.round(Math.random() * 3),
        comments: Math.round(Math.random() * 5)
      };

      return {
        impressions: (baseMetrics.impressions || 0) + increment.impressions,
        clicks: (baseMetrics.clicks || 0) + increment.clicks,
        conversions: (baseMetrics.conversions || 0) + increment.conversions,
        spend: (baseMetrics.spend || 0) + increment.spend,
        videoViews: (baseMetrics.videoViews || 0) + increment.videoViews,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Meta API error:', error);
      return null;
    }
  }

  // Fetch TikTok Ads performance (placeholder)
  async fetchTikTokAdsPerformance(campaign) {
    try {
      // TODO: Implement TikTok API integration
      console.log('TikTok API integration coming soon');
      return null;
    } catch (error) {
      console.error('TikTok API error:', error);
      return null;
    }
  }

  // Fetch LinkedIn Ads performance (placeholder)
  async fetchLinkedInAdsPerformance(campaign) {
    try {
      // TODO: Implement LinkedIn API integration
      console.log('LinkedIn API integration coming soon');
      return null;
    } catch (error) {
      console.error('LinkedIn API error:', error);
      return null;
    }
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

  // Check for performance alerts
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
          message: `Low CTR detected (${newMetrics.ctr.toFixed(2)}%) for campaign "${campaign.name}". Consider optimizing ad creatives.`
        });
      }

      // Check for high CPC
      if (newMetrics.cpc > 5.0 && newMetrics.clicks > 10) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `High CPC detected ($${newMetrics.cpc.toFixed(2)}) for campaign "${campaign.name}". Review keyword bids and targeting.`
        });
      }

      // Check for low ROAS
      if (newMetrics.roas < 1.5 && newMetrics.conversions > 5) {
        alerts.push({
          type: 'performance',
          severity: 'error',
          message: `Low ROAS detected (${newMetrics.roas.toFixed(2)}x) for campaign "${campaign.name}". Immediate optimization recommended.`
        });
      }

      // Check budget pacing
      const dailySpendRate = this.calculateDailySpendRate(campaign, newMetrics);
      if (dailySpendRate > campaign.budget.dailyBudget * 1.2) {
        alerts.push({
          type: 'budget',
          severity: 'warning',
          message: `Campaign "${campaign.name}" is spending 20% above daily budget. Current pace: $${dailySpendRate.toFixed(2)}/day.`
        });
      }

      // Add alerts to campaign
      if (alerts.length > 0) {
        campaign.marcusInsights.alerts.push(...alerts);
        await campaign.save();
        console.log(`⚠️ Added ${alerts.length} alerts for campaign ${campaign.name}`);
      }

    } catch (error) {
      console.error('Error checking performance alerts:', error);
    }
  }

  // Calculate daily spend rate
  calculateDailySpendRate(campaign, currentMetrics) {
    if (!campaign.launchedAt) return 0;

    const daysRunning = Math.max(1, (new Date() - campaign.launchedAt) / (1000 * 60 * 60 * 24));
    return currentMetrics.spend / daysRunning;
  }

  // Get real-time performance for user
  async getRealTimePerformance(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get active campaigns
      const activeCampaigns = await Campaign.find({
        userId,
        status: 'active'
      }).select('name platform metrics marcusInsights.alerts');

      const realTimeData = {
        totalActiveCampaigns: activeCampaigns.length,
        totalSpendToday: 0,
        totalImpressionsToday: 0,
        totalClicksToday: 0,
        totalConversionsToday: 0,
        alerts: [],
        topPerformingCampaigns: [],
        underperformingCampaigns: []
      };

      // Aggregate metrics
      activeCampaigns.forEach(campaign => {
        const metrics = campaign.metrics || {};

        realTimeData.totalSpendToday += metrics.spend || 0;
        realTimeData.totalImpressionsToday += metrics.impressions || 0;
        realTimeData.totalClicksToday += metrics.clicks || 0;
        realTimeData.totalConversionsToday += metrics.conversions || 0;

        // Collect unacknowledged alerts
        if (campaign.marcusInsights?.alerts) {
          campaign.marcusInsights.alerts.forEach(alert => {
            if (!alert.acknowledged) {
              realTimeData.alerts.push({
                campaignId: campaign._id,
                campaignName: campaign.name,
                platform: campaign.platform,
                ...alert
              });
            }
          });
        }

        // Classify performance
        if (metrics.roas > 3.0) {
          realTimeData.topPerformingCampaigns.push({
            id: campaign._id,
            name: campaign.name,
            platform: campaign.platform,
            roas: metrics.roas,
            spend: metrics.spend || 0
          });
        } else if (metrics.roas < 1.5 && metrics.spend > 50) {
          realTimeData.underperformingCampaigns.push({
            id: campaign._id,
            name: campaign.name,
            platform: campaign.platform,
            roas: metrics.roas,
            spend: metrics.spend || 0
          });
        }
      });

      // Sort and limit results
      realTimeData.topPerformingCampaigns.sort((a, b) => b.roas - a.roas).slice(0, 5);
      realTimeData.underperformingCampaigns.sort((a, b) => a.roas - b.roas).slice(0, 5);
      realTimeData.alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

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

      console.log(`🔄 Force syncing campaign: ${campaign.name}`);
      await this.syncCampaignPerformance(campaign);

      return {
        success: true,
        message: 'Campaign synced successfully',
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Force sync error:', error);
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeUsers: Array.from(this.activeUsers),
      refreshInterval: this.refreshInterval,
      lastSync: this.lastSyncTime || null,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

// Create singleton instance
const livePerformanceService = new LivePerformanceService();

// Start service automatically
livePerformanceService.startMonitoring();

module.exports = livePerformanceService;