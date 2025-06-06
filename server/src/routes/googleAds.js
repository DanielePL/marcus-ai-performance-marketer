// server/src/routes/googleAds.js
// MARCUS AI - Complete Google Ads Market Intelligence APIs
// 🔥 FULL PERFORMANCE mit Live Market Data

const express = require('express');
const { authenticateToken } = require('./auth');
const GoogleAdsService = require('../services/integrations/googleAdsService');

const router = express.Router();

// Initialize Google Ads Service
const googleAdsService = require('../services/integrations/googleAdsService');

// 🔥 POST /api/google-ads/keyword-research - Marcus Market Intelligence
router.post('/keyword-research', authenticateToken, async (req, res) => {
  try {
    const { keywords, businessInfo = {}, targetLocation = '2276' } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keywords array is required'
      });
    }

    console.log(`🔍 Marcus Keyword Research for: ${keywords.join(', ')}`);

    // Get keyword ideas from Google Ads API
    const keywordIdeas = await googleAdsService.getKeywordIdeas(keywords, targetLocation);

    // Process and enhance data for Marcus AI
    const processedData = {
      totalKeywordsFound: keywordIdeas.length,
      keywords: keywordIdeas,

      // High-value keywords (>1000 monthly searches)
      highVolumeKeywords: keywordIdeas.filter(k => k.avgMonthlySearches > 1000),

      // Low competition opportunities
      lowCompetitionKeywords: keywordIdeas.filter(k =>
        k.competition === 'LOW' && k.avgMonthlySearches > 100
      ),

      // Market opportunity calculation
      marketOpportunity: keywordIdeas.reduce((sum, k) => sum + k.avgMonthlySearches, 0),

      // CPC Analysis
      avgCpcRange: {
        min: Math.min(...keywordIdeas.map(k => parseFloat(k.lowTopOfPageBid))).toFixed(2),
        max: Math.max(...keywordIdeas.map(k => parseFloat(k.highTopOfPageBid))).toFixed(2),
        avg: (keywordIdeas.reduce((sum, k) => sum + parseFloat(k.lowTopOfPageBid), 0) / keywordIdeas.length).toFixed(2)
      },

      // Competition insights
      competitionAnalysis: {
        highCompetition: keywordIdeas.filter(k => k.competition === 'HIGH').length,
        mediumCompetition: keywordIdeas.filter(k => k.competition === 'MEDIUM').length,
        lowCompetition: keywordIdeas.filter(k => k.competition === 'LOW').length
      },

      // Top recommendations
      topRecommendations: keywordIdeas
        .sort((a, b) => b.avgMonthlySearches - a.avgMonthlySearches)
        .slice(0, 10)
        .map(k => ({
          keyword: k.keyword,
          volume: k.avgMonthlySearches,
          cpc: k.lowTopOfPageBid,
          competition: k.competition,
          score: calculateKeywordScore(k)
        })),

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: processedData,
      message: `Marcus analyzed ${keywordIdeas.length} keywords successfully`
    });

  } catch (error) {
    console.error('❌ Keyword Research Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Marcus keyword research failed'
    });
  }
});

// 🔥 POST /api/google-ads/competitor-analysis - Marcus Competitor Intelligence
router.post('/competitor-analysis', authenticateToken, async (req, res) => {
  try {
    const { domain, keywords = [] } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Competitor domain is required'
      });
    }

    console.log(`🕵️ Marcus analyzing competitor: ${domain}`);

    // Get competitor insights from Google Ads
    const competitorData = await googleAdsService.getCompetitorInsights(domain, keywords);

    // Enhanced competitor analysis for Marcus
    const analysis = {
      competitor: domain,
      adActivity: competitorData.adCount,
      competitorAds: competitorData.ads,

      // Extract strategy insights
      competitorStrategy: competitorData.ads.length > 0 ? {
        avgCpc: (competitorData.ads.reduce((sum, ad) => sum + parseFloat(ad.avgCpc || 0), 0) / competitorData.ads.length).toFixed(2),
        topHeadlines: [...new Set(competitorData.ads.map(ad => ad.headline1).filter(h => h))].slice(0, 5),
        campaignThemes: [...new Set(competitorData.ads.map(ad => ad.campaign).filter(c => c))].slice(0, 3),
        avgCtr: (competitorData.ads.reduce((sum, ad) => sum + parseFloat(ad.ctr || 0), 0) / competitorData.ads.length).toFixed(2)
      } : null,

      // Market insights
      insights: {
        adVolume: competitorData.adCount > 20 ? 'High' : competitorData.adCount > 5 ? 'Medium' : 'Low',
        estimatedBudget: estimateCompetitorBudget(competitorData.ads),
        activityLevel: competitorData.adCount > 0 ? 'Active' : 'Low Activity',
        primaryFocus: extractPrimaryFocus(competitorData.ads)
      },

      // Competitive intelligence
      opportunities: generateCompetitiveOpportunities(competitorData),

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analysis,
      message: `Marcus analyzed competitor "${domain}" successfully`
    });

  } catch (error) {
    console.error('❌ Competitor Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Marcus competitor analysis failed'
    });
  }
});

