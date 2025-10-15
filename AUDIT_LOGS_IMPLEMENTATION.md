# Audit Logs System - Implementation Documentation

## Overview

The Audit Logs system provides a complete, tamper-evident, append-only trail of sensitive actions across the Craved Artisan platform. It uses SHA-256 hash chaining for tamper evidence, PII redaction for compliance, and comprehensive event tracking for forensics and regulatory compliance (GDPR/CCPA).

## Architecture

### Core Components

#### 1. Database Schema (`prisma/schema.prisma`)

**AuditEvent Model**
- ✅ **Hash Chain Fields**: `prevHash`, `selfHash` for tamper-evident chaining
- ✅ **Actor Metadata**: `actorId`, `actorType`, `actorIp`, `actorUa`
- ✅ **Request Tracing**: `requestId`, `traceId` for distributed tracing
- ✅ **Event Classification**: `scope`, `action`, `severity`
- ✅ **Entity Tracking**: `targetType`, `targetId`
- ✅ **PII-Safe Diffs**: `diffBefore`, `diffAfter` (redacted)
- ✅ **Justification**: `reason` field (required for sensitive operations)

**Enums**
- ✅ `ActorType`: USER, SYSTEM, WEBHOOK
- ✅ `AuditScope`: AUTH, USER, REVENUE, ORDER, INVENTORY, MESSAGE, EVENT, CONFIG, PRIVACY
- ✅ `Severity`: INFO, NOTICE, WARNING, CRITICAL

**Indices**
- ✅ `(scope, action, occurredAt)`
- ✅ `(targetType, targetId, occurredAt)`
- ✅ `(actorId, occurredAt)`
- ✅ `(requestId)`, `(traceId)`

#### 2. Audit Utilities (`server/src/utils/audit.ts`)

**PII Redaction**
- ✅ Email masking: `user@example.com` → `u***r@example.com`
- ✅ Phone masking: `555-1234` → `***-1234`
- ✅ Password/Secret/Token redaction: `[REDACTED]`
- ✅ SSN/Tax ID hashing: `[HASH:abc123...]`

**Hash Chain Implementation**
- ✅ Canonical payload builder with sorted keys
- ✅ SHA-256 hashing with Base64 encoding
- ✅ Previous hash fetching and linking
- ✅ Automatic chain verification

**Core Functions**
- ✅ `logEvent()` - Main audit logging function
- ✅ `requireReason()` - Validation for sensitive actions
- ✅ `withAudit()` - Wrapper for mutation handlers
- ✅ `logEventBatch()` - Batch event logger

#### 3. Request Context Middleware (`server/src/middleware/request-context.ts`)

- ✅ Captures `requestId` and `traceId` from headers
- ✅ Generates IDs if missing (using UUID)
- ✅ Extracts actor metadata: userId, IP, User-Agent, roles
- ✅ Attaches context to `req.context` for all handlers
- ✅ Sets response headers for tracing

#### 4. Event Constants (`server/src/constants/audit-events.ts`)

**Event Codes Defined**
- ✅ **Auth Events** (10): LOGIN_SUCCESS, LOGIN_FAIL, PASSWORD_CHANGED, MFA, IMPERSONATION, etc.
- ✅ **User Events** (14): CREATED, UPDATED, SUSPENDED, ROLE_GRANTED, TEAM_INVITED, etc.
- ✅ **Revenue Events** (8): FEE_SCHEDULE, PROMO_ISSUED, PAYOUT_ADJUSTED, etc.
- ✅ **Order Events** (5): STATE_CHANGED, REFUNDED, EDITED, etc.
- ✅ **Inventory Events** (4): ADJUSTMENT, WASTE_LOGGED, RECIPE_RUN, etc.
- ✅ **Message Events** (5): BROADCAST, THREAD_JOINED, NOTE/TASK operations
- ✅ **Event (Coordinator) Events** (5): CREATED, UPDATED, SETTLEMENT_CLOSED, etc.
- ✅ **Config Events** (7): WEBHOOK/API_KEY rotation, POLICY changes, etc.
- ✅ **Privacy Events** (6): SAR operations, DATA_EXPORTED, DELETE/ANONYMIZE
- ✅ **Account Events** (3): CREATED, DELETED, SETTINGS_UPDATED

**Helper Functions**
- ✅ `isCriticalEvent()` - Identifies critical events for alerting
- ✅ Event category helpers: `isAuthEvent()`, `isPrivacyEvent()`, etc.

#### 5. Admin API Routes (`server/src/routes/admin-audit.router.ts`)

**Endpoints**
- ✅ `GET /api/admin/audit` - List events with filters
  - Filters: date range, scope, action, actor, target, severity, requestId, traceId
  - Pagination support (50 per page)
  - Includes actor details

- ✅ `GET /api/admin/audit/:id` - Event detail
  - Full event data with actor info
  - Related events in same request

