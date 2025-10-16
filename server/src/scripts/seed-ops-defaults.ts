/**
 * Seed script to initialize default feature flags and runbooks
 * Run this once after deploying the ops tab
 */

import { featureFlagsService } from '../services/feature-flags.service';
import { runbooksService } from '../services/runbooks.service';
import { logger } from '../logger';

async function seedOpsDefaults() {
  logger.info('Seeding ops defaults...');

  // Initialize feature flags
  await featureFlagsService.initializeDefaults();
  logger.info('✅ Feature flags initialized');

  // Initialize runbooks
  await runbooksService.initializeDefaults();
  logger.info('✅ Runbooks initialized');

  logger.info('🎉 Ops defaults seeded successfully');
}

seedOpsDefaults()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to seed ops defaults:', error);
    process.exit(1);
  });

