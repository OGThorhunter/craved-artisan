import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';
import { createFacebookAPIService, getFacebookConfig } from '../services/facebook-api.service';
import { createInstagramAPIService, getInstagramConfig } from '../services/instagram-api.service';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Helper function to authenticate and get vendor profile
async function authenticateVendor(req: any) {
  console.log('🔍 [DEBUG] SocialMedia authenticateVendor - req.user:', req.user);
  
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
const SocialPostCreateSchema = z.object({
  campaignId: z.string().optional(),
  content: z.string().min(1, 'Post content is required'),
  platforms: z.array(z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'X', 'THREADS'])),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  hashtags: z.array(z.string()).optional(),
  productTags: z.array(z.string()).optional(),
  location: z.string().optional(),
  mediaUrls: z.array(z.string()).optional()
});

const SocialPostUpdateSchema = SocialPostCreateSchema.partial();

const SocialAssetCreateSchema = z.object({
  postId: z.string().optional(),
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['IMAGE', 'VIDEO', 'GIF']),
  url: z.string().url('Valid URL is required'),
  thumbnailUrl: z.string().url().optional(),
  dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
  duration: z.number().optional(),
  size: z.number(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional()
});

const ContentTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.string().min(1, 'Category is required'),
  content: z.string().min(1, 'Template content is required'),
  hashtags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false)
});

// ================================
// SOCIAL MEDIA POST ENDPOINTS
// ================================

// GET /api/vendor/social-media/posts - Get all social media posts for vendor
router.get('/posts', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { status, platform, campaign } = req.query;

    const whereClause: any = { vendorProfileId: vendorProfile.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (campaign) {
      whereClause.campaignId = campaign;
    }

    const posts = await prisma.socialMediaPost.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: { id: true, name: true, type: true }
        },
        assets: true,
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        _count: {
          select: {
            assets: true,
            analytics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const processedPosts = posts.map(post => ({
      ...post,
      platforms: post.platforms ? JSON.parse(post.platforms) : [],
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      productTags: post.productTags ? JSON.parse(post.productTags) : [],
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      engagementData: post.engagementData ? JSON.parse(post.engagementData) : null
    }));

    logger.info({
      vendorProfileId: vendorProfile.id,
      postCount: posts.length,
      filters: { status, platform, campaign }
    }, 'Retrieved social media posts for vendor');

    res.json({
      success: true,
      data: processedPosts
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting social media posts');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/social-media/posts - Create new social media post
router.post('/posts', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = SocialPostCreateSchema.parse(req.body);

    // Check if campaign exists (if campaignId provided)
    if (validatedData.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: validatedData.campaignId,
          vendorProfileId: vendorProfile.id 
        }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        platforms: JSON.stringify(validatedData.platforms),
        hashtags: validatedData.hashtags ? JSON.stringify(validatedData.hashtags) : null,
        productTags: validatedData.productTags ? JSON.stringify(validatedData.productTags) : null,
        mediaUrls: validatedData.mediaUrls ? JSON.stringify(validatedData.mediaUrls) : null,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT'
      },
      include: {
        campaign: true,
        assets: true
      }
    });

    // Parse JSON fields for response
    const processedPost = {
      ...post,
      platforms: JSON.parse(post.platforms),
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      productTags: post.productTags ? JSON.parse(post.productTags) : [],
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : []
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      postId: post.id,
      platforms: validatedData.platforms
    }, 'Created new social media post');

    res.status(201).json({
      success: true,
      data: processedPost
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating social media post');

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

// GET /api/vendor/social-media/posts/:id - Get specific social media post
router.get('/posts/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    const post = await prisma.socialMediaPost.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        campaign: true,
        assets: {
          orderBy: { createdAt: 'asc' }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Social media post not found'
      });
    }

    // Parse JSON fields
    const processedPost = {
      ...post,
      platforms: post.platforms ? JSON.parse(post.platforms) : [],
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      productTags: post.productTags ? JSON.parse(post.productTags) : [],
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      engagementData: post.engagementData ? JSON.parse(post.engagementData) : null
    };

    res.json({
      success: true,
      data: processedPost
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      postId: req.params.id
    }, 'Error getting social media post');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// PUT /api/vendor/social-media/posts/:id - Update social media post
router.put('/posts/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;
    const validatedData = SocialPostUpdateSchema.parse(req.body);

    // Check if post exists and belongs to vendor
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Social media post not found'
      });
    }

    const post = await prisma.socialMediaPost.update({
      where: { id },
      data: {
        ...validatedData,
        platforms: validatedData.platforms ? JSON.stringify(validatedData.platforms) : undefined,
        hashtags: validatedData.hashtags ? JSON.stringify(validatedData.hashtags) : undefined,
        productTags: validatedData.productTags ? JSON.stringify(validatedData.productTags) : undefined,
        mediaUrls: validatedData.mediaUrls ? JSON.stringify(validatedData.mediaUrls) : undefined
      },
      include: {
        campaign: true,
        assets: true,
        analytics: true
      }
    });

    // Parse JSON fields for response
    const processedPost = {
      ...post,
      platforms: JSON.parse(post.platforms),
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      productTags: post.productTags ? JSON.parse(post.productTags) : [],
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      engagementData: post.engagementData ? JSON.parse(post.engagementData) : null
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      postId: post.id
    }, 'Updated social media post');

    res.json({
      success: true,
      data: processedPost
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      postId: req.params.id
    }, 'Error updating social media post');

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

