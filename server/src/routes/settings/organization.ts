import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canManageOrganization } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';

const router = Router();

// Validation schemas
const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  primaryEmail: z.string().email(),
  primaryPhone: z.string().optional(),
  taxId: z.string().optional(),
  logoUrl: z.string().url().optional()
});

const updateAddressSchema = z.object({
  name: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().default('US')
});

// GET /api/settings/org
export const getOrganization = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        address: true
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: account.id,
        name: account.name,
        slug: account.slug,
        logoUrl: account.logoUrl,
        primaryEmail: account.primaryEmail,
        primaryPhone: account.primaryPhone,
        taxId: account.taxId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        address: account.address
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching organization');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/org
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { name, primaryEmail, primaryPhone, taxId, logoUrl } = req.body;

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        name,
        primaryEmail,
        primaryPhone,
        taxId,
        logoUrl
      },
      include: {
        address: true
      }
    });

    res.json({
      success: true,
      data: updatedAccount,
      message: 'Organization updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating organization');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/settings/org/address
export const getAddress = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        address: true
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: account.address
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching address');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/org/address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const addressData = req.body;

    // Check if account already has an address
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { address: true }
    });

    let address;

    if (account?.address) {
      // Update existing address
      address = await prisma.address.update({
        where: { id: account.address.id },
        data: addressData
      });
    } else {
      // Create new address and link to account
      address = await prisma.address.create({
        data: addressData
      });

      await prisma.account.update({
        where: { id: accountId },
        data: { addressId: address.id }
      });
    }

    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating address');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply middleware and routes
router.use(requireAuth);
router.use(loadAccountContext);
router.use(requireAccountContext);

router.get('/', getOrganization);
router.put('/', canManageOrganization, validateRequest(updateOrganizationSchema), updateOrganization);
router.get('/address', getAddress);
router.put('/address', canManageOrganization, validateRequest(updateAddressSchema), updateAddress);

export const organizationRoutes = router;
