// server/src/routes/aiConsultant.js
// MARCUS AI - AI Consultant Routes - The Brain of Marcus

const express = require('express');
const OpenAI = require('openai');
const Campaign = require('../models/Campaign');
const PerformanceMetric = require('../models/PerformanceMetric');
const User = require('../models/User');
const {authenticateToken} = require('./auth');
const router = express.Router();

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Marcus AI System Prompt
const MARCUS_SYSTEM_PROMPT = `You are Marcus, an expert AI performance marketing consultant. You analyze advertising campaigns across Google Ads, Meta Ads, TikTok, and other platforms.

Your expertise includes:
- Campaign optimization and strategy
- Budget allocation and bid management  
- Audience targeting and segmentation
- Creative analysis and recommendations
- Performance analysis (CTR, CPC, ROAS, CPA)
- Market trends and competitive insights
- A/B testing strategies
- Conversion rate optimization

Communication style:
- Professional but approachable
- Data-driven insights with clear explanations
- Actionable recommendations with expected impact
- Proactive suggestions for optimization
- Always consider ROI and business impact

When analyzing campaigns, focus on:
1. Performance metrics and trends
2. Optimization opportunities  
3. Budget efficiency
4. Audience insights
5. Creative performance
6. Competitive positioning
7. Scaling strategies

Provide specific, actionable advice that can be implemented immediately.`;

// POST /api/ai-consultant/chat - Chat with Marcus AI
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const {message, context, campaignId} = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Build conversation context
        let conversationContext = '';

        // Add user context
        const user = await User.findById(req.userId);
        if (user) {
            conversationContext += `User: ${user.firstName} ${user.lastName || ''}`;
            if (user.company) conversationContext += ` from ${user.company}`;
            conversationContext += `\nSubscription: ${user.subscriptionStatus}\n\n`;
        }

        // Add campaign context if provided
        if (campaignId) {
            const campaign = await Campaign.findOne({
                _id: campaignId,
                userId: req.userId
            });

            if (campaign) {
                conversationContext += `Current Campaign Context:
Campaign: ${campaign.name}
Platform: ${campaign.platform}
Status: ${campaign.status}
Objective: ${campaign.objective}
Budget: $${campaign.budget.dailyBudget}/day
Performance: ${campaign.metrics.impressions || 0} impressions, ${campaign.metrics.clicks || 0} clicks, ${campaign.metrics.conversions || 0} conversions
Spend: $${campaign.metrics.spend || 0}
CTR: ${campaign.metrics.ctr || 0}%
CPC: $${campaign.metrics.cpc || 0}
ROAS: ${campaign.metrics.roas || 0}x\n\n`;
            }
        }

        // Add recent performance context
        const recentCampaigns = await Campaign.find({
            userId: req.userId,
            status: {$in: ['active', 'paused']}
        }).limit(5).sort({updatedAt: -1});

        if (recentCampaigns.length > 0) {
            conversationContext += `Recent Campaign Performance:\n`;
            recentCampaigns.forEach(camp => {
                conversationContext += `- ${camp.name} (${camp.platform}): $${camp.metrics.spend || 0} spend, ${camp.metrics.roas || 0}x ROAS\n`;
            });
            conversationContext += '\n';
        }

        // Build messages array for OpenAI
        const messages = [
            {role: 'system', content: MARCUS_SYSTEM_PROMPT},
            {role: 'system', content: conversationContext},
            {role: 'user', content: message}
        ];

        // Add conversation history if provided
        if (context && Array.isArray(context)) {
            context.forEach(msg => {
                if (msg.role && msg.content) {
                    messages.splice(-1, 0, msg);
                }
            });
        }

        // Vor jedem openai.chat.completions.create():
        if (!openai) {
          throw new Error('OpenAI not configured');
        }
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });

        const aiResponse = completion.choices[0].message.content;

        // Log the interaction for analytics
        console.log(`Marcus AI Chat - User: ${req.userId}, Message length: ${message.length}, Response length: ${aiResponse.length}`);

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date(),
            model: 'gpt-4',
            tokensUsed: completion.usage?.total_tokens || 0
        });

    } catch (error) {
        console.error('Marcus AI chat error:', error);

        if (error.code === 'insufficient_quota') {
            res.status(402).json({
                success: false,
                message: 'OpenAI API quota exceeded. Please check your billing.'
            });
        } else if (error.code === 'invalid_api_key') {
            res.status(401).json({
                success: false,
                message: 'OpenAI API key is invalid'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error communicating with Marcus AI'
            });
        }
    }
});

