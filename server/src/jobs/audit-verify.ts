import cron from 'node-cron';
import { createHash } from 'crypto';
import { prisma } from '../db';
import { logger } from '../logger';

// Verify audit chain integrity
async function verifyAuditChain(): Promise<{
  isValid: boolean;
  checkedCount: number;
  totalCount: number;
  firstBreakId: string | null;
  errors: string[];
}> {
  try {
    logger.info('Starting audit chain verification...');

    // Fetch all events ordered by time
    const events = await prisma.auditEvent.findMany({
      orderBy: { occurredAt: 'asc' },
      select: {
        id: true,
        occurredAt: true,
        actorId: true,
        actorType: true,
        requestId: true,
        scope: true,
        action: true,
        targetType: true,
        targetId: true,
        reason: true,
        severity: true,
        diffBefore: true,
        diffAfter: true,
        metadata: true,
        prevHash: true,
        selfHash: true,
      },
    });

    let isValid = true;
    let firstBreakId: string | null = null;
    let checkedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const prevEvent = i > 0 ? events[i - 1] : null;

      // Verify prevHash matches previous event's selfHash
      if (prevEvent && event.prevHash !== prevEvent.selfHash) {
        isValid = false;
        firstBreakId = event.id;
        const error = `Chain break: Event ${event.id} prevHash does not match previous event ${prevEvent.id} selfHash`;
        errors.push(error);
        logger.error(error);
        break;
      }

      // Verify selfHash is correct
      const canonicalPayload = JSON.stringify({
        occurredAt: event.occurredAt,
        actorId: event.actorId,
        actorType: event.actorType,
        requestId: event.requestId,
        scope: event.scope,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        reason: event.reason,
        severity: event.severity,
        diffBefore: event.diffBefore,
        diffAfter: event.diffAfter,
        metadata: event.metadata,
        prevHash: event.prevHash,
      });
      
      const computedHash = createHash('sha256').update(canonicalPayload).digest('base64');

      if (computedHash !== event.selfHash) {
        isValid = false;
        firstBreakId = event.id;
        const error = `Hash mismatch: Event ${event.id} selfHash is invalid (tampered?)`;
        errors.push(error);
        logger.error(error);
        break;
      }

      checkedCount++;
    }

    const result = {
      isValid,
      checkedCount,
      totalCount: events.length,
      firstBreakId,
      errors,
    };

    if (isValid) {
      logger.info({
        checkedCount,
        totalCount: events.length,
      }, 'Audit chain verification successful');
    } else {
      logger.error({
        firstBreakId,
        checkedCount,
        totalCount: events.length,
        errors,
      }, 'Audit chain verification FAILED');
    }

    return result;
  } catch (error) {
    logger.error({ error }, 'Error during audit chain verification');
    throw error;
  }
}

// Cron job: Runs every Sunday at 2 AM
let verificationJob: cron.ScheduledTask | null = null;

export function startAuditVerificationJob() {
  if (verificationJob) {
    logger.warn('Audit verification job is already running');
    return;
  }

  // Schedule: Every Sunday at 2:00 AM
  verificationJob = cron.schedule('0 2 * * 0', async () => {
    try {
      logger.info('Running weekly audit chain verification...');
      const result = await verifyAuditChain();

      if (!result.isValid) {
        // TODO: Send alert email/Slack notification
        logger.critical({
          ...result,
          message: 'CRITICAL: Audit chain integrity compromised!',
        }, 'Audit chain verification failed');

        // Here you would send email/Slack alerts
        // await sendAlertEmail({
        //   subject: 'CRITICAL: Audit Chain Integrity Compromised',
        //   body: `Audit chain verification failed at event ${result.firstBreakId}`,
        // });
      }
    } catch (error) {
      logger.error({ error }, 'Weekly audit verification job failed');
    }
  });

  logger.info('Audit verification cron job started (runs every Sunday at 2 AM)');
}

export function stopAuditVerificationJob() {
  if (verificationJob) {
    verificationJob.stop();
    verificationJob = null;
    logger.info('Audit verification cron job stopped');
  }
}

// Export for manual verification
export { verifyAuditChain };

