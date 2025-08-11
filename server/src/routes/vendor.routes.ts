import express from 'express';
import { validate, zLimitOffset, zId } from '../validation/common';
import { getVendorById, getVendorProducts } from '../controllers/vendor.controller';
import { createHash } from 'crypto';

const router = express.Router();

// GET /vendors/:vendorId
router.get('/:vendorId', 
  validate(zId, 'params'),
  async (req, res, next) => {
    try {
      await getVendorById(req, res);
      
      // Set ETag header based on response body
      const body = JSON.stringify(res.locals.responseBody || {});
      const etag = createHash('md5').update(body).digest('hex');
      res.set('ETag', `"${etag}"`);
      
      // Set cache control
      res.set('Cache-Control', 'public, max-age=300');
      
      // Set request ID if available
      if (res.locals.requestId) {
        res.set('x-request-id', res.locals.requestId);
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET /vendors/:vendorId/products
router.get('/:vendorId/products',
  validate(zId, 'params'),
  validate(zLimitOffset, 'query'),
  async (req, res, next) => {
    try {
      await getVendorProducts(req, res);
      
      // Set ETag header based on response body
      const body = JSON.stringify(res.locals.responseBody || {});
      const etag = createHash('md5').update(body).digest('hex');
      res.set('ETag', `"${etag}"`);
      
      // Set cache control
      res.set('Cache-Control', 'public, max-age=60');
      
      // Set request ID if available
      if (res.locals.requestId) {
        res.set('x-request-id', res.locals.requestId);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
