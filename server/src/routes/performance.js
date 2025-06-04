// server/src/routes/performance.js
// MARCUS AI - Performance Analytics & Live Data Routes

const express = require('express');
const Campaign = require('../models/Campaign');
const PerformanceMetric = require('../models/PerformanceMetric');
const { authenticateToken } = require('./auth');
const router = express.Router();

// GET /api/performance/dashboard - Get dashboard overview
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get campaigns in timeframe
    const campaigns = await Campaign.find({
      userId: req.userId,
      createdAt: { $gte: startDate },
      status: { $ne: 'deleted' }
    });

    // Calculate summary metrics
    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalSpend: campaigns.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
      totalClicks: campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
      totalConversions: campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
      totalVideoViews: campaigns.reduce((sum, c) => sum + (c.metrics?.videoViews || 0), 0),

      // Platform breakdown
      platformBreakdown: {},

      // Status breakdown
      statusBreakdown: {},

      // Daily performance (last 7 days)
      dailyPerformance: []
    };

    // Calculate derived metrics
    if (summary.totalImpressions > 0) {
      summary.averageCTR = Number(((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2));
    } else {
      summary.averageCTR = 0;
    }

    if (summary.totalClicks > 0) {
      summary.averageCPC = Number((summary.totalSpend / summary.totalClicks).toFixed(2));
    } else {
      summary.averageCPC = 0;
    }

    if (summary.totalConversions > 0) {
      summary.averageCPA = Number((summary.totalSpend / summary.totalConversions).toFixed(2));
      // Assuming $50 average conversion value - TODO: make configurable
      const estimatedRevenue = summary.totalConversions * 50;
      summary.averageROAS = Number((estimatedRevenue / summary.totalSpend).toFixed(2));
    } else {
      summary.averageCPA = 0;
      summary.averageROAS = 0;
    }

    // Platform breakdown
    campaigns.forEach(campaign => {
      if (!summary.platformBreakdown[campaign.platform]) {
        summary.platformBreakdown[campaign.platform] = {
          campaigns: 0,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        };
      }

      summary.platformBreakdown[campaign.platform].campaigns += 1;
      summary.platformBreakdown[campaign.platform].spend += campaign.metrics?.spend || 0;
      summary.platformBreakdown[campaign.platform].impressions += campaign.metrics?.impressions || 0;
      summary.platformBreakdown[campaign.platform].clicks += campaign.metrics?.clicks || 0;
      summary.platformBreakdown[campaign.platform].conversions += campaign.metrics?.conversions || 0;
    });

    // Status breakdown
    campaigns.forEach(campaign => {
      summary.statusBreakdown[campaign.status] =
        (summary.statusBreakdown[campaign.status] || 0) + 1;
    });

    // Generate daily performance for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      // TODO: In a real implementation, this would query time-series performance data
      // For now, we'll simulate realistic data
      const dayData = {
        date: dateStr,
        spend: Math.round(summary.totalSpend / 7 * (0.8 + Math.random() * 0.4)),
        impressions: Math.round(summary.totalImpressions / 7 * (0.8 + Math.random() * 0.4)),
        clicks: Math.round(summary.totalClicks / 7 * (0.8 + Math.random() * 0.4)),
        conversions: Math.round(summary.totalConversions / 7 * (0.8 + Math.random() * 0.4))
      };

      dayData.ctr = dayData.impressions > 0 ?
        Number(((dayData.clicks / dayData.impressions) * 100).toFixed(2)) : 0;
      dayData.cpc = dayData.clicks > 0 ?
        Number((dayData.spend / dayData.clicks).toFixed(2)) : 0;

      summary.dailyPerformance.push(dayData);
    }

    res.json({
      success: true,
      summary,
      timeframe,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data'
    });
  }
});

