import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/event-coordinator/events
router.get('/events', requireAuth, async (req, res) => {
  try {
    if (process.env.ALLOW_MOCK_API !== 'true') {
      // In production, load from database by coordinator ID
      return res.json([]);
    }
    
    // Mock data for development
    res.json([]);
  } catch (error: any) {
    console.error('EVENT_COORDINATOR_EVENTS_ERROR', error);
    res.status(500).json({ 
      error: 'EVENTS_FETCH_FAILED', 
      message: error.message 
    });
  }
});

// GET /api/event-coordinator/events/:eventId/applications
router.get('/events/:eventId/applications', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (process.env.ALLOW_MOCK_API !== 'true') {
      // In production, load from database
      return res.json([]);
    }
    
    // Mock data for development
    res.json([]);
  } catch (error: any) {
    console.error('EVENT_COORDINATOR_APPLICATIONS_ERROR', error);
    res.status(500).json({ 
      error: 'APPLICATIONS_FETCH_FAILED', 
      message: error.message 
    });
  }
});

// GET /api/event-coordinator/events/:eventId/inventory
router.get('/events/:eventId/inventory', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (process.env.ALLOW_MOCK_API !== 'true') {
      // In production, load from database
      return res.json([]);
    }
    
    // Mock data for development
    res.json([]);
  } catch (error: any) {
    console.error('EVENT_COORDINATOR_INVENTORY_ERROR', error);
    res.status(500).json({ 
      error: 'INVENTORY_FETCH_FAILED', 
      message: error.message 
    });
  }
});

export default router;

