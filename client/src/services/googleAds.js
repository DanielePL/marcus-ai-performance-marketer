// client/src/services/googleAds.js
// Frontend Service für Google Ads API Integration mit Marcus AI

class GoogleAdsClientService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.apiEndpoint = `${this.baseURL}/api/google-ads`;
  }

  // Test Google Ads API Connection
  async testConnection() {
    try {
      console.log('🔌 Testing Google Ads connection...');

      const response = await fetch(`${this.apiEndpoint}/test-connection`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Google Ads API connected:', data.data);
        return { status: 'connected', data: data.data };
      } else {
        console.error('❌ Google Ads API failed:', data.error);
        return { status: 'error', message: data.error };
      }

    } catch (error) {
      console.error('❌ Google Ads connection error:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Get Market Intelligence for Marcus
  async getMarketIntelligence(keywords, businessInfo = {}) {
    try {
      console.log('🧠 Marcus requesting market intelligence for:', keywords);

      const keywordResponse = await fetch(`${this.apiEndpoint}/keyword-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });

      const keywordData = await keywordResponse.json();

      if (!keywordData.success) {
        throw new Error(keywordData.error);
      }

      // Get industry benchmarks if industry provided
      let industryData = null;
      if (businessInfo.industry) {
        const industryResponse = await fetch(`${this.apiEndpoint}/industry-benchmarks/${businessInfo.industry}`);
        const industryResult = await industryResponse.json();
        if (industryResult.success) {
          industryData = industryResult.data;
        }
      }

      // Combine intelligence for Marcus
      const marketIntelligence = {
        keywords: keywordData.data,
        industry: industryData,
        insights: this.generateMarketInsights(keywordData.data, industryData),
        timestamp: new Date().toISOString()
      };

      console.log('✅ Market intelligence ready for Marcus');
      return { success: true, data: marketIntelligence };

    } catch (error) {
      console.error('❌ Market intelligence failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Competitor Analysis for Marcus
  async getCompetitorIntelligence(domain, keywords = []) {
    try {
      console.log('🕵️ Marcus analyzing competitor:', domain);

      const response = await fetch(`${this.apiEndpoint}/competitor-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, keywords })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Competitor intelligence ready');
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('❌ Competitor analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Account Performance for Marcus
  async getAccountPerformance(days = 30) {
    try {
      console.log(`📊 Marcus requesting account performance (${days} days)`);

      const response = await fetch(`${this.apiEndpoint}/account-performance?days=${days}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Account performance ready');
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('❌ Account performance failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Complete Campaign Intelligence for Marcus
  async getCampaignIntelligence(businessInfo, keywords) {
    try {
      console.log('🚀 Marcus generating comprehensive campaign intelligence...');

      const response = await fetch(`${this.apiEndpoint}/campaign-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInfo, keywords })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Campaign intelligence ready for Marcus');
        return { success: true, data: data.data };
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('❌ Campaign intelligence failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate formatted data for Marcus AI prompts
  formatForMarcusAI(intelligenceData) {
    const formatted = {
      marketData: this.formatMarketData(intelligenceData),
      competitorData: this.formatCompetitorData(intelligenceData),
      performanceData: this.formatPerformanceData(intelligenceData),
      recommendations: this.formatRecommendations(intelligenceData)
    };

    return formatted;
  }

  // Helper: Format Market Data for AI
  formatMarketData(data) {
    if (!data || !data.keywords) return null;

    const keywords = data.keywords;
    return {
      summary: `Analyzed ${keywords.totalKeywordsFound} keywords with ${keywords.highVolumeKeywords.length} high-volume opportunities`,
      topKeywords: keywords.keywords.slice(0, 5).map(k =>
        `"${k.keyword}" (${k.avgMonthlySearches} searches/month, €${k.lowTopOfPageBid} CPC)`
      ),
      marketSize: `Total market opportunity: ${keywords.marketOpportunity.toLocaleString()} monthly searches`,
      cpcRange: `CPC Range: €${keywords.avgCpcRange.min} - €${keywords.avgCpcRange.max} (Avg: €${keywords.avgCpcRange.avg})`,
      opportunities: keywords.lowCompetitionKeywords.length > 0 ?
        `${keywords.lowCompetitionKeywords.length} low-competition keywords identified` :
        'High competition market - focus on long-tail keywords'
    };
  }

  // Helper: Format Competitor Data for AI
  formatCompetitorData(data) {
    if (!data || !data.competitor) return null;

    return {
      summary: `Competitor "${data.competitor}" has ${data.adActivity} active ads`,
      strategy: data.competitorStrategy ? {
        avgCpc: `Average CPC: €${data.competitorStrategy.avgCpc}`,
        topHeadlines: data.competitorStrategy.topHeadlines.slice(0, 3),
        campaigns: data.competitorStrategy.campaignThemes.slice(0, 3)
      } : null,
      insights: data.insights ?
        `Activity Level: ${data.insights.adVolume}, Budget: ${data.insights.estimatedBudget}` : null
    };
  }

  // Helper: Format Performance Data for AI
  formatPerformanceData(data) {
    if (!data || !data.performance) return null;

    const perf = data.performance;
    return {
      summary: `Last ${perf.period}: ${perf.clicks} clicks, ${perf.conversions} conversions`,
      metrics: {
        ctr: `CTR: ${perf.ctr}%`,
        cpc: `CPC: €${perf.avgCpc}`,
        spend: `Total Spend: €${perf.totalSpend}`,
        conversionRate: `Conversion Rate: ${perf.conversionRate}%`
      },
      performance: data.insights ? data.insights.performanceLevel : 'Unknown',
      trends: data.trends ?
        `Daily: €${data.trends.dailySpend} spend, ${data.trends.dailyClicks} clicks` : null
    };
  }

  // Helper: Format Recommendations for AI
  formatRecommendations(data) {
    const recommendations = [];

    if (data.strategicInsights) {
      const insights = data.strategicInsights;
      recommendations.push(`Market Position: ${insights.marketPosition}`);
      recommendations.push(`Growth Opportunity: ${insights.growthOpportunity}`);
      recommendations.push(`Competitive Advantage: ${insights.competitiveAdvantage}`);
    }

    if (data.budgetGuidance) {
      const budget = data.budgetGuidance;
      recommendations.push(`Recommended Daily Budget: €${budget.recommendedDaily}`);
      recommendations.push(`Monthly Budget: €${budget.monthlyRecommended}`);
    }

    if (data.nextSteps) {
      recommendations.push(...data.nextSteps);
    }

    return recommendations;
  }

  // Generate Market Insights
  generateMarketInsights(keywordData, industryData) {
    const insights = [];

    // Keyword insights
    if (keywordData) {
      if (keywordData.highVolumeKeywords.length > 5) {
        insights.push('Strong market demand with multiple high-volume keywords');
      }

      if (keywordData.lowCompetitionKeywords.length > 3) {
        insights.push('Opportunity for quick wins with low-competition keywords');
      }

      if (parseFloat(keywordData.avgCpcRange.avg) > 3.0) {
        insights.push('High-value market with premium CPC - focus on quality over quantity');
      }
    }

    // Industry insights
    if (industryData) {
      insights.push(`Industry average CTR: ${industryData.benchmarks.avgCtr}`);
      insights.push(`Competition level: ${industryData.competitiveAnalysis.cpcLevel}`);
    }

    return insights;
  }

  // Quick Market Check for Marcus Chat
  async quickMarketCheck(keyword) {
    try {
      const response = await this.getMarketIntelligence([keyword]);

      if (response.success && response.data.keywords) {
        const keywordData = response.data.keywords.keywords[0];

        if (keywordData) {
          return {
            keyword: keywordData.keyword,
            volume: keywordData.avgMonthlySearches,
            cpc: keywordData.lowTopOfPageBid,
            competition: keywordData.competition,
            summary: `"${keywordData.keyword}" has ${keywordData.avgMonthlySearches.toLocaleString()} monthly searches with €${keywordData.lowTopOfPageBid} CPC (${keywordData.competition} competition)`
          };
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Quick market check failed:', error);
      return null;
    }
  }
}

// Singleton instance
const googleAdsClientService = new GoogleAdsClientService();

export default googleAdsClientService;