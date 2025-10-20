import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Helper function to authenticate and get vendor profile
async function authenticateVendor(req: any) {
  console.log('🔍 [DEBUG] PromotionsAnalytics authenticateVendor - req.user:', req.user);
  
  const vendorId = req.user?.userId;
  if (!vendorId) {
    const error = new Error('Authentication required');
    (error as any).statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user || !user.vendorProfile) {
    const error = new Error('Vendor profile required');
    (error as any).statusCode = 403;
    throw error;
  }

  if ((user as any).role !== 'VENDOR') {
    const error = new Error('Vendor access required');
    (error as any).statusCode = 403;
    throw error;
  }

  return user.vendorProfile;
}

// Validation schemas
const AnalyticsQuerySchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  campaignId: z.string().optional(),
  promotionId: z.string().optional(),
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'X', 'THREADS']).optional()
});

const MarketingEventCreateSchema = z.object({
  userId: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  eventData: z.record(z.any()),
  sessionId: z.string().optional()
});

// ================================
// CAMPAIGN ANALYTICS ENDPOINTS
// ================================

// GET /api/vendor/promotions-analytics/campaigns/:id/performance - Get campaign performance
router.get('/campaigns/:id/performance', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id: campaignId } = req.params;
    const { startDate, endDate } = AnalyticsQuerySchema.parse(req.query);

    // Check if campaign belongs to vendor
    const campaign = await prisma.campaign.findFirst({
      where: { 
        id: campaignId,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Get campaign analytics
    const analytics = await prisma.campaignAnalytics.findMany({
      where: {
        campaignId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals and trends
    const totals = analytics.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      revenue: acc.revenue + day.revenue,
      cost: acc.cost + day.cost,
      reach: acc.reach + day.reach,
      engagement: acc.engagement + day.engagement
    }), {
      impressions: 0, clicks: 0, conversions: 0, 
      revenue: 0, cost: 0, reach: 0, engagement: 0
    });

    // Calculate derived metrics
    const clickThroughRate = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks * 100) : 0;
    const costPerClick = totals.clicks > 0 ? (totals.cost / totals.clicks) : 0;
    const roi = totals.cost > 0 ? ((totals.revenue - totals.cost) / totals.cost * 100) : 0;
    const engagementRate = totals.reach > 0 ? (totals.engagement / totals.reach * 100) : 0;

    // Get related promotions performance
    const promotions = await prisma.promotion.findMany({
      where: { campaignId },
      include: {
        analytics: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        usageHistory: {
          where: {
            usedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    const promotionsSummary = promotions.map(promotion => {
      const promoAnalytics = promotion.analytics.reduce((acc, day) => ({
        views: acc.views + day.views,
        uses: acc.uses + day.uses,
        revenue: acc.revenue + day.revenue,
        discountGiven: acc.discountGiven + day.discountGiven
      }), { views: 0, uses: 0, revenue: 0, discountGiven: 0 });

      return {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        code: promotion.code,
        ...promoAnalytics,
        conversionRate: promoAnalytics.views > 0 ? (promoAnalytics.uses / promoAnalytics.views * 100) : 0,
        totalUses: promotion.usageHistory.length
      };
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      campaignId,
      dateRange: { startDate, endDate },
      totalRevenue: totals.revenue,
      totalConversions: totals.conversions
    }, 'Retrieved campaign performance analytics');

    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status
        },
        dateRange: { startDate, endDate },
        totals,
        metrics: {
          clickThroughRate: Number(clickThroughRate.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          costPerClick: Number(costPerClick.toFixed(2)),
          roi: Number(roi.toFixed(2)),
          engagementRate: Number(engagementRate.toFixed(2))
        },
        dailyData: analytics,
        promotions: promotionsSummary
      }
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      campaignId: req.params.id
    }, 'Error getting campaign performance');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// PROMOTION ANALYTICS ENDPOINTS
// ================================

// GET /api/vendor/promotions-analytics/promotions/:id/performance - Get promotion performance
router.get('/promotions/:id/performance', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id: promotionId } = req.params;
    const { startDate, endDate } = AnalyticsQuerySchema.parse(req.query);

    // Check if promotion belongs to vendor
    const promotion = await prisma.promotion.findFirst({
      where: { 
        id: promotionId,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        campaign: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    // Get promotion analytics
    const analytics = await prisma.promotionAnalytics.findMany({
      where: {
        promotionId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Get usage history
    const usageHistory = await prisma.promotionUsage.findMany({
      where: {
        promotionId,
        usedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { usedAt: 'desc' }
    });

    // Calculate totals
    const totals = analytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      uses: acc.uses + day.uses,
      revenue: acc.revenue + day.revenue,
      discountGiven: acc.discountGiven + day.discountGiven
    }), { views: 0, uses: 0, revenue: 0, discountGiven: 0 });

    // Calculate derived metrics
    const conversionRate = totals.views > 0 ? (totals.uses / totals.views * 100) : 0;
    const avgDiscountPerUse = totals.uses > 0 ? (totals.discountGiven / totals.uses) : 0;
    const totalUses = usageHistory.length;
    const uniqueCustomers = new Set(usageHistory.map(u => u.userId)).size;
    const avgRevenuePerUse = totalUses > 0 ? (totals.revenue / totalUses) : 0;

    // Usage distribution by day of week and hour
    const usageByDayOfWeek: { [key: string]: number } = {};
    const usageByHour: { [key: string]: number } = {};
    
    usageHistory.forEach(usage => {
      const date = new Date(usage.usedAt);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      
      usageByDayOfWeek[dayOfWeek] = (usageByDayOfWeek[dayOfWeek] || 0) + 1;
      usageByHour[hour] = (usageByHour[hour] || 0) + 1;
    });

    // Top customers
    const customerUsage: { [key: string]: { count: number, discount: number, user: any } } = {};
    usageHistory.forEach(usage => {
      if (!customerUsage[usage.userId]) {
        customerUsage[usage.userId] = { count: 0, discount: 0, user: usage.user };
      }
      customerUsage[usage.userId].count++;
      customerUsage[usage.userId].discount += usage.discountAmount;
    });

    const topCustomers = Object.values(customerUsage)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionId,
      dateRange: { startDate, endDate },
      totalRevenue: totals.revenue,
      totalUses: totalUses
    }, 'Retrieved promotion performance analytics');

    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion.id,
          name: promotion.name,
          type: promotion.type,
          code: promotion.code,
          campaign: promotion.campaign
        },
        dateRange: { startDate, endDate },
        totals,
        metrics: {
          conversionRate: Number(conversionRate.toFixed(2)),
          avgDiscountPerUse: Number(avgDiscountPerUse.toFixed(2)),
          avgRevenuePerUse: Number(avgRevenuePerUse.toFixed(2)),
          totalUses,
          uniqueCustomers,
          repeatUsageRate: uniqueCustomers > 0 ? Number(((totalUses - uniqueCustomers) / totalUses * 100).toFixed(2)) : 0
        },
        dailyData: analytics,
        usagePatterns: {
          byDayOfWeek: usageByDayOfWeek,
          byHour: usageByHour
        },
        topCustomers,
        recentUsage: usageHistory.slice(0, 20)
      }
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      promotionId: req.params.id
    }, 'Error getting promotion performance');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// SOCIAL MEDIA ANALYTICS ENDPOINTS
// ================================

// GET /api/vendor/promotions-analytics/social-media/:id/performance - Get social media post performance
router.get('/social-media/:id/performance', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id: postId } = req.params;
    const { startDate, endDate, platform } = AnalyticsQuerySchema.parse(req.query);

    // Check if post belongs to vendor
    const post = await prisma.socialMediaPost.findFirst({
      where: { 
        id: postId,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        campaign: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Social media post not found'
      });
    }

    // Get social media analytics
    const whereClause: any = {
      postId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (platform) {
      whereClause.platform = platform;
    }

    const analytics = await prisma.socialMediaAnalytics.findMany({
      where: whereClause,
      orderBy: [{ platform: 'asc' }, { date: 'asc' }]
    });

    // Group by platform
    const byPlatform: { [key: string]: any } = {};
    analytics.forEach(day => {
      const platformName = day.platform;
      if (!byPlatform[platformName]) {
        byPlatform[platformName] = {
          platform: platformName,
          impressions: 0, reach: 0, likes: 0, comments: 0, 
          shares: 0, clicks: 0, totalEngagement: 0
        };
      }

      byPlatform[platformName].impressions += day.impressions;
      byPlatform[platformName].reach += day.reach;
      byPlatform[platformName].likes += day.likes;
      byPlatform[platformName].comments += day.comments;
      byPlatform[platformName].shares += day.shares;
      byPlatform[platformName].clicks += day.clicks;
      byPlatform[platformName].totalEngagement += (day.likes + day.comments + day.shares);
    });

    // Calculate platform metrics
    Object.values(byPlatform).forEach((platform: any) => {
      platform.engagementRate = platform.impressions > 0 ? 
        (platform.totalEngagement / platform.impressions * 100) : 0;
      platform.clickThroughRate = platform.impressions > 0 ? 
        (platform.clicks / platform.impressions * 100) : 0;
    });

    // Calculate totals across all platforms
    const totals = Object.values(byPlatform).reduce((acc: any, platform: any) => ({
      impressions: acc.impressions + platform.impressions,
      reach: acc.reach + platform.reach,
      likes: acc.likes + platform.likes,
      comments: acc.comments + platform.comments,
      shares: acc.shares + platform.shares,
      clicks: acc.clicks + platform.clicks,
      totalEngagement: acc.totalEngagement + platform.totalEngagement
    }), {
      impressions: 0, reach: 0, likes: 0, comments: 0, 
      shares: 0, clicks: 0, totalEngagement: 0
    });

    // Calculate overall metrics
    const overallEngagementRate = totals.impressions > 0 ? 
      (totals.totalEngagement / totals.impressions * 100) : 0;
    const overallClickThroughRate = totals.impressions > 0 ? 
      (totals.clicks / totals.impressions * 100) : 0;

    logger.info({
      vendorProfileId: vendorProfile.id,
      postId,
      dateRange: { startDate, endDate },
      totalEngagement: totals.totalEngagement,
      platformCount: Object.keys(byPlatform).length
    }, 'Retrieved social media performance analytics');

    res.json({
      success: true,
      data: {
        post: {
          id: post.id,
          content: post.content,
          platforms: JSON.parse(post.platforms),
          status: post.status,
          campaign: post.campaign
        },
        dateRange: { startDate, endDate },
        totals,
        metrics: {
          engagementRate: Number(overallEngagementRate.toFixed(2)),
          clickThroughRate: Number(overallClickThroughRate.toFixed(2)),
          avgEngagementPerPost: Number((totals.totalEngagement / Object.keys(byPlatform).length).toFixed(0))
        },
        byPlatform: Object.values(byPlatform),
        dailyData: analytics
      }
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      postId: req.params.id
    }, 'Error getting social media performance');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// OVERALL ANALYTICS DASHBOARD
// ================================

// GET /api/vendor/promotions-analytics/dashboard - Get overall promotions analytics dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { startDate, endDate } = AnalyticsQuerySchema.parse(req.query);

    // Get all campaigns with analytics
    const campaigns = await prisma.campaign.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        analytics: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        promotions: {
          include: {
            analytics: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate
                }
              }
            },
            usageHistory: {
              where: {
                usedAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        },
        socialPosts: {
          include: {
            analytics: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      }
    });

    // Calculate overall totals
    const totalCampaignMetrics = {
      impressions: 0, clicks: 0, conversions: 0, 
      revenue: 0, cost: 0, reach: 0, engagement: 0
    };

    const totalPromotionMetrics = {
      views: 0, uses: 0, revenue: 0, discountGiven: 0
    };

    const totalSocialMetrics = {
      impressions: 0, reach: 0, likes: 0, comments: 0, 
      shares: 0, clicks: 0
    };

    let totalPromotionUses = 0;

    campaigns.forEach(campaign => {
      // Campaign analytics
      campaign.analytics.forEach(day => {
        totalCampaignMetrics.impressions += day.impressions;
        totalCampaignMetrics.clicks += day.clicks;
        totalCampaignMetrics.conversions += day.conversions;
        totalCampaignMetrics.revenue += day.revenue;
        totalCampaignMetrics.cost += day.cost;
        totalCampaignMetrics.reach += day.reach;
        totalCampaignMetrics.engagement += day.engagement;
      });

      // Promotion analytics
      campaign.promotions.forEach(promotion => {
        totalPromotionUses += promotion.usageHistory.length;
        
        promotion.analytics.forEach(day => {
          totalPromotionMetrics.views += day.views;
          totalPromotionMetrics.uses += day.uses;
          totalPromotionMetrics.revenue += day.revenue;
          totalPromotionMetrics.discountGiven += day.discountGiven;
        });
      });

      // Social media analytics
      campaign.socialPosts.forEach(post => {
        post.analytics.forEach(day => {
          totalSocialMetrics.impressions += day.impressions;
          totalSocialMetrics.reach += day.reach;
          totalSocialMetrics.likes += day.likes;
          totalSocialMetrics.comments += day.comments;
          totalSocialMetrics.shares += day.shares;
          totalSocialMetrics.clicks += day.clicks;
        });
      });
    });

    // Calculate key metrics
    const campaignROI = totalCampaignMetrics.cost > 0 ? 
      ((totalCampaignMetrics.revenue - totalCampaignMetrics.cost) / totalCampaignMetrics.cost * 100) : 0;
    
    const promotionConversionRate = totalPromotionMetrics.views > 0 ? 
      (totalPromotionMetrics.uses / totalPromotionMetrics.views * 100) : 0;
    
    const socialEngagementRate = totalSocialMetrics.impressions > 0 ? 
      ((totalSocialMetrics.likes + totalSocialMetrics.comments + totalSocialMetrics.shares) / totalSocialMetrics.impressions * 100) : 0;

    // Top performing campaigns
    const topCampaigns = campaigns
      .map(campaign => {
        const revenue = campaign.analytics.reduce((sum, day) => sum + day.revenue, 0);
        const conversions = campaign.analytics.reduce((sum, day) => sum + day.conversions, 0);
        return { ...campaign, totalRevenue: revenue, totalConversions: conversions };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Top performing promotions
    const allPromotions = campaigns.flatMap(c => c.promotions);
    const topPromotions = allPromotions
      .map(promotion => {
        const revenue = promotion.analytics.reduce((sum, day) => sum + day.revenue, 0);
        const uses = promotion.usageHistory.length;
        return { ...promotion, totalRevenue: revenue, totalUses: uses };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    logger.info({
      vendorProfileId: vendorProfile.id,
      dateRange: { startDate, endDate },
      totalRevenue: totalCampaignMetrics.revenue + totalPromotionMetrics.revenue,
      activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length
    }, 'Retrieved promotions analytics dashboard');

    res.json({
      success: true,
      data: {
        dateRange: { startDate, endDate },
        overview: {
          activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
          activePromotions: allPromotions.filter(p => p.isActive).length,
          totalRevenue: totalCampaignMetrics.revenue + totalPromotionMetrics.revenue,
          totalPromotionUses: totalPromotionUses,
          totalSocialEngagement: totalSocialMetrics.likes + totalSocialMetrics.comments + totalSocialMetrics.shares
        },
        campaigns: {
          totals: totalCampaignMetrics,
          roi: Number(campaignROI.toFixed(2)),
          topPerforming: topCampaigns.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            revenue: c.totalRevenue,
            conversions: c.totalConversions
          }))
        },
        promotions: {
          totals: totalPromotionMetrics,
          conversionRate: Number(promotionConversionRate.toFixed(2)),
          topPerforming: topPromotions.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            code: p.code,
            revenue: p.totalRevenue,
            uses: p.totalUses
          }))
        },
        socialMedia: {
          totals: totalSocialMetrics,
          engagementRate: Number(socialEngagementRate.toFixed(2)),
          postCount: campaigns.reduce((sum, c) => sum + c.socialPosts.length, 0)
        }
      }
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting promotions analytics dashboard');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// MARKETING EVENTS TRACKING
// ================================

// POST /api/vendor/promotions-analytics/events - Track marketing event
router.post('/events', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = MarketingEventCreateSchema.parse(req.body);

    const event = await prisma.marketingEvent.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        eventData: JSON.stringify(validatedData.eventData)
      }
    });

    // Parse JSON field for response
    const processedEvent = {
      ...event,
      eventData: JSON.parse(event.eventData)
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      eventType: validatedData.eventType,
      userId: validatedData.userId
    }, 'Tracked marketing event');

    res.status(201).json({
      success: true,
      data: processedEvent
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error tracking marketing event');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// GET /api/vendor/promotions-analytics/events - Get marketing events
router.get('/events', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { eventType, userId, limit = '50' } = req.query;

    const whereClause: any = { vendorProfileId: vendorProfile.id };
    
    if (eventType) {
      whereClause.eventType = eventType;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }

    const events = await prisma.marketingEvent.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string)
    });

    // Parse JSON fields
    const processedEvents = events.map(event => ({
      ...event,
      eventData: JSON.parse(event.eventData)
    }));

    logger.info({
      vendorProfileId: vendorProfile.id,
      eventCount: events.length,
      filters: { eventType, userId, limit }
    }, 'Retrieved marketing events');

    res.json({
      success: true,
      data: processedEvents
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting marketing events');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export { router as promotionsAnalyticsRouter };