// DELETE /api/vendor/social-media/posts/:id - Delete social media post
router.delete('/posts/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if post exists and belongs to vendor
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Social media post not found'
      });
    }

    await prisma.socialMediaPost.delete({
      where: { id }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      postId: id
    }, 'Deleted social media post');

    res.json({
      success: true,
      message: 'Social media post deleted successfully'
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      postId: req.params.id
    }, 'Error deleting social media post');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/social-media/posts/:id/publish - Publish social media post
router.post('/posts/:id/publish', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if post exists and belongs to vendor
    const existingPost = await prisma.socialMediaPost.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        assets: true
      }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        error: 'Social media post not found'
      });
    }

    // Update status to publishing
    await prisma.socialMediaPost.update({
      where: { id },
      data: { status: 'PUBLISHING' }
    });

    const platforms = JSON.parse(existingPost.platforms);
    const publishResults: any = {};
    let hasErrors = false;

    // Publish to each platform using real APIs
    for (const platform of platforms) {
      try {
        switch (platform.toUpperCase()) {
          case 'FACEBOOK':
            const fbConfig = getFacebookConfig();
            if (fbConfig.accessToken && fbConfig.pageId) {
              const fbService = createFacebookAPIService(fbConfig.accessToken, fbConfig.pageId);
              
              const fbPostData: any = {
                message: existingPost.content
              };

              // Add image if available
              if (existingPost.assets && existingPost.assets.length > 0) {
                const imageAsset = existingPost.assets.find(a => a.type === 'IMAGE');
                if (imageAsset) {
                  fbPostData.picture = imageAsset.url;
                }
              }

              const fbResult = await fbService.createPost(fbPostData);
              publishResults.facebook = {
                success: true,
                postId: fbResult.id,
                permalink: fbResult.permalink_url
              };

              // Store analytics data
              await prisma.socialMediaAnalytics.upsert({
                where: {
                  postId_platform_date: {
                    postId: id,
                    platform: 'FACEBOOK',
                    date: new Date()
                  }
                },
                update: {
                  impressions: fbResult.insights?.impressions || 0,
                  reach: fbResult.insights?.reach || 0,
                  likes: fbResult.insights?.reactions || 0,
                  comments: fbResult.insights?.comments || 0,
                  shares: fbResult.insights?.shares || 0,
                  clicks: fbResult.insights?.clicks || 0
                },
                create: {
                  postId: id,
                  platform: 'FACEBOOK',
                  date: new Date(),
                  impressions: fbResult.insights?.impressions || 0,
                  reach: fbResult.insights?.reach || 0,
                  likes: fbResult.insights?.reactions || 0,
                  comments: fbResult.insights?.comments || 0,
                  shares: fbResult.insights?.shares || 0,
                  clicks: fbResult.insights?.clicks || 0,
                  engagementRate: fbResult.insights?.engagement_rate || 0
                }
              });
            } else {
              publishResults.facebook = {
                success: false,
                error: 'Facebook API not configured'
              };
              hasErrors = true;
            }
            break;

          case 'INSTAGRAM':
            const igConfig = getInstagramConfig();
            if (igConfig.accessToken && igConfig.accountId) {
              const igService = createInstagramAPIService(igConfig.accessToken, igConfig.accountId);
              
              const igMediaData: any = {
                caption: existingPost.content,
                media_type: 'IMAGE'
              };

              // Add image if available
              if (existingPost.assets && existingPost.assets.length > 0) {
                const imageAsset = existingPost.assets.find(a => a.type === 'IMAGE');
                if (imageAsset) {
                  igMediaData.image_url = imageAsset.url;
                } else {
                  // Instagram requires media, skip if no image
                  publishResults.instagram = {
                    success: false,
                    error: 'Instagram posts require an image'
                  };
                  hasErrors = true;
                  continue;
                }
              } else {
                publishResults.instagram = {
                  success: false,
                  error: 'Instagram posts require an image'
                };
                hasErrors = true;
                continue;
              }

              const igResult = await igService.createPost(igMediaData);
              publishResults.instagram = {
                success: true,
                mediaId: igResult.id,
                permalink: igResult.permalink
              };

              // Store analytics data
              await prisma.socialMediaAnalytics.upsert({
                where: {
                  postId_platform_date: {
                    postId: id,
                    platform: 'INSTAGRAM',
                    date: new Date()
                  }
                },
                update: {
                  impressions: igResult.insights?.impressions || 0,
                  reach: igResult.insights?.reach || 0,
                  likes: igResult.insights?.likes || 0,
                  comments: igResult.insights?.comments || 0,
                  shares: igResult.insights?.shares || 0
                },
                create: {
                  postId: id,
                  platform: 'INSTAGRAM',
                  date: new Date(),
                  impressions: igResult.insights?.impressions || 0,
                  reach: igResult.insights?.reach || 0,
                  likes: igResult.insights?.likes || 0,
                  comments: igResult.insights?.comments || 0,
                  shares: igResult.insights?.shares || 0,
                  clicks: 0,
                  engagementRate: 0
                }
              });
            } else {
              publishResults.instagram = {
                success: false,
                error: 'Instagram API not configured'
              };
              hasErrors = true;
            }
            break;

          default:
            publishResults[platform.toLowerCase()] = {
              success: false,
              error: 'Platform not supported yet'
            };
            hasErrors = true;
        }
      } catch (platformError: any) {
        logger.error({
          platform,
          error: platformError.message,
          postId: id
        }, 'Error publishing to platform');

        publishResults[platform.toLowerCase()] = {
          success: false,
          error: platformError.message
        };
        hasErrors = true;
      }
    }

    // Update post status based on results
    const finalStatus = hasErrors ? 'FAILED' : 'PUBLISHED';
    const post = await prisma.socialMediaPost.update({
      where: { id },
      data: {
        status: finalStatus,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null
      },
      include: {
        campaign: true,
        assets: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      postId: post.id,
      platforms: JSON.parse(post.platforms),
      publishResults
    }, 'Completed social media post publishing');

    res.json({
      success: true,
      data: post,
      publishResults,
      message: hasErrors ? 'Post published with some errors' : 'Post published successfully'
    });

  } catch (error: any) {
    // Update post status to failed
    try {
      await prisma.socialMediaPost.update({
        where: { id: req.params.id },
        data: { status: 'FAILED' }
      });
    } catch (updateError) {
      // Log but don't throw
      logger.error({ updateError }, 'Failed to update post status to FAILED');
    }

    logger.error({
      error: error.message,
      postId: req.params.id
    }, 'Error publishing social media post');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// SOCIAL MEDIA ASSETS ENDPOINTS
// ================================

// GET /api/vendor/social-media/assets - Get all assets for vendor
router.get('/assets', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { type, folder, postId } = req.query;

    const whereClause: any = { vendorProfileId: vendorProfile.id };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (folder) {
      whereClause.folder = folder;
    }

    if (postId) {
      whereClause.postId = postId;
    }

    const assets = await prisma.socialMediaAsset.findMany({
      where: whereClause,
      include: {
        post: {
          select: { id: true, content: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const processedAssets = assets.map(asset => ({
      ...asset,
      dimensions: asset.dimensions ? JSON.parse(asset.dimensions) : null,
      tags: asset.tags ? JSON.parse(asset.tags) : []
    }));

    logger.info({
      vendorProfileId: vendorProfile.id,
      assetCount: assets.length,
      filters: { type, folder, postId }
    }, 'Retrieved social media assets for vendor');

    res.json({
      success: true,
      data: processedAssets
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting social media assets');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/social-media/assets - Create new asset
router.post('/assets', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = SocialAssetCreateSchema.parse(req.body);

    // Check if post exists (if postId provided)
    if (validatedData.postId) {
      const post = await prisma.socialMediaPost.findFirst({
        where: { 
          id: validatedData.postId,
          vendorProfileId: vendorProfile.id 
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Social media post not found'
        });
      }
    }

    const asset = await prisma.socialMediaAsset.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        dimensions: validatedData.dimensions ? JSON.stringify(validatedData.dimensions) : null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null
      },
      include: {
        post: true
      }
    });

    // Parse JSON fields for response
    const processedAsset = {
      ...asset,
      dimensions: asset.dimensions ? JSON.parse(asset.dimensions) : null,
      tags: asset.tags ? JSON.parse(asset.tags) : []
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      assetId: asset.id,
      assetType: asset.type
    }, 'Created new social media asset');

    res.status(201).json({
      success: true,
      data: processedAsset
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating social media asset');

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

// DELETE /api/vendor/social-media/assets/:id - Delete asset
router.delete('/assets/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if asset exists and belongs to vendor
    const existingAsset = await prisma.socialMediaAsset.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        error: 'Social media asset not found'
      });
    }

    await prisma.socialMediaAsset.delete({
      where: { id }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      assetId: id
    }, 'Deleted social media asset');

    res.json({
      success: true,
      message: 'Social media asset deleted successfully'
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      assetId: req.params.id
    }, 'Error deleting social media asset');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// CONTENT TEMPLATES ENDPOINTS
// ================================

// GET /api/vendor/social-media/templates - Get all content templates
router.get('/templates', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { category, isPublic } = req.query;

    const whereClause: any = { 
      OR: [
        { vendorProfileId: vendorProfile.id },
        { isPublic: true }
      ]
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }

    const templates = await prisma.contentTemplate.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: { id: true, storeName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields
    const processedTemplates = templates.map(template => ({
      ...template,
      hashtags: template.hashtags ? JSON.parse(template.hashtags) : []
    }));

    logger.info({
      vendorProfileId: vendorProfile.id,
      templateCount: templates.length,
      filters: { category, isPublic }
    }, 'Retrieved content templates for vendor');

    res.json({
      success: true,
      data: processedTemplates
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting content templates');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/social-media/templates - Create new template
router.post('/templates', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = ContentTemplateCreateSchema.parse(req.body);

    const template = await prisma.contentTemplate.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        hashtags: validatedData.hashtags ? JSON.stringify(validatedData.hashtags) : null
      },
      include: {
        vendor: {
          select: { id: true, storeName: true }
        }
      }
    });

    // Parse JSON fields for response
    const processedTemplate = {
      ...template,
      hashtags: template.hashtags ? JSON.parse(template.hashtags) : []
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      templateId: template.id,
      templateName: template.name
    }, 'Created new content template');

    res.status(201).json({
      success: true,
      data: processedTemplate
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating content template');

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

// DELETE /api/vendor/social-media/templates/:id - Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if template exists and belongs to vendor
    const existingTemplate = await prisma.contentTemplate.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Content template not found'
      });
    }

    await prisma.contentTemplate.delete({
      where: { id }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      templateId: id
    }, 'Deleted content template');

    res.json({
      success: true,
      message: 'Content template deleted successfully'
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      templateId: req.params.id
    }, 'Error deleting content template');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export { router as socialMediaRouter };
