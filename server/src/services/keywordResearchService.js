// server/src/services/keywordResearchService.js
// MARCUS AI - Enhanced Live Keyword Research & Market Intelligence Service

const { GoogleAdsApi } = require('google-ads-api');

class KeywordResearchService {
  constructor() {
    this.isInitialized = false;
    this.client = null;
    this.customer = null;

    // Initialize the service
    this.initialize();
  }

  // Initialize Google Ads API connection
  async initialize() {
    try {
      console.log('🚀 Marcus initializing keyword research engine...');

      // Validate required environment variables
      const requiredEnvVars = [
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CUSTOMER_ID',
        'GOOGLE_ADS_REFRESH_TOKEN'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        console.warn('⚠️ Missing Google Ads environment variables:', missingVars);
        return;
      }

      // Initialize Google Ads API client
      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });

      // Initialize customer instance
      this.customer = this.client.Customer({
        customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      // Test connection
      await this.testConnection();

      this.isInitialized = true;
      console.log('✅ Marcus keyword research engine ready!');

    } catch (error) {
      console.error('❌ Failed to initialize keyword research service:', error.message);
      this.isInitialized = false;
    }
  }

  // Test Google Ads API connection
  async testConnection() {
    try {
      if (!this.customer) {
        throw new Error('Customer not initialized');
      }

      // Simple test query to verify connection
      await this.customer.report({
        entity: 'customer',
        attributes: ['customer.id'],
        limit: 1
      });

      console.log('✅ Google Ads API connection verified');
      return true;

    } catch (error) {
      console.error('❌ Google Ads API connection test failed:', error.message);
      throw error;
    }
  }

  // Check if service is ready for use
  isReady() {
    return this.isInitialized && this.customer;
  }