- ✅ `POST /api/admin/audit/export` - Export events
  - Formats: CSV, JSONL
  - Filtered export support
  - Downloadable file response

- ✅ `POST /api/admin/audit/verify` - Chain verification
  - Verifies hash chain integrity over filter range
  - Returns first break ID if invalid
  - Provides verification verdict

#### 6. Integration Points

**Auth & Security** ✅
- ✅ Login success/fail (`server/src/routes/auth.ts`)
- ✅ Logout (`server/src/routes/auth.ts`)
- ✅ Password changes (`server/src/routes/settings/security.ts`)
- ✅ Session termination (`server/src/routes/settings/security.ts`)
- ⏳ 2FA enroll/remove (placeholders exist)
- ⏳ Impersonation start/stop (to be implemented)

**Users & Roles** ✅
- ✅ Team member invite (`server/src/routes/settings/team.ts`)
- ✅ Team member removed (`server/src/routes/settings/team.ts`)
- ✅ Role changes (`server/src/routes/settings/team.ts`)
- ⏳ User suspension/reinstatement
- ⏳ Ownership transfer (imports added to `danger-zone.ts`)
- ⏳ Account deletion/anonymization

**Revenue** ⏳
- ⏳ Fee schedule activation
- ⏳ Promo/credit issuance
- ⏳ Payout adjustments
- ⏳ Refund policy changes

**Orders & Inventory** ⏳
- ⏳ Order state changes
- ⏳ Order refunds/cancellations
- ⏳ Inventory adjustments
- ⏳ Waste logs

#### 7. Chain Verification Job (`server/src/jobs/audit-verify.ts`)

- ✅ Weekly cron job (Sunday 2 AM)
- ✅ Verifies entire audit chain integrity
- ✅ Checks `prevHash` links between events
- ✅ Recomputes and validates `selfHash` for each event
- ✅ Logs errors and first break ID
- ✅ Integrated into `CronJobService`
- ⏳ Email/Slack alerting (TODO: implement)

#### 8. Frontend UI (`client/src/pages/AuditLogsPage.tsx`)

**Features**
- ✅ Audit events table with pagination
- ✅ Filter panel (date range, scope, action, severity, search)
- ✅ Scope and severity badges with color coding
- ✅ Actor information display
- ✅ Export button (downloads CSV)
- ✅ Verify Chain button
- ✅ Responsive design with Tailwind CSS
- ⏳ Event detail drawer/modal
- ⏳ Related events panel
- ⏳ Diff viewer (side-by-side comparison)
- ⏳ Hash chain visualization

## Event Flow

### 1. Request arrives
```
Client → Express → CORS → JSON Parser → Session → requestContext
```

### 2. Request context is set
```typescript
req.context = {
  requestId: 'uuid-or-from-header',
  traceId: 'optional-trace-id',
  actor: { id, ip, ua, roles }
}
```

### 3. Business logic executes
```typescript
// Example: User logs in
const user = await validateCredentials(email, password);
req.session.userId = user.id;
```

### 4. Audit event is logged
```typescript
await logEvent({
  scope: AuditScope.AUTH,
  action: AUTH_LOGIN_SUCCESS,
  actorId: user.id,
  actorType: ActorType.USER,
  actorIp: req.context?.actor.ip,
  actorUa: req.context?.actor.ua,
  requestId: req.context?.requestId,
  traceId: req.context?.traceId,
  targetType: 'User',
  targetId: user.id,
  severity: Severity.INFO,
  metadata: { email, role: user.role }
});
```

### 5. Event is persisted with hash chain
```typescript
1. Redact PII from diffs
2. Fetch last event's selfHash as prevHash
3. Build canonical payload (sorted keys)
4. Compute selfHash = SHA-256(canonical)
5. Insert event with prevHash and selfHash
```

## Security Features

### Tamper Evidence
- **Hash Chaining**: Each event links to previous via `prevHash`
- **Self-Hashing**: Each event has `selfHash` computed from canonical payload
- **Canonical Format**: Consistent JSON with sorted keys for reproducible hashing
- **Verification Job**: Weekly automated integrity checks

### PII Protection
- **Email Redaction**: First/last char + domain visible
- **Phone Masking**: Last 4 digits visible
- **Secret Removal**: Passwords, tokens, API keys redacted
- **Hash-based IDs**: Sensitive IDs stored as SHA-256 hashes

### Access Control
- ✅ Admin authentication required (`requireAuth`)
- ⏳ Granular permissions (AUDIT_READ_ALL, AUDIT_READ_MASKED, AUDIT_EXPORT, AUDIT_VERIFY)
- ⏳ Scope-based filtering (Staff Admin sees masked PII)
- ⏳ Rate limiting on export endpoints

## Compliance Features

