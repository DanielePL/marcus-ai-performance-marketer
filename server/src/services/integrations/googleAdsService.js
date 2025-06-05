// server/src/services/integrations/googleAdsService.js
// MARCUS AI - Google Ads API Integration Service
// Live Performance Data & Campaign Management

const { GoogleAdsApi, enums } = require('google-ads-api');

class GoogleAdsService {
  constructor() {
    this.client = null;
    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    this.isConnected = false;
    this.lastError = null;

    this.initializeClient();
    console.log('🚀 Marcus Google Ads Service initializing...');
  }

  // Initialize Google Ads Client
  initializeClient() {
    try {
      if (!process.env.GOOGLE_ADS_CLIENT_ID ||
          !process.env.GOOGLE_ADS_CLIENT_SECRET ||
          !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
        throw new Error('Missing Google Ads API credentials in environment variables');
      }

      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });

      console.log('✅ Google Ads API Client initialized');
    } catch (error) {
      console.error('❌ Google Ads Client initialization failed:', error.message);
      this.lastError = error.message;
    }
  }

  // Get authenticated customer instance
  async getCustomer() {
    try {
      if (!this.client) {
        throw new Error('Google Ads client not initialized');
      }

      if (!this.customerId || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
        throw new Error('Missing Customer ID or Refresh Token');
      }

      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      return customer;
    } catch (error) {
      console.error('❌ Google Ads Customer Error:', error);
      this.isConnected = false;
      this.lastError = error.message;
      throw error;
    }
  }

  // 🔥 MARCUS LIVE PERFORMANCE: Real-time account metrics
  async getLivePerformanceData() {
    try {
      const customer = await this.getCustomer();

      console.log('📊 Marcus fetching live Google Ads performance...');

      // Get today's performance data
      const query = `
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.conversion_rate,
          segments.date
        FROM customer 
        WHERE segments.date = TODAY
      `;

      const todayResults = await customer.query(query);

      // Get yesterday's data for comparison
      const yesterdayQuery = `
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.conversion_rate
        FROM customer 
        WHERE segments.date = YESTERDAY
      `;

      const yesterdayResults = await customer.query(yesterdayQuery);

      // Process today's data
      const todayMetrics = this.aggregateMetrics(todayResults);
      const yesterdayMetrics = this.aggregateMetrics(yesterdayResults);

      // Calculate performance changes
      const performanceData = {
        platform: 'google_ads',
        status: 'connected',
        lastUpdated: new Date().toISOString(),

        // Today's metrics
        current: {
          impressions: todayMetrics.impressions,
          clicks: todayMetrics.clicks,
          ctr: todayMetrics.ctr,
          cpc: todayMetrics.avgCpc,
          spend: todayMetrics.spend,
          conversions: todayMetrics.conversions,
          revenue: todayMetrics.revenue,
          roas: todayMetrics.roas,
          conversionRate: todayMetrics.conversionRate
        },

        // Performance changes vs yesterday
        changes: {
          impressions: this.calculateChange(todayMetrics.impressions, yesterdayMetrics.impressions),
          clicks: this.calculateChange(todayMetrics.clicks, yesterdayMetrics.clicks),
          ctr: this.calculateChange(todayMetrics.ctr, yesterdayMetrics.ctr),
          cpc: this.calculateChange(todayMetrics.avgCpc, yesterdayMetrics.avgCpc),
          spend: this.calculateChange(todayMetrics.spend, yesterdayMetrics.spend),
          conversions: this.calculateChange(todayMetrics.conversions, yesterdayMetrics.conversions),
          revenue: this.calculateChange(todayMetrics.revenue, yesterdayMetrics.revenue)
        },

        // Account health indicators
        health: {
          accountStatus: 'active',
          budgetUtilization: this.calculateBudgetUtilization(todayMetrics.spend),
          qualityScore: await this.getAverageQualityScore(),
          activecampaigns: await this.getActiveCampaignCount()
        }
      };

      this.isConnected = true;
      this.lastError = null;

      console.log('✅ Live Google Ads performance data retrieved');
      return performanceData;

    } catch (error) {
      console.error('❌ Live Performance Error:', error);
      this.isConnected = false;
      this.lastError = error.message;

      return {
        platform: 'google_ads',
        status: 'error',
        error: error.message,
        lastUpdated: new Date().toISOString(),
        current: this.getEmptyMetrics(),
        changes: this.getEmptyChanges(),
        health: { accountStatus: 'disconnected' }
      };
    }
  }

  // 🔥 MARCUS REAL-TIME: Get hourly performance trends
  async getHourlyTrends() {
    try {
      const customer = await this.getCustomer();

      const query = `
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          segments.hour
        FROM customer 
        WHERE segments.date = TODAY
        ORDER BY segments.hour ASC
      `;

      const results = await customer.query(query);

      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourData = results.find(r => r.segments?.hour === hour) || {};

        hourlyData.push({
          hour: hour,
          impressions: hourData.metrics?.impressions || 0,
          clicks: hourData.metrics?.clicks || 0,
          spend: hourData.metrics?.cost_micros ? (hourData.metrics.cost_micros / 1000000) : 0,
          conversions: hourData.metrics?.conversions || 0,
          timestamp: new Date().setHours(hour, 0, 0, 0)
        });
      }

      console.log('📈 Hourly trends data retrieved');
      return hourlyData;

    } catch (error) {
      console.error('❌ Hourly Trends Error:', error);
      return [];
    }
  }

  // 🔥 MARCUS CONNECTION TEST: Live API connection verification
  async testConnectionLive() {
    try {
      console.log('🔍 Marcus testing Google Ads connection...');

      const customer = await this.getCustomer();

      // Test with simple customer query
      const query = `
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone
        FROM customer 
        LIMIT 1
      `;

      const result = await customer.query(query);

      if (result && result.length > 0) {
        const customerInfo = result[0].customer;

        this.isConnected = true;
        this.lastError = null;

        console.log('✅ Google Ads API connection successful');

        return {
          status: 'connected',
          platform: 'google_ads',
          customerId: this.customerId,
          accountName: customerInfo.descriptive_name || 'Unknown Account',
          currency: customerInfo.currency_code || 'EUR',
          timezone: customerInfo.time_zone || 'Europe/Zurich',
          message: 'Marcus Google Ads intelligence is online',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('No customer data returned');
      }

    } catch (error) {
      console.error('❌ Google Ads connection test failed:', error);

      this.isConnected = false;
      this.lastError = error.message;

      return {
        status: 'error',
        platform: 'google_ads',
        error: error.message,
        details: this.getDiagnosticInfo(),
        message: 'Marcus Google Ads connection offline',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper: Aggregate metrics from query results
  aggregateMetrics(results) {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalCost = 0;
    let totalConversions = 0;
    let totalConversionsValue = 0;

    results.forEach(row => {
      totalImpressions += row.metrics?.impressions || 0;
      totalClicks += row.metrics?.clicks || 0;
      totalCost += row.metrics?.cost_micros || 0;
      totalConversions += row.metrics?.conversions || 0;
      totalConversionsValue += row.metrics?.conversions_value || 0;
    });

    const spend = totalCost / 1000000; // Convert micros to euros
    const revenue = totalConversionsValue;
    const roas = spend > 0 ? (revenue / spend) : 0;

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0,
      avgCpc: totalClicks > 0 ? (spend / totalClicks) : 0,
      spend: spend,
      conversions: totalConversions,
      revenue: revenue,
      roas: roas,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0
    };
  }

  // Helper: Calculate percentage change
  calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100);
  }

  // Helper: Get average quality score
  async getAverageQualityScore() {
    try {
      const customer = await this.getCustomer();

      const query = `
        SELECT 
          keyword_view.resource_name,
          ad_group_criterion.quality_info.quality_score
        FROM keyword_view 
        WHERE ad_group_criterion.quality_info.quality_score > 0
        AND segments.date DURING LAST_7_DAYS
        LIMIT 100
      `;

      const results = await customer.query(query);

      if (results.length === 0) return 7; // Default average

      const totalScore = results.reduce((sum, row) => {
        return sum + (row.ad_group_criterion?.quality_info?.quality_score || 0);
      }, 0);

      return Math.round(totalScore / results.length);

    } catch (error) {
      console.error('Quality Score Error:', error);
      return 7; // Return default
    }
  }

  // Helper: Get active campaign count
  async getActiveCampaignCount() {
    try {
      const customer = await this.getCustomer();

      const query = `
        SELECT campaign.id
        FROM campaign 
        WHERE campaign.status = 'ENABLED'
      `;

      const results = await customer.query(query);
      return results.length;

    } catch (error) {
      console.error('Campaign Count Error:', error);
      return 0;
    }
  }

  // Helper: Calculate budget utilization
  calculateBudgetUtilization(todaySpend) {
    // This would need actual budget data - for now estimate
    const estimatedDailyBudget = 100; // Default budget
    return todaySpend > 0 ? Math.min(100, (todaySpend / estimatedDailyBudget * 100)) : 0;
  }

  // Helper: Get diagnostic information
  getDiagnosticInfo() {
    return {
      clientInitialized: !!this.client,
      customerId: !!this.customerId,
      refreshToken: !!process.env.GOOGLE_ADS_REFRESH_TOKEN,
      developerToken: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: !!process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: !!process.env.GOOGLE_ADS_CLIENT_SECRET
    };
  }

  // Helper: Empty metrics structure
  getEmptyMetrics() {
    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      spend: 0,
      conversions: 0,
      revenue: 0,
      roas: 0,
      conversionRate: 0
    };
  }

  // Helper: Empty changes structure
  getEmptyChanges() {
    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      spend: 0,
      conversions: 0,
      revenue: 0
    };
  }

  // 🔥 MARCUS INTELLIGENCE: Get connection status
  getConnectionStatus() {
    return {
      platform: 'google_ads',
      connected: this.isConnected,
      lastError: this.lastError,
      customerId: this.customerId,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = GoogleAdsService;