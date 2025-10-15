import { createHash } from 'crypto';
import { prisma } from '../db';
import { logger } from '../logger';
import { ActorType, AuditScope, Severity } from '@prisma/client';

// Actions that require a reason
const ACTIONS_REQUIRING_REASON = new Set([
  'AUTH_IMPERSONATION_STARTED',
  'AUTH_IMPERSONATION_ENDED',
  'USER_ROLE_GRANTED',
  'USER_ROLE_REVOKED',
  'USER_SUSPENDED',
  'USER_REINSTATED',
  'USER_DELETED_SOFT',
  'USER_ANONYMIZED',
  'USER_MERGED',
  'REVENUE_FEE_SCHEDULE_ACTIVATED',
  'REVENUE_PAYOUT_ADJUSTED',
  'REVENUE_REFUND_POLICY_UPDATED',
  'CONFIG_WEBHOOK_SECRET_ROTATED',
  'CONFIG_API_KEY_ROTATED',
  'PRIVACY_SAR_REQUESTED',
  'PRIVACY_SAR_DENIED',
]);

export interface LogEventParams {
  scope: AuditScope;
  action: string;
  actorId?: string | null;
  actorType?: ActorType;
  actorIp?: string;
  actorUa?: string;
  requestId?: string;
  traceId?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  severity?: Severity;
  diffBefore?: any;
  diffAfter?: any;
  metadata?: any;
  tenantId?: string;
}

// PII redaction utilities
function redactEmail(email: string): string {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return `${maskedLocal}@${domain}`;
}

function redactPhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\d(?=\d{4})/g, '*');
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex').substring(0, 16);
}

function redactPII(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const redacted: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Redact sensitive fields
    if (lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('key')) {
      redacted[key] = '[REDACTED]';
    } else if (lowerKey.includes('email') && typeof value === 'string') {
      redacted[key] = redactEmail(value);
    } else if (lowerKey.includes('phone') && typeof value === 'string') {
      redacted[key] = redactPhone(value);
    } else if (lowerKey.includes('ssn') || lowerKey.includes('tax') || lowerKey.includes('ein')) {
      redacted[key] = typeof value === 'string' ? `[HASH:${hashValue(value)}]` : '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactPII(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

// Create canonical payload for hashing
function buildCanonicalPayload(event: any): string {
  const keys = [
    'occurredAt',
    'actorId',
    'actorType',
    'requestId',
    'scope',
    'action',
    'targetType',
    'targetId',
    'reason',
    'severity',
    'diffBefore',
    'diffAfter',
    'metadata',
    'prevHash',
  ].sort();
  
  const canonical: any = {};
  for (const key of keys) {
    if (event[key] !== undefined && event[key] !== null) {
      canonical[key] = event[key];
    }
  }
  
  return JSON.stringify(canonical);
}

// Compute SHA-256 hash
function computeHash(payload: string): string {
  return createHash('sha256').update(payload).digest('base64');
}

// Check if action requires a reason
export function requireReason(action: string): boolean {
  return ACTIONS_REQUIRING_REASON.has(action);
}

// Main audit logging function
export async function logEvent(params: LogEventParams): Promise<void> {
  try {
    // Validate required reason
    if (requireReason(params.action) && !params.reason) {
      logger.warn({ action: params.action }, 'Audit event requires a reason but none was provided');
      // Don't throw - log the event anyway but mark it
      params.severity = Severity.WARNING;
      params.metadata = { 
        ...(params.metadata || {}), 
        missingReason: true 
      };
    }

    // Redact PII from diffs
    const redactedBefore = params.diffBefore ? redactPII(params.diffBefore) : null;
    const redactedAfter = params.diffAfter ? redactPII(params.diffAfter) : null;

    // Prepare event data
    const occurredAt = new Date();
    const eventData = {
      occurredAt,
      actorId: params.actorId || null,
      actorType: params.actorType || ActorType.USER,
      actorIp: params.actorIp,
      actorUa: params.actorUa,
      requestId: params.requestId,
      traceId: params.traceId,
      scope: params.scope,
      action: params.action,
      targetType: params.targetType || null,
      targetId: params.targetId || null,
      reason: params.reason || null,
      severity: params.severity || Severity.INFO,
      diffBefore: redactedBefore,
      diffAfter: redactedAfter,
      metadata: params.metadata || null,
      tenantId: params.tenantId || null,
    };

    // Fetch the last hash for chaining (by tenantId if present)
    const lastEvent = await prisma.auditEvent.findFirst({
      where: params.tenantId ? { tenantId: params.tenantId } : {},
      orderBy: { occurredAt: 'desc' },
      select: { selfHash: true },
    });

    const prevHash = lastEvent?.selfHash || null;

    // Build canonical payload and compute hash
    const canonicalPayload = buildCanonicalPayload({
      ...eventData,
      prevHash,
    });
    
    const selfHash = computeHash(canonicalPayload);

    // Insert the audit event
    await prisma.auditEvent.create({
      data: {
        ...eventData,
        prevHash,
        selfHash,
      },
    });

    logger.debug({ 
      action: params.action, 
      scope: params.scope, 
      targetId: params.targetId 
    }, 'Audit event logged');

  } catch (error) {
    // Never fail the main operation due to audit logging errors
    logger.error({ error, params }, 'Failed to log audit event');
  }
}

// Batch event logger
export async function logEventBatch(events: LogEventParams[]): Promise<void> {
  for (const event of events) {
    await logEvent(event);
  }
}

// Wrapper to audit mutations
export function withAudit<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  buildAuditArgs: (result: any, ...args: Parameters<T>) => LogEventParams
): T {
  return (async (...args: Parameters<T>) => {
    const result = await handler(...args);
    
    try {
      const auditArgs = buildAuditArgs(result, ...args);
      await logEvent(auditArgs);
    } catch (error) {
      logger.error({ error }, 'Failed to audit mutation');
    }
    
    return result;
  }) as T;
}

