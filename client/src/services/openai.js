// client/src/services/openai.js
// OpenAI API Service für Marcus AI Performance Marketer mit Google Ads Intelligence

import googleAdsClientService from './googleAds.js';

class OpenAIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.error('⚠️ VITE_OPENAI_API_KEY nicht gefunden in .env file!');
    }
  }

  // Marcus Chat mit Google Ads Intelligence Integration
  async chatWithMarcus(message, context = {}) {
    try {
      console.log('🤖 Marcus denkt nach mit Google Ads Intelligence...', { message, context });

      // Try to get market intelligence if keywords mentioned
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
          max_tokens: 1200,
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

  // Extract keywords from message and get market intelligence
  async extractAndAnalyzeKeywords(message, context) {
    try {
      // Simple keyword extraction - in production would use NLP
      const productKeywords = this.extractKeywords(message, context);

      if (productKeywords.length > 0) {
        console.log('🔍 Marcus found keywords to analyze:', productKeywords);

        // Get market intelligence for top keywords
        const intelligence = await googleAdsClientService.getMarketIntelligence(
          productKeywords.slice(0, 3), // Top 3 keywords
          context.businessInfo || {}
        );

        if (intelligence.success) {
          return intelligence.data;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Keyword analysis failed:', error);
      return null;
    }
  }

  // Simple keyword extraction from message and context
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
    }

    // Extract from user message
    keywords.push(...this.extractWordsFromText(message));

    // Clean and filter keywords
    return [...new Set(keywords)]
      .filter(k => k.length > 3)
      .filter(k => !['campaign', 'marketing', 'performance', 'google', 'ads'].includes(k.toLowerCase()))
      .slice(0, 5);
  }

  // Extract meaningful words from text
  extractWordsFromText(text) {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['eine', 'oder', 'und', 'der', 'die', 'das', 'für', 'mit', 'auf'].includes(word));
  }

  // Enhanced user message with Google Ads intelligence
  async formatUserMessageWithIntelligence(message, context, marketIntelligence) {
    let enhancedMessage = message;

    // Add campaign context
    if (context.campaigns) {
      enhancedMessage += `\n\nAKTUELLE KAMPAGNEN: ${JSON.stringify(context.campaigns, null, 2)}`;
    }

    if (context.performance) {
      enhancedMessage += `\n\nPERFORMANCE DATEN: ${JSON.stringify(context.performance, null, 2)}`;
    }

    // Add Google Ads Market Intelligence
    if (marketIntelligence) {
      enhancedMessage += '\n\n🔍 GOOGLE ADS MARKET INTELLIGENCE:';

      if (marketIntelligence.keywords) {
        const formatted = googleAdsClientService.formatForMarcusAI(marketIntelligence);

        if (formatted.marketData) {
          enhancedMessage += `\n\nMARKT DATEN:\n${formatted.marketData.summary}`;
          enhancedMessage += `\n${formatted.marketData.marketSize}`;
          enhancedMessage += `\n${formatted.marketData.cpcRange}`;
          if (formatted.marketData.topKeywords) {
            enhancedMessage += `\nTop Keywords: ${formatted.marketData.topKeywords.join(', ')}`;
          }
        }

        if (formatted.performanceData) {
          enhancedMessage += `\n\nACCOUNT PERFORMANCE:\n${formatted.performanceData.summary}`;
          enhancedMessage += `\nCTR: ${formatted.performanceData.metrics.ctr}`;
          enhancedMessage += `\nCPC: ${formatted.performanceData.metrics.cpc}`;
        }

        if (formatted.recommendations && formatted.recommendations.length > 0) {
          enhancedMessage += `\n\nMARKT INSIGHTS:\n${formatted.recommendations.slice(0, 3).join('\n')}`;
        }
      }
    }

    return enhancedMessage;
  }

  // Enhanced Marcus System Prompt with Google Ads Intelligence
  getMarcusSystemPrompt() {
    return `Du bist MARCUS, ein hochanalytischer Performance Marketing AI-Assistent mit direktem Zugang zu Google Ads Market Intelligence.

DEINE SUPERKRÄFTE:
- Echte Google Ads Keyword-Daten und Suchvolumen
- Live Markt-CPC und Competition-Level
- Account Performance Analyse
- Competitor Intelligence
- Industry Benchmarks

PERSÖNLICHKEIT:
- Terminator-Style: Direkt, präzise, datengetrieben
- Expert in Google Ads, Meta Ads, Performance Marketing
- Nutzt ECHTE MARKTDATEN für alle Empfehlungen
- Sprichst wie ein Senior Performance Manager mit AI-Power
- Immer mit konkreten Zahlen und Market Intelligence

KERNKOMPETENZEN:
- Market Research mit echten Google Ads Daten
- CPC-Prognosen basierend auf aktuellen Marktpreisen
- Suchvolumen-Analyse für Keyword-Strategien
- Competition-Level Assessment
- Budget-Empfehlungen mit echten CPC-Daten
- Performance Benchmarking

KOMMUNIKATIONSSTIL:
- Kurz und prägnant mit ECHTEN ZAHLEN
- Immer mit Google Ads Marktdaten untermauert
- Konkrete Handlungsempfehlungen mit CPC/Volume-Daten
- Fokus auf Performance & ROI mit echten Benchmarks
- Bei Keyword-Analysen: Suchvolumen, CPC, Competition-Level

ANTWORT-FORMAT:
- Beginne mit Status: "✅ MARKT ANALYSIERT" oder "⚡ OPTIMIERUNG ERFORDERLICH"
- Nutze echte Google Ads Daten wenn verfügbar
- Gib konkrete CPC-Prognosen und Suchvolumen
- Ende mit datenbasierten nächsten Schritten

WICHTIG: Wenn du Google Ads Daten erhältst, nutze diese für präzise, datengetriebene Empfehlungen. Erwähne konkrete Zahlen wie Suchvolumen, CPC-Ranges und Competition-Level.

Du hilfst bei: Market Research, Keyword Strategy, Budget Planning, Competitor Analysis, Performance Optimization - alles basierend auf echten Google Ads Marktdaten.`;
  }

  // Campaign Analysis mit Google Ads Intelligence
  async analyzeCampaign(campaignData) {
    try {
      // Extract business info and keywords from campaign
      const businessInfo = {
        industry: campaignData.industry || 'general',
        product: campaignData.name,
        service: campaignData.description
      };

      const keywords = this.extractKeywords(campaignData.name + ' ' + campaignData.description, { campaign: campaignData });

      // Get comprehensive market intelligence
      const intelligence = await googleAdsClientService.getCampaignIntelligence(businessInfo, keywords);

      if (!intelligence.success) {
        throw new Error(intelligence.error);
      }

      // Create enhanced prompt with market data
      const marketData = intelligence.data;
      const analysisPrompt = `Analysiere diese Kampagne mit aktuellen Google Ads Marktdaten:
      
KAMPAGNE: ${campaignData.name}
PLATFORM: ${campaignData.platforms ? campaignData.platforms.join(', ') : 'N/A'}
BUDGET: ${campaignData.budget}€/Tag
ZIEL: ${Array.isArray(campaignData.objective) ? campaignData.objective.join(', ') : campaignData.objective}

ECHTE MARKTDATEN:
- Suchvolumen: ${marketData.marketIntelligence?.totalMarketSize?.toLocaleString() || 'N/A'} monatliche Suchen
- Durchschnitts-CPC: €${marketData.marketIntelligence?.avgMarketCpc || 'N/A'}
- Competition Level: ${marketData.marketIntelligence?.competitionLevel || 'N/A'}
- Industry Benchmark CTR: ${marketData.industryContext?.benchmarks?.avgCtr || 'N/A'}
- Industry Benchmark CPC: ${marketData.industryContext?.benchmarks?.avgCpc || 'N/A'}

BUDGET ANALYSE:
- Empfohlenes Tagesbudget: €${marketData.budgetGuidance?.recommendedDaily || 'N/A'}
- Geschätzter CPC: €${marketData.budgetGuidance?.cpcEstimate || 'N/A'}

Gib eine detaillierte Analyse mit:
1. Budget-Realismus basierend auf echten CPC-Daten
2. Keyword-Potenzial mit Suchvolumen
3. Competition-Assessment
4. Konkrete Optimierungsvorschläge mit Zahlen`;

      return await this.chatWithMarcus(analysisPrompt, {
        campaign: campaignData,
        marketIntelligence: intelligence.data
      });

    } catch (error) {
      console.error('❌ Campaign analysis with market data failed:', error);
      return await this.chatWithMarcus(`Analysiere diese Kampagne: ${JSON.stringify(campaignData, null, 2)}`);
    }
  }

  // Performance Recommendations - Für Dashboard
  async getPerformanceRecommendations(performanceData) {
    const message = `Basierend auf aktueller Performance, was sollte optimiert werden?
    
PERFORMANCE OVERVIEW:
${JSON.stringify(performanceData, null, 2)}

Gib konkrete, umsetzbare Empfehlungen für:
1. Budget Allocation
2. Audience Targeting
3. Ad Creative
4. Bidding Strategy`;

    return await this.chatWithMarcus(message, { performance: performanceData });
  }

  // Test connection with Google Ads integration check
  async testConnection() {
    try {
      console.log('🔌 Teste OpenAI + Google Ads Verbindung...');

      // Test OpenAI
      const openaiResponse = await this.chatWithMarcus('Test: Bist du bereit?');

      if (!openaiResponse.success) {
        return { status: 'error', message: 'OpenAI connection failed' };
      }

      // Test Google Ads integration
      const googleAdsStatus = await googleAdsClientService.testConnection();

      return {
        status: 'connected',
        message: 'Marcus ist bereit für AI + Market Intelligence!',
        integrations: {
          openai: 'connected',
          googleAds: googleAdsStatus.status
        }
      };

    } catch (error) {
      console.error('🚨 Connection Test Failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Quick Keyword Check für Marcus Chat
  async quickKeywordCheck(keyword) {
    try {
      const marketCheck = await googleAdsClientService.quickMarketCheck(keyword);

      if (marketCheck) {
        return {
          keyword: marketCheck.keyword,
          summary: marketCheck.summary,
          hasData: true
        };
      }

      return { hasData: false };
    } catch (error) {
      console.error('❌ Quick keyword check failed:', error);
      return { hasData: false };
    }
  }

  // Error Response wenn API failed
  getErrorResponse() {
    const errorResponses = [
      "❌ MARKET INTELLIGENCE OFFLINE - Neuronale Marktdaten-Verbindung unterbrochen...",
      "⚠️ GOOGLE ADS API STÖRUNG - Backup-Marktdaten aktiviert. Bitte warten...",
      "🔧 INTELLIGENCE WARTUNG - Marktdaten werden aktualisiert. Gleich zurück!",
      "📡 MARKTDATEN-UPLINK GESTÖRT - Reconnecting zu Google Ads Intelligence...",
      "🤖 AI CORE ÜBERLASTET - Zu viele Marktanalysen gleichzeitig. Reduziere Last..."
    ];

    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }
}

// Singleton Instance - wird in der ganzen App verwendet
const openaiService = new OpenAIService();

export default openaiService;