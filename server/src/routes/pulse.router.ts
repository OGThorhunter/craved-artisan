import { Router } from 'express';
import { getVendorPulse } from '../services/pulse.service';
import type { PulseRange } from '../types/pulse';

export const pulseRouter = Router();

pulseRouter.get('/vendor/:vendorId/pulse', async (req, res) => {
  const { vendorId } = req.params;
  const range = (req.query.range as PulseRange) || 'today';
  
  try {
    // Optional: auth check (req.session.userId vs vendor relationship)
    // TODO: Add authentication middleware when ready
    // if (!req.user || req.user.role !== 'VENDOR') {
    //   return res.status(403).json({ error: 'VENDOR_ACCESS_REQUIRED' });
    // }
    
    const payload = await getVendorPulse(vendorId, range);
    res.json(payload);
    
  } catch (e: any) {
    console.error('PULSE_ERROR', e);
    res.status(500).json({ error: 'PULSE_FAILED', message: e.message });
  }
});
