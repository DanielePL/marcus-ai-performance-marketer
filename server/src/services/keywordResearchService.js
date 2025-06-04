// server/src/services/keywordResearchService.js
// MARCUS AI - Live Keyword Research & Market Intelligence Service

const { GoogleAdsApi } = require('google-ads-api');

class KeywordResearchService {
  constructor() {
    this.client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    this.customer = this.client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
  }

  // LIVE Keyword Research with Google Keyword Planner
  async researchKeywords(seedKeywords, options = {}) {
    try {
      console.log('🔍 Marcus researching keywords:', seedKeywords);

      const {
        language = 'de',
        location = 'DE', // Germany
        includeAdultKeywords = false,
        keywordPlanNetwork = 'GOOGLE_SEARCH'
      } = options;

      // Step 1: Generate keyword ideas
      const keywordIdeas = await this.generateKeywordIdeas(seedKeywords, {
        language,
        location,
        includeAdultKeywords,
        keywordPlanNetwork
      });

      // Step 2: Get historical metrics for keywords
      const keywordsWithMetrics = await this.getKeywordMetrics(keywordIdeas);

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
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Keyword research failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generate keyword ideas using Google Keyword Planner
  async generateKeywordIdeas(seedKeywords, options) {
    try {
      const keywordIdeas = await this.customer.keywordPlanIdeaService.generateKeywordIdeas({
        keyword_plan_network: options.keywordPlanNetwork,
        geo_target_constants: [`geoTargetConstants/${this.getLocationId(options.location)}`],
        language: `languageConstants/${this.getLanguageId(options.language)}`,
        keyword_seed: {
          keywords: seedKeywords
        },
        keyword_annotation: ['KEYWORD_CONCEPT'],
        aggregate_metrics: {
          aggregation_dimension: 'ANNOTATION'
        }
      });

      console.log(`🔍 Generated ${keywordIdeas.results?.length || 0} keyword ideas`);
      return keywordIdeas.results || [];

    } catch (error) {
      console.error('❌ Keyword idea generation failed:', error);
      throw error;
    }
  }

  // Get detailed metrics for keywords
  async getKeywordMetrics(keywordIdeas) {
    try {
      const keywordsWithMetrics = [];

      for (const idea of keywordIdeas.slice(0, 200)) { // Limit to avoid quota issues
        const keyword = idea.text;
        const metrics = idea.keyword_idea_metrics;

        if (metrics) {
          keywordsWithMetrics.push({
            keyword: keyword,
            avgMonthlySearches: metrics.avg_monthly_searches || 0,
            competition: this.mapCompetition(metrics.competition),
            competitionIndex: metrics.competition_index || 0,
            lowTopOfPageBid: this.microsToCurrency(metrics.low_top_of_page_bid_micros),
            highTopOfPageBid: this.microsToCurrency(metrics.high_top_of_page_bid_micros),
            searchVolumeTrend: metrics.monthly_search_volumes || [],
            keywordIdeaType: idea.keyword_idea_type,
            annotations: idea.keyword_annotations || [],
            conceptGroup: idea.concept_group,
            inAccountHistory: idea.in_account
          });
        }
      }

      return keywordsWithMetrics.sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches);

    } catch (error) {
      console.error('❌ Keyword metrics failed:', error);
      throw error;
    }
  }

  // Analyze keywords and create categories
  analyzeKeywords(keywords) {
    const analysis = {
      // High-value keywords
      highVolumeKeywords: keywords.filter(k => k.avgMonthlySearches >= 1000),
      lowCompetitionKeywords: keywords.filter(k => k.competition === 'LOW' || k.competitionIndex < 30),
      highValueKeywords: keywords.filter(k => k.lowTopOfPageBid >= 2.0),

      // Long-tail opportunities
      longTailKeywords: keywords.filter(k => k.keyword.split(' ').length >= 3),

      // Commercial intent
      commercialKeywords: keywords.filter(k =>
        k.keyword.includes('buy') ||
        k.keyword.includes('price') ||
        k.keyword.includes('best') ||
        k.keyword.includes('review') ||
        k.keyword.includes('compare')
      ),

      // Informational intent
      informationalKeywords: keywords.filter(k =>
        k.keyword.includes('how') ||
        k.keyword.includes('what') ||
        k.keyword.includes('why') ||
        k.keyword.includes('guide') ||
        k.keyword.includes('tutorial')
      ),

      // Opportunity segments
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
    insights.push({
      type: 'market_size',
      insight: `Total addressable market: ${totalVolume.toLocaleString()} monthly searches`,
      confidence: 'high',
      impact: 'strategic'
    });

    // Competition insights
    const lowCompetitionRatio = analysis.lowCompetitionKeywords.length / analysis.highVolumeKeywords.length;
    if (lowCompetitionRatio > 0.3) {
      insights.push({
        type: 'opportunity',
        insight: `${Math.round(lowCompetitionRatio * 100)}% of high-volume keywords have low competition - great opportunity!`,
        confidence: 'high',
        impact: 'tactical',
        action: 'Target these keywords for quick wins'
      });
    }

    // Long-tail opportunities
    if (analysis.longTailKeywords.length > 20) {
      insights.push({
        type: 'strategy',
        insight: `${analysis.longTailKeywords.length} long-tail opportunities identified`,
        confidence: 'medium',
        impact: 'tactical',
        action: 'Build content strategy around long-tail keywords'
      });
    }

    // CPC insights
    if (analysis.avgCpcRange.avg > 3.0) {
      insights.push({
        type: 'cost',
        insight: `High-value market with €${analysis.avgCpcRange.avg.toFixed(2)} average CPC`,
        confidence: 'high',
        impact: 'financial',
        action: 'Focus on high-converting landing pages to justify premium CPCs'
      });
    }

    // Commercial vs informational balance
    const commercialRatio = analysis.commercialKeywords.length / (analysis.commercialKeywords.length + analysis.informationalKeywords.length);
    insights.push({
      type: 'intent_analysis',
      insight: `Market split: ${Math.round(commercialRatio * 100)}% commercial intent, ${Math.round((1 - commercialRatio) * 100)}% informational`,
      confidence: 'medium',
      impact: 'strategic',
      action: commercialRatio > 0.6 ? 'Direct-response campaigns' : 'Content marketing + nurturing funnel'
    });

    return insights;
  }

  // Get Competitor Keywords (Advanced Research)
  async getCompetitorKeywords(competitorDomain, maxKeywords = 100) {
    try {
      console.log('🕵️ Marcus spying on competitor:', competitorDomain);

      // Note: This requires additional APIs like SEMrush, Ahrefs, or similar
      // For now, we'll use URL-based keyword suggestions

      const urlKeywords = await this.customer.keywordPlanIdeaService.generateKeywordIdeas({
        keyword_plan_network: 'GOOGLE_SEARCH',
        geo_target_constants: ['geoTargetConstants/2276'], // Germany
        language: 'languageConstants/1000', // German
        url_seed: {
          url: competitorDomain
        }
      });

      const competitorKeywords = await this.getKeywordMetrics(urlKeywords.results || []);

      console.log(`🕵️ Found ${competitorKeywords.length} competitor keywords`);

      return {
        success: true,
        data: {
          competitorDomain,
          keywords: competitorKeywords.slice(0, maxKeywords),
          analysis: this.analyzeKeywords(competitorKeywords),
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Competitor research failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search for trending keywords in industry
  async getTrendingKeywords(industry, timeframe = '30d') {
    try {
      console.log('📈 Marcus analyzing trends for:', industry);

      // Generate industry-specific seed keywords
      const industrySeeds = this.getIndustrySeeds(industry);

      // Research current keywords
      const currentData = await this.researchKeywords(industrySeeds);

      if (!currentData.success) {
        throw new Error(currentData.error);
      }

      // Identify trending patterns
      const trendingKeywords = currentData.data.keywords.filter(keyword => {
        // Look for keywords with consistent growth in search volume trend
        if (keyword.searchVolumeTrend && keyword.searchVolumeTrend.length >= 3) {
          const recent = keyword.searchVolumeTrend.slice(-3);
          const older = keyword.searchVolumeTrend.slice(-6, -3);

          const recentAvg = recent.reduce((sum, month) => sum + (month.monthly_searches || 0), 0) / recent.length;
          const olderAvg = older.reduce((sum, month) => sum + (month.monthly_searches || 0), 0) / older.length;

          return recentAvg > olderAvg * 1.2; // 20% growth
        }
        return false;
      });

      return {
        success: true,
        data: {
          industry,
          timeframe,
          trendingKeywords: trendingKeywords.slice(0, 50),
          insights: this.generateTrendInsights(trendingKeywords),
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Trending keywords failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper Methods
  microsToCurrency(micros) {
    return micros ? parseFloat((micros / 1000000).toFixed(2)) : 0;
  }

  mapCompetition(competition) {
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
      'US': '2840'  // United States
    };
    return locationMap[location] || '2276';
  }

  getLanguageId(language) {
    const languageMap = {
      'de': '1001', // German
      'en': '1000', // English
      'fr': '1002'  // French
    };
    return languageMap[language] || '1001';
  }

  calculateCpcRange(keywords) {
    const cpcs = keywords.map(k => k.lowTopOfPageBid).filter(cpc => cpc > 0);
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

  getIndustrySeeds(industry) {
    const industrySeeds = {
      'ecommerce': ['online shop', 'kaufen', 'bestellen', 'versand', 'rabatt'],
      'fitness': ['fitness', 'sport', 'training', 'gym', 'abnehmen'],
      'tech': ['software', 'app', 'digital', 'online', 'cloud'],
      'beauty': ['kosmetik', 'pflege', 'schönheit', 'makeup', 'hautpflege'],
      'food': ['restaurant', 'essen', 'lieferung', 'rezept', 'kochen'],
      'travel': ['reisen', 'hotel', 'urlaub', 'flug', 'booking'],
      'finance': ['bank', 'kredit', 'versicherung', 'geld', 'sparen'],
      'real_estate': ['immobilien', 'haus', 'wohnung', 'miete', 'kauf']
    };

    return industrySeeds[industry.toLowerCase()] || ['service', 'product', 'solution'];
  }

  generateTrendInsights(trendingKeywords) {
    return [
      {
        type: 'trending_opportunity',
        insight: `${trendingKeywords.length} keywords showing upward trend`,
        action: 'Create content targeting these growing search terms'
      }
    ];
  }
}

// Singleton instance
const keywordResearchService = new KeywordResearchService();

module.exports = keywordResearchService;