// server/src/routes/googleAds.js
// API Routes für Google Ads Integration mit Marcus AI
const express = require('express');
const GoogleAdsService = require('../services/googleAdsService');

const router = express.Router();
const googleAdsService = new GoogleAdsService();

// Test Google Ads API Connection
router.get('/test-connection', async (req, res) => {
  try {
    console.log('🔌 Testing Google Ads API connection...');
    const result = await googleAdsService.testConnection();

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Google Ads connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Marcus Market Intelligence - Keyword Research
router.post('/keyword-research', async (req, res) => {
  try {
    const { keywords, location = '2276' } = req.body; // Default: Germany

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keywords array is required'
      });
    }

    console.log('🔍 Marcus requesting keyword research for:', keywords);

    const keywordData = await googleAdsService.getKeywordIdeas(keywords, location);

    // Format for Marcus AI consumption
    const marcusIntelligence = {
      seedKeywords: keywords,
      totalKeywordsFound: keywordData.length,
      highVolumeKeywords: keywordData.filter(k => k.avgMonthlySearches > 1000),
      lowCompetitionKeywords: keywordData.filter(k => k.competition === 'LOW'),
      avgCpcRange: {
        min: Math.min(...keywordData.map(k => parseFloat(k.lowTopOfPageBid))).toFixed(2),
        max: Math.max(...keywordData.map(k => parseFloat(k.highTopOfPageBid))).toFixed(2),
        avg: (keywordData.reduce((sum, k) => sum + parseFloat(k.lowTopOfPageBid), 0) / keywordData.length).toFixed(2)
      },
      marketOpportunity: keywordData.reduce((sum, k) => sum + k.avgMonthlySearches, 0),
      keywords: keywordData.slice(0, 20) // Top 20 for Marcus analysis
    };

    res.json({
      success: true,
      data: marcusIntelligence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Keyword research failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Marcus Competitor Intelligence
router.post('/competitor-analysis', async (req, res) => {
  try {
    const { domain, keywords } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Competitor domain is required'
      });
    }

    console.log('🕵️ Marcus analyzing competitor:', domain);

    const competitorData = await googleAdsService.getCompetitorInsights(domain, keywords);

    // Format for Marcus AI analysis
    const marcusIntelligence = {
      competitor: domain,
      adActivity: competitorData.adCount,
      activeAds: competitorData.ads,
      competitorStrategy: {
        avgCpc: competitorData.ads.length > 0 ?
          (competitorData.ads.reduce((sum, ad) => sum + parseFloat(ad.avgCpc), 0) / competitorData.ads.length).toFixed(2) : '0.00',
        topHeadlines: [...new Set(competitorData.ads.map(ad => ad.headline1))].slice(0, 5),
        topDescriptions: [...new Set(competitorData.ads.map(ad => ad.description))].slice(0, 3),
        campaignThemes: [...new Set(competitorData.ads.map(ad => ad.campaign))].slice(0, 5)
      },
      insights: {
        isActive: competitorData.adCount > 0,
        adVolume: competitorData.adCount > 10 ? 'High' : competitorData.adCount > 3 ? 'Medium' : 'Low',
        estimatedBudget: competitorData.adCount > 10 ? 'Significant' : 'Moderate'
      }
    };

    res.json({
      success: true,
      data: marcusIntelligence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Competitor analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Marcus Account Performance Intelligence
router.get('/account-performance', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    console.log(`📊 Marcus requesting account performance for ${days} days`);

    const performance = await googleAdsService.getAccountPerformance(parseInt(days));

    // Format for Marcus AI analysis
    const marcusIntelligence = {
      period: performance.period,
      performance: performance,
      insights: {
        performanceLevel: parseFloat(performance.ctr) > 2.0 ? 'Good' : parseFloat(performance.ctr) > 1.0 ? 'Average' : 'Needs Improvement',
        spendEfficiency: parseFloat(performance.avgCpc) < 2.0 ? 'Efficient' : 'Above Average',
        conversionHealth: parseFloat(performance.conversionRate) > 3.0 ? 'Strong' : parseFloat(performance.conversionRate) > 1.0 ? 'Moderate' : 'Weak',
        recommendedActions: generatePerformanceRecommendations(performance)
      },
      trends: {
        dailySpend: (parseFloat(performance.totalSpend) / parseInt(days)).toFixed(2),
        dailyClicks: Math.round(performance.clicks / parseInt(days)),
        dailyImpressions: Math.round(performance.impressions / parseInt(days))
      }
    };

    res.json({
      success: true,
      data: marcusIntelligence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Account performance analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Marcus Industry Benchmarks
router.get('/industry-benchmarks/:industry', async (req, res) => {
  try {
    const { industry } = req.params;

    console.log(`🏆 Marcus requesting benchmarks for industry: ${industry}`);

    const benchmarks = await googleAdsService.getIndustryBenchmarks(industry);

    // Enhanced benchmarks for Marcus AI
    const marcusIntelligence = {
      industry: benchmarks.industryType,
      benchmarks: benchmarks,
      competitiveAnalysis: {
        cpcLevel: parseFloat(benchmarks.avgCpc.replace('€', '')) > 2.0 ? 'High Competition' : 'Moderate Competition',
        marketOpportunity: parseFloat(benchmarks.avgCtr.replace('%', '')) > 2.5 ? 'Strong Market' : 'Competitive Market',
        conversionPotential: parseFloat(benchmarks.avgConversionRate.replace('%', '')) > 3.0 ? 'High Converting' : 'Standard Converting'
      },
      recommendations: {
        targetCtr: `>${(parseFloat(benchmarks.avgCtr.replace('%', '')) + 0.5).toFixed(1)}%`,
        maxCpc: `€${(parseFloat(benchmarks.avgCpc.replace('€', '')) * 1.2).toFixed(2)}`,
        minConversionRate: `${benchmarks.avgConversionRate}`
      }
    };

    res.json({
      success: true,
      data: marcusIntelligence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Industry benchmarks failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Marcus Campaign Intelligence - Full Market Analysis
router.post('/campaign-intelligence', async (req, res) => {
  try {
    const { businessInfo, keywords } = req.body;

    if (!businessInfo || !keywords) {
      return res.status(400).json({
        success: false,
        error: 'Business info and keywords are required'
      });
    }

    console.log('🧠 Marcus generating full campaign intelligence...');

    // Parallel API calls for comprehensive intelligence
    const [
      keywordData,
      accountPerformance,
      industryBenchmarks,
      campaignSuggestions
    ] = await Promise.all([
      googleAdsService.getKeywordIdeas(keywords),
      googleAdsService.getAccountPerformance(30),
      googleAdsService.getIndustryBenchmarks(businessInfo.industry),
      googleAdsService.getCampaignSuggestions(businessInfo)
    ]);

    // Comprehensive Marcus Intelligence Package
    const marcusIntelligence = {
      businessProfile: businessInfo,
      marketIntelligence: {
        keywords: keywordData.slice(0, 15),
        totalMarketSize: keywordData.reduce((sum, k) => sum + k.avgMonthlySearches, 0),
        avgMarketCpc: (keywordData.reduce((sum, k) => sum + parseFloat(k.lowTopOfPageBid), 0) / keywordData.length).toFixed(2),
        competitionLevel: calculateCompetitionLevel(keywordData)
      },
      currentPerformance: accountPerformance,
      industryContext: industryBenchmarks,
      campaignRecommendations: campaignSuggestions,
      strategicInsights: generateStrategicInsights(keywordData, accountPerformance, industryBenchmarks),
      budgetGuidance: generateBudgetGuidance(keywordData, industryBenchmarks),
      nextSteps: generateNextSteps(keywordData, accountPerformance)
    };

    res.json({
      success: true,
      data: marcusIntelligence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Campaign intelligence generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper Functions for Marcus Intelligence

function generatePerformanceRecommendations(performance) {
  const recommendations = [];

  if (parseFloat(performance.ctr) < 1.5) {
    recommendations.push('Improve ad copy and headlines for better CTR');
  }

  if (parseFloat(performance.avgCpc) > 3.0) {
    recommendations.push('Optimize bidding strategy to reduce CPC');
  }

  if (parseFloat(performance.conversionRate) < 2.0) {
    recommendations.push('Enhance landing page experience');
  }

  return recommendations;
}

function calculateCompetitionLevel(keywords) {
  const highCompetition = keywords.filter(k => k.competition === 'HIGH').length;
  const totalKeywords = keywords.length;

  if (highCompetition / totalKeywords > 0.6) return 'Very High';
  if (highCompetition / totalKeywords > 0.4) return 'High';
  if (highCompetition / totalKeywords > 0.2) return 'Medium';
  return 'Low';
}

function generateStrategicInsights(keywords, performance, benchmarks) {
  return {
    marketPosition: performance.ctr > benchmarks.avgCtr ? 'Above Industry Average' : 'Below Industry Average',
    growthOpportunity: keywords.filter(k => k.avgMonthlySearches > 5000).length > 5 ? 'High' : 'Moderate',
    competitiveAdvantage: performance.avgCpc < benchmarks.avgCpc ? 'Cost Efficient' : 'Premium Pricing',
    scalingPotential: keywords.reduce((sum, k) => sum + k.avgMonthlySearches, 0) > 50000 ? 'High Scale Potential' : 'Niche Market'
  };
}

function generateBudgetGuidance(keywords, benchmarks) {
  const avgCpc = keywords.length > 0 ?
    keywords.reduce((sum, k) => sum + parseFloat(k.lowTopOfPageBid), 0) / keywords.length :
    parseFloat(benchmarks.avgCpc.replace('€', ''));

  return {
    minimumDaily: Math.round(avgCpc * 10),
    recommendedDaily: Math.round(avgCpc * 30),
    aggressiveDaily: Math.round(avgCpc * 60),
    monthlyRecommended: Math.round(avgCpc * 30 * 30),
    cpcEstimate: `€${avgCpc.toFixed(2)}`
  };
}

function generateNextSteps(keywords, performance) {
  const steps = [];

  if (keywords.length > 0) {
    steps.push(`Target ${keywords.slice(0, 5).map(k => k.keyword).join(', ')} keywords first`);
  }

  if (parseFloat(performance.ctr) < 2.0) {
    steps.push('Create compelling ad copy with strong CTAs');
  }

  steps.push('Set up conversion tracking');
  steps.push('Create audience segments for remarketing');

  return steps;
}

module.exports = router;