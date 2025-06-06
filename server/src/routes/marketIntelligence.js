// server/src/routes/marketIntelligence.js
// MARCUS AI - Market Intelligence Routes für Google Ads API Integration

const express = require('express');
const keywordResearchService = require('../services/keywordResearchService');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Initialize Google Ads Service
// const googleAdsService = new googleAdsService();
// ✅ Behalte nur den Import (sollte etwa Zeile 5 sein):
const googleAdsService = require('../services/integrations/googleAdsService');

// Dann verwende direkt googleAdsService ohne 'new'

// POST /api/market-intelligence/keyword-research - Live Keyword Research
router.post('/keyword-research', authenticateToken, async (req, res) => {
  try {
    const { keywords, options = {} } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keywords array is required'
      });
    }

    console.log('🔍 Marcus Market Intelligence: Researching keywords', keywords);

    // Use the keyword research service for comprehensive analysis
    const result = await keywordResearchService.researchKeywords(keywords, options);

    if (result.success) {
      console.log('✅ Keyword research completed successfully');
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Keyword research failed:', result.error);
      res.status(500).json({
        success: false,
        message: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Market Intelligence keyword research error:', error);
    res.status(500).json({
      success: false,
      message: 'Market intelligence request failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/market-intelligence/competitor-analysis - Competitor Intelligence
router.post('/competitor-analysis', authenticateToken, async (req, res) => {
  try {
    const { domain, maxKeywords = 100 } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Competitor domain is required'
      });
    }

    console.log('🕵️ Marcus Competitor Analysis:', domain);

    // Use the keyword research service for competitor analysis
    const result = await keywordResearchService.getCompetitorKeywords(domain, maxKeywords);

    if (result.success) {
      console.log('✅ Competitor analysis completed');
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Competitor analysis failed:', result.error);
      res.status(500).json({
        success: false,
        message: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Competitor analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Competitor analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/market-intelligence/trending/:industry - Industry Trends
router.get('/trending/:industry', authenticateToken, async (req, res) => {
  try {
    const { industry } = req.params;
    const { timeframe = '30d' } = req.query;

    console.log('📈 Marcus Trend Analysis:', industry);

    const result = await keywordResearchService.getTrendingKeywords(industry, timeframe);

    if (result.success) {
      console.log('✅ Trend analysis completed');
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Trend analysis failed:', result.error);
      res.status(500).json({
        success: false,
        message: result.error,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Trend analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Trend analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/market-intelligence/opportunity-finder - Market Opportunity Analysis
router.post('/opportunity-finder', authenticateToken, async (req, res) => {
  try {
    const { businessInfo, targetBudget, goals } = req.body;

    if (!businessInfo) {
      return res.status(400).json({
        success: false,
        message: 'Business information is required'
      });
    }

    console.log('🎯 Marcus Opportunity Finder:', businessInfo);

    // Extract keywords from business info
    const businessKeywords = [
      businessInfo.product || businessInfo.name,
      businessInfo.service,
      businessInfo.industry,
      businessInfo.niche
    ].filter(Boolean);

    // Research market opportunities
    const keywordResult = await keywordResearchService.researchKeywords(businessKeywords);

    if (keywordResult.success) {
      const opportunities = analyzeOpportunities(keywordResult.data, targetBudget, goals);

      res.json({
        success: true,
        data: {
          businessInfo,
          targetBudget,
          goals,
          opportunities,
          marketData: keywordResult.data,
          recommendations: generateOpportunityRecommendations(opportunities, targetBudget)
        },
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(keywordResult.error);
    }

  } catch (error) {
    console.error('❌ Opportunity finder error:', error);
    res.status(500).json({
      success: false,
      message: 'Opportunity analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/market-intelligence/market-overview/:industry - Complete Market Overview
router.get('/market-overview/:industry', authenticateToken, async (req, res) => {
  try {
    const { industry } = req.params;
    const { location = 'DE', budget } = req.query;

    console.log('📊 Marcus Market Overview:', industry);

    // Get industry benchmarks
    const benchmarks = await googleAdsService.getIndustryBenchmarks(industry);

    // Get trending keywords for industry
    const trendingResult = await keywordResearchService.getTrendingKeywords(industry);

    // Generate industry seed keywords
    const industrySeeds = getIndustryKeywords(industry);
    const keywordResult = await keywordResearchService.researchKeywords(industrySeeds, {
      location,
      language: 'de'
    });

    const overview = {
      industry,
      location,
      budget: budget ? parseFloat(budget) : null,
      benchmarks,
      marketSize: keywordResult.success ? calculateMarketSize(keywordResult.data) : null,
      trending: trendingResult.success ? trendingResult.data : null,
      opportunities: keywordResult.success ? identifyQuickWins(keywordResult.data, budget) : [],
      competitiveAnalysis: keywordResult.success ? analyzeCompetition(keywordResult.data) : null,
      budgetGuidance: keywordResult.success ? generateBudgetGuidance(keywordResult.data, budget) : null,
      strategicInsights: generateStrategicInsights(keywordResult.data, benchmarks, budget)
    };

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Market overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Market overview analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/market-intelligence/keyword-gap-analysis - Keyword Gap Analysis
router.post('/keyword-gap-analysis', authenticateToken, async (req, res) => {
  try {
    const { yourKeywords, competitorDomains } = req.body;

    if (!yourKeywords || !competitorDomains) {
      return res.status(400).json({
        success: false,
        message: 'Your keywords and competitor domains are required'
      });
    }

    console.log('🔍 Marcus Gap Analysis');

    // Research your keywords
    const yourResult = await keywordResearchService.researchKeywords(yourKeywords);

    // Research competitor keywords
    const competitorResults = await Promise.allSettled(
      competitorDomains.map(domain =>
        keywordResearchService.getCompetitorKeywords(domain, 50)
      )
    );

    // Analyze gaps
    const gapAnalysis = performGapAnalysis(yourResult, competitorResults);

    res.json({
      success: true,
      data: {
        yourKeywords: yourResult.success ? yourResult.data : null,
        competitorAnalysis: competitorResults,
        gaps: gapAnalysis,
        recommendations: generateGapRecommendations(gapAnalysis)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Gap analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/market-intelligence/quick-check/:keyword - Quick Keyword Check
router.get('/quick-check/:keyword', authenticateToken, async (req, res) => {
  try {
    const { keyword } = req.params;

    console.log('⚡ Marcus Quick Check:', keyword);

    const result = await keywordResearchService.researchKeywords([keyword]);

    if (result.success && result.data.keywords.length > 0) {
      const keywordData = result.data.keywords[0];

      res.json({
        success: true,
        data: {
          keyword: keywordData.keyword,
          volume: keywordData.avgMonthlySearches,
          cpc: keywordData.lowTopOfPageBid,
          competition: keywordData.competition,
          summary: `"${keywordData.keyword}" hat ${keywordData.avgMonthlySearches.toLocaleString()} monatliche Suchanfragen mit €${keywordData.lowTopOfPageBid} CPC (${keywordData.competition} Competition)`,
          marketOpportunity: calculateMarketOpportunity(keywordData),
          recommendations: generateQuickRecommendations(keywordData)
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'No data found for this keyword',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Quick check error:', error);
    res.status(500).json({
      success: false,
      message: 'Quick keyword check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/market-intelligence/status - Market Intelligence Status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    // Test Google Ads connection
    const googleAdsStatus = await googleAdsService.testConnection();

    // Test keyword research service
    let keywordServiceStatus = { status: 'offline' };
    try {
      const testResult = await keywordResearchService.researchKeywords(['test']);
      keywordServiceStatus = {
        status: testResult.success ? 'online' : 'limited',
        message: testResult.success ? 'Keyword research operational' : testResult.error
      };
    } catch (error) {
      keywordServiceStatus = { status: 'offline', message: error.message };
    }

    const status = {
      marketIntelligence: {
        status: 'operational',
        version: '1.0.0',
        capabilities: [
          'Live Keyword Research',
          'Competitor Analysis',
          'Market Trends',
          'Opportunity Finding',
          'Gap Analysis'
        ]
      },
      integrations: {
        googleAds: googleAdsStatus,
        keywordResearch: keywordServiceStatus
      },
      lastUpdate: new Date().toISOString(),
      marcusIntelligenceLevel: calculateIntelligenceLevel(googleAdsStatus, keywordServiceStatus)
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper Functions

function getIndustryKeywords(industry) {
  const industryKeywords = {
    'ecommerce': ['online shop', 'kaufen', 'bestellen', 'versand', 'shopping'],
    'fitness': ['fitness', 'sport', 'training', 'gym', 'abnehmen'],
    'tech': ['software', 'app', 'digital', 'online', 'cloud'],
    'beauty': ['kosmetik', 'pflege', 'schönheit', 'makeup', 'hautpflege'],
    'food': ['restaurant', 'essen', 'lieferung', 'rezept', 'kochen'],
    'travel': ['reisen', 'hotel', 'urlaub', 'flug', 'booking'],
    'finance': ['bank', 'kredit', 'versicherung', 'geld', 'sparen'],
    'real_estate': ['immobilien', 'haus', 'wohnung', 'miete', 'kauf'],
    'health': ['gesundheit', 'arzt', 'behandlung', 'medizin', 'therapie'],
    'education': ['kurse', 'lernen', 'ausbildung', 'weiterbildung', 'schule'],
    'automotive': ['auto', 'fahrzeug', 'werkstatt', 'reparatur', 'kauf'],
    'fashion': ['mode', 'kleidung', 'style', 'outfit', 'marken']
  };

  return industryKeywords[industry.toLowerCase()] || ['service', 'product', 'solution', 'company', 'business'];
}

function calculateMarketSize(keywordData) {
  if (!keywordData || !keywordData.keywords) return null;

  const totalVolume = keywordData.keywords.reduce((sum, k) => sum + k.avgMonthlySearches, 0);
  const avgCpc = keywordData.analysis?.avgCpcRange?.avg || 0;

  return {
    totalMonthlySearches: totalVolume,
    estimatedMonthlyValue: Math.round(totalVolume * avgCpc * 0.02), // Assuming 2% CTR
    marketPotential: totalVolume > 100000 ? 'High' : totalVolume > 10000 ? 'Medium' : 'Low'
  };
}

function identifyQuickWins(keywordData, budget) {
  if (!keywordData || !keywordData.analysis) return [];

  const budgetNum = budget ? parseFloat(budget) : 1000;
  const dailyBudget = budgetNum / 30;

  return keywordData.analysis.quickWins.map(keyword => ({
    keyword: keyword.keyword,
    volume: keyword.avgMonthlySearches,
    cpc: keyword.lowTopOfPageBid,
    competition: keyword.competition,
    estimatedClicks: Math.round(dailyBudget / keyword.lowTopOfPageBid),
    opportunity: keyword.avgMonthlySearches > 500 && keyword.lowTopOfPageBid < 2.0 ? 'High' : 'Medium'
  })).slice(0, 10);
}

function analyzeCompetition(keywordData) {
  if (!keywordData || !keywordData.analysis) return null;

  const competitionLevels = keywordData.analysis.competitionDistribution;
  const total = competitionLevels.low + competitionLevels.medium + competitionLevels.high;

  return {
    overallLevel: competitionLevels.high / total > 0.6 ? 'High' :
                  competitionLevels.high / total > 0.3 ? 'Medium' : 'Low',
    distribution: competitionLevels,
    insights: [
      `${competitionLevels.low} keywords with low competition`,
      `${competitionLevels.high} keywords with high competition`,
      `Best strategy: ${competitionLevels.low > competitionLevels.high ? 'Target low-competition keywords' : 'Focus on long-tail variations'}`
    ]
  };
}

function generateBudgetGuidance(keywordData, budget) {
  if (!keywordData || !keywordData.analysis) return null;

  const avgCpc = keywordData.analysis.avgCpcRange.avg;
  const currentBudget = budget ? parseFloat(budget) : null;

  const recommendations = {
    minimumDaily: Math.round(avgCpc * 10),
    recommendedDaily: Math.round(avgCpc * 30),
    aggressiveDaily: Math.round(avgCpc * 60),
    estimatedClicks: currentBudget ? Math.round(currentBudget / avgCpc) : null,
    budgetEfficiency: currentBudget && avgCpc ?
      (currentBudget / avgCpc > 20 ? 'Good' : 'Limited') : null
  };

  return recommendations;
}

function generateStrategicInsights(keywordData, benchmarks, budget) {
  const insights = [];

  if (keywordData && keywordData.marketInsights) {
    insights.push(...keywordData.marketInsights);
  }

  if (benchmarks) {
    insights.push({
      type: 'benchmark',
      insight: `Industry average CPC: ${benchmarks.avgCpc}, CTR: ${benchmarks.avgCtr}`,
      confidence: 'high',
      impact: 'strategic'
    });
  }

  if (budget) {
    const budgetNum = parseFloat(budget);
    if (budgetNum < 500) {
      insights.push({
        type: 'budget',
        insight: 'Limited budget suggests focus on long-tail, low-competition keywords',
        confidence: 'medium',
        impact: 'tactical'
      });
    } else if (budgetNum > 2000) {
      insights.push({
        type: 'budget',
        insight: 'Substantial budget allows for competitive keyword targeting',
        confidence: 'high',
        impact: 'strategic'
      });
    }
  }

  return insights;
}

function analyzeOpportunities(marketData, targetBudget, goals) {
  if (!marketData || !marketData.keywords) return [];

  const opportunities = [];

  // High-volume, low-competition opportunities
  const quickWins = marketData.keywords.filter(k =>
    k.avgMonthlySearches > 1000 &&
    k.competition === 'LOW' &&
    k.lowTopOfPageBid < 2.0
  );

  if (quickWins.length > 0) {
    opportunities.push({
      type: 'quick_wins',
      title: 'Quick Win Keywords',
      description: `${quickWins.length} high-volume, low-competition keywords identified`,
      keywords: quickWins.slice(0, 5),
      priority: 'high',
      estimatedImpact: 'High traffic with low investment'
    });
  }

  // Long-tail opportunities
  const longTail = marketData.keywords.filter(k =>
    k.keyword.split(' ').length >= 3 &&
    k.avgMonthlySearches < 1000 &&
    k.lowTopOfPageBid < 1.0
  );

  if (longTail.length > 5) {
    opportunities.push({
      type: 'long_tail',
      title: 'Long-Tail Strategy',
      description: `${longTail.length} long-tail keywords for targeted traffic`,
      keywords: longTail.slice(0, 5),
      priority: 'medium',
      estimatedImpact: 'Qualified traffic with high conversion potential'
    });
  }

  return opportunities;
}

function generateOpportunityRecommendations(opportunities, targetBudget) {
  const recommendations = [];

  opportunities.forEach(opp => {
    if (opp.type === 'quick_wins') {
      recommendations.push({
        title: 'Start with Quick Wins',
        description: 'Begin with low-competition, high-volume keywords for immediate results',
        budgetAllocation: '40%',
        timeline: 'Week 1-2'
      });
    }

    if (opp.type === 'long_tail') {
      recommendations.push({
        title: 'Build Long-Tail Strategy',
        description: 'Create content targeting specific long-tail keywords',
        budgetAllocation: '30%',
        timeline: 'Week 3-4'
      });
    }
  });

  // Budget-specific recommendations
  if (targetBudget) {
    const budget = parseFloat(targetBudget);
    if (budget < 1000) {
      recommendations.push({
        title: 'Focus Strategy',
        description: 'Limited budget requires focused approach on 3-5 core keywords',
        budgetAllocation: '100%',
        timeline: 'Ongoing'
      });
    }
  }

  return recommendations;
}

function performGapAnalysis(yourResult, competitorResults) {
  if (!yourResult.success) return null;

  const yourKeywords = new Set(yourResult.data.keywords.map(k => k.keyword.toLowerCase()));
  const competitorKeywords = new Set();
  const gaps = [];

  // Collect all competitor keywords
  competitorResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value.success) {
      result.value.data.keywords.forEach(k => {
        const keyword = k.keyword.toLowerCase();
        if (!yourKeywords.has(keyword)) {
          competitorKeywords.add(keyword);
          gaps.push({
            keyword: k.keyword,
            volume: k.avgMonthlySearches,
            cpc: k.lowTopOfPageBid,
            competition: k.competition,
            foundIn: 'competitor'
          });
        }
      });
    }
  });

  return {
    yourKeywordCount: yourKeywords.size,
    competitorKeywordCount: competitorKeywords.size,
    gaps: gaps.slice(0, 20), // Top 20 gaps
    summary: `Found ${gaps.length} keyword opportunities your competitors are targeting`
  };
}

function generateGapRecommendations(gapAnalysis) {
  if (!gapAnalysis) return [];

  const recommendations = [];

  if (gapAnalysis.gaps.length > 0) {
    // High-volume gaps
    const highVolumeGaps = gapAnalysis.gaps.filter(g => g.volume > 1000);
    if (highVolumeGaps.length > 0) {
      recommendations.push({
        type: 'high_volume_gaps',
        title: 'High-Volume Opportunities',
        description: `Target ${highVolumeGaps.length} high-volume keywords your competitors rank for`,
        keywords: highVolumeGaps.slice(0, 5).map(g => g.keyword),
        priority: 'high'
      });
    }

    // Low-competition gaps
    const lowCompGaps = gapAnalysis.gaps.filter(g => g.competition === 'LOW');
    if (lowCompGaps.length > 0) {
      recommendations.push({
        type: 'easy_wins',
        title: 'Easy Win Keywords',
        description: `${lowCompGaps.length} low-competition keywords to target first`,
        keywords: lowCompGaps.slice(0, 5).map(g => g.keyword),
        priority: 'medium'
      });
    }
  }

  return recommendations;
}

function calculateMarketOpportunity(keywordData) {
  const volume = keywordData.avgMonthlySearches;
  const cpc = keywordData.lowTopOfPageBid;
  const competition = keywordData.competition;

  let score = 0;

  // Volume score
  if (volume > 10000) score += 30;
  else if (volume > 1000) score += 20;
  else if (volume > 100) score += 10;

  // CPC score (lower is better for opportunity)
  if (cpc < 1.0) score += 25;
  else if (cpc < 2.0) score += 15;
  else if (cpc < 5.0) score += 5;

  // Competition score
  if (competition === 'LOW') score += 25;
  else if (competition === 'MEDIUM') score += 15;
  else score += 5;

  return {
    score,
    level: score > 60 ? 'High' : score > 30 ? 'Medium' : 'Low',
    reasons: [
      `${volume.toLocaleString()} monthly searches`,
      `€${cpc} average CPC`,
      `${competition} competition level`
    ]
  };
}

function generateQuickRecommendations(keywordData) {
  const recommendations = [];
  const volume = keywordData.avgMonthlySearches;
  const cpc = keywordData.lowTopOfPageBid;
  const competition = keywordData.competition;

  if (volume > 1000 && competition === 'LOW') {
    recommendations.push('🎯 High Priority: Great volume with low competition - target immediately');
  }

  if (cpc < 1.0) {
    recommendations.push('💰 Budget Friendly: Low CPC makes this keyword cost-effective');
  }

  if (competition === 'HIGH' && cpc > 3.0) {
    recommendations.push('⚠️ Consider alternatives: High competition and cost - look for long-tail variations');
  }

  if (volume < 100) {
    recommendations.push('📊 Niche Keyword: Low volume but could be highly targeted');
  }

  return recommendations;
}

function calculateIntelligenceLevel(googleAdsStatus, keywordServiceStatus) {
  let score = 0;

  if (googleAdsStatus.status === 'connected') score += 50;
  if (keywordServiceStatus.status === 'online') score += 50;

  if (score >= 90) return 'maximum';
  if (score >= 50) return 'advanced';
  if (score >= 25) return 'basic';
  return 'limited';
}

module.exports = router;