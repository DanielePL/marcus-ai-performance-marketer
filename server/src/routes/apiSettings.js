// server/src/routes/apiSettings.js
// MARCUS AI - API Settings & Platform Integrations Routes

const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// GET /api/api-settings - Get user's API settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return API settings (mask sensitive data)
    const apiSettings = {
      google: {
        connected: !!user.googleAdsCustomerId,
        customerId: user.googleAdsCustomerId ?
          '***-***-' + user.googleAdsCustomerId.slice(-4) : null,
        lastSync: user.lastGoogleSync || null
      },

      meta: {
        connected: !!user.metaAdAccountId,
        accountId: user.metaAdAccountId ?
          '***' + user.metaAdAccountId.slice(-4) : null,
        lastSync: user.lastMetaSync || null
      },

      tiktok: {
        connected: !!user.tiktokAdAccountId,
        accountId: user.tiktokAdAccountId ?
          '***' + user.tiktokAdAccountId.slice(-4) : null,
        lastSync: user.lastTiktokSync || null
      },

      linkedin: {
        connected: !!user.linkedinAdAccountId,
        accountId: user.linkedinAdAccountId ?
          '***' + user.linkedinAdAccountId.slice(-4) : null,
        lastSync: user.lastLinkedinSync || null
      },

      general: {
        preferredCurrency: user.preferredCurrency || 'USD',
        timezone: user.timezone || 'UTC',
        autoOptimization: user.marcusSettings?.autoOptimization ?? true,
        budgetAlerts: user.marcusSettings?.budgetAlerts ?? true,
        performanceAlerts: user.marcusSettings?.performanceAlerts ?? true,
        weeklyReports: user.marcusSettings?.weeklyReports ?? true,
        riskTolerance: user.marcusSettings?.riskTolerance || 'moderate',
        maxDailyBudget: user.marcusSettings?.maxDailyBudget || 1000
      }
    };

    res.json({
      success: true,
      apiSettings,
      connectedPlatforms: Object.keys(apiSettings).filter(
        platform => platform !== 'general' && apiSettings[platform].connected
      ).length,
      lastUpdated: user.updatedAt
    });

  } catch (error) {
    console.error('Get API settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving API settings'
    });
  }
});

// PUT /api/api-settings/google - Update Google Ads settings
router.put('/google', authenticateToken, async (req, res) => {
  try {
    const { customerId, developerToken, refreshToken } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Google Ads Customer ID is required'
      });
    }

    // Validate Customer ID format (xxx-xxx-xxxx)
    const customerIdRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!customerIdRegex.test(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Ads Customer ID format. Use: xxx-xxx-xxxx'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update Google Ads settings
    user.googleAdsCustomerId = customerId;

    if (developerToken) {
      user.googleAdsDeveloperToken = developerToken;
    }

    if (refreshToken) {
      user.googleAdsRefreshToken = refreshToken;
    }

    user.lastGoogleSync = null; // Reset sync status
    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Google Ads settings updated successfully',
      settings: {
        customerId: '***-***-' + customerId.slice(-4),
        connected: true,
        lastSync: null
      }
    });

  } catch (error) {
    console.error('Update Google settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating Google Ads settings'
    });
  }
});

// PUT /api/api-settings/meta - Update Meta Ads settings
router.put('/meta', authenticateToken, async (req, res) => {
  try {
    const { adAccountId, accessToken, appId, appSecret } = req.body;

    if (!adAccountId) {
      return res.status(400).json({
        success: false,
        message: 'Meta Ad Account ID is required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update Meta settings
    user.metaAdAccountId = adAccountId;

    if (accessToken) {
      user.metaAccessToken = accessToken;
    }

    if (appId) {
      user.metaAppId = appId;
    }

    if (appSecret) {
      user.metaAppSecret = appSecret;
    }

    user.lastMetaSync = null; // Reset sync status
    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Meta Ads settings updated successfully',
      settings: {
        accountId: '***' + adAccountId.slice(-4),
        connected: true,
        lastSync: null
      }
    });

  } catch (error) {
    console.error('Update Meta settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating Meta Ads settings'
    });
  }
});