// GET /api/performance/campaigns/:id - Get detailed campaign performance
router.get('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d', granularity = 'daily' } = req.query;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get performance metrics over time
    const performanceData = await PerformanceMetric.find({
      campaignId: campaign._id,
      date: {
        $gte: new Date(Date.now() - parseInt(timeframe.replace('d', '')) * 24 * 60 * 60 * 1000)
      }
    }).sort({ date: 1 });

    // If no historical data, create current snapshot
    let metrics = performanceData;
    if (metrics.length === 0 && campaign.metrics) {
      metrics = [{
        date: new Date(),
        impressions: campaign.metrics.impressions || 0,
        clicks: campaign.metrics.clicks || 0,
        conversions: campaign.metrics.conversions || 0,
        spend: campaign.metrics.spend || 0,
        ctr: campaign.metrics.ctr || 0,
        cpc: campaign.metrics.cpc || 0,
        cpa: campaign.metrics.cpa || 0,
        roas: campaign.metrics.roas || 0
      }];
    }

    // Get keyword performance (if Search campaign)
    let keywordPerformance = [];
    if (campaign.keywords && campaign.keywords.length > 0) {
      keywordPerformance = campaign.keywords.map(keyword => ({
        text: keyword.text,
        matchType: keyword.matchType,
        bid: keyword.bid || 0,
        qualityScore: keyword.quality?.qualityScore || 0,
        // TODO: Fetch real keyword metrics from platform APIs
        impressions: Math.round(Math.random() * 1000),
        clicks: Math.round(Math.random() * 50),
        spend: Number((Math.random() * 100).toFixed(2)),
        ctr: Number((Math.random() * 5).toFixed(2)),
        cpc: Number((Math.random() * 3).toFixed(2)),
        conversions: Math.round(Math.random() * 5)
      })).sort((a, b) => b.spend - a.spend);
    }

    // Get ad performance
    let adPerformance = [];
    if (campaign.adSets && campaign.adSets.length > 0) {
      campaign.adSets.forEach(adSet => {
        if (adSet.ads && adSet.ads.length > 0) {
          adSet.ads.forEach(ad => {
            adPerformance.push({
              adSetName: adSet.name,
              headline: ad.headline,
              description: ad.description,
              status: ad.status,
              // TODO: Fetch real ad metrics from platform APIs
              impressions: Math.round(Math.random() * 1000),
              clicks: Math.round(Math.random() * 50),
              spend: Number((Math.random() * 100).toFixed(2)),
              conversions: Math.round(Math.random() * 5),
              ctr: Number((Math.random() * 5).toFixed(2)),
              cpc: Number((Math.random() * 3).toFixed(2))
            });
          });
        }
      });
    }

    res.json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        objective: campaign.objective
      },
      metrics,
      keywordPerformance,
      adPerformance,
      timeframe,
      granularity
    });

  } catch (error) {
    console.error('Campaign performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign performance'
    });
  }
});

// GET /api/performance/realtime - Get real-time performance updates
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    // Get all active campaigns for user
    const activeCampaigns = await Campaign.find({
      userId: req.userId,
      status: 'active'
    }).select('name platform metrics marcusInsights.alerts');

    const realtimeData = {
      totalActiveCampaigns: activeCampaigns.length,
      totalSpendToday: 0,
      totalImpressionsToday: 0,
      totalClicksToday: 0,
      totalConversionsToday: 0,
      alerts: [],
      topPerformingCampaigns: [],
      underperformingCampaigns: []
    };

    // Calculate today's totals and identify top/underperforming campaigns
    activeCampaigns.forEach(campaign => {
      // TODO: In real implementation, fetch today's metrics specifically
      const todayMetrics = campaign.metrics || {};

      realtimeData.totalSpendToday += todayMetrics.spend || 0;
      realtimeData.totalImpressionsToday += todayMetrics.impressions || 0;
      realtimeData.totalClicksToday += todayMetrics.clicks || 0;
      realtimeData.totalConversionsToday += todayMetrics.conversions || 0;

      // Collect alerts
      if (campaign.marcusInsights?.alerts) {
        campaign.marcusInsights.alerts.forEach(alert => {
          if (!alert.acknowledged) {
            realtimeData.alerts.push({
              campaignId: campaign._id,
              campaignName: campaign.name,
              platform: campaign.platform,
              type: alert.type,
              severity: alert.severity,
              message: alert.message,
              createdAt: alert.createdAt
            });
          }
        });
      }

      // Identify top performing (ROAS > 3.0)
      if (todayMetrics.roas && todayMetrics.roas > 3.0) {
        realtimeData.topPerformingCampaigns.push({
          id: campaign._id,
          name: campaign.name,
          platform: campaign.platform,
          roas: todayMetrics.roas,
          spend: todayMetrics.spend || 0
        });
      }

      // Identify underperforming (ROAS < 1.5 and spending > $50)
      if (todayMetrics.roas && todayMetrics.roas < 1.5 && todayMetrics.spend > 50) {
        realtimeData.underperformingCampaigns.push({
          id: campaign._id,
          name: campaign.name,
          platform: campaign.platform,
          roas: todayMetrics.roas,
          spend: todayMetrics.spend || 0
        });
      }
    });

    // Sort arrays
    realtimeData.topPerformingCampaigns.sort((a, b) => b.roas - a.roas);
    realtimeData.underperformingCampaigns.sort((a, b) => a.roas - b.roas);
    realtimeData.alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Limit results
    realtimeData.topPerformingCampaigns = realtimeData.topPerformingCampaigns.slice(0, 5);
    realtimeData.underperformingCampaigns = realtimeData.underperformingCampaigns.slice(0, 5);
    realtimeData.alerts = realtimeData.alerts.slice(0, 10);

    res.json({
      success: true,
      data: realtimeData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Realtime performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving real-time performance data'
    });
  }
});