// 🔥 GET /api/google-ads/account-performance - Marcus Performance Intelligence
router.get('/account-performance', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    console.log(`📊 Marcus fetching account performance (${days} days)`);

    // Get account performance from Google Ads API
    const performance = await googleAdsService.getAccountPerformance(parseInt(days));

    // Enhanced performance analysis for Marcus
    const analysis = {
      performance: performance,

      // Performance insights
      insights: {
        performanceLevel: assessPerformanceLevel(performance),
        spendTrend: performance.totalSpend > 1000 ? 'High Spend' : performance.totalSpend > 100 ? 'Medium Spend' : 'Low Spend',
        efficiencyScore: calculateEfficiencyScore(performance),
        optimizationNeeded: identifyOptimizationNeeds(performance)
      },

      // Trends calculation
      trends: {
        dailySpend: (parseFloat(performance.totalSpend) / parseInt(days)).toFixed(2),
        dailyClicks: Math.round(performance.clicks / parseInt(days)),
        dailyConversions: (performance.conversions / parseInt(days)).toFixed(1),
        spendPerConversion: performance.costPerConversion
      },

      // Benchmarking
      benchmarks: await googleAdsService.getIndustryBenchmarks('general'),

      // Recommendations
      recommendations: generatePerformanceRecommendations(performance),

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analysis,
      message: `Marcus performance analysis for ${days} days completed`
    });

  } catch (error) {
    console.error('❌ Account Performance Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Marcus performance analysis failed'
    });
  }
});

// 🔥 POST /api/google-ads/campaign-intelligence - Marcus Campaign Intelligence
router.post('/campaign-intelligence', authenticateToken, async (req, res) => {
  try {
    const { businessInfo, keywords } = req.body;

    if (!businessInfo || !keywords) {
      return res.status(400).json({
        success: false,
        error: 'Business info and keywords are required'
      });
    }

    console.log(`🚀 Marcus generating campaign intelligence for: ${businessInfo.product || 'Unknown Product'}`);

    // Get comprehensive campaign suggestions
    const suggestions = await googleAdsService.getCampaignSuggestions(businessInfo);

    // Enhanced intelligence for Marcus
    const intelligence = {
      marketIntelligence: {
        totalMarketSize: suggestions.recommendedKeywords.reduce((sum, k) => sum + k.avgMonthlySearches, 0),
        avgMarketCpc: suggestions.recommendedKeywords.length > 0 ?
          (suggestions.recommendedKeywords.reduce((sum, k) => sum + parseFloat(k.lowTopOfPageBid), 0) / suggestions.recommendedKeywords.length).toFixed(2) : '0.00',
        competitionLevel: assessMarketCompetition(suggestions.recommendedKeywords),
        marketOpportunity: categorizeMarketOpportunity(suggestions.recommendedKeywords)
      },

      // Strategic insights
      strategicInsights: {
        marketPosition: determineMarketPosition(suggestions.accountPerformance, suggestions.industryBenchmarks),
        growthOpportunity: assessGrowthOpportunity(suggestions.recommendedKeywords),
        competitiveAdvantage: identifyCompetitiveAdvantage(suggestions)
      },

      // Budget guidance
      budgetGuidance: {
        ...suggestions.budgetSuggestions,
        monthlyRecommended: suggestions.budgetSuggestions.recommendedStarting * 30,
        cpcEstimate: suggestions.budgetSuggestions.avgCpcEstimate
      },

      // Campaign recommendations
      campaignRecommendations: suggestions.campaignRecommendations,

      // Industry context
      industryContext: {
        benchmarks: suggestions.industryBenchmarks,
        competitiveAnalysis: analyzeIndustryCompetition(suggestions.industryBenchmarks)
      },

      // Next steps
      nextSteps: generateStrategicNextSteps(suggestions),

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: intelligence,
      message: 'Marcus campaign intelligence generated successfully'
    });

  } catch (error) {
    console.error('❌ Campaign Intelligence Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Marcus campaign intelligence failed'
    });
  }
});

