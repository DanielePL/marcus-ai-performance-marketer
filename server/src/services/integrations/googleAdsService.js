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
          averageCpc: todayMetrics.averageCpc,
          cost: todayMetrics.cost,
          conversions: todayMetrics.conversions,
          conversionValue: todayMetrics.conversionValue,
          conversionRate: todayMetrics.conversionRate,
          roas: todayMetrics.conversionValue / todayMetrics.cost || 0
        },

        // Yesterday's metrics for comparison
        previous: {
          impressions: yesterdayMetrics.impressions,
          clicks: yesterdayMetrics.clicks,
          ctr: yesterdayMetrics.ctr,
          averageCpc: yesterdayMetrics.averageCpc,
          cost: yesterdayMetrics.cost,
          conversions: yesterdayMetrics.conversions,
          conversionValue: yesterdayMetrics.conversionValue,
          conversionRate: yesterdayMetrics.conversionRate,
          roas: yesterdayMetrics.conversionValue / yesterdayMetrics.cost || 0
        },

        // Performance changes
        changes: {
          impressions: this.calculateChange(yesterdayMetrics.impressions, todayMetrics.impressions),
          clicks: this.calculateChange(yesterdayMetrics.clicks, todayMetrics.clicks),
          ctr: this.calculateChange(yesterdayMetrics.ctr, todayMetrics.ctr),
          averageCpc: this.calculateChange(yesterdayMetrics.averageCpc, todayMetrics.averageCpc),
          cost: this.calculateChange(yesterdayMetrics.cost, todayMetrics.cost),
          conversions: this.calculateChange(yesterdayMetrics.conversions, todayMetrics.conversions),
          conversionValue: this.calculateChange(yesterdayMetrics.conversionValue, todayMetrics.conversionValue),
          conversionRate: this.calculateChange(yesterdayMetrics.conversionRate, todayMetrics.conversionRate)
        }
      };

      this.isConnected = true;
      console.log('✅ Marcus live performance data retrieved successfully');

      return performanceData;

    } catch (error) {
      console.error('❌ Marcus Live Performance Error:', error);
      this.isConnected = false;
      this.lastError = error.message;

      return {
        platform: 'google_ads',
        status: 'error',
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // 🎯 MARCUS CAMPAIGN INTELLIGENCE: Get all active campaigns
  async getActiveCampaigns() {
    try {
      const customer = await this.getCustomer();

      console.log('🎯 Marcus fetching active campaigns...');

      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.target_spend.target_spend_micros,
          campaign.maximize_conversions.target_cpa_micros,
          campaign.start_date,
          campaign.end_date,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.conversion_rate
        FROM campaign 
        WHERE campaign.status = 'ENABLED'
        AND segments.date DURING LAST_7_DAYS
      `;

      const results = await customer.query(query);

      const campaigns = results.map(row => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        type: row.campaign.advertising_channel_type,
        biddingStrategy: row.campaign.bidding_strategy_type,
        budget: row.campaign.target_spend?.target_spend_micros / 1000000 || 0,
        targetCpa: row.campaign.maximize_conversions?.target_cpa_micros / 1000000 || 0,
        startDate: row.campaign.start_date,
        endDate: row.campaign.end_date,
        metrics: {
          impressions: row.metrics.impressions || 0,
          clicks: row.metrics.clicks || 0,
          ctr: row.metrics.ctr || 0,
          averageCpc: row.metrics.average_cpc || 0,
          cost: row.metrics.cost_micros / 1000000 || 0,
          conversions: row.metrics.conversions || 0,
          conversionValue: row.metrics.conversions_value || 0,
          conversionRate: row.metrics.conversion_rate || 0
        }
      }));

      console.log(`✅ Marcus found ${campaigns.length} active campaigns`);
      return campaigns;

    } catch (error) {
      console.error('❌ Marcus Campaign Fetch Error:', error);
      throw error;
    }
  }

  // 🔍 MARCUS KEYWORD INTELLIGENCE: Research keywords for target market
  async performKeywordResearch(params) {
    try {
      const customer = await this.getCustomer();
      console.log('🔍 Marcus performing keyword research...');

      const { keywords, location = 'CH', language = 'de' } = params;

      if (!keywords || keywords.length === 0) {
        throw new Error('Keywords are required for research');
      }

      const keywordPlanIdeaService = customer.keywordPlanIdeas;

      const request = {
        customer_id: this.customerId,
        resource_name: customer.getResourceName(),
        keyword_seed: {
          keywords: keywords
        },
        geo_target_constants: [`geoTargetConstants/2756`], // Switzerland
        language: `languageConstants/1001`, // German
        keyword_plan_network: enums.KeywordPlanNetwork.GOOGLE_SEARCH,
        include_adult_keywords: false
      };

      const keywordIdeas = await keywordPlanIdeaService.generateKeywordIdeas(request);

      const researchResults = keywordIdeas.results.map(idea => ({
        keyword: idea.text,
        avgMonthlySearches: idea.keyword_idea_metrics?.avg_monthly_searches || 0,
        competition: idea.keyword_idea_metrics?.competition || 'UNKNOWN',
        competitionIndex: idea.keyword_idea_metrics?.competition_index || 0,
        lowTopPageBid: idea.keyword_idea_metrics?.low_top_of_page_bid_micros / 1000000 || 0,
        highTopPageBid: idea.keyword_idea_metrics?.high_top_of_page_bid_micros / 1000000 || 0
      })).sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches);

      console.log(`✅ Marcus found ${researchResults.length} keyword opportunities`);

      return {
        status: 'success',
        totalKeywords: researchResults.length,
        keywords: researchResults,
        searchLocation: location,
        searchLanguage: language,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Marcus Keyword Research Error:', error);
      throw error;
    }
  }

  // 🚀 MARCUS CAMPAIGN CREATOR: Create optimized Google Ads campaign
  async createOptimizedCampaign(campaignData) {
    try {
      const customer = await this.getCustomer();
      console.log('🚀 Marcus creating optimized campaign...');

      const {
        name,
        budget,
        targetLocation = 'CH',
        keywords,
        adGroups,
        biddingStrategy = 'MAXIMIZE_CONVERSIONS'
      } = campaignData;

      // Create Campaign
      const campaignOperation = {
        create: {
          name: name,
          status: enums.CampaignStatus.PAUSED, // Start paused for review
          advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
          bidding_strategy_type: enums.BiddingStrategyType[biddingStrategy],
          campaign_budget: await this.createCampaignBudget(customer, budget),
          network_settings: {
            target_google_search: true,
            target_search_network: true,
            target_content_network: false,
            target_partner_search_network: false
          },
          geo_target_type_setting: {
            positive_geo_target_type: enums.PositiveGeoTargetType.PRESENCE_OR_INTEREST,
            negative_geo_target_type: enums.NegativeGeoTargetType.PRESENCE
          }
        }
      };

      const campaignResponse = await customer.campaigns.mutate([campaignOperation]);
      const campaignResourceName = campaignResponse.results[0].resource_name;
      const campaignId = campaignResourceName.split('/').pop();

      console.log(`✅ Marcus created campaign: ${campaignId}`);

      // Add location targeting
      await this.addLocationTargeting(customer, campaignResourceName, targetLocation);

      // Create Ad Groups with Keywords
      for (const adGroup of adGroups) {
        await this.createAdGroupWithKeywords(customer, campaignResourceName, adGroup);
      }

      return {
        status: 'success',
        campaignId: campaignId,
        campaignName: name,
        message: 'Marcus has successfully created your optimized campaign'
      };

    } catch (error) {
      console.error('❌ Marcus Campaign Creation Error:', error);
      throw error;
    }
  }

  // 🔧 Helper: Create campaign budget
  async createCampaignBudget(customer, budgetAmount) {
    const budgetOperation = {
      create: {
        name: `Marcus Budget ${Date.now()}`,
        amount_micros: budgetAmount * 1000000,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD
      }
    };

    const budgetResponse = await customer.campaignBudgets.mutate([budgetOperation]);
    return budgetResponse.results[0].resource_name;
  }

  // 🔧 Helper: Add location targeting
  async addLocationTargeting(customer, campaignResourceName, location) {
    const locationCriterion = {
      create: {
        campaign: campaignResourceName,
        location: {
          geo_target_constant: `geoTargetConstants/2756` // Switzerland
        }
      }
    };

    await customer.campaignCriteria.mutate([locationCriterion]);
  }

  // 🔧 Helper: Create ad group with keywords
  async createAdGroupWithKeywords(customer, campaignResourceName, adGroupData) {
    const { name, keywords, ads } = adGroupData;

    // Create Ad Group
    const adGroupOperation = {
      create: {
        campaign: campaignResourceName,
        name: name,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
        cpc_bid_micros: 1000000 // 1 CHF default bid
      }
    };

    const adGroupResponse = await customer.adGroups.mutate([adGroupOperation]);
    const adGroupResourceName = adGroupResponse.results[0].resource_name;

    // Add Keywords to Ad Group
    const keywordOperations = keywords.map(keyword => ({
      create: {
        ad_group: adGroupResourceName,
        keyword: {
          text: keyword.text,
          match_type: enums.KeywordMatchType[keyword.matchType || 'BROAD']
        },
        cpc_bid_micros: keyword.bidAmount * 1000000 || 1000000
      }
    }));

    await customer.adGroupCriteria.mutate(keywordOperations);

    // Create Ads
    const adOperations = ads.map(ad => ({
      create: {
        ad_group: adGroupResourceName,
        ad: {
          expanded_text_ad: {
            headline_part1: ad.headline1,
            headline_part2: ad.headline2,
            description: ad.description,
            path1: ad.path1,
            path2: ad.path2
          },
          final_urls: [ad.finalUrl]
        },
        status: enums.AdGroupAdStatus.ENABLED
      }
    }));

    await customer.adGroupAds.mutate(adOperations);
  }

  // 🔧 Helper: Aggregate metrics from query results
  aggregateMetrics(results) {
    const totals = {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      conversionValue: 0
    };

    results.forEach(row => {
      totals.impressions += row.metrics.impressions || 0;
      totals.clicks += row.metrics.clicks || 0;
      totals.cost += (row.metrics.cost_micros || 0) / 1000000;
      totals.conversions += row.metrics.conversions || 0;
      totals.conversionValue += row.metrics.conversions_value || 0;
    });

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      ctr: totals.clicks / totals.impressions || 0,
      averageCpc: totals.cost / totals.clicks || 0,
      cost: totals.cost,
      conversions: totals.conversions,
      conversionValue: totals.conversionValue,
      conversionRate: totals.conversions / totals.clicks || 0
    };
  }

  // 🔧 Helper: Calculate percentage change
  calculateChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  // 🧪 Test API connection
  async testConnection() {
    try {
      const customer = await this.getCustomer();

      // Simple query to test connection
      const testQuery = `
        SELECT customer.id, customer.descriptive_name 
        FROM customer 
        LIMIT 1
      `;

      const result = await customer.query(testQuery);

      this.isConnected = true;
      this.lastError = null;

      console.log('✅ Google Ads API connection successful');

      return {
        status: 'connected',
        customerId: this.customerId,
        customerName: result[0]?.customer?.descriptive_name || 'Unknown',
        message: 'Google Ads API ready for Marcus intelligence'
      };

    } catch (error) {
      console.error('❌ Google Ads connection test failed:', error);
      this.isConnected = false;
      this.lastError = error.message;

      return {
        status: 'error',
        error: error.message,
        message: 'Google Ads API connection failed'
      };
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      customerId: this.customerId,
      lastError: this.lastError,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new GoogleAdsService();