### GDPR/CCPA Support
- ✅ Subject Access Request (SAR) event logging
- ✅ Data export tracking
- ✅ Delete vs Anonymize differentiation
- ✅ PII redaction in audit trails
- ⏳ Retention policies (18-24 months hot + cold archive)
- ⏳ Right to be forgotten implementation

### Forensic Capabilities
- ✅ Complete action trail with timestamps
- ✅ Actor identification (user, system, webhook)
- ✅ IP and User-Agent tracking
- ✅ Request correlation via requestId
- ✅ Distributed tracing via traceId
- ✅ Before/after diffs (redacted)
- ✅ Reason capture for sensitive operations

## Operational Features

### Monitoring
- ✅ Winston logger integration
- ✅ Debug logging for audit operations
- ✅ Error logging for failures
- ✅ Critical event identification
- ⏳ Metrics collection (event counts, chain verification status)

### Alerting
- ✅ Critical event detection
- ✅ Chain break logging
- ⏳ Email alerts for chain breaks
- ⏳ Slack notifications for critical events
- ⏳ Alert policy configuration

### Export & Archival
- ✅ CSV export with filters
- ✅ JSONL export format
- ⏳ Monthly archival to S3/compatible storage
- ⏳ Object lock (WORM) for immutability
- ⏳ Anchor hash storage for batches
- ⏳ Cold storage retention policies

## Testing

### Unit Tests ⏳
- [ ] Hash chain logic tests
- [ ] PII redaction tests
- [ ] Canonical payload generation tests
- [ ] Event validation tests

### Integration Tests ⏳
- [ ] Auth operations audit logging
- [ ] User operations audit logging
- [ ] API endpoint tests (list, detail, export, verify)
- [ ] Chain verification with tampered data

### E2E Tests ⏳
- [ ] Full audit flow from action to verification
- [ ] UI filter and export functionality
- [ ] Chain break detection and alerting

## Future Enhancements

### Immediate (Next Sprint)
- [ ] Complete revenue operations integration
- [ ] Complete orders/inventory integration
- [ ] Event detail drawer in UI
- [ ] Granular permissions implementation
- [ ] Email/Slack alerting for critical events

### Short-term (1-2 Sprints)
- [ ] Diff viewer component (side-by-side)
- [ ] Related events panel
- [ ] Hash chain visualization
- [ ] Saved filters
- [ ] Export job queue (async for large exports)

### Medium-term (2-4 Sprints)
- [ ] Retention and archival policies
- [ ] Cold storage implementation
- [ ] Advanced search with Elasticsearch
- [ ] Audit log analytics dashboard
- [ ] Custom alert rules engine

### Long-term (4+ Sprints)
- [ ] Multi-tenant support
- [ ] Cross-region replication
- [ ] Blockchain anchoring (optional)
- [ ] Machine learning for anomaly detection
- [ ] Compliance report generator

## API Reference

### List Audit Events
```http
GET /api/admin/audit?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z&scope=AUTH&action=AUTH_LOGIN_SUCCESS&severity=WARNING&page=1&limit=50
```

### Get Event Detail
```http
GET /api/admin/audit/:id
```

### Export Events
```http
POST /api/admin/audit/export
Content-Type: application/json

{
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-12-31T23:59:59Z",
  "scope": "AUTH",
  "format": "csv"
}
```

### Verify Chain
```http
POST /api/admin/audit/verify
Content-Type: application/json

{
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-12-31T23:59:59Z"
}
```

## Files Modified/Created

### Backend
- ✅ `prisma/schema.prisma` - Added AuditEvent model and enums
- ✅ `server/src/utils/audit.ts` - Core audit utilities
- ✅ `server/src/middleware/request-context.ts` - Request context middleware
- ✅ `server/src/constants/audit-events.ts` - Event code constants
- ✅ `server/src/routes/admin-audit.router.ts` - Admin API routes
- ✅ `server/src/jobs/audit-verify.ts` - Chain verification job
- ✅ `server/src/services/cron-jobs.ts` - Added audit verification to cron
- ✅ `server/src/index.ts` - Wired up middleware and routes
- ✅ `server/src/routes/auth.ts` - Added audit logging
- ✅ `server/src/routes/settings/security.ts` - Added audit logging
- ✅ `server/src/routes/settings/team.ts` - Added audit logging
- ✅ `server/src/routes/settings/danger-zone.ts` - Added imports for audit

### Frontend
- ✅ `client/src/pages/AuditLogsPage.tsx` - Audit logs list page

### Documentation
- ✅ `AUDIT_LOGS_IMPLEMENTATION.md` - This file

## Conclusion

The Audit Logs system provides a robust, tamper-evident audit trail with PII protection, comprehensive event tracking, and compliance features. The core infrastructure is complete with hash chaining, redaction, verification, and basic UI. Next steps include completing integrations, adding advanced UI features, implementing alerting, and establishing retention policies.

**Status**: 🟡 Core Complete, Integrations In Progress (70% complete)

