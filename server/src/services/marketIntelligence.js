// client/src/services/marketIntelligence.js
// MARCUS AI - Market Intelligence Frontend Service

class MarketIntelligenceService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.apiEndpoint = `${this.baseURL}/api/market-intelligence`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('marcus_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Live Keyword Research - Marcus' Market Eyes
  async researchKeywords(keywords, options = {}) {
    try {
      console.log('🔍 Marcus researching market for:', keywords);

      const response = await fetch(`${this.apiEndpoint}/keyword-research`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ keywords, options })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus found market intelligence:', data.data);
        return { success: true, data: data.data };
      } else {
        console.error('❌ Market research failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Market research error:', error);
      return { success: false, error: error.message };
    }
  }

  // Competitor Analysis - Marcus' Spy Mode
  async analyzeCompetitor(domain, maxKeywords = 100) {
    try {
      console.log('🕵️ Marcus spying on competitor:', domain);

      const response = await fetch(`${this.apiEndpoint}/competitor-analysis`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ domain, maxKeywords })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus completed competitor analysis');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Competitor analysis failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Competitor analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Industry Trends - Marcus' Crystal Ball
  async getTrendingKeywords(industry, timeframe = '30d') {
    try {
      console.log('📈 Marcus analyzing trends for:', industry);

      const response = await fetch(`${this.apiEndpoint}/trending/${industry}?timeframe=${timeframe}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus identified trending opportunities');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Trend analysis failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Trend analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Market Opportunity Finder - Marcus' Strategic Brain
  async findOpportunities(businessInfo, targetBudget, goals) {
    try {
      console.log('🎯 Marcus finding market opportunities...');

      const response = await fetch(`${this.apiEndpoint}/opportunity-finder`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ businessInfo, targetBudget, goals })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus identified strategic opportunities');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Opportunity finder failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Opportunity finder error:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete Market Overview - Marcus' Full Intelligence
  async getMarketOverview(industry, location = 'DE', budget = null) {
    try {
      console.log('📊 Marcus creating complete market overview...');

      const params = new URLSearchParams({ location });
      if (budget) params.append('budget', budget);

      const response = await fetch(`${this.apiEndpoint}/market-overview/${industry}?${params}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus completed market overview');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Market overview failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Market overview error:', error);
      return { success: false, error: error.message };
    }
  }

  // Keyword Gap Analysis - Marcus' Competitive Intelligence
  async analyzeKeywordGaps(yourKeywords, competitorDomains) {
    try {
      console.log('🔍 Marcus analyzing keyword gaps...');

      const response = await fetch(`${this.apiEndpoint}/keyword-gap-analysis`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ yourKeywords, competitorDomains })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Marcus identified keyword gaps');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Gap analysis failed:', data.message);
        return { success: false, error: data.message };
      }

    } catch (error) {
      console.error('❌ Gap analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Quick Market Check for Marcus Chat
  async quickMarketCheck(keyword) {
    try {
      const result = await this.researchKeywords([keyword]);

      if (result.success && result.data.keywords.length > 0) {
        const keywordData = result.data.keywords[0];

        return {
          keyword: keywordData.keyword,
          volume: keywordData.avgMonthlySearches,
          cpc: keywordData.lowTopOfPageBid,
          competition: keywordData.competition,
          summary: `"${keywordData.keyword}" hat ${keywordData.avgMonthlySearches.toLocaleString()} monatliche Suchanfragen mit €${keywordData.lowTopOfPageBid} CPC (${keywordData.competition} Competition)`
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Quick market check failed:', error);
      return null;
    }
  }

  // Format Market Data for Marcus AI Chat
  formatForMarcusChat(marketData) {
    if (!marketData) return 'Keine Marktdaten verfügbar';

    const formatted = [];

    // Market Summary
    if (marketData.keywords) {
      formatted.push(`🔍 MARKTANALYSE: ${marketData.totalKeywordsFound} Keywords gefunden`);

      if (marketData.analysis) {
        const analysis = marketData.analysis;
        formatted.push(`📊 High-Volume Keywords: ${analysis.highVolumeKeywords.length}`);
        formatted.push(`🎯 Quick-Win Opportunities: ${analysis.quickWins.length}`);
        formatted.push(`💰 Durchschnittlicher CPC: €${analysis.avgCpcRange.avg.toFixed(2)}`);
      }
    }

    // Top Keywords
    if (marketData.keywords && marketData.keywords.length > 0) {
      formatted.push('\n🏆 TOP KEYWORDS:');
      marketData.keywords.slice(0, 5).forEach((keyword, index) => {
        formatted.push(`${index + 1}. "${keyword.keyword}" - ${keyword.avgMonthlySearches.toLocaleString()} Suchanfragen/Monat (€${keyword.lowTopOfPageBid} CPC)`);
      });
    }

    // Marcus Insights
    if (marketData.marcusInsights) {
      formatted.push('\n🤖 MARCUS INSIGHTS:');
      marketData.marcusInsights.forEach(insight => {
        formatted.push(`${this.getInsightIcon(insight.type)} ${insight.message}`);
      });
    }

    // Recommendations
    if (marketData.recommendations) {
      formatted.push('\n💡 EMPFEHLUNGEN:');
      marketData.recommendations.forEach(rec => {
        formatted.push(`• ${rec.title}: ${rec.description}`);
      });
    }

    return formatted.join('\n');
  }

  // Get icon for insight type
  getInsightIcon(type) {
    const icons = {
      opportunity: '🎯',
      warning: '⚠️',
      strategy: '📋',
      competitive_analysis: '🕵️',
      trending: '📈'
    };
    return icons[type] || '💡';
  }

  // Format Competitor Data for Marcus Chat
  formatCompetitorDataForChat(competitorData) {
    if (!competitorData) return 'Keine Konkurrenz-Daten verfügbar';

    const formatted = [];

    formatted.push(`🕵️ KONKURRENZANALYSE: ${competitorData.competitorDomain}`);
    formatted.push(`📊 Keywords gefunden: ${competitorData.keywords.length}`);

    if (competitorData.keywords.length > 0) {
      formatted.push('\n🏆 TOP KONKURRENZ-KEYWORDS:');
      competitorData.keywords.slice(0, 5).forEach((keyword, index) => {
        formatted.push(`${index + 1}. "${keyword.keyword}" - ${keyword.avgMonthlySearches.toLocaleString()} Suchanfragen`);
      });
    }

    if (competitorData.marcusInsights) {
      formatted.push('\n🤖 MARCUS ANALYSE:');
      competitorData.marcusInsights.forEach(insight => {
        formatted.push(`${this.getInsightIcon(insight.type)} ${insight.message}`);
      });
    }

    return formatted.join('\n');
  }

  // Get Market Intelligence Status for Dashboard
  async getIntelligenceStatus() {
    try {
      // Test connection by doing a simple keyword check
      const testResult = await this.researchKeywords(['test']);

      return {
        status: testResult.success ? 'online' : 'offline',
        capabilities: [
          'Live Keyword Research',
          'Competitor Analysis',
          'Trend Detection',
          'Market Opportunities',
          'Gap Analysis'
        ],
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
        capabilities: []
      };
    }
  }

  // Generate Market Intelligence Summary for Marcus
  generateIntelligenceSummary(data) {
    const summary = {
      level: 'basic',
      score: 0,
      capabilities: [],
      recommendations: []
    };

    if (data.keywords && data.keywords.length > 0) {
      summary.score += 25;
      summary.capabilities.push('Keyword Research');
    }

    if (data.analysis && data.analysis.quickWins.length > 0) {
      summary.score += 25;
      summary.capabilities.push('Opportunity Detection');
    }

    if (data.marcusInsights && data.marcusInsights.length > 0) {
      summary.score += 25;
      summary.capabilities.push('Strategic Analysis');
    }

    if (data.recommendations && data.recommendations.length > 0) {
      summary.score += 25;
      summary.capabilities.push('Action Planning');
    }

    // Determine intelligence level
    if (summary.score >= 75) {
      summary.level = 'maximum';
      summary.description = 'Full Market Intelligence Active';
    } else if (summary.score >= 50) {
      summary.level = 'advanced';
      summary.description = 'Advanced Market Intelligence';
    } else if (summary.score >= 25) {
      summary.level = 'basic';
      summary.description = 'Basic Market Intelligence';
    } else {
      summary.level = 'offline';
      summary.description = 'Market Intelligence Offline';
    }

    return summary;
  }
}

// Singleton instance
const marketIntelligenceService = new MarketIntelligenceService();

export default marketIntelligenceService;