  // LIVE Keyword Research with Google Keyword Planner
  async researchKeywords(seedKeywords, options = {}) {
    try {
      // Validate service readiness
      if (!this.isReady()) {
        return {
          success: false,
          error: 'Keyword research service not properly initialized. Check Google Ads API credentials.',
          timestamp: new Date().toISOString()
        };
      }

      console.log('🔍 Marcus researching keywords:', seedKeywords);

      // Validate input
      if (!seedKeywords || !Array.isArray(seedKeywords) || seedKeywords.length === 0) {
        return {
          success: false,
          error: 'Valid seed keywords array required',
          timestamp: new Date().toISOString()
        };
      }

      const {
        language = 'de',
        location = 'DE',
        includeAdultKeywords = false,
        keywordPlanNetwork = 'GOOGLE_SEARCH',
        maxKeywords = 200
      } = options;

      // Step 1: Generate keyword ideas
      const keywordIdeas = await this.generateKeywordIdeas(seedKeywords, {
        language,
        location,
        includeAdultKeywords,
        keywordPlanNetwork
      });

      if (!keywordIdeas || keywordIdeas.length === 0) {
        return {
          success: false,
          error: 'No keyword ideas generated. Try different seed keywords.',
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Get historical metrics for keywords
      const keywordsWithMetrics = await this.getKeywordMetrics(keywordIdeas, maxKeywords);

      // Step 3: Analyze and categorize keywords
      const analysis = this.analyzeKeywords(keywordsWithMetrics);

      // Step 4: Generate market insights
      const marketInsights = this.generateMarketInsights(analysis);

      console.log(`✅ Marcus analyzed ${keywordsWithMetrics.length} keywords`);

      return {
        success: true,
        data: {
          seedKeywords,
          totalKeywordsFound: keywordsWithMetrics.length,
          keywords: keywordsWithMetrics,
          analysis,
          marketInsights,
          searchOptions: { language, location, keywordPlanNetwork },
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Keyword research failed:', error);
      return {
        success: false,
        error: `Keyword research failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generate keyword ideas using Google Keyword Planner
  async generateKeywordIdeas(seedKeywords, options) {
    try {
      if (!this.customer || !this.customer.keywordPlanIdeaService) {
        throw new Error('Google Ads Keyword Planner service not available');
      }

      const request = {
        keyword_plan_network: options.keywordPlanNetwork,
        geo_target_constants: [`geoTargetConstants/${this.getLocationId(options.location)}`],
        language: `languageConstants/${this.getLanguageId(options.language)}`,
        keyword_seed: {
          keywords: seedKeywords
        },
        include_adult_keywords: options.includeAdultKeywords
      };

      console.log('🔍 Requesting keyword ideas with:', request);

      const keywordIdeas = await this.customer.keywordPlanIdeaService.generateKeywordIdeas(request);

      console.log(`🔍 Generated ${keywordIdeas.results?.length || 0} keyword ideas`);
      return keywordIdeas.results || [];

    } catch (error) {
      console.error('❌ Keyword idea generation failed:', error);

      // Provide more specific error information
      if (error.message.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
        throw new Error('Google Ads Developer Token not approved. Please get approval from Google.');
      } else if (error.message.includes('AUTHENTICATION_ERROR')) {
        throw new Error('Google Ads authentication failed. Check your refresh token.');
      } else if (error.message.includes('CUSTOMER_NOT_FOUND')) {
        throw new Error('Google Ads customer account not found. Check customer ID.');
      }

      throw error;
    }
  }

  // Get detailed metrics for keywords
  async getKeywordMetrics(keywordIdeas, maxKeywords = 200) {
    try {
      const keywordsWithMetrics = [];

      // Limit keywords to avoid quota issues
      const limitedKeywords = keywordIdeas.slice(0, maxKeywords);

      for (const idea of limitedKeywords) {
        const keyword = idea.text;
        const metrics = idea.keyword_idea_metrics;

        if (metrics && keyword) {
          keywordsWithMetrics.push({
            keyword: keyword.trim(),
            avgMonthlySearches: parseInt(metrics.avg_monthly_searches) || 0,
            competition: this.mapCompetition(metrics.competition),
            competitionIndex: parseInt(metrics.competition_index) || 0,
            lowTopOfPageBid: this.microsToCurrency(metrics.low_top_of_page_bid_micros),
            highTopOfPageBid: this.microsToCurrency(metrics.high_top_of_page_bid_micros),
            searchVolumeTrend: metrics.monthly_search_volumes || [],
            keywordIdeaType: idea.keyword_idea_type || 'KEYWORD',
            annotations: idea.keyword_annotations || [],
            conceptGroup: idea.concept_group,
            inAccountHistory: Boolean(idea.in_account)
          });
        }
      }

      // Sort by search volume (highest first)
      return keywordsWithMetrics.sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches);

    } catch (error) {
      console.error('❌ Keyword metrics processing failed:', error);
      throw error;
    }
  }

  // Analyze keywords and create categories
  analyzeKeywords(keywords) {
    if (!keywords || keywords.length === 0) {
      return {
        highVolumeKeywords: [],
        lowCompetitionKeywords: [],
        highValueKeywords: [],
        longTailKeywords: [],
        commercialKeywords: [],
        informationalKeywords: [],
        quickWins: [],
        avgCpcRange: { min: 0, max: 0, avg: 0 },
        volumeDistribution: { high: 0, medium: 0, low: 0 },
        competitionDistribution: { low: 0, medium: 0, high: 0 }
      };
    }

    const analysis = {
      // High-value keywords
      highVolumeKeywords: keywords.filter(k => k.avgMonthlySearches >= 1000),
      lowCompetitionKeywords: keywords.filter(k => k.competition === 'LOW' || k.competitionIndex < 30),
      highValueKeywords: keywords.filter(k => k.lowTopOfPageBid >= 2.0),

      // Long-tail opportunities
      longTailKeywords: keywords.filter(k => k.keyword.split(' ').length >= 3),

      // Commercial intent keywords (German + English)
      commercialKeywords: keywords.filter(k => {
        const keyword = k.keyword.toLowerCase();
        return keyword.includes('buy') || keyword.includes('kaufen') ||
               keyword.includes('price') || keyword.includes('preis') ||
               keyword.includes('best') || keyword.includes('beste') ||
               keyword.includes('review') || keyword.includes('bewertung') ||
               keyword.includes('compare') || keyword.includes('vergleich') ||
               keyword.includes('shop') || keyword.includes('bestellen');
      }),

      // Informational intent keywords (German + English)
      informationalKeywords: keywords.filter(k => {
        const keyword = k.keyword.toLowerCase();
        return keyword.includes('how') || keyword.includes('wie') ||
               keyword.includes('what') || keyword.includes('was') ||
               keyword.includes('why') || keyword.includes('warum') ||
               keyword.includes('guide') || keyword.includes('anleitung') ||
               keyword.includes('tutorial') || keyword.includes('tipps');
      }),

      // Quick win opportunities
      quickWins: keywords.filter(k =>
        k.avgMonthlySearches >= 100 &&
        k.avgMonthlySearches <= 1000 &&
        (k.competition === 'LOW' || k.competitionIndex < 30)
      ),

      // Competitive landscape
      avgCpcRange: this.calculateCpcRange(keywords),
      volumeDistribution: this.calculateVolumeDistribution(keywords),
      competitionDistribution: this.calculateCompetitionDistribution(keywords)
    };

    return analysis;
  }

  // Generate strategic market insights
  generateMarketInsights(analysis) {
    const insights = [];

    // Market size insights
    const totalVolume = analysis.highVolumeKeywords.reduce((sum, k) => sum + k.avgMonthlySearches, 0);
    if (totalVolume > 0) {
      insights.push({
        type: 'market_size',
        insight: `Total addressable market: ${totalVolume.toLocaleString()} monthly searches`,
        confidence: 'high',
        impact: 'strategic',
        priority: 'high'
      });
    }

    // Competition insights
    if (analysis.highVolumeKeywords.length > 0) {
      const lowCompetitionRatio = analysis.lowCompetitionKeywords.length / analysis.highVolumeKeywords.length;
      if (lowCompetitionRatio > 0.3) {
        insights.push({
          type: 'opportunity',
          insight: `${Math.round(lowCompetitionRatio * 100)}% of high-volume keywords have low competition`,
          confidence: 'high',
          impact: 'tactical',
          action: 'Target these keywords for quick wins',
          priority: 'high'
        });
      }
    }

    // Long-tail opportunities
    if (analysis.longTailKeywords.length > 10) {
      insights.push({
        type: 'strategy',
        insight: `${analysis.longTailKeywords.length} long-tail opportunities identified`,
        confidence: 'medium',
        impact: 'tactical',
        action: 'Build content strategy around long-tail keywords',
        priority: 'medium'
      });
    }

    // CPC insights
    if (analysis.avgCpcRange.avg > 0) {
      if (analysis.avgCpcRange.avg > 3.0) {
        insights.push({
          type: 'cost',
          insight: `High-value market with €${analysis.avgCpcRange.avg.toFixed(2)} average CPC`,
          confidence: 'high',
          impact: 'financial',
          action: 'Focus on high-converting landing pages to justify premium CPCs',
          priority: 'high'
        });
      } else {
        insights.push({
          type: 'cost',
          insight: `Affordable market with €${analysis.avgCpcRange.avg.toFixed(2)} average CPC`,
          confidence: 'high',
          impact: 'financial',
          action: 'Scale campaigns aggressively in this cost-effective market',
          priority: 'medium'
        });
      }
    }

    // Intent analysis
    const totalIntentKeywords = analysis.commercialKeywords.length + analysis.informationalKeywords.length;
    if (totalIntentKeywords > 0) {
      const commercialRatio = analysis.commercialKeywords.length / totalIntentKeywords;
      insights.push({
        type: 'intent_analysis',
        insight: `Market split: ${Math.round(commercialRatio * 100)}% commercial intent, ${Math.round((1 - commercialRatio) * 100)}% informational`,
        confidence: 'medium',
        impact: 'strategic',
        action: commercialRatio > 0.6 ? 'Direct-response campaigns recommended' : 'Content marketing + nurturing funnel recommended',
        priority: 'medium'
      });
    }

    // Quick wins insight
    if (analysis.quickWins.length > 5) {
      insights.push({
        type: 'quick_wins',
        insight: `${analysis.quickWins.length} quick-win keywords identified`,
        confidence: 'high',
        impact: 'tactical',
        action: 'Start campaigns with these low-competition, moderate-volume keywords',
        priority: 'high'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper Methods
  microsToCurrency(micros) {
    if (!micros || isNaN(micros)) return 0;
    return parseFloat((micros / 1000000).toFixed(2));
  }

  mapCompetition(competition) {
    if (typeof competition === 'string') return competition;

    const competitionMap = {
      0: 'UNKNOWN',
      1: 'LOW',
      2: 'MEDIUM',
      3: 'HIGH'
    };
    return competitionMap[competition] || 'UNKNOWN';
  }

  getLocationId(location) {
    const locationMap = {
      'DE': '2276', // Germany
      'AT': '2040', // Austria
      'CH': '2756', // Switzerland
      'US': '2840', // United States
      'GB': '2826', // United Kingdom
      'FR': '2250', // France
      'IT': '2380', // Italy
      'ES': '2724', // Spain
      'NL': '2528'  // Netherlands
    };
    return locationMap[location.toUpperCase()] || '2276';
  }

  getLanguageId(language) {
    const languageMap = {
      'de': '1001', // German
      'en': '1000', // English
      'fr': '1002', // French
      'it': '1004', // Italian
      'es': '1003', // Spanish
      'nl': '1043'  // Dutch
    };
    return languageMap[language.toLowerCase()] || '1001';
  }

  calculateCpcRange(keywords) {
    const cpcs = keywords
      .map(k => k.lowTopOfPageBid)
      .filter(cpc => cpc > 0 && !isNaN(cpc));

    if (cpcs.length === 0) return { min: 0, max: 0, avg: 0 };

    return {
      min: Math.min(...cpcs),
      max: Math.max(...cpcs),
      avg: cpcs.reduce((sum, cpc) => sum + cpc, 0) / cpcs.length
    };
  }

  calculateVolumeDistribution(keywords) {
    return {
      high: keywords.filter(k => k.avgMonthlySearches >= 10000).length,
      medium: keywords.filter(k => k.avgMonthlySearches >= 1000 && k.avgMonthlySearches < 10000).length,
      low: keywords.filter(k => k.avgMonthlySearches < 1000).length
    };
  }

  calculateCompetitionDistribution(keywords) {
    return {
      low: keywords.filter(k => k.competition === 'LOW').length,
      medium: keywords.filter(k => k.competition === 'MEDIUM').length,
      high: keywords.filter(k => k.competition === 'HIGH').length
    };
  }

  // Get health status of the service
  getServiceHealth() {
    return {
      isInitialized: this.isInitialized,
      isReady: this.isReady(),
      hasClient: Boolean(this.client),
      hasCustomer: Boolean(this.customer),
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
const keywordResearchService = new KeywordResearchService();

module.exports = keywordResearchService;