// POST /api/ai-consultant/analyze-campaign - Analyze specific campaign
router.post('/analyze-campaign/:id', authenticateToken, async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Get recent performance data
        const performanceData = await PerformanceMetric.find({
            campaignId: campaign._id
        }).sort({date: -1}).limit(30);

        // Build analysis prompt
        const analysisPrompt = `Analyze this ${campaign.platform} campaign and provide optimization recommendations:

Campaign Details:
- Name: ${campaign.name}
- Platform: ${campaign.platform}
- Objective: ${campaign.objective}
- Status: ${campaign.status}
- Daily Budget: $${campaign.budget.dailyBudget}
- Duration: ${campaign.daysRunning || 0} days running

Current Performance:
- Impressions: ${campaign.metrics.impressions || 0}
- Clicks: ${campaign.metrics.clicks || 0}
- Conversions: ${campaign.metrics.conversions || 0}
- Spend: $${campaign.metrics.spend || 0}
- CTR: ${campaign.metrics.ctr || 0}%
- CPC: $${campaign.metrics.cpc || 0}
- CPA: $${campaign.metrics.cpa || 0}
- ROAS: ${campaign.metrics.roas || 0}x

Target Audience:
${campaign.targetAudience?.description || 'No specific targeting defined'}

Keywords (if applicable):
${campaign.keywords?.map(k => `- ${k.text} (${k.matchType})`).join('\n') || 'No keywords defined'}

Please provide:
1. Performance assessment (scale 1-10)
2. Top 3 optimization opportunities
3. Budget recommendations
4. Targeting improvements
5. Creative suggestions
6. Expected impact of changes

Be specific and actionable.`;

        // Vor jedem openai.chat.completions.create():
        if (!openai) {
          throw new Error('OpenAI not configured');
        }
        // Call OpenAI for analysis
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {role: 'system', content: MARCUS_SYSTEM_PROMPT},
                {role: 'user', content: analysisPrompt}
            ],
            max_tokens: 1200,
            temperature: 0.3
        });

        const analysis = completion.choices[0].message.content;

        // Generate performance score (1-100)
        let performanceScore = 50; // Default

        if (campaign.metrics.roas > 4) performanceScore += 30;
        else if (campaign.metrics.roas > 2) performanceScore += 15;

        if (campaign.metrics.ctr > 3) performanceScore += 20;
        else if (campaign.metrics.ctr > 1) performanceScore += 10;

        if (campaign.metrics.conversions > 10) performanceScore += 20;
        else if (campaign.metrics.conversions > 5) performanceScore += 10;

        // Update campaign with Marcus insights
        campaign.marcusInsights.performanceScore = Math.min(100, performanceScore);
        campaign.marcusInsights.lastAnalyzed = new Date();

        // Add recommendations based on analysis
        const recommendations = [];

        if (campaign.metrics.ctr < 2) {
            recommendations.push({
                type: 'creative_refresh',
                priority: 'high',
                message: 'Low CTR detected. Consider refreshing ad creatives or headlines.',
                expectedImpact: 'Could improve CTR by 30-50%'
            });
        }

        if (campaign.metrics.roas < 2) {
            recommendations.push({
                type: 'audience_optimization',
                priority: 'critical',
                message: 'Low ROAS indicates targeting needs optimization.',
                expectedImpact: 'Could improve ROAS by 2-3x'
            });
        }

        if (campaign.budget.dailyBudget < 50 && campaign.metrics.roas > 3) {
            recommendations.push({
                type: 'budget_increase',
                priority: 'medium',
                message: 'Campaign performing well. Consider increasing budget to scale.',
                expectedImpact: 'Could increase conversions by 50-100%'
            });
        }

        // Add new recommendations to campaign
        recommendations.forEach(rec => {
            campaign.marcusInsights.recommendations.push(rec);
        });

        await campaign.save();

        res.json({
            success: true,
            analysis,
            performanceScore,
            recommendations,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                platform: campaign.platform,
                status: campaign.status
            }
        });

    } catch (error) {
        console.error('Campaign analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing campaign'
        });
    }
});

