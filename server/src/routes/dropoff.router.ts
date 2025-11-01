import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as dropoffService from '../services/dropoff.service';

const router = Router();

// GET /api/dropoff/locations
router.get('/locations', requireAuth, async (req, res, next) => {
  try {
    const locations = await dropoffService.getDropoffLocations();
    return res.json(locations);
  } catch (error: any) {
    return next(error);
  }
});

export default router;

