import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { FacebookAPIService, getDefaultFacebookConfig } from '../services/facebookAPI';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Facebook API service
const facebookAPI = new FacebookAPIService(getDefaultFacebookConfig());

// Validation schemas
const ConnectFacebookSchema = z.object({
  vendorId: z.string().uuid()
});

const FacebookCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
  error_description: z.string().optional()
});

// Helper function to authenticate vendor
async function authenticateVendor(req: any) {
  const vendorId = req.user?.userId;
  if (!vendorId) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user?.vendorProfile || user.role !== 'VENDOR') {
    throw new Error('Vendor access required');
  }

  return user.vendorProfile;
}

// GET /api/vendor/facebook-auth/connect
// Generate Facebook OAuth URL for vendor
router.get('/connect', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    
    // Generate random state for security
    const state = `${vendor.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store state temporarily (you might want to use Redis in production)
    const authURL = facebookAPI.generateAuthURL(state);
    
    // Store the state in database temporarily
    await prisma.socialMediaAccount.upsert({
      where: {
        vendorProfileId_platform: {
          vendorProfileId: vendor.id,
          platform: 'FACEBOOK_PENDING'
        }
      },
      update: {
        authState: state,
        updatedAt: new Date()
      },
      create: {
        vendorProfileId: vendor.id,
        platform: 'FACEBOOK_PENDING',
        username: '',
        authState: state,
        isActive: false
      }
    });

    logger.info(`Generated Facebook auth URL for vendor: ${vendor.id}`);
    
    res.json({
      success: true,
      data: {
        authURL,
        state
      }
    });
  } catch (error) {
    logger.error('Facebook connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Facebook auth URL',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vendor/facebook-auth/callback
// Handle Facebook OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = FacebookCallbackSchema.parse(req.query);
    
    if (error) {
      logger.error(`Facebook auth error: ${error} - ${error_description}`);
      return res.redirect(`${process.env.CLIENT_URL}/dashboard/vendor/promotions?error=facebook_auth_failed`);
    }

    // Verify state and get vendor
    const [vendorId] = state.split('_');
    
    const pendingAuth = await prisma.socialMediaAccount.findFirst({
      where: {
        vendorProfileId: vendorId,
        platform: 'FACEBOOK_PENDING',
        authState: state
      },
      include: {
        vendorProfile: true
      }
    });

    if (!pendingAuth) {
      logger.error(`Invalid state or expired auth request: ${state}`);
      return res.redirect(`${process.env.CLIENT_URL}/dashboard/vendor/promotions?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenData = await facebookAPI.exchangeCodeForToken(code);
    
    // Get long-lived token
    const longLivedToken = await facebookAPI.getLongLivedToken(tokenData.access_token);
    
    // Get user's Facebook pages
    const pages = await facebookAPI.getUserPages(longLivedToken.access_token);
    
    // Store Facebook accounts in database
    const createdAccounts = [];
    
    for (const page of pages) {
      // Store Facebook page
      const facebookAccount = await prisma.socialMediaAccount.upsert({
        where: {
          vendorProfileId_platform_externalId: {
            vendorProfileId: pendingAuth.vendorProfileId,
            platform: 'FACEBOOK',
            externalId: page.id
          }
        },
        update: {
          username: page.name,
          accessToken: page.accessToken,
          refreshToken: longLivedToken.access_token,
          expiresAt: new Date(Date.now() + longLivedToken.expires_in * 1000),
          isActive: true,
          metadata: {
            category: page.category,
            permissions: ['pages_manage_posts', 'pages_read_engagement']
          },
          updatedAt: new Date()
        },
        create: {
          vendorProfileId: pendingAuth.vendorProfileId,
          platform: 'FACEBOOK',
          externalId: page.id,
          username: page.name,
          accessToken: page.accessToken,
          refreshToken: longLivedToken.access_token,
          expiresAt: new Date(Date.now() + longLivedToken.expires_in * 1000),
          isActive: true,
          metadata: {
            category: page.category,
            permissions: ['pages_manage_posts', 'pages_read_engagement']
          }
        }
      });
      
      createdAccounts.push(facebookAccount);
      
      // If page has Instagram business account, store that too
      if (page.instagram_business_account) {
        const instagramAccount = await prisma.socialMediaAccount.upsert({
          where: {
            vendorProfileId_platform_externalId: {
              vendorProfileId: pendingAuth.vendorProfileId,
              platform: 'INSTAGRAM',
              externalId: page.instagram_business_account.id
            }
          },
          update: {
            username: `@${page.name.toLowerCase().replace(/\s+/g, '')}`,
            accessToken: page.accessToken, // Instagram uses the page access token
            refreshToken: longLivedToken.access_token,
            expiresAt: new Date(Date.now() + longLivedToken.expires_in * 1000),
            isActive: true,
            metadata: {
              facebookPageId: page.id,
              permissions: ['instagram_basic', 'instagram_content_publish']
            },
            updatedAt: new Date()
          },
          create: {
            vendorProfileId: pendingAuth.vendorProfileId,
            platform: 'INSTAGRAM',
            externalId: page.instagram_business_account.id,
            username: `@${page.name.toLowerCase().replace(/\s+/g, '')}`,
            accessToken: page.accessToken,
            refreshToken: longLivedToken.access_token,
            expiresAt: new Date(Date.now() + longLivedToken.expires_in * 1000),
            isActive: true,
            metadata: {
              facebookPageId: page.id,
              permissions: ['instagram_basic', 'instagram_content_publish']
            }
          }
        });
        
        createdAccounts.push(instagramAccount);
      }
    }

    // Clean up pending auth record
    await prisma.socialMediaAccount.delete({
      where: { id: pendingAuth.id }
    });

    logger.info(`Successfully connected ${createdAccounts.length} social media accounts for vendor: ${pendingAuth.vendorProfileId}`);

    // Redirect back to promotions page with success
    res.redirect(`${process.env.CLIENT_URL}/dashboard/vendor/promotions?connected=facebook&accounts=${createdAccounts.length}`);
    
  } catch (error) {
    logger.error('Facebook callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/dashboard/vendor/promotions?error=callback_failed`);
  }
});