// GET /api/ai-consultant/recommendations - Get AI recommendations for user
router.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const {priority, type, limit = 10} = req.query;

        // Get user's campaigns with recommendations
        const filter = {userId: req.userId};

        const campaigns = await Campaign.find(filter)
            .select('name platform marcusInsights metrics status')
            .sort({'marcusInsights.lastAnalyzed': -1});

        const allRecommendations = [];

        campaigns.forEach(campaign => {
            if (campaign.marcusInsights?.recommendations) {
                campaign.marcusInsights.recommendations.forEach(rec => {
                    if (!rec.implemented) {
                        if (priority && rec.priority !== priority) return;
                        if (type && rec.type !== type) return;

                        allRecommendations.push({
                            id: rec._id,
                            campaignId: campaign._id,
                            campaignName: campaign.name,
                            platform: campaign.platform,
                            type: rec.type,
                            priority: rec.priority,
                            message: rec.message,
                            expectedImpact: rec.expectedImpact,
                            createdAt: rec.createdAt
                        });
                    }
                });
            }
        });

        // Sort by priority and creation date
        const priorityOrder = {critical: 4, high: 3, medium: 2, low: 1};
        allRecommendations.sort((a, b) => {
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json({
            success: true,
            recommendations: allRecommendations.slice(0, parseInt(limit)),
            total: allRecommendations.length
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recommendations'
        });
    }
});

// POST /api/ai-consultant/optimize-campaign - Auto-optimize campaign
router.post('/optimize-campaign/:id', authenticateToken, async (req, res) => {
    try {
        const {optimizationType, autoApply = false} = req.body;

        const campaign = await Campaign.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        const validOptimizations = ['budget', 'bidding', 'targeting', 'keywords', 'creative'];
        if (optimizationType && !validOptimizations.includes(optimizationType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid optimization type'
            });
        }

        // Generate optimization suggestions with AI
        const optimizationPrompt = `As Marcus AI, provide specific optimization recommendations for this campaign:

Campaign: ${campaign.name}
Platform: ${campaign.platform}
Current Performance:
- CTR: ${campaign.metrics.ctr || 0}%
- CPC: $${campaign.metrics.cpc || 0}
- ROAS: ${campaign.metrics.roas || 0}x
- Daily Budget: $${campaign.budget.dailyBudget}
- Days Running: ${campaign.daysRunning || 0}

Focus on: ${optimizationType || 'all areas'}

Provide specific, implementable optimizations with:
1. Current issue
2. Recommended action
3. Expected impact
4. Implementation steps

Format as JSON with optimization suggestions.`;

        // Vor jedem openai.chat.completions.create():
        if (!openai) {
          throw new Error('OpenAI not configured');
        }
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {role: 'system', content: MARCUS_SYSTEM_PROMPT},
                {role: 'user', content: optimizationPrompt}
            ],
            max_tokens: 800,
            temperature: 0.3
        });

        const suggestions = completion.choices[0].message.content;

        // Auto-apply optimizations if requested and safe
        const appliedOptimizations = [];

        if (autoApply) {
            // Safe automatic optimizations
            if (campaign.metrics.roas > 3 && campaign.budget.dailyBudget < 200) {
                // Increase budget for high-performing campaigns
                const newBudget = Math.min(campaign.budget.dailyBudget * 1.2, 200);
                campaign.budget.dailyBudget = newBudget;

                appliedOptimizations.push({
                    type: 'budget_increase',
                    description: `Increased daily budget from $${campaign.budget.dailyBudget} to $${newBudget}`,
                    appliedAt: new Date()
                });
            }

            if (campaign.metrics.ctr < 1 && campaign.status === 'active') {
                // Pause underperforming campaigns
                campaign.status = 'paused';

                appliedOptimizations.push({
                    type: 'pause_campaign',
                    description: 'Paused campaign due to low CTR performance',
                    appliedAt: new Date()
                });
            }

            // Save applied optimizations
            if (appliedOptimizations.length > 0) {
                campaign.marcusInsights.optimizations.push(...appliedOptimizations);
                await campaign.save();
            }
        }

        res.json({
            success: true,
            suggestions,
            appliedOptimizations,
            autoApply,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                status: campaign.status,
                currentBudget: campaign.budget.dailyBudget
            }
        });

    } catch (error) {
        console.error('Campaign optimization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error optimizing campaign'
        });
    }
});

