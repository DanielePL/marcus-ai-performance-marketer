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