// 🔥 GET /api/google-ads/industry-benchmarks/:industry - Marcus Industry Intelligence
router.get('/industry-benchmarks/:industry', authenticateToken, async (req, res) => {
  try {
    const { industry } = req.params;

    console.log(`📈 Marcus fetching industry benchmarks for: ${industry}`);

    const benchmarks = await googleAdsService.getIndustryBenchmarks(industry);

    // Enhanced benchmarks for Marcus
    const analysis = {
      industry: industry,
      benchmarks: benchmarks,

      // Competitive analysis
      competitiveAnalysis: {
        cpcLevel: parseFloat(benchmarks.avgCpc.replace('€', '')) > 2.5 ? 'High' : parseFloat(benchmarks.avgCpc.replace('€', '')) > 1.5 ? 'Medium' : 'Low',
        marketMaturity: assessMarketMaturity(benchmarks),
        entryBarrier: calculateEntryBarrier(benchmarks)
      },

      // Opportunity assessment
      opportunityAssessment: {
        marketSaturation: assessMarketSaturation(benchmarks),
        growthPotential: assessGrowthPotential(benchmarks),
        recommendedApproach: recommendApproach(benchmarks)
      },

      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analysis,
      message: `Marcus industry analysis for ${industry} completed`
    });

  } catch (error) {
    console.error('❌ Industry Benchmarks Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Marcus industry analysis failed'
    });
  }
});

// 🔥 POST /api/google-ads/test-connection - Redirect to new performance route
router.post('/test-connection', authenticateToken, async (req, res) => {
  try {
    console.log('🔌 Marcus testing Google Ads connection (legacy route)...');

    const connectionTest = await googleAdsService.testConnectionLive();

    res.json({
      success: connectionTest.status === 'connected',
      data: connectionTest,
      message: connectionTest.message
    });

  } catch (error) {
    console.error('❌ Google Ads connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Google Ads connection test failed'
    });
  }
});

// 🔥 HELPER FUNCTIONS for Marcus Intelligence

// Calculate keyword score for ranking
function calculateKeywordScore(keyword) {
  const volumeScore = Math.min(keyword.avgMonthlySearches / 1000, 10);
  const competitionScore = keyword.competition === 'LOW' ? 10 : keyword.competition === 'MEDIUM' ? 6 : 3;
  const cpcScore = Math.max(10 - parseFloat(keyword.lowTopOfPageBid), 1);

  return Math.round((volumeScore + competitionScore + cpcScore) / 3 * 10) / 10;
}

// Estimate competitor budget
function estimateCompetitorBudget(ads) {
  if (ads.length === 0) return 'Unknown';

  const avgCpc = ads.reduce((sum, ad) => sum + parseFloat(ad.avgCpc || 0), 0) / ads.length;
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  if (totalClicks > 1000 && avgCpc > 2) return 'High (€5000+/month)';
  if (totalClicks > 300 && avgCpc > 1) return 'Medium (€1000-5000/month)';
  return 'Low (<€1000/month)';
}

// Extract primary focus from competitor ads
function extractPrimaryFocus(ads) {
  if (ads.length === 0) return 'Unknown';

  const keywords = ads.map(ad => `${ad.headline1} ${ad.description}`).join(' ').toLowerCase();

  if (keywords.includes('sale') || keywords.includes('discount')) return 'Price-focused';
  if (keywords.includes('quality') || keywords.includes('premium')) return 'Quality-focused';
  if (keywords.includes('fast') || keywords.includes('quick')) return 'Speed-focused';

  return 'Brand-focused';
}

