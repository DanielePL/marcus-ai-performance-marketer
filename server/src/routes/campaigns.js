// server/src/routes/campaigns.js
// MARCUS AI - Campaign Management Routes

const express = require('express');
const Campaign = require('../models/Campaign');
const { authenticateToken } = require('./auth');
const router = express.Router();

// GET /api/campaigns - Get all campaigns for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, platform, limit = 20, page = 1 } = req.query;

    // Build filter query
    const filter = { userId: req.userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    const skip = (page - 1) * limit;

    // Get campaigns with pagination
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'firstName lastName company');

    // Get total count for pagination
    const totalCampaigns = await Campaign.countDocuments(filter);
    const totalPages = Math.ceil(totalCampaigns / limit);

    res.json({
      success: true,
      campaigns,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCampaigns,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaigns'
    });
  }
});

// GET /api/campaigns/:id - Get specific campaign
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('userId', 'firstName lastName company');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign'
    });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      platform,
      objective,
      targetAudience,
      budget,
      duration,
      adSets,
      creativeConcept,
      keywords,
      targetingCriteria
    } = req.body;

    // Validation
    if (!name || !platform || !objective || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Name, platform, objective, and budget are required'
      });
    }

    // Validate platform
    const validPlatforms = ['google', 'meta', 'tiktok', 'linkedin'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ')
      });
    }

    // Create campaign
    const newCampaign = new Campaign({
      userId: req.userId,
      name,
      platform: platform.toLowerCase(),
      objective,
      targetAudience,
      budget: {
        dailyBudget: budget.dailyBudget || 0,
        totalBudget: budget.totalBudget || 0,
        currency: budget.currency || 'USD'
      },
      duration: {
        startDate: duration?.startDate ? new Date(duration.startDate) : new Date(),
        endDate: duration?.endDate ? new Date(duration.endDate) : null
      },
      status: 'draft',
      adSets: adSets || [],
      creativeConcept: creativeConcept || '',
      keywords: keywords || [],
      targetingCriteria: targetingCriteria || {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCampaign.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: newCampaign
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', authenticateToken, async (req, res) => {
  try {
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

    // Update allowed fields
    const allowedUpdates = [
      'name', 'objective', 'targetAudience', 'budget', 'duration',
      'adSets', 'creativeConcept', 'keywords', 'targetingCriteria'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        campaign[key] = req.body[key];
      }
    });

    campaign.updatedAt = new Date();
    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });

  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
});

// POST /api/campaigns/:id/launch - Launch campaign
router.post('/:id/launch', authenticateToken, async (req, res) => {
  try {
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

    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Campaign must be in draft or paused status to launch'
      });
    }

    // TODO: Integrate with actual platform APIs (Google Ads, Meta, etc.)
    // For now, we'll simulate the launch

    campaign.status = 'active';
    campaign.launchedAt = new Date();
    campaign.updatedAt = new Date();

    // Add launch metrics
    campaign.metrics = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0,
      lastUpdated: new Date()
    };

    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign launched successfully',
      campaign
    });

  } catch (error) {
    console.error('Launch campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error launching campaign'
    });
  }
});

// POST /api/campaigns/:id/pause - Pause campaign
router.post('/:id/pause', authenticateToken, async (req, res) => {
  try {
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

    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active campaigns can be paused'
      });
    }

    campaign.status = 'paused';
    campaign.pausedAt = new Date();
    campaign.updatedAt = new Date();

    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign paused successfully',
      campaign
    });

  } catch (error) {
    console.error('Pause campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausing campaign'
    });
  }
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
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

    // Soft delete - mark as deleted instead of removing
    campaign.status = 'deleted';
    campaign.deletedAt = new Date();
    campaign.updatedAt = new Date();

    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
});

// GET /api/campaigns/:id/metrics - Get campaign performance metrics
router.get('/:id/metrics', authenticateToken, async (req, res) => {
  try {
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

    // TODO: Fetch real-time metrics from platform APIs
    // For now, return stored metrics
    const metrics = campaign.metrics || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0,
      lastUpdated: new Date()
    };

    res.json({
      success: true,
      metrics,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status
      }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign metrics'
    });
  }
});

// GET /api/campaigns/analytics/summary - Get campaigns summary
router.get('/analytics/summary', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get campaigns in timeframe
    const campaigns = await Campaign.find({
      userId: req.userId,
      createdAt: { $gte: startDate }
    });

    // Calculate summary metrics
    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalSpend: campaigns.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
      totalClicks: campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
      totalConversions: campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
      platformBreakdown: {},
      statusBreakdown: {}
    };

    // Platform breakdown
    campaigns.forEach(campaign => {
      summary.platformBreakdown[campaign.platform] =
        (summary.platformBreakdown[campaign.platform] || 0) + 1;
    });

    // Status breakdown
    campaigns.forEach(campaign => {
      summary.statusBreakdown[campaign.status] =
        (summary.statusBreakdown[campaign.status] || 0) + 1;
    });

    // Calculate average metrics
    if (summary.totalImpressions > 0) {
      summary.averageCTR = (summary.totalClicks / summary.totalImpressions * 100).toFixed(2);
    }

    if (summary.totalClicks > 0) {
      summary.averageCPC = (summary.totalSpend / summary.totalClicks).toFixed(2);
    }

    if (summary.totalConversions > 0) {
      summary.averageCPA = (summary.totalSpend / summary.totalConversions).toFixed(2);
      summary.averageROAS = ((summary.totalConversions * 50) / summary.totalSpend).toFixed(2); // Assuming $50 avg conversion value
    }

    res.json({
      success: true,
      summary,
      timeframe
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign summary'
    });
  }
});

module.exports = router;