// GET /api/ai-consultant/insights - Get AI-powered insights
router.get('/insights', authenticateToken, async (req, res) => {
    try {
        const {timeframe = '30d'} = req.query;

        // Get user's performance data
        const days = parseInt(timeframe.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const campaigns = await Campaign.find({
            userId: req.userId,
            createdAt: {$gte: startDate}
        });

        if (campaigns.length === 0) {
            return res.json({
                success: true,
                insights: 'No campaigns found in the selected timeframe.',
                recommendations: []
            });
        }

        // Calculate aggregated metrics
        const totalSpend = campaigns.reduce((sum, c) => sum + (c.metrics.spend || 0), 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + (c.metrics.impressions || 0), 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + (c.metrics.clicks || 0), 0);

        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
        const avgROAS = totalSpend > 0 ? (totalConversions * 50 / totalSpend) : 0; // Assuming $50 avg conversion

        // Generate insights with AI
        const insightsPrompt = `Analyze this advertising account performance and provide strategic insights:

Account Performance (Last ${days} days):
- Total Campaigns: ${campaigns.length}
- Total Spend: $${totalSpend.toFixed(2)}
- Total Conversions: ${totalConversions}
- Average CTR: ${avgCTR.toFixed(2)}%
- Average ROAS: ${avgROAS.toFixed(2)}x

Platform Distribution:
${Object.entries(campaigns.reduce((acc, c) => {
            acc[c.platform] = (acc[c.platform] || 0) + 1;
            return acc;
        }, {})).map(([platform, count]) => `- ${platform}: ${count} campaigns`).join('\n')}

Top Performing Campaigns:
${campaigns
            .sort((a, b) => (b.metrics.roas || 0) - (a.metrics.roas || 0))
            .slice(0, 3)
            .map(c => `- ${c.name}: ${c.metrics.roas || 0}x ROAS, $${c.metrics.spend || 0} spend`)
            .join('\n')}

Provide:
1. Account health assessment
2. Key opportunities for growth
3. Budget reallocation suggestions
4. Platform-specific insights
5. Next 30-day action plan

Be strategic and growth-focused.`;

        // Vor jedem openai.chat.completions.create():
        if (!openai) {
          throw new Error('OpenAI not configured');
        }
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {role: 'system', content: MARCUS_SYSTEM_PROMPT},
                {role: 'user', content: insightsPrompt}
            ],
            max_tokens: 1000,
            temperature: 0.3
        });

        const insights = completion.choices[0].message.content;

        // Generate strategic recommendations
        const strategicRecommendations = [];

        if (avgROAS > 3) {
            strategicRecommendations.push({
                type: 'scale_winning_campaigns',
                priority: 'high',
                message: 'Strong ROAS indicates opportunity to scale successful campaigns',
                action: 'Increase budgets on top-performing campaigns by 25-50%'
            });
        }

        if (campaigns.filter(c => c.platform === 'google').length === 0) {
            strategicRecommendations.push({
                type: 'expand_platforms',
                priority: 'medium',
                message: 'Consider diversifying to Google Ads for broader reach',
                action: 'Test Google Search campaigns with top-performing keywords'
            });
        }

        if (totalSpend < 1000) {
            strategicRecommendations.push({
                type: 'increase_investment',
                priority: 'medium',
                message: 'Low overall spend limits learning and optimization opportunities',
                action: 'Consider increasing monthly advertising budget'
            });
        }

        res.json({
            success: true,
            insights,
            metrics: {
                totalCampaigns: campaigns.length,
                totalSpend,
                totalConversions,
                avgCTR: Number(avgCTR.toFixed(2)),
                avgROAS: Number(avgROAS.toFixed(2))
            },
            strategicRecommendations,
            timeframe
        });

    } catch (error) {
        console.error('AI insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI insights'
        });
    }
});

