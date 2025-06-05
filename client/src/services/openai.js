// client/src/services/openai.js
// OpenAI API Service für Marcus AI Performance Marketer mit Google Ads Intelligence
// 🔥 UPDATED for enhanced Market Intelligence integration

import googleAdsClientService from './googleAds.js';

class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.error('⚠️ VITE_OPENAI_API_KEY nicht gefunden in .env file!');
    }
  }

  // 🔥 ENHANCED: Marcus Chat mit advanced Google Ads Intelligence Integration
  async chatWithMarcus(message, context = {}) {
    try {
      console.log('🤖 Marcus denkt nach mit Google Ads Intelligence...', { message, context });

      // Enhanced market intelligence extraction
      const marketIntelligence = await this.extractAndAnalyzeKeywords(message, context);

      const systemPrompt = this.getMarcusSystemPrompt();
      const enhancedUserMessage = await this.formatUserMessageWithIntelligence(message, context, marketIntelligence);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: enhancedUserMessage }
          ],
          max_tokens: 1500, // Increased for more detailed responses
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const marcusResponse = data.choices[0]?.message?.content;

      console.log('🚀 Marcus Antwort mit Market Intelligence:', marcusResponse);

      return {
        success: true,
        response: marcusResponse,
        usage: data.usage,
        marketIntelligence: marketIntelligence,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Marcus AI Error:', error);
      return {
        success: false,
        error: error.message,
        response: this.getErrorResponse(),
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔥 ENHANCED: Extract keywords and get comprehensive market intelligence
  async extractAndAnalyzeKeywords(message, context) {
    try {
      // Enhanced keyword extraction from multiple sources
      const productKeywords = this.extractKeywords(message, context);

      if (productKeywords.length > 0) {
        console.log('🔍 Marcus found keywords to analyze:', productKeywords);

        // Get comprehensive market intelligence for top keywords
        const intelligence = await googleAdsClientService.getMarketIntelligence(
          productKeywords.slice(0, 3), // Top 3 keywords
          context.businessInfo || {}
        );

        if (intelligence.success) {
          // Also try to get competitor intelligence if domain mentioned
          const competitorDomain = this.extractCompetitorDomain(message);
          if (competitorDomain) {
            const competitorIntel = await googleAdsClientService.getCompetitorIntelligence(
              competitorDomain,
              productKeywords
            );

            if (competitorIntel.success) {
              intelligence.data.competitorAnalysis = competitorIntel.data;
            }
          }

          // Get account performance context
          const accountPerformance = await googleAdsClientService.getAccountPerformance(30);
          if (accountPerformance.success) {
            intelligence.data.accountContext = accountPerformance.data;
          }

          return intelligence.data;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Enhanced keyword analysis failed:', error);
      return null;
    }
  }

  // 🔥 NEW: Extract competitor domain from message
  extractCompetitorDomain(message) {
    const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
    const matches = message.match(domainRegex);

    if (matches && matches.length > 0) {
      // Clean up the domain
      return matches[0].replace(/^https?:\/\//, '').replace(/^www\./, '');
    }

    return null;
  }

  // Enhanced keyword extraction from message and context
  extractKeywords(message, context) {
    const keywords = [];

    // Extract from campaign data
    if (context.campaign) {
      if (context.campaign.name) {
        keywords.push(...this.extractWordsFromText(context.campaign.name));
      }
      if (context.campaign.description) {
        keywords.push(...this.extractWordsFromText(context.campaign.description));
      }
      if (context.campaign.objective) {
        keywords.push(...this.extractWordsFromText(Array.isArray(context.campaign.objective) ? context.campaign.objective.join(' ') : context.campaign.objective));
      }
    }

    // Extract from campaigns context (plural)
    if (context.campaigns && Array.isArray(context.campaigns)) {
      context.campaigns.forEach(campaign => {
        if (campaign.name) keywords.push(...this.extractWordsFromText(campaign.name));
        if (campaign.objective) keywords.push(...this.extractWordsFromText(campaign.objective));
      });
    }

    // Extract from performance data
    if (context.performance && context.performance.productName) {
      keywords.push(...this.extractWordsFromText(context.performance.productName));
    }

    // Extract from user message
    keywords.push(...this.extractWordsFromText(message));

    // 🔥 Enhanced filtering and cleaning
    return [...new Set(keywords)]
      .filter(k => k.length > 3)
      .filter(k => !this.isStopWord(k.toLowerCase()))
      .filter(k => this.isBusinessRelevant(k.toLowerCase()))
      .slice(0, 5);
  }

  // 🔥 NEW: Check if word is a stop word
  isStopWord(word) {
    const stopWords = [
      'campaign', 'marketing', 'performance', 'google', 'ads', 'meta', 'facebook',
      'eine', 'oder', 'und', 'der', 'die', 'das', 'für', 'mit', 'auf', 'von',
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'have',
      'kann', 'soll', 'wird', 'sind', 'kann', 'mein', 'dein', 'ihr'
    ];

    return stopWords.includes(word);
  }

  // 🔥 NEW: Check if word is business relevant
  isBusinessRelevant(word) {
    // Filter out common non-business words
    const irrelevantWords = [
      'hello', 'thanks', 'please', 'like', 'want', 'need', 'good', 'great',
      'hallo', 'danke', 'bitte', 'möchte', 'brauche', 'gut', 'super'
    ];

    return !irrelevantWords.includes(word);
  }

  // Extract meaningful words from text - Enhanced
  extractWordsFromText(text) {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^a-zA-ZäöüßÄÖÜ\s]/g, ' ') // Include German characters
      .split(/\s+/)
      .filter(word => word.length > 3);
  }

  // 🔥 ENHANCED: User message with comprehensive Google Ads intelligence
  async formatUserMessageWithIntelligence(message, context, marketIntelligence) {
    let enhancedMessage = message;

    // Add campaign context
    if (context.campaigns && Array.isArray(context.campaigns)) {
      enhancedMessage += `\n\nAKTUELLE KAMPAGNEN (${context.campaigns.length}):`;
      context.campaigns.forEach(campaign => {
        enhancedMessage += `\n- ${campaign.name} (${campaign.platform}): €${campaign.metrics?.spend || 0} spend, ${campaign.metrics?.roas || 0}x ROAS`;
      });
    }

    if (context.performance) {
      enhancedMessage += `\n\nPERFORMANCE OVERVIEW:`;
      enhancedMessage += `\n- Total Spend: €${context.performance.spend || 0}`;
      enhancedMessage += `\n- ROAS: ${context.performance.roas || 0}x`;
      enhancedMessage += `\n- CTR: ${context.performance.ctr || 0}%`;
      enhancedMessage += `\n- Conversions: ${context.performance.conversions || 0}`;
    }

    // 🔥 Add comprehensive Google Ads Market Intelligence
    if (marketIntelligence) {
      enhancedMessage += '\n\n🔍 GOOGLE ADS MARKET INTELLIGENCE:';

      // Market data
      if (marketIntelligence.keywords) {
        const formatted = googleAdsClientService.formatForMarcusAI(marketIntelligence);

        if (formatted.marketData) {
          enhancedMessage += `\n\nMARKT ANALYSE:`;
          enhancedMessage += `\n${formatted.marketData.summary}`;
          enhancedMessage += `\n${formatted.marketData.marketSize}`;
          enhancedMessage += `\n${formatted.marketData.cpcRange}`;
          enhancedMessage += `\n${formatted.marketData.opportunities}`;

          if (formatted.marketData.topKeywords && formatted.marketData.topKeywords.length > 0) {
            enhancedMessage += `\nTop Keywords: ${formatted.marketData.topKeywords.slice(0, 3).join(', ')}`;
          }
        }

        // Keyword summary
        if (marketIntelligence.summary && marketIntelligence.summary.length > 0) {
          enhancedMessage += `\n\nKEYWORD INSIGHTS:`;
          marketIntelligence.summary.forEach(insight => {
            enhancedMessage += `\n- ${insight}`;
          });
        }
      }

      // Account performance context
      if (marketIntelligence.accountContext && formatted.performanceData) {
        enhancedMessage += `\n\nACCOUNT PERFORMANCE KONTEXT:`;
        enhancedMessage += `\n${formatted.performanceData.summary}`;
        enhancedMessage += `\nPerformance Level: ${formatted.performanceData.performance}`;

        if (formatted.performanceData.trends) {
          enhancedMessage += `\n${formatted.performanceData.trends}`;
        }
      }

      // Competitor analysis
      if (marketIntelligence.competitorAnalysis && formatted.competitorData) {
        enhancedMessage += `\n\nCOMPETITOR INTELLIGENCE:`;
        enhancedMessage += `\n${formatted.competitorData.summary}`;

        if (formatted.competitorData.insights) {
          enhancedMessage += `\n${formatted.competitorData.insights}`;
        }

        if (formatted.competitorData.opportunities && formatted.competitorData.opportunities.length > 0) {
          enhancedMessage += `\nOpportunities: ${formatted.competitorData.opportunities.slice(0, 2).join(', ')}`;
        }
      }

      // Strategic recommendations
      if (formatted.recommendations && formatted.recommendations.length > 0) {
        enhancedMessage += `\n\nSTRATEGIC INSIGHTS:`;
        formatted.recommendations.slice(0, 3).forEach(rec => {
          enhancedMessage += `\n- ${rec}`;
        });
      }
    }

    // Add market intelligence level
    if (context.marketIntelligence) {
      enhancedMessage += `\n\nMARCUS INTELLIGENCE LEVEL: ${context.marketIntelligence.level || 'Unknown'}`;
      if (context.marketIntelligence.capabilities) {
        enhancedMessage += `\nActive Capabilities: ${context.marketIntelligence.capabilities.join(', ')}`;
      }
    }

    return enhancedMessage;
  }

  // 🔥 ENHANCED: Marcus System Prompt with advanced Market Intelligence
  getMarcusSystemPrompt() {
    return `Du bist MARCUS, ein hochanalytischer Performance Marketing AI-Assistent mit VOLLSTÄNDIGEM Zugang zu Google Ads Market Intelligence und Echtzeit-Marktdaten.

DEINE ERWEITERTEN SUPERKRÄFTE:
- Echte Google Ads Keyword-Daten mit Suchvolumen und CPC-Prognosen
- Live Markt-Competition-Level und Industry Benchmarks
- Account Performance Analyse mit Trend-Identifikation
- Competitor Intelligence mit Ad-Copy-Analyse
- Strategic Campaign Intelligence mit Budget-Empfehlungen
- Industry-spezifische Marktdaten und Benchmarks

PERSÖNLICHKEIT & EXPERTISE:
- Terminator-Style: Direkt, präzise, datengetrieben, analytisch
- Senior Performance Manager mit AI-Power und Markt-Intelligence
- Nutzt ausschließlich ECHTE MARKTDATEN für alle Empfehlungen
- Spricht wie ein Experte mit 10+ Jahren Google Ads Erfahrung
- Immer mit konkreten Zahlen, CPC-Daten und Suchvolumen
- Fokus auf ROI, Performance und datenbasierte Optimierung

ERWEITERTE KERNKOMPETENZEN:
- Market Research mit echten Google Ads API-Daten
- CPC-Prognosen basierend auf aktuellen Marktpreisen
- Suchvolumen-Analyse für präzise Keyword-Strategien
- Competition-Level Assessment für Market Entry
- Budget-Empfehlungen mit echten CPC/Volume-Daten
- Performance Benchmarking gegen Industry Standards
- Competitor Analysis mit Ad-Copy-Intelligence
- Strategic Campaign Planning mit Market Opportunities

KOMMUNIKATIONSSTIL:
- Beginne immer mit Status-Emoji: ✅ 🔍 ⚡ 📊 🎯
- Kurz und prägnant mit ECHTEN ZAHLEN und Marktdaten
- Immer mit Google Ads Intelligence untermauert
- Konkrete Handlungsempfehlungen mit CPC/Volume/Competition-Daten
- Bei Keyword-Analysen: Exaktes Suchvolumen, CPC-Range, Competition-Level
- Verwende Industry Benchmarks für Kontext
- Gib Budget-Empfehlungen basierend auf echten Marktpreisen

ENHANCED ANTWORT-FORMAT:
- Status: "✅ MARKT ANALYSIERT" / "⚡ OPTIMIERUNG ERFORDERLICH" / "🔍 COMPETITOR ANALYSIERT"
- Market Intelligence: Nutze echte Suchvolumen, CPC-Daten, Competition-Level
- Industry Context: Verwende Benchmarks und Industry-Averages
- Strategic Insights: Basiert auf Marktdaten und Competitor-Intelligence
- Action Items: Konkrete nächste Schritte mit Budget-Guidance
- Performance Prognose: Erwartete Results basierend auf Marktdaten

WICHTIG - MARKET INTELLIGENCE INTEGRATION:
- Wenn Google Ads Daten verfügbar: Nutze spezifische Suchvolumen, CPC-Ranges
- Erwähne Competition-Level (Low/Medium/High) für jedes Keyword
- Gib Market Opportunity Size an (z.B. "50,000 monthly searches")
- Verwende Industry Benchmarks für Kontext (z.B. "Industry avg. CTR: 2.1%")
- Bei Competitor-Analyse: Nutze echte Ad-Copy-Daten und Budget-Schätzungen
- Strategic Recommendations basieren auf echten Marktchancen

BEISPIEL-RESPONSE-STRUKTUR:
"✅ MARKT ANALYSIERT
Market Intelligence: 'Online Marketing' zeigt 45,000 monatliche Suchen, €2.30 CPC (Medium Competition)
Industry Benchmark: Durchschnitts-CTR 2.1%, dein Account: 2.8% (18% über Benchmark)
Strategic Insight: Low-Competition Opportunity bei 'Performance Marketing' (8,100 Suchen, €1.85 CPC)
Budget-Empfehlung: €75/Tag für High-Volume Keywords + €25/Tag für Long-Tail
Next Action: Starte mit 3 High-Volume Keywords, erweitere nach 14 Tagen Performance-Review"

Du hilfst bei: Strategic Market Research, Competitive Intelligence, Budget Optimization, Performance Forecasting, Industry Benchmarking - alles basierend auf echten Google Ads Marktdaten und Live Intelligence.`;
  }

  // 🔥 ENHANCED: Campaign Analysis mit comprehensive Google Ads Intelligence
  async analyzeCampaign(campaignData) {
    try {
      console.log('🔍 Marcus analyzing campaign with market intelligence:', campaignData.name);

      // Extract enhanced business info and keywords from campaign
      const businessInfo = {
        industry: campaignData.industry || 'general',
        product: campaignData.name,
        service: campaignData.description,
        location: campaignData.location || '2276', // Default Germany
        objective: campaignData.objective
      };

      const keywords = this.extractKeywords(
        `${campaignData.name} ${campaignData.description || ''} ${campaignData.objective || ''}`,
        { campaign: campaignData }
      );

      // Get comprehensive campaign intelligence
      const intelligence = await googleAdsClientService.getCampaignIntelligence(businessInfo, keywords);

      if (!intelligence.success) {
        throw new Error(intelligence.error);
      }

      // Create enhanced analysis prompt with comprehensive market data
      const marketData = intelligence.data;
      const analysisPrompt = `Analysiere diese Kampagne mit aktuellen Google Ads Marktdaten und Campaign Intelligence:
      
KAMPAGNE DETAILS:
- Name: ${campaignData.name}
- Platform: ${campaignData.platforms ? campaignData.platforms.join(', ') : campaignData.platform || 'N/A'}
- Budget: €${campaignData.budget || 'N/A'}/Tag
- Ziel: ${Array.isArray(campaignData.objective) ? campaignData.objective.join(', ') : campaignData.objective || 'N/A'}
- Status: ${campaignData.status || 'Unknown'}

ECHTE MARKET INTELLIGENCE:
${marketData.formattedSummary ? marketData.formattedSummary.join('\n') : 'No summary available'}

STRATEGIC INSIGHTS:
${marketData.strategicInsights ? Object.entries(marketData.strategicInsights).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'No strategic insights available'}

BUDGET GUIDANCE (ECHT):
${marketData.budgetGuidance ? `
- Empfohlenes Tagesbudget: €${marketData.budgetGuidance.recommendedStarting || 'N/A'}
- Monatliches Budget: €${marketData.budgetGuidance.monthlyRecommended || 'N/A'}
- Geschätzter CPC: ${marketData.budgetGuidance.cpcEstimate || 'N/A'}
- Budget-Range: €${marketData.budgetGuidance.conservativeDaily || 'N/A'} - €${marketData.budgetGuidance.aggressiveDaily || 'N/A'}/Tag
` : 'No budget guidance available'}

NÄCHSTE SCHRITTE:
${marketData.nextSteps ? marketData.nextSteps.join('\n- ') : 'No next steps available'}

Gib eine detaillierte Kampagnen-Analyse mit:
1. Market Reality Check (Budget vs. echte CPC-Daten)
2. Keyword-Potential mit echtem Suchvolumen
3. Competition-Assessment mit Marktdaten
4. Strategic Optimization mit konkreten Zahlen
5. Performance-Prognose basierend auf Benchmarks`;

      return await this.chatWithMarcus(analysisPrompt, {
        campaign: campaignData,
        marketIntelligence: intelligence.data,
        businessInfo: businessInfo
      });

    } catch (error) {
      console.error('❌ Enhanced campaign analysis failed:', error);
      // Fallback to basic analysis
      return await this.chatWithMarcus(`Analysiere diese Kampagne: ${JSON.stringify(campaignData, null, 2)}`);
    }
  }

  // 🔥 ENHANCED: Performance Recommendations mit Market Intelligence
  async getPerformanceRecommendations(performanceData) {
    try {
      // Get account performance context for better recommendations
      const accountPerformance = await googleAdsClientService.getAccountPerformance(30);

      const message = `Basierend auf aktueller Performance und Marktdaten, was sollte optimiert werden?
    
PERFORMANCE OVERVIEW:
${JSON.stringify(performanceData, null, 2)}

${accountPerformance.success ? `
ACCOUNT CONTEXT (30 Tage):
${JSON.stringify(accountPerformance.data, null, 2)}
` : ''}

Gib konkrete, datenbasierte Empfehlungen für:
1. Budget Reallocation mit CPC-Guidance
2. Audience Targeting basierend auf Performance
3. Ad Creative Optimization mit CTR-Benchmarks
4. Bidding Strategy mit Market Intelligence
5. Keyword Strategy mit Suchvolumen-Daten`;

      return await this.chatWithMarcus(message, {
        performance: performanceData,
        marketIntelligence: accountPerformance.success ? accountPerformance.data : null
      });

    } catch (error) {
      console.error('❌ Enhanced performance recommendations failed:', error);
      // Fallback to basic recommendations
      return await this.chatWithMarcus(`Analysiere Performance: ${JSON.stringify(performanceData, null, 2)}`);
    }
  }

  // 🔥 ENHANCED: Test connection with comprehensive integration check
  async testConnection() {
    try {
      console.log('🔌 Teste OpenAI + Google Ads Integration...');

      // Test OpenAI first
      const openaiResponse = await this.chatWithMarcus('Test: Bist du bereit für Market Intelligence?');

      if (!openaiResponse.success) {
        return {
          status: 'error',
          message: 'OpenAI connection failed',
          details: openaiResponse.error
        };
      }

      // Test Google Ads integration
      const googleAdsStatus = await googleAdsClientService.testConnection();

      // Test market intelligence capability
      const marketIntelligenceTest = await googleAdsClientService.quickMarketCheck('marketing');

      return {
        status: 'connected',
        message: 'Marcus ist bereit für AI + Full Market Intelligence!',
        integrations: {
          openai: 'connected',
          googleAds: googleAdsStatus.status,
          marketIntelligence: marketIntelligenceTest ? 'active' : 'limited'
        },
        capabilities: {
          aiChat: true,
          keywordResearch: googleAdsStatus.status === 'connected',
          competitorAnalysis: googleAdsStatus.status === 'connected',
          performanceAnalytics: googleAdsStatus.status === 'connected',
          industryBenchmarks: googleAdsStatus.status === 'connected'
        }
      };

    } catch (error) {
      console.error('🚨 Enhanced Connection Test Failed:', error);
      return {
        status: 'error',
        message: error.message,
        integrations: {
          openai: 'error',
          googleAds: 'error',
          marketIntelligence: 'error'
        }
      };
    }
  }

  // 🔥 ENHANCED: Quick Keyword Check für Marcus Chat
  async quickKeywordCheck(keyword) {
    try {
      const marketCheck = await googleAdsClientService.quickMarketCheck(keyword);

      if (marketCheck) {
        return {
          keyword: marketCheck.keyword,
          volume: marketCheck.volume,
          cpc: marketCheck.cpc,
          competition: marketCheck.competition,
          summary: marketCheck.summary,
          hasData: true,
          marketOpportunity: marketCheck.volume > 1000 ? 'High' : marketCheck.volume > 100 ? 'Medium' : 'Low'
        };
      }

      return { hasData: false };
    } catch (error) {
      console.error('❌ Enhanced keyword check failed:', error);
      return { hasData: false };
    }
  }

  // 🔥 NEW: Get Market Intelligence Summary for Chat
  async getMarketIntelligenceSummary(keywords, businessInfo = {}) {
    try {
      const intelligence = await googleAdsClientService.getMarketIntelligence(keywords, businessInfo);

      if (intelligence.success && intelligence.data.summary) {
        return {
          success: true,
          summary: intelligence.data.summary,
          insights: intelligence.data.insights || [],
          marketData: intelligence.data.keywords || null
        };
      }

      return { success: false };
    } catch (error) {
      console.error('❌ Market intelligence summary failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced Error Response with market intelligence context
  getErrorResponse() {
    const errorResponses = [
      "❌ MARKET INTELLIGENCE OFFLINE - Google Ads API-Verbindung unterbrochen. Reconnecting...",
      "⚠️ LIVE MARKTDATEN GESTÖRT - Market Intelligence temporär limitiert. Backup-Daten aktiv...",
      "🔧 INTELLIGENCE WARTUNG - Google Ads Market Data wird aktualisiert. Bitte 30 Sekunden warten...",
      "📡 GOOGLE ADS UPLINK GESTÖRT - Reconnecting zu Market Intelligence APIs...",
      "🤖 AI CORE ÜBERLASTET - Zu viele Market Intelligence Requests. Reduziere Analysis-Load...",
      "🔍 MARKET DATA SYNC - Keyword Research APIs werden neu kalibriert. Gleich zurück...",
      "⚡ COMPETITOR INTELLIGENCE OFFLINE - Ad-Copy-Analyse temporär nicht verfügbar..."
    ];

    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }
}

// Singleton Instance - enhanced für Market Intelligence
const openaiService = new OpenAIService();

export default openaiService;