// Generate competitive opportunities
function generateCompetitiveOpportunities(competitorData) {
  const opportunities = [];

  if (competitorData.adCount < 5) {
    opportunities.push('Low competitor activity - opportunity for market entry');
  }

  if (competitorData.ads.some(ad => parseFloat(ad.avgCpc) > 3)) {
    opportunities.push('High CPC market - focus on long-tail keywords');
  }

  if (competitorData.ads.length > 0) {
    const avgCtr = competitorData.ads.reduce((sum, ad) => sum + parseFloat(ad.ctr || 0), 0) / competitorData.ads.length;
    if (avgCtr < 2) {
      opportunities.push('Low industry CTR - opportunity for better ad copy');
    }
  }

  return opportunities;
}

// Assess performance level
function assessPerformanceLevel(performance) {
  const ctr = parseFloat(performance.ctr);
  const conversionRate = parseFloat(performance.conversionRate);

  if (ctr > 3 && conversionRate > 3) return 'Excellent';
  if (ctr > 2 && conversionRate > 2) return 'Good';
  if (ctr > 1 && conversionRate > 1) return 'Average';
  return 'Needs Optimization';
}

// Calculate efficiency score
function calculateEfficiencyScore(performance) {
  const ctr = parseFloat(performance.ctr);
  const conversionRate = parseFloat(performance.conversionRate);
  const cpc = parseFloat(performance.avgCpc);

  let score = 0;
  score += ctr > 2 ? 30 : ctr > 1 ? 20 : 10;
  score += conversionRate > 2 ? 30 : conversionRate > 1 ? 20 : 10;
  score += cpc < 2 ? 30 : cpc < 4 ? 20 : 10;
  score += performance.conversions > 10 ? 10 : 5;

  return Math.round(score);
}

// Identify optimization needs
function identifyOptimizationNeeds(performance) {
  const needs = [];

  if (parseFloat(performance.ctr) < 1.5) needs.push('Improve ad copy and targeting');
  if (parseFloat(performance.conversionRate) < 1.5) needs.push('Optimize landing pages');
  if (parseFloat(performance.avgCpc) > 3) needs.push('Review keyword bids and targeting');
  if (performance.conversions < 10) needs.push('Increase budget or improve funnel');

  return needs.length > 0 ? needs : ['Performance looks good - continue monitoring'];
}

// Generate performance recommendations
function generatePerformanceRecommendations(performance) {
  const recommendations = [];

  if (parseFloat(performance.ctr) < 2) {
    recommendations.push('Test new ad headlines and descriptions to improve CTR');
  }

  if (parseFloat(performance.conversionRate) < 2) {
    recommendations.push('Optimize landing page experience and calls-to-action');
  }

  if (parseFloat(performance.avgCpc) > 2.5) {
    recommendations.push('Consider long-tail keywords to reduce CPC');
  }

  if (performance.conversions > 0) {
    recommendations.push('Scale successful campaigns with increased budget');
  }

  return recommendations;
}

// Assess market competition
function assessMarketCompetition(keywords) {
  const highComp = keywords.filter(k => k.competition === 'HIGH').length;
  const total = keywords.length;

  if (highComp / total > 0.7) return 'Very High';
  if (highComp / total > 0.5) return 'High';
  if (highComp / total > 0.3) return 'Medium';
  return 'Low';
}

// Categorize market opportunity
function categorizeMarketOpportunity(keywords) {
  const totalVolume = keywords.reduce((sum, k) => sum + k.avgMonthlySearches, 0);

  if (totalVolume > 100000) return 'Large Market';
  if (totalVolume > 10000) return 'Medium Market';
  if (totalVolume > 1000) return 'Niche Market';
  return 'Small Market';
}

// Determine market position
function determineMarketPosition(performance, benchmarks) {
  const accountCtr = parseFloat(performance.ctr);
  const benchmarkCtr = parseFloat(benchmarks.avgCtr.replace('%', ''));

  if (accountCtr > benchmarkCtr * 1.2) return 'Market Leader';
  if (accountCtr > benchmarkCtr) return 'Above Average';
  if (accountCtr > benchmarkCtr * 0.8) return 'Average';
  return 'Below Average';
}

// Assess growth opportunity
function assessGrowthOpportunity(keywords) {
  const lowCompKeywords = keywords.filter(k => k.competition === 'LOW').length;
  const highVolumeKeywords = keywords.filter(k => k.avgMonthlySearches > 1000).length;

  if (lowCompKeywords > 5 && highVolumeKeywords > 3) return 'High Growth Potential';
  if (lowCompKeywords > 2 || highVolumeKeywords > 1) return 'Medium Growth Potential';
  return 'Limited Growth Potential';
}

