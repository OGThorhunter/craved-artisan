# Craved Artisan Runbooks

## Incident Response

### 5xx Error Spike
1. **Immediate Actions:**
   - Check Render dashboard for service status
   - Review logs: `grep "x-request-id"` in Render logs
   - Check database connectivity: `GET /readyz`

2. **Investigation:**
   - Look for specific error patterns in logs
   - Check if it's a specific endpoint or global
   - Verify database connection pool exhaustion

3. **Recovery:**
   - Restart service if needed
   - Scale up instances if under load
   - Check for memory leaks or infinite loops

### Stripe Webhook Failures
1. **Check Webhook Status:**
   - Stripe Dashboard → Developers → Webhooks
   - Look for failed delivery attempts
   - Check webhook endpoint URL is correct

2. **Replay Failed Events:**
   ```bash
   # Local testing
   stripe listen --forward-to localhost:3001/api/checkout/webhook
   
   # Replay specific event
   stripe events resend evt_1234567890
   ```

3. **Verify Webhook Secret:**
   - Check `STRIPE_WEBHOOK_SECRET` in Render environment
   - Ensure webhook URL is accessible
   - Test with Stripe CLI

### Database Issues
1. **Connection Problems:**
   - Check `DATABASE_URL` in Render environment
   - Verify database is running in Render dashboard
   - Test connection: `GET /readyz`

2. **Migration Issues:**
   ```bash
   # Check migration status
   npx prisma migrate status
   
   # Resolve failed migration
   npx prisma migrate resolve --applied migration_name
   ```

## Deployment Procedures

### Rollback
1. **Render Rollback:**
   - Go to service → Deployments
   - Click "Rollback" on previous successful deploy
   - Monitor health checks

2. **Database Rollback:**
   ```bash
   # If migration caused issues
   npx prisma migrate resolve --rolled-back migration_name
   ```

### Secrets Rotation
1. **Session Secret:**
   - Generate new secret: `openssl rand -base64 32`
   - Update `SESSION_SECRET` in Render
   - Redeploy service

2. **Stripe Keys:**
   - Generate new keys in Stripe Dashboard
   - Update `STRIPE_SECRET_KEY` in Render
   - Update webhook endpoint if needed
   - Redeploy service

## Database Management

### Backup & Restore
1. **Automated Backups:**
   - Render Postgres has automated daily backups
   - Retention: 7 days for starter plan

2. **Manual Backup:**
   ```bash
   # Create backup
   pg_dump $DATABASE_URL > backup.sql
   
   # Restore backup
   psql $DATABASE_URL < backup.sql
   ```

3. **Point-in-Time Recovery:**
   - Available in Render Postgres Pro plans
   - Contact support for recovery assistance

### Performance Issues
1. **Slow Queries:**
   - Check Prisma query logs
   - Add database indexes
   - Optimize N+1 queries

2. **Connection Pool:**
   - Monitor connection usage
   - Adjust `DATABASE_POOL_SIZE` if needed
   - Check for connection leaks

## Monitoring & Alerts

### Health Checks
- **Liveness:** `GET /healthz` - Basic service health
- **Readiness:** `GET /readyz` - Database connectivity
- **Legacy:** `GET /health` - Detailed service status

### Key Metrics
- Response time < 500ms
- Error rate < 1%
- Database connection pool utilization < 80%
- Memory usage < 80%

### Log Analysis
- Request IDs: `x-request-id` header
- Structured logging with Pino
- Sentry integration for error tracking

## Feature Flags

### Environment Variables
- `VITE_FEATURE_CHECKOUT` - Enable/disable checkout
- `VITE_FEATURE_ANALYTICS` - Enable/disable analytics
- `VITE_FEATURE_FINANCIALS` - Enable/disable financial features

### Rollout Strategy
1. **Staging:** All features enabled
2. **Production:** Gradual rollout
   - Day 1: 10% traffic
   - Day 2: 50% traffic  
   - Day 3: 100% traffic

## Emergency Contacts

### Render Support
- Status page: https://status.render.com
- Support: https://render.com/docs/help

### Stripe Support
- Status page: https://status.stripe.com
- Support: https://support.stripe.com

### Database Support
- Neon (if using): https://neon.tech/docs/introduction/support
- Render Postgres: Via Render support

## Recovery Time Objectives (RTO/RPO)

- **RTO:** 15 minutes (service restart)
- **RPO:** 24 hours (daily backups)
- **Critical Path:** Payment processing, order fulfillment