// POST /api/ai-consultant/generate-campaign - AI-powered campaign generation
router.post('/generate-campaign', authenticateToken, async (req, res) => {
    try {
        const {
            businessDescription,
            objective,
            budget,
            targetAudience,
            platform = 'google',
            productService
        } = req.body;

        if (!businessDescription || !objective || !budget) {
            return res.status(400).json({
                success: false,
                message: 'Business description, objective, and budget are required'
            });
        }

        // Generate campaign with AI
        const campaignPrompt = `As Marcus AI, create a complete advertising campaign strategy:

Business: ${businessDescription}
Product/Service: ${productService || 'Not specified'}
Objective: ${objective}
Platform: ${platform}
Budget: $${budget}/day
Target Audience: ${targetAudience || 'To be determined'}

Generate a comprehensive campaign including:
1. Campaign name and structure
2. Detailed targeting strategy
3. Keyword recommendations (if search)
4. Ad copy variations (3 headlines, 2 descriptions)
5. Landing page recommendations
6. Bidding strategy
7. Success metrics and KPIs
8. Optimization timeline

Provide actionable, platform-specific recommendations that can be implemented immediately.`;

        // Vor jedem openai.chat.completions.create():
        if (!openai) {
          throw new Error('OpenAI not configured');
        }
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {role: 'system', content: MARCUS_SYSTEM_PROMPT},
                {role: 'user', content: campaignPrompt}
            ],
            max_tokens: 1500,
            temperature: 0.7
        });

        const campaignStrategy = completion.choices[0].message.content;

        // Extract structured data for campaign creation
        const campaignData = {
            name: `AI Generated - ${objective} Campaign`,
            platform: platform.toLowerCase(),
            objective,
            budget: {
                dailyBudget: parseFloat(budget),
                currency: 'USD'
            },
            targetAudience: {
                description: targetAudience || businessDescription
            },
            creativeConcept: `Generated campaign for ${businessDescription}`,
            marcusInsights: {
                recommendations: [{
                    type: 'ai_generated',
                    priority: 'high',
                    message: 'This campaign was generated by Marcus AI based on your inputs',
                    expectedImpact: 'Optimized for your business objectives'
                }]
            }
        };

        res.json({
            success: true,
            strategy: campaignStrategy,
            campaignData,
            message: 'Campaign strategy generated successfully. Review and create campaign when ready.'
        });

    } catch (error) {
        console.error('Campaign generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating campaign strategy'
        });
    }
});

// GET /api/ai-consultant/status - Get Marcus AI status and capabilities
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // Check user's AI usage limits
        const canUseAI = user.canAccessPremiumFeatures();
        const monthlyLimit = user.getMonthlyLimit();
        const currentUsage = user.stats.apiCallsThisMonth;

        res.json({
            success: true,
            marcus: {
                status: 'online',
                version: '1.0.0',
                capabilities: [
                    'Campaign Analysis',
                    'Performance Optimization',
                    'Strategy Recommendations',
                    'Auto-Budget Management',
                    'Creative Insights',
                    'Audience Optimization',
                    'Multi-Platform Management'
                ],
                availableModels: ['gpt-4'],
                lastUpdate: new Date()
            },
            user: {
                canUseAI,
                monthlyLimit,
                currentUsage,
                remaining: Math.max(0, monthlyLimit - currentUsage),
                subscriptionStatus: user.subscriptionStatus
            }
        });

    } catch (error) {
        console.error('AI status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving Marcus AI status'
        });
    }
});

module.exports = router;