// Identify competitive advantage
function identifyCompetitiveAdvantage(suggestions) {
  const lowCompetition = suggestions.recommendedKeywords.filter(k => k.competition === 'LOW').length;
  const performance = suggestions.accountPerformance;

  if (lowCompetition > 5) return 'Keyword Opportunity Advantage';
  if (parseFloat(performance.ctr) > 3) return 'Creative Excellence Advantage';
  if (parseFloat(performance.conversionRate) > 3) return 'Conversion Optimization Advantage';

  return 'Market Entry Opportunity';
}

// Analyze industry competition
function analyzeIndustryCompetition(benchmarks) {
  const avgCpc = parseFloat(benchmarks.avgCpc.replace('€', ''));
  const avgCtr = parseFloat(benchmarks.avgCtr.replace('%', ''));

  return {
    cpcLevel: avgCpc > 3 ? 'High Cost Market' : avgCpc > 1.5 ? 'Medium Cost Market' : 'Low Cost Market',
    engagementLevel: avgCtr > 3 ? 'High Engagement' : avgCtr > 2 ? 'Medium Engagement' : 'Low Engagement',
    marketType: avgCpc > 2.5 && avgCtr > 2.5 ? 'Competitive Premium Market' : 'Standard Market'
  };
}

// Generate strategic next steps
function generateStrategicNextSteps(suggestions) {
  const steps = [];

  const highVolumeKeywords = suggestions.recommendedKeywords.filter(k => k.avgMonthlySearches > 1000);
  if (highVolumeKeywords.length > 0) {
    steps.push(`Start with ${highVolumeKeywords.length} high-volume keywords for immediate impact`);
  }

  if (suggestions.budgetSuggestions.recommendedStarting < 50) {
    steps.push(`Begin with conservative €${suggestions.budgetSuggestions.recommendedStarting}/day budget and scale based on performance`);
  }

  if (suggestions.campaignRecommendations.length > 0) {
    steps.push(`Implement ${suggestions.campaignRecommendations[0].type} campaign as primary focus`);
  }

  steps.push('Monitor performance weekly and optimize based on Marcus AI recommendations');

  return steps;
}

// Additional helper functions for industry analysis
function assessMarketMaturity(benchmarks) {
  const avgCpc = parseFloat(benchmarks.avgCpc.replace('€', ''));
  const avgCtr = parseFloat(benchmarks.avgCtr.replace('%', ''));

  if (avgCpc > 3 && avgCtr < 2) return 'Mature Market';
  if (avgCpc > 2 && avgCtr > 2) return 'Growing Market';
  return 'Emerging Market';
}

function calculateEntryBarrier(benchmarks) {
  const avgCpc = parseFloat(benchmarks.avgCpc.replace('€', ''));

  if (avgCpc > 4) return 'High';
  if (avgCpc > 2) return 'Medium';
  return 'Low';
}

function assessMarketSaturation(benchmarks) {
  const avgCpc = parseFloat(benchmarks.avgCpc.replace('€', ''));
  const conversionRate = parseFloat(benchmarks.avgConversionRate.replace('%', ''));

  if (avgCpc > 3 && conversionRate < 2) return 'High Saturation';
  if (avgCpc > 2 && conversionRate < 3) return 'Medium Saturation';
  return 'Low Saturation';
}

function assessGrowthPotential(benchmarks) {
  const avgCtr = parseFloat(benchmarks.avgCtr.replace('%', ''));
  const conversionRate = parseFloat(benchmarks.avgConversionRate.replace('%', ''));

  if (avgCtr > 3 && conversionRate > 3) return 'High Growth';
  if (avgCtr > 2 || conversionRate > 2) return 'Medium Growth';
  return 'Low Growth';
}

function recommendApproach(benchmarks) {
  const avgCpc = parseFloat(benchmarks.avgCpc.replace('€', ''));
  const avgCtr = parseFloat(benchmarks.avgCtr.replace('%', ''));

  if (avgCpc > 3) return 'Focus on long-tail keywords and quality score optimization';
  if (avgCtr < 2) return 'Emphasize creative testing and audience refinement';
  return 'Balanced approach with gradual scaling';
}

module.exports = router;