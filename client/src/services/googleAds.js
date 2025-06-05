// client/src/services/googleAds.js
// Frontend Service für Google Ads API Integration mit Marcus AI
// 🔥 OPTIMIZED for new comprehensive Google Ads Routes

class GoogleAdsClientService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.apiEndpoint = `${this.baseURL}/google-ads`;
  }

  // Test Google Ads API Connection - Enhanced
  async testConnection() {
    try {
      console.log('🔌 Testing Google Ads connection...');

      const response = await fetch(`${this.apiEndpoint}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Google Ads API connected:', data.data);
        return {
          status: 'connected',
          data: data.data,
          message: data.message || 'Google Ads API connected successfully'
        };
      } else {
        console.error('❌ Google Ads API failed:', data.error);
        return {
          status: 'error',
          message: data.error || 'Connection failed'
        };
      }

    } catch (error) {
      console.error('❌ Google Ads connection error:', error);
      return { status: 'error', message: error.message };
    }
  }

  // 🔥 ENHANCED: Get Market Intelligence for Marcus with better error handling
  async getMarketIntelligence(keywords, businessInfo = {}) {
    try {
      console.log('🧠 Marcus requesting market intelligence for:', keywords);

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        throw new Error('Keywords array is required and cannot be empty');
      }

      const keywordResponse = await fetch(`${this.apiEndpoint}/keyword-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          keywords,
          businessInfo,
          targetLocation: businessInfo.location || '2276' // Default to Germany
        })
      });

      const keywordData = await keywordResponse.json();

      if (!keywordData.success) {
        throw new Error(keywordData.error || 'Keyword research failed');
      }

      // Get industry benchmarks if industry provided
      let industryData = null;
      if (businessInfo.industry) {
        try {
          const industryResponse = await fetch(`${this.apiEndpoint}/industry-benchmarks/${businessInfo.industry}`, {
            headers: this.getAuthHeaders()
          });
          const industryResult = await industryResponse.json();
          if (industryResult.success) {
            industryData = industryResult.data;
          }
        } catch (industryError) {
          console.warn('Industry data not available:', industryError.message);
        }
      }

      // Combine intelligence for Marcus
      const marketIntelligence = {
        keywords: keywordData.data,
        industry: industryData,
        insights: this.generateMarketInsights(keywordData.data, industryData),
        summary: this.generateIntelligenceSummary(keywordData.data, industryData),
        timestamp: new Date().toISOString()
      };

      console.log('✅ Market intelligence ready for Marcus');
      return { success: true, data: marketIntelligence };

    } catch (error) {
      console.error('❌ Market intelligence failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 ENHANCED: Get Competitor Analysis for Marcus
  async getCompetitorIntelligence(domain, keywords = []) {
    try {
      console.log('🕵️ Marcus analyzing competitor:', domain);

      if (!domain || typeof domain !== 'string') {
        throw new Error('Valid competitor domain is required');
      }

      const response = await fetch(`${this.apiEndpoint}/competitor-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ domain, keywords })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Competitor intelligence ready');
        return {
          success: true,
          data: {
            ...data.data,
            formattedSummary: this.formatCompetitorSummary(data.data)
          }
        };
      } else {
        throw new Error(data.error || 'Competitor analysis failed');
      }

    } catch (error) {
      console.error('❌ Competitor analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 ENHANCED: Get Account Performance for Marcus
  async getAccountPerformance(days = 30) {
    try {
      console.log(`📊 Marcus requesting account performance (${days} days)`);

      const response = await fetch(`${this.apiEndpoint}/account-performance?days=${days}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Account performance ready');
        return {
          success: true,
          data: {
            ...data.data,
            formattedSummary: this.formatPerformanceSummary(data.data)
          }
        };
      } else {
        throw new Error(data.error || 'Account performance fetch failed');
      }

    } catch (error) {
      console.error('❌ Account performance failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 ENHANCED: Get Complete Campaign Intelligence for Marcus
  async getCampaignIntelligence(businessInfo, keywords) {
    try {
      console.log('🚀 Marcus generating comprehensive campaign intelligence...');

      if (!businessInfo || !keywords) {
        throw new Error('Business info and keywords are required');
      }

      const response = await fetch(`${this.apiEndpoint}/campaign-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ businessInfo, keywords })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Campaign intelligence ready for Marcus');
        return {
          success: true,
          data: {
            ...data.data,
            formattedSummary: this.formatCampaignIntelligenceSummary(data.data)
          }
        };
      } else {
        throw new Error(data.error || 'Campaign intelligence generation failed');
      }

    } catch (error) {
      console.error('❌ Campaign intelligence failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 NEW: Get Industry Benchmarks
  async getIndustryBenchmarks(industry) {
    try {
      console.log(`📈 Marcus fetching industry benchmarks for: ${industry}`);

      const response = await fetch(`${this.apiEndpoint}/industry-benchmarks/${industry}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Industry benchmarks ready');
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error || 'Industry benchmarks fetch failed');
      }

    } catch (error) {
      console.error('❌ Industry benchmarks failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate formatted data for Marcus AI prompts - Enhanced
  formatForMarcusAI(intelligenceData) {
    const formatted = {
      marketData: this.formatMarketData(intelligenceData),
      competitorData: this.formatCompetitorData(intelligenceData),
      performanceData: this.formatPerformanceData(intelligenceData),
      recommendations: this.formatRecommendations(intelligenceData)
    };

    return formatted;
  }

  // 🔥 ENHANCED: Format Market Data for AI
  formatMarketData(data) {
    if (!data || !data.keywords) return null;

    const keywords = data.keywords;
    const topKeywords = keywords.topRecommendations || keywords.keywords?.slice(0, 5) || [];

    return {
      summary: `Analyzed ${keywords.totalKeywordsFound || 0} keywords with ${keywords.highVolumeKeywords?.length || 0} high-volume opportunities`,
      topKeywords: topKeywords.map(k =>
        `"${k.keyword}" (${k.volume || k.avgMonthlySearches || 0} searches/month, €${k.cpc || k.lowTopOfPageBid || '0.00'} CPC)`
      ),
      marketSize: `Total market opportunity: ${(keywords.marketOpportunity || 0).toLocaleString()} monthly searches`,
      cpcRange: keywords.avgCpcRange ?
        `CPC Range: €${keywords.avgCpcRange.min} - €${keywords.avgCpcRange.max} (Avg: €${keywords.avgCpcRange.avg})` :
        'CPC data not available',
      opportunities: keywords.lowCompetitionKeywords?.length > 0 ?
        `${keywords.lowCompetitionKeywords.length} low-competition keywords identified` :
        'High competition market - focus on long-tail keywords',
      competitionLevel: keywords.competitionAnalysis ?
        `Competition: ${keywords.competitionAnalysis.highCompetition || 0} high, ${keywords.competitionAnalysis.mediumCompetition || 0} medium, ${keywords.competitionAnalysis.lowCompetition || 0} low` :
        'Competition analysis not available'
    };
  }

  // 🔥 ENHANCED: Format Competitor Data for AI
  formatCompetitorData(data) {
    if (!data || !data.competitor) return null;

    const insights = data.insights || {};
    const strategy = data.competitorStrategy || {};

    return {
      summary: `Competitor "${data.competitor}" has ${data.adActivity || 0} active ads`,
      strategy: Object.keys(strategy).length > 0 ? {
        avgCpc: `Average CPC: €${strategy.avgCpc || '0.00'}`,
        avgCtr: `Average CTR: ${strategy.avgCtr || '0.00'}%`,
        topHeadlines: strategy.topHeadlines || [],
        campaigns: strategy.campaignThemes || []
      } : null,
      insights: Object.keys(insights).length > 0 ?
        `Activity Level: ${insights.activityLevel || 'Unknown'}, Budget: ${insights.estimatedBudget || 'Unknown'}, Focus: ${insights.primaryFocus || 'Unknown'}` : null,
      opportunities: data.opportunities || []
    };
  }

  // 🔥 ENHANCED: Format Performance Data for AI
  formatPerformanceData(data) {
    if (!data || !data.performance) return null;

    const perf = data.performance;
    const insights = data.insights || {};
    const trends = data.trends || {};

    return {
      summary: `Last ${perf.period || '30 days'}: ${perf.clicks || 0} clicks, ${perf.conversions || 0} conversions`,
      metrics: {
        ctr: `CTR: ${perf.ctr || '0.00'}%`,
        cpc: `CPC: €${perf.avgCpc || '0.00'}`,
        spend: `Total Spend: €${perf.totalSpend || '0.00'}`,
        conversionRate: `Conversion Rate: ${perf.conversionRate || '0.00'}%`,
        costPerConversion: `Cost per Conversion: €${perf.costPerConversion || '0.00'}`
      },
      performance: insights.performanceLevel || 'Unknown',
      trends: Object.keys(trends).length > 0 ?
        `Daily: €${trends.dailySpend || '0.00'} spend, ${trends.dailyClicks || 0} clicks, ${trends.dailyConversions || '0.0'} conversions` : null,
      recommendations: data.recommendations || []
    };
  }

  // 🔥 ENHANCED: Format Recommendations for AI
  formatRecommendations(data) {
    const recommendations = [];

    if (data.strategicInsights) {
      const insights = data.strategicInsights;
      if (insights.marketPosition) recommendations.push(`Market Position: ${insights.marketPosition}`);
      if (insights.growthOpportunity) recommendations.push(`Growth Opportunity: ${insights.growthOpportunity}`);
      if (insights.competitiveAdvantage) recommendations.push(`Competitive Advantage: ${insights.competitiveAdvantage}`);
    }

    if (data.budgetGuidance) {
      const budget = data.budgetGuidance;
      if (budget.recommendedStarting) recommendations.push(`Recommended Daily Budget: €${budget.recommendedStarting}`);
      if (budget.monthlyRecommended) recommendations.push(`Monthly Budget: €${budget.monthlyRecommended}`);
    }

    if (data.nextSteps && Array.isArray(data.nextSteps)) {
      recommendations.push(...data.nextSteps);
    }

    return recommendations;
  }

  // 🔥 NEW: Generate Intelligence Summary
  generateIntelligenceSummary(keywordData, industryData) {
    const summary = [];

    if (keywordData) {
      const totalVolume = keywordData.marketOpportunity || 0;
      const keywordCount = keywordData.totalKeywordsFound || 0;
      const avgCpc = keywordData.avgCpcRange?.avg || '0.00';

      summary.push(`Market Intelligence: ${keywordCount} keywords analyzed with ${totalVolume.toLocaleString()} total monthly searches`);
      summary.push(`Average Market CPC: €${avgCpc}`);

      if (keywordData.highVolumeKeywords?.length > 0) {
        summary.push(`High-Volume Opportunities: ${keywordData.highVolumeKeywords.length} keywords with 1000+ monthly searches`);
      }

      if (keywordData.lowCompetitionKeywords?.length > 0) {
        summary.push(`Low-Competition Opportunities: ${keywordData.lowCompetitionKeywords.length} keywords for quick wins`);
      }
    }

    if (industryData && industryData.benchmarks) {
      const benchmarks = industryData.benchmarks;
      summary.push(`Industry Benchmarks: CTR ${benchmarks.avgCtr || 'N/A'}, CPC ${benchmarks.avgCpc || 'N/A'}, Conv Rate ${benchmarks.avgConversionRate || 'N/A'}`);
    }

    return summary;
  }

  // 🔥 NEW: Format Competitor Summary
  formatCompetitorSummary(competitorData) {
    const summary = [];

    summary.push(`Competitor Analysis: "${competitorData.competitor}" with ${competitorData.adActivity || 0} active ads`);

    if (competitorData.insights) {
      const insights = competitorData.insights;
      summary.push(`Activity Level: ${insights.activityLevel || 'Unknown'}`);
      summary.push(`Estimated Budget: ${insights.estimatedBudget || 'Unknown'}`);
      summary.push(`Primary Focus: ${insights.primaryFocus || 'Unknown'}`);
    }

    if (competitorData.opportunities && competitorData.opportunities.length > 0) {
      summary.push(`Opportunities: ${competitorData.opportunities.length} competitive gaps identified`);
    }

    return summary;
  }

  // 🔥 NEW: Format Performance Summary
  formatPerformanceSummary(performanceData) {
    const summary = [];
    const perf = performanceData.performance || {};

    summary.push(`Account Performance (${perf.period || 'Last 30 days'}): €${perf.totalSpend || '0.00'} spent`);
    summary.push(`Results: ${perf.clicks || 0} clicks, ${perf.conversions || 0} conversions`);
    summary.push(`Efficiency: ${perf.ctr || '0.00'}% CTR, €${perf.avgCpc || '0.00'} CPC`);

    if (performanceData.insights) {
      summary.push(`Performance Level: ${performanceData.insights.performanceLevel || 'Unknown'}`);
    }

    return summary;
  }

  // 🔥 NEW: Format Campaign Intelligence Summary
  formatCampaignIntelligenceSummary(intelligenceData) {
    const summary = [];

    if (intelligenceData.marketIntelligence) {
      const market = intelligenceData.marketIntelligence;
      summary.push(`Market Size: ${(market.totalMarketSize || 0).toLocaleString()} monthly searches`);
      summary.push(`Market CPC: €${market.avgMarketCpc || '0.00'} average`);
      summary.push(`Competition Level: ${market.competitionLevel || 'Unknown'}`);
    }

    if (intelligenceData.strategicInsights) {
      const insights = intelligenceData.strategicInsights;
      summary.push(`Market Position: ${insights.marketPosition || 'Unknown'}`);
      summary.push(`Growth Opportunity: ${insights.growthOpportunity || 'Unknown'}`);
    }

    if (intelligenceData.budgetGuidance) {
      const budget = intelligenceData.budgetGuidance;
      summary.push(`Recommended Budget: €${budget.recommendedStarting || '0'}/day (€${budget.monthlyRecommended || '0'}/month)`);
    }

    return summary;
  }

  // Generate Market Insights - Enhanced
  generateMarketInsights(keywordData, industryData) {
    const insights = [];

    // Keyword insights
    if (keywordData) {
      if (keywordData.highVolumeKeywords?.length > 5) {
        insights.push('Strong market demand with multiple high-volume keywords');
      }

      if (keywordData.lowCompetitionKeywords?.length > 3) {
        insights.push('Opportunity for quick wins with low-competition keywords');
      }

      if (keywordData.avgCpcRange && parseFloat(keywordData.avgCpcRange.avg) > 3.0) {
        insights.push('High-value market with premium CPC - focus on quality over quantity');
      }

      if (keywordData.competitionAnalysis) {
        const comp = keywordData.competitionAnalysis;
        const highCompPercentage = (comp.highCompetition || 0) / (keywordData.totalKeywordsFound || 1) * 100;
        if (highCompPercentage > 70) {
          insights.push('Highly competitive market - consider long-tail keyword strategy');
        }
      }
    }

    // Industry insights
    if (industryData && industryData.benchmarks) {
      const benchmarks = industryData.benchmarks;
      insights.push(`Industry average CTR: ${benchmarks.avgCtr || 'N/A'}`);
      insights.push(`Industry average CPC: ${benchmarks.avgCpc || 'N/A'}`);

      if (industryData.competitiveAnalysis) {
        insights.push(`Market maturity: ${industryData.competitiveAnalysis.marketMaturity || 'Unknown'}`);
      }
    }

    return insights;
  }

  // Quick Market Check for Marcus Chat - Enhanced
  async quickMarketCheck(keyword) {
    try {
      if (!keyword || typeof keyword !== 'string') {
        return null;
      }

      const response = await this.getMarketIntelligence([keyword.trim()]);

      if (response.success && response.data.keywords) {
        const keywordData = response.data.keywords.keywords?.[0] || response.data.keywords.topRecommendations?.[0];

        if (keywordData) {
          const volume = keywordData.avgMonthlySearches || keywordData.volume || 0;
          const cpc = keywordData.lowTopOfPageBid || keywordData.cpc || '0.00';
          const competition = keywordData.competition || 'Unknown';

          return {
            keyword: keywordData.keyword,
            volume: volume,
            cpc: cpc,
            competition: competition,
            summary: `"${keywordData.keyword}" has ${volume.toLocaleString()} monthly searches with €${cpc} CPC (${competition} competition)`
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Quick market check failed:', error);
      return null;
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('marcus_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // 🔥 NEW: Check service health
  async checkServiceHealth() {
    try {
      const response = await this.testConnection();
      return {
        healthy: response.status === 'connected',
        status: response.status,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const googleAdsClientService = new GoogleAdsClientService();

export default googleAdsClientService;