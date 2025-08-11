import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validateQuery, validateParams, zLimitOffset, zId } from '../validation/common';

const router = Router();

// GET /api/products - List products with pagination
router.get('/', 
  validateQuery(zLimitOffset),
  productController.list
);

// GET /api/products/:id - Get product by ID
router.get('/:id',
  validateParams(zId),
  productController.byId
);

export default router;
