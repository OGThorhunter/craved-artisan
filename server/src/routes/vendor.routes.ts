import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller';
import { validateQuery, validateParams, zLimitOffset, zId } from '../validation/common';

const router = Router();

// GET /api/vendors - List vendors with pagination (handy for QA)
router.get('/',
  validateQuery(zLimitOffset),
  vendorController.list
);

// GET /api/vendors/:id - Get vendor by ID
router.get('/:id',
  validateParams(zId),
  vendorController.byId
);

// GET /api/vendors/:id/products - Get products for a specific vendor
router.get('/:id/products',
  validateParams(zId),
  validateQuery(zLimitOffset),
  vendorController.productsForVendor
);

export default router;