// GET /api/vendor/facebook-auth/accounts
// Get connected Facebook/Instagram accounts for vendor
router.get('/accounts', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    
    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        vendorProfileId: vendor.id,
        platform: {
          in: ['FACEBOOK', 'INSTAGRAM']
        },
        isActive: true
      },
      select: {
        id: true,
        platform: true,
        externalId: true,
        username: true,
        isActive: true,
        expiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Check token expiry and refresh if needed
    const activeAccounts = [];
    for (const account of accounts) {
      if (account.expiresAt && account.expiresAt < new Date()) {
        logger.warn(`Token expired for account: ${account.id}`);
        // Mark as inactive or attempt refresh
        await prisma.socialMediaAccount.update({
          where: { id: account.id },
          data: { isActive: false }
        });
      } else {
        activeAccounts.push(account);
      }
    }

    res.json({
      success: true,
      data: activeAccounts
    });
    
  } catch (error) {
    logger.error('Get Facebook accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connected accounts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/vendor/facebook-auth/disconnect/:accountId
// Disconnect a Facebook/Instagram account
router.delete('/disconnect/:accountId', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { accountId } = req.params;

    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id: accountId,
        vendorProfileId: vendor.id,
        platform: {
          in: ['FACEBOOK', 'INSTAGRAM']
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Deactivate the account (don't delete to preserve historical data)
    await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: {
        isActive: false,
        accessToken: null,
        refreshToken: null,
        updatedAt: new Date()
      }
    });

    logger.info(`Disconnected ${account.platform} account: ${accountId} for vendor: ${vendor.id}`);

    res.json({
      success: true,
      message: `${account.platform} account disconnected successfully`
    });
    
  } catch (error) {
    logger.error('Facebook disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/vendor/facebook-auth/refresh-token/:accountId
// Refresh access token for an account
router.post('/refresh-token/:accountId', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { accountId } = req.params;

    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id: accountId,
        vendorProfileId: vendor.id,
        platform: 'FACEBOOK',
        isActive: true
      }
    });

    if (!account || !account.refreshToken) {
      return res.status(404).json({
        success: false,
        message: 'Account not found or no refresh token available'
      });
    }

    // Refresh the page access token
    const newToken = await facebookAPI.refreshPageToken(
      account.externalId!, 
      account.refreshToken
    );

    // Update the token in database
    await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: {
        accessToken: newToken,
        updatedAt: new Date()
      }
    });

    logger.info(`Refreshed token for Facebook account: ${accountId}`);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