// POST /api/performance/sync/:platform - Sync performance data from platform
router.post('/sync/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['google', 'meta', 'tiktok', 'linkedin'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    // Get user's campaigns for this platform
    const campaigns = await Campaign.find({
      userId: req.userId,
      platform,
      status: { $in: ['active', 'paused'] }
    });

    if (campaigns.length === 0) {
      return res.json({
        success: true,
        message: 'No campaigns found for syncing',
        synced: 0
      });
    }

    let syncedCount = 0;
    const errors = [];

    // TODO: Implement actual API calls to platform
    // For now, simulate sync with realistic data
    for (const campaign of campaigns) {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate fetching fresh metrics
        const freshMetrics = {
          impressions: campaign.metrics.impressions + Math.round(Math.random() * 100),
          clicks: campaign.metrics.clicks + Math.round(Math.random() * 10),
          conversions: campaign.metrics.conversions + Math.round(Math.random() * 2),
          spend: campaign.metrics.spend + Number((Math.random() * 50).toFixed(2)),
          lastUpdated: new Date()
        };

        await campaign.updateMetrics(freshMetrics);
        syncedCount++;

      } catch (error) {
        errors.push({
          campaignId: campaign._id,
          campaignName: campaign.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} campaigns from ${platform}`,
      synced: syncedCount,
      total: campaigns.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Performance sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing performance data'
    });
  }
});

// GET /api/performance/trends - Get performance trends analysis
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d', metric = 'spend' } = req.query;

    const validMetrics = ['spend', 'impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'roas'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid metric. Valid options: ' + validMetrics.join(', ')
      });
    }

    // Get historical performance data
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const performanceData = await PerformanceMetric.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by date and calculate trends
    const trendData = {};
    performanceData.forEach(data => {
      const dateKey = data.date.toISOString().split('T')[0];
      if (!trendData[dateKey]) {
        trendData[dateKey] = {
          date: dateKey,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          campaigns: 0
        };
      }

      trendData[dateKey].spend += data.spend || 0;
      trendData[dateKey].impressions += data.impressions || 0;
      trendData[dateKey].clicks += data.clicks || 0;
      trendData[dateKey].conversions += data.conversions || 0;
      trendData[dateKey].campaigns += 1;
    });

    // Convert to array and calculate derived metrics
    const trends = Object.values(trendData).map(day => {
      day.ctr = day.impressions > 0 ? (day.clicks / day.impressions * 100) : 0;
      day.cpc = day.clicks > 0 ? (day.spend / day.clicks) : 0;
      day.roas = day.spend > 0 ? ((day.conversions * 50) / day.spend) : 0; // Assuming $50 conversion value
      return day;
    });

    // Calculate trend direction (comparing first and last periods)
    let trendDirection = 'stable';
    let trendPercentage = 0;

    if (trends.length >= 2) {
      const firstPeriod = trends.slice(0, Math.ceil(trends.length / 2));
      const lastPeriod = trends.slice(Math.floor(trends.length / 2));

      const firstAvg = firstPeriod.reduce((sum, day) => sum + day[metric], 0) / firstPeriod.length;
      const lastAvg = lastPeriod.reduce((sum, day) => sum + day[metric], 0) / lastPeriod.length;

      if (firstAvg > 0) {
        trendPercentage = ((lastAvg - firstAvg) / firstAvg * 100);
        trendDirection = trendPercentage > 5 ? 'increasing' :
                        trendPercentage < -5 ? 'decreasing' : 'stable';
      }
    }

    res.json({
      success: true,
      trends,
      analysis: {
        metric,
        timeframe,
        trendDirection,
        trendPercentage: Number(trendPercentage.toFixed(2)),
        dataPoints: trends.length
      }
    });

  } catch (error) {
    console.error('Trends analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving trends analysis'
    });
  }
});

// GET /api/performance/alerts - Get performance alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { severity, acknowledged = 'false' } = req.query;

    // Get campaigns with alerts
    const filter = { userId: req.userId };
    if (acknowledged === 'false') {
      filter['marcusInsights.alerts.acknowledged'] = false;
    }

    const campaigns = await Campaign.find(filter)
      .select('name platform marcusInsights.alerts')
      .sort({ 'marcusInsights.alerts.createdAt': -1 });

    const alerts = [];

    campaigns.forEach(campaign => {
      if (campaign.marcusInsights?.alerts) {
        campaign.marcusInsights.alerts.forEach(alert => {
          if (acknowledged === 'false' && alert.acknowledged) return;
          if (severity && alert.severity !== severity) return;

          alerts.push({
            id: alert._id,
            campaignId: campaign._id,
            campaignName: campaign.name,
            platform: campaign.platform,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            acknowledged: alert.acknowledged,
            createdAt: alert.createdAt
          });
        });
      }
    });

    // Sort by creation date (newest first)
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      alerts,
      total: alerts.length
    });

  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving alerts'
    });
  }
});

// POST /api/performance/alerts/:id/acknowledge - Acknowledge alert
router.post('/alerts/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      userId: req.userId,
      'marcusInsights.alerts._id': req.params.id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Find and acknowledge the alert
    const alert = campaign.marcusInsights.alerts.id(req.params.id);
    if (alert) {
      alert.acknowledged = true;
      await campaign.save();
    }

    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert'
    });
  }
});

module.exports = router;