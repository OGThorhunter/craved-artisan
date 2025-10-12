import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { growthSocialService } from '../services/growth-social';
import { z } from 'zod';

const router = Router();

// Validation schemas
const UTMCampaignsSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'draft']).optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const SEOKeywordsSchema = z.object({
  positionMin: z.coerce.number().min(1).max(100).optional(),
  positionMax: z.coerce.number().min(1).max(100).optional(),
  searchVolumeMin: z.coerce.number().min(0).optional(),
  searchVolumeMax: z.coerce.number().min(0).optional(),
  difficultyMin: z.coerce.number().min(0).max(100).optional(),
  difficultyMax: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const SEOPagesSchema = z.object({
  indexed: z.coerce.boolean().optional(),
  statusCode: z.coerce.number().min(100).max(599).optional(),
  pageSpeedMin: z.coerce.number().min(0).max(100).optional(),
  pageSpeedMax: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const SocialConnectorsSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin']).optional(),
  status: z.enum(['connected', 'disconnected', 'error', 'expired']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const ReferralCodesSchema = z.object({
  type: z.enum(['vendor', 'customer', 'affiliate']).optional(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const SocialConnectSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'tiktok', 'twitter', 'youtube', 'linkedin']),
  accountData: z.object({
    accountId: z.string().min(1),
    accountName: z.string().min(1),
    accountUrl: z.string().url(),
    accessToken: z.string().min(1),
    refreshToken: z.string().optional(),
    tokenExpiry: z.coerce.date().optional()
  })
});

const ReferralCodeCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  type: z.enum(['vendor', 'customer', 'affiliate']),
  discount: z.number().min(0).max(100).optional(),
  commission: z.number().min(0).max(100).optional(),
  usageLimit: z.number().min(1).optional(),
  expiresAt: z.coerce.date().optional()
});

const ReferralCodeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  discount: z.number().min(0).max(100).optional(),
  commission: z.number().min(0).max(100).optional(),
  usageLimit: z.number().min(1).optional(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  expiresAt: z.coerce.date().optional()
});

// GET /api/admin/growth-social/utm-campaigns - Get UTM campaigns
router.get('/growth-social/utm-campaigns', requireAdmin, async (req, res) => {
  try {
    const filters = UTMCampaignsSchema.parse(req.query);
    const result = await growthSocialService.getUTMCampaigns(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('UTM campaigns error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/growth-social/utm-campaigns/:id/performance - Get campaign performance
router.get('/growth-social/utm-campaigns/:id/performance', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const performance = await growthSocialService.getCampaignPerformance(id, days);
    
    return res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Campaign performance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign performance'
    });
  }
});

// GET /api/admin/growth-social/seo-keywords - Get SEO keywords
router.get('/growth-social/seo-keywords', requireAdmin, async (req, res) => {
  try {
    const filters = SEOKeywordsSchema.parse(req.query);
    
    // Transform query params to match service interface
    const serviceFilters = {
      position: filters.positionMin || filters.positionMax ? {
        min: filters.positionMin,
        max: filters.positionMax
      } : undefined,
      searchVolume: filters.searchVolumeMin || filters.searchVolumeMax ? {
        min: filters.searchVolumeMin,
        max: filters.searchVolumeMax
      } : undefined,
      difficulty: filters.difficultyMin || filters.difficultyMax ? {
        min: filters.difficultyMin,
        max: filters.difficultyMax
      } : undefined,
      page: filters.page,
      pageSize: filters.pageSize
    };
    
    const result = await growthSocialService.getSEOKeywords(serviceFilters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('SEO keywords error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/growth-social/seo-pages - Get SEO pages
router.get('/growth-social/seo-pages', requireAdmin, async (req, res) => {
  try {
    const filters = SEOPagesSchema.parse(req.query);
    
    // Transform query params to match service interface
    const serviceFilters = {
      indexed: filters.indexed,
      statusCode: filters.statusCode,
      pageSpeed: filters.pageSpeedMin || filters.pageSpeedMax ? {
        min: filters.pageSpeedMin,
        max: filters.pageSpeedMax
      } : undefined,
      page: filters.page,
      pageSize: filters.pageSize
    };
    
    const result = await growthSocialService.getSEOPages(serviceFilters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('SEO pages error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/growth-social/social-connectors - Get social connectors
router.get('/growth-social/social-connectors', requireAdmin, async (req, res) => {
  try {
    const filters = SocialConnectorsSchema.parse(req.query);
    const result = await growthSocialService.getSocialConnectors(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Social connectors error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// POST /api/admin/growth-social/social-connectors/connect - Connect social platform
router.post('/growth-social/social-connectors/connect', requireAdmin, auditAdminAction('growth-social.social.connect'), async (req, res) => {
  try {
    const { platform, accountData } = SocialConnectSchema.parse(req.body);
    
    const success = await growthSocialService.connectSocialPlatform(platform, accountData);
    
    if (success) {
      return res.json({
        success: true,
        message: `${platform} account connected successfully`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to connect social platform'
      });
    }
  } catch (error) {
    console.error('Connect social platform error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid connection data',
      error: (error as Error).message
    });
  }
});

// DELETE /api/admin/growth-social/social-connectors/:id - Disconnect social platform
router.delete('/growth-social/social-connectors/:id', requireAdmin, auditAdminAction('growth-social.social.disconnect'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await growthSocialService.disconnectSocialPlatform(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Social platform disconnected successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to disconnect social platform'
      });
    }
  } catch (error) {
    console.error('Disconnect social platform error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to disconnect social platform'
    });
  }
});

// GET /api/admin/growth-social/referral-codes - Get referral codes
router.get('/growth-social/referral-codes', requireAdmin, async (req, res) => {
  try {
    const filters = ReferralCodesSchema.parse(req.query);
    const result = await growthSocialService.getReferralCodes(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Referral codes error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// POST /api/admin/growth-social/referral-codes - Create referral code
router.post('/growth-social/referral-codes', requireAdmin, auditAdminAction('growth-social.referral.create'), async (req, res) => {
  try {
    const codeData = ReferralCodeCreateSchema.parse(req.body);
    
    const success = await growthSocialService.createReferralCode(codeData);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Referral code created successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to create referral code'
      });
    }
  } catch (error) {
    console.error('Create referral code error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid referral code data',
      error: (error as Error).message
    });
  }
});

// PUT /api/admin/growth-social/referral-codes/:id - Update referral code
router.put('/growth-social/referral-codes/:id', requireAdmin, auditAdminAction('growth-social.referral.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = ReferralCodeUpdateSchema.parse(req.body);
    
    const success = await growthSocialService.updateReferralCode(id, updates);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Referral code updated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to update referral code'
      });
    }
  } catch (error) {
    console.error('Update referral code error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid update data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/growth-social/metrics - Get growth metrics
router.get('/growth-social/metrics', requireAdmin, async (req, res) => {
  try {
    const metrics = await growthSocialService.getGrowthMetrics();
    
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Growth metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch growth metrics'
    });
  }
});

export default router;






















