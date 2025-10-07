import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { loadAccountContext, requireAccountContext } from '../middleware/account-auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

// Import route handlers
import { settingsOverview } from './settings/overview';
import { profileRoutes } from './settings/profile';
import { organizationRoutes } from './settings/organization';
import { teamRoutes } from './settings/team';
import { socialRoutes } from './settings/social';
import { securityRoutes } from './settings/security';
import { notificationsRoutes } from './settings/notifications';
import { billingRoutes } from './settings/billing';
import { documentsRoutes } from './settings/documents';
import { integrationsRoutes } from './settings/integrations';
import { auditRoutes } from './settings/audit';
import { dangerZoneRoutes } from './settings/danger-zone';

const router = Router();

// Apply authentication and account context to all routes
router.use(requireAuth);
router.use(loadAccountContext);
router.use(requireAccountContext);

// Settings overview
router.get('/overview', settingsOverview);

// Profile routes
router.use('/profile', profileRoutes);

// Organization routes
router.use('/org', organizationRoutes);

// Team routes
router.use('/team', teamRoutes);

// Social links routes
router.use('/social-links', socialRoutes);

// Security routes
router.use('/security', securityRoutes);

// Notifications routes
router.use('/notifications', notificationsRoutes);

// Billing routes
router.use('/billing', billingRoutes);

// Documents routes
router.use('/documents', documentsRoutes);

// Integrations routes
router.use('/integrations', integrationsRoutes);

// Audit routes
router.use('/audit', auditRoutes);

// Danger zone routes
router.use('/danger-zone', dangerZoneRoutes);

export default router;

