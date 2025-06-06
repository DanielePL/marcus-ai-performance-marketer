// client/src/services/googleAds.js
// Frontend Service für Google Ads API Integration mit Marcus AI
// 🔥 VOLLSTÄNDIG REPARIERT - Korrekte URL Construction & API Routes + FIXED keywordIdeas.filter

class GoogleAdsClientService {
  constructor() {
    // 🔥 KORREKTE URL CONSTRUCTION:
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.apiEndpoint = `${this.baseURL}/api/google-ads`;  // Korrekt: /api/google-ads
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

  // 🔥 ENHANCED: Get Market Intelligence for Marcus with FIXED keywordIdeas.filter
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

      // 🔥 FIXED: Defensive extraction of keyword array from API response
      let keywordIdeas = [];

      if (keywordData.data) {
        // Check multiple possible response formats
        if (Array.isArray(keywordData.data)) {
          // Direct array: keywordData.data = [...]
          keywordIdeas = keywordData.data;
        } else if (keywordData.data.keywords && Array.isArray(keywordData.data.keywords)) {
          // Nested array: keywordData.data = { keywords: [...] }
          keywordIdeas = keywordData.data.keywords;
        } else if (keywordData.data.results && Array.isArray(keywordData.data.results)) {
          // Alternative format: keywordData.data = { results: [...] }
          keywordIdeas = keywordData.data.results;
        }
      }

      // 🛡️ Safety check: Ensure we have a valid array
      if (!Array.isArray(keywordIdeas)) {
        console.warn('⚠️ keywordIdeas is not an array:', keywordIdeas);
        keywordIdeas = [];
      }

      console.log(`✅ Extracted ${keywordIdeas.length} keyword ideas for processing`);

      // 🔥 NOW SAFE: Filter and process keywords
      const highVolumeKeywords = keywordIdeas.filter(keyword => {
        const volume = keyword.avgMonthlySearches || keyword.volume || 0;
        return volume >= 1000;
      });

      const lowCompetitionKeywords = keywordIdeas.filter(keyword => {
        const competition = keyword.competition || keyword.competitionLevel || 'UNKNOWN';
        return competition === 'LOW' || competition === 'low' || competition === 'Low';
      });

      const topRecommendations = keywordIdeas
        .filter(keyword => (keyword.avgMonthlySearches || keyword.volume || 0) > 100)
        .sort((a, b) => (b.avgMonthlySearches || b.volume || 0) - (a.avgMonthlySearches || a.volume || 0))
        .slice(0, 10);

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

      // Calculate market metrics
      const totalVolume = keywordIdeas.reduce((sum, keyword) => {
        return sum + (keyword.avgMonthlySearches || keyword.volume || 0);
      }, 0);

      const averageCpc = keywordIdeas.reduce((sum, keyword) => {
        const cpc = keyword.lowTopOfPageBid || keyword.highTopOfPageBid || keyword.cpc || 0;
        return sum + parseFloat(cpc);
      }, 0) / Math.max(keywordIdeas.length, 1);

      // Combine intelligence for Marcus
      const marketIntelligence = {
        keywords: {
          all: keywordIdeas,
          topRecommendations: topRecommendations,
          highVolumeKeywords: highVolumeKeywords,
          lowCompetitionKeywords: lowCompetitionKeywords,
          totalKeywordsFound: keywordIdeas.length,
          marketOpportunity: totalVolume,
          avgCpcRange: {
            avg: averageCpc.toFixed(2)
          },
          competitionAnalysis: {
            lowCompetition: lowCompetitionKeywords.length,
            highCompetition: keywordIdeas.filter(k => {
              const comp = k.competition || 'UNKNOWN';
              return comp === 'HIGH' || comp === 'high' || comp === 'High';
            }).length
          }
        },
        industry: industryData,
        insights: this.generateMarketInsights({
          highVolumeKeywords,
          lowCompetitionKeywords,
          avgCpcRange: { avg: averageCpc.toFixed(2) },
          totalKeywordsFound: keywordIdeas.length,
          competitionAnalysis: {
            highCompetition: keywordIdeas.filter(k => {
              const comp = k.competition || 'UNKNOWN';
              return comp === 'HIGH' || comp === 'high' || comp === 'High';
            }).length
          }
        }, industryData),
        summary: this.generateIntelligenceSummary({
          marketOpportunity: totalVolume,
          totalKeywordsFound: keywordIdeas.length,
          avgCpcRange: { avg: averageCpc.toFixed(2) },
          highVolumeKeywords,
          lowCompetitionKeywords
        }, industryData),
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

  // Quick Market Check for Marcus Chat - Enhanced with DEFENSIVE programming
  async quickMarketCheck(keyword) {
    try {
      if (!keyword || typeof keyword !== 'string') {
        return null;
      }

      const response = await this.getMarketIntelligence([keyword.trim()]);

      if (response.success && response.data.keywords) {
        // 🛡️ Defensive extraction from multiple possible formats
        let keywordData = null;

        if (response.data.keywords.keywords && Array.isArray(response.data.keywords.keywords)) {
          keywordData = response.data.keywords.keywords[0];
        } else if (response.data.keywords.topRecommendations && Array.isArray(response.data.keywords.topRecommendations)) {
          keywordData = response.data.keywords.topRecommendations[0];
        } else if (response.data.keywords.all && Array.isArray(response.data.keywords.all)) {
          keywordData = response.data.keywords.all[0];
        }

        if (keywordData) {
          const volume = keywordData.avgMonthlySearches || keywordData.volume || 0;
          const cpc = keywordData.lowTopOfPageBid || keywordData.cpc || '0.00';
          const competition = keywordData.competition || 'Unknown';

          return {
            keyword: keywordData.keyword || keywordData.text || keyword,
            volume: volume,
            cpc: cpc,
            competition: competition,
            summary: `"${keywordData.keyword || keyword}" has ${volume.toLocaleString()} monthly searches with €${cpc} CPC (${competition} competition)`
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Quick market check failed:', error);
      return null;
    }
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