// PUT /api/api-settings/general - Update general Marcus settings
router.put('/general', authenticateToken, async (req, res) => {
  try {
    const {
      preferredCurrency,
      timezone,
      autoOptimization,
      budgetAlerts,
      performanceAlerts,
      weeklyReports,
      riskTolerance,
      maxDailyBudget
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate inputs
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD'];
    const validRiskLevels = ['conservative', 'moderate', 'aggressive'];

    if (preferredCurrency && !validCurrencies.includes(preferredCurrency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Valid options: ' + validCurrencies.join(', ')
      });
    }

    if (riskTolerance && !validRiskLevels.includes(riskTolerance)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid risk tolerance. Valid options: ' + validRiskLevels.join(', ')
      });
    }

    if (maxDailyBudget && (maxDailyBudget < 10 || maxDailyBudget > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Max daily budget must be between $10 and $10,000'
      });
    }

    // Update settings
    if (preferredCurrency) user.preferredCurrency = preferredCurrency;
    if (timezone) user.timezone = timezone;

    // Initialize marcusSettings if not exists
    if (!user.marcusSettings) {
      user.marcusSettings = {};
    }

    if (typeof autoOptimization === 'boolean') {
      user.marcusSettings.autoOptimization = autoOptimization;
    }
    if (typeof budgetAlerts === 'boolean') {
      user.marcusSettings.budgetAlerts = budgetAlerts;
    }
    if (typeof performanceAlerts === 'boolean') {
      user.marcusSettings.performanceAlerts = performanceAlerts;
    }
    if (typeof weeklyReports === 'boolean') {
      user.marcusSettings.weeklyReports = weeklyReports;
    }
    if (riskTolerance) {
      user.marcusSettings.riskTolerance = riskTolerance;
    }
    if (maxDailyBudget) {
      user.marcusSettings.maxDailyBudget = maxDailyBudget;
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'General settings updated successfully',
      settings: {
        preferredCurrency: user.preferredCurrency,
        timezone: user.timezone,
        autoOptimization: user.marcusSettings.autoOptimization,
        budgetAlerts: user.marcusSettings.budgetAlerts,
        performanceAlerts: user.marcusSettings.performanceAlerts,
        weeklyReports: user.marcusSettings.weeklyReports,
        riskTolerance: user.marcusSettings.riskTolerance,
        maxDailyBudget: user.marcusSettings.maxDailyBudget
      }
    });

  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating general settings'
    });
  }
});

// POST /api/api-settings/test-connection/:platform - Test API connection
router.post('/test-connection/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['google', 'meta', 'tiktok', 'linkedin'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // TODO: Implement actual API connection tests
    // For now, simulate connection test
    let connectionTest = {
      platform,
      connected: false,
      error: null,
      accountInfo: null
    };

    switch (platform) {
      case 'google':
        if (user.googleAdsCustomerId) {
          // Simulate Google Ads API test
          connectionTest.connected = true;
          connectionTest.accountInfo = {
            customerId: user.googleAdsCustomerId,
            accountName: 'Test Google Ads Account',
            currency: 'USD',
            timezone: 'America/New_York'
          };
        } else {
          connectionTest.error = 'Google Ads Customer ID not configured';
        }
        break;

      case 'meta':
        if (user.metaAdAccountId) {
          // Simulate Meta API test
          connectionTest.connected = true;
          connectionTest.accountInfo = {
            accountId: user.metaAdAccountId,
            accountName: 'Test Meta Ad Account',
            currency: 'USD',
            timezone: 'America/New_York'
          };
        } else {
          connectionTest.error = 'Meta Ad Account ID not configured';
        }
        break;

      case 'tiktok':
        connectionTest.error = 'TikTok API integration coming soon';
        break;

      case 'linkedin':
        connectionTest.error = 'LinkedIn API integration coming soon';
        break;
    }

    // Update last sync time if successful
    if (connectionTest.connected) {
      const syncField = `last${platform.charAt(0).toUpperCase() + platform.slice(1)}Sync`;
      user[syncField] = new Date();
      await user.save();
    }

    res.json({
      success: true,
      connectionTest,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing API connection'
    });
  }
});

// DELETE /api/api-settings/:platform - Disconnect platform
router.delete('/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['google', 'meta', 'tiktok', 'linkedin'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear platform-specific settings
    switch (platform) {
      case 'google':
        user.googleAdsCustomerId = undefined;
        user.googleAdsDeveloperToken = undefined;
        user.googleAdsRefreshToken = undefined;
        user.lastGoogleSync = undefined;
        break;

      case 'meta':
        user.metaAdAccountId = undefined;
        user.metaAccessToken = undefined;
        user.metaAppId = undefined;
        user.metaAppSecret = undefined;
        user.lastMetaSync = undefined;
        break;

      case 'tiktok':
        user.tiktokAdAccountId = undefined;
        user.lastTiktokSync = undefined;
        break;

      case 'linkedin':
        user.linkedinAdAccountId = undefined;
        user.lastLinkedinSync = undefined;
        break;
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected successfully`
    });

  } catch (error) {
    console.error('Disconnect platform error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disconnecting platform'
    });
  }
});

// GET /api/api-settings/supported-platforms - Get supported platforms
router.get('/supported-platforms', authenticateToken, async (req, res) => {
  try {
    const supportedPlatforms = [
      {
        id: 'google',
        name: 'Google Ads',
        description: 'Search, Display, Shopping, YouTube advertising',
        status: 'active',
        features: ['Campaign Management', 'Keyword Optimization', 'Bid Management', 'Performance Tracking'],
        setupInstructions: 'Connect your Google Ads account using Customer ID and API credentials',
        requiredFields: ['customerId', 'developerToken', 'refreshToken']
      },
      {
        id: 'meta',
        name: 'Meta Ads',
        description: 'Facebook and Instagram advertising',
        status: 'active',
        features: ['Campaign Management', 'Audience Targeting', 'Creative Optimization', 'Conversion Tracking'],
        setupInstructions: 'Connect your Meta Business account and ad account',
        requiredFields: ['adAccountId', 'accessToken', 'appId', 'appSecret']
      },
      {
        id: 'tiktok',
        name: 'TikTok Ads',
        description: 'TikTok advertising platform',
        status: 'coming_soon',
        features: ['Video Campaigns', 'Spark Ads', 'Brand Takeovers', 'In-Feed Ads'],
        setupInstructions: 'TikTok integration will be available soon',
        requiredFields: ['adAccountId', 'accessToken']
      },
      {
        id: 'linkedin',
        name: 'LinkedIn Ads',
        description: 'Professional B2B advertising',
        status: 'coming_soon',
        features: ['Sponsored Content', 'Lead Gen Forms', 'Text Ads', 'Dynamic Ads'],
        setupInstructions: 'LinkedIn integration will be available soon',
        requiredFields: ['adAccountId', 'accessToken']
      },
      {
        id: 'twitter',
        name: 'Twitter Ads',
        description: 'Twitter advertising platform',
        status: 'planned',
        features: ['Promoted Tweets', 'Twitter Takeovers', 'Video Ads'],
        setupInstructions: 'Twitter integration is planned for future release',
        requiredFields: ['adAccountId', 'accessToken']
      }
    ];

    res.json({
      success: true,
      platforms: supportedPlatforms,
      total: supportedPlatforms.length,
      active: supportedPlatforms.filter(p => p.status === 'active').length
    });

  } catch (error) {
    console.error('Get supported platforms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving supported platforms'
    });
  }
});

module.exports = router;