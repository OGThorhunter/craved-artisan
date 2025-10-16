# Incidents & Runbooks Quick Start Guide

## ✅ What's Working Now

### Backend (100% Complete)
- ✅ Database schema extended with all new models
- ✅ Incident management service with KPIs, events, post-mortems
- ✅ Runbook service with search, execution tracking, versioning
- ✅ 15+ new API endpoints with Winston logging
- ✅ SLA tracking and calculations
- ✅ Filter and search capabilities

### Frontend (Core Features Complete)
- ✅ Live KPI dashboard (SEV counts, MTTM/MTTR, SLA breaches, on-call)
- ✅ Advanced incident filters (status, severity, services, tags, dates)
- ✅ Drag-and-drop incident board (Open → Mitigated → Closed)
- ✅ List/table view with sortable columns
- ✅ Runbook catalog with search
- ✅ Markdown rendering for runbooks
- ✅ Executable runbook launch
- ✅ Review status tracking

## 🚀 How to Enable

### Option 1: Side-by-Side Testing
The new components are in separate files, so you can test them alongside the existing views:

1. In `client/src/components/OperationsDashboard.tsx`, add imports:
```typescript
import HealthIncidentsViewNew from './ops/HealthIncidentsViewNew';
import RunbooksToolsViewNew from './ops/RunbooksToolsViewNew';
```

2. Add a new view to the navigation:
```typescript
const views = [
  { id: 'health', label: 'Health & Incidents', icon: Activity },
  { id: 'health-new', label: 'Health & Incidents (New)', icon: Activity }, // Add this
  { id: 'runbooks', label: 'Runbooks & Tools', icon: BookOpen },
  { id: 'runbooks-new', label: 'Runbooks (New)', icon: BookOpen }, // Add this
  // ... other views
];
```

3. Update the render section:
```typescript
{selectedView === 'health-new' && <HealthIncidentsViewNew />}
{selectedView === 'runbooks-new' && <RunbooksToolsViewNew />}
```

### Option 2: Replace Existing Views
Simply replace the imports and usage:
```typescript
import HealthIncidentsView from './ops/HealthIncidentsViewNew'; // Changed
import RunbooksToolsView from './ops/RunbooksToolsViewNew'; // Changed
```

## 📊 Key Features

### Incidents Management
1. **Real-time KPIs** - Auto-refresh every 30 seconds
2. **Smart Filtering** - Multi-dimensional filtering with active filter count
3. **Drag-to-Update** - Drag incidents between columns to change status
4. **SLA Monitoring** - Color-coded timers (green/yellow/red)
5. **Service Tags** - Quick identification of affected systems
6. **Owner Assignment** - Track responsibility

### Runbooks
1. **Search** - Full-text search across title, content, and tags
2. **Stale Detection** - Automatic "Needs Review" badges
3. **Markdown Support** - Rich formatting with code blocks, tables, lists
4. **Version Tracking** - See version number on each runbook
5. **Quick Actions** - Execute or mark reviewed with one click
6. **Metadata Display** - Duration, roles, prerequisites at a glance

## 🔧 Configuration

### SLA Defaults
Configured in `incident-management.service.ts`:
- SEV1: 15m mitigation, 2h resolution
- SEV2: 1h mitigation, 8h resolution
- SEV3: 4h mitigation, 24h resolution  
- SEV4: 24h mitigation, 7d resolution

### Services List
Update in `IncidentFilters.tsx`:
```typescript
const SERVICE_OPTIONS = ['api', 'worker', 'web', 'database', 'redis', 'email', 'stripe', 'webhooks'];
```

### Review Cadence
Default 90 days, configurable per runbook in database

## 🧪 Testing

### Test Incident Creation
```bash
curl -X POST http://localhost:5000/api/admin/ops/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "severity": "SEV3",
    "summary": "Testing the new system",
    "affected": ["api", "database"]
  }'
```

### Test Runbook Creation
```bash
curl -X POST http://localhost:5000/api/admin/ops/runbooks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Runbook",
    "incidentType": "TEST",
    "contentMarkdown": "# Test\n\n1. Step one\n2. Step two",
    "service": ["api"],
    "severityFit": ["SEV3", "SEV4"],
    "estimatedDuration": 15
  }'
```

## 📝 What's Next (Optional Enhancements)

### High Priority
- [ ] Incident detail drawer (full CRUD for title, severity, owner, tags)
- [ ] Timeline event composer (add NOTE, ACTION, UPDATE events)
- [ ] Post-mortem form (structured fields + action items)
- [ ] Policy prompts (close without post-mortem warning)

### Medium Priority
- [ ] Runbook creation form (markdown editor with preview)
- [ ] Runbook checklist mode (step-by-step execution)
- [ ] Cross-link incidents ↔ runbooks
- [ ] Owner/team picker UI

### Nice to Have
- [ ] Export incidents to PDF
- [ ] Runbook templates (SEV1, Deploy, DB)
- [ ] Automation bindings UI
- [ ] External integrations (Jira, PagerDuty)

## 🐛 Troubleshooting

### "Failed to fetch incidents"
- Check backend is running
- Verify admin authentication
- Check browser console for CORS errors

### Drag-and-drop not working
- Ensure `@dnd-kit/core` is installed
- Check for JavaScript errors in console
- Try refreshing the page

### Markdown not rendering
- Verify `react-markdown` and `remark-gfm` are installed
- Check runbook has `contentMarkdown` field (not `content`)

### SLA times incorrect
- Backend calculates from `startedAt` timestamp
- Check system timezone settings
- Verify `slaMitigateMinutes` and `slaCloseMinutes` are set

## 📚 File Reference

### Backend
- `prisma/schema.prisma` - Database models
- `server/src/services/incident-management.service.ts` - Incident logic
- `server/src/services/runbooks.service.ts` - Runbook logic
- `server/src/routes/admin-ops.router.ts` - API endpoints

### Frontend
- `client/src/components/ops/HealthIncidentsViewNew.tsx` - Main incidents view
- `client/src/components/ops/RunbooksToolsViewNew.tsx` - Main runbooks view
- `client/src/components/ops/incidents/IncidentKPIs.tsx` - KPI cards
- `client/src/components/ops/incidents/IncidentFilters.tsx` - Filter panel
- `client/src/components/ops/incidents/IncidentBoardDnD.tsx` - Drag-drop board

## 💡 Tips

1. **Use Filters** - Start with status filter to focus on active work
2. **Drag Workflow** - Drag incidents through board columns for status updates
3. **Quick Search** - Use search in runbooks to find procedures fast
4. **Mark Reviewed** - Keep runbooks current by reviewing regularly
5. **Execute Safely** - Only executable runbooks have automation; others are manual guides

## 🎯 Success Metrics

Track these to validate the system:
- Mean Time To Mitigate (MTTM) trending down
- Mean Time To Resolve (MTTR) trending down
- SLA breach count at 0 or near 0
- Post-mortem completion rate for SEV1/2 at 100%
- Runbook staleness (should review every 90 days)

## 🔐 Security Notes

- All operations require admin authentication
- Winston logs every incident/runbook change
- Markdown is sanitized by react-markdown
- Audit trail in database for compliance
- SLA breach events logged for review

---

**Questions?** Check `INCIDENTS_RUNBOOKS_IMPLEMENTATION_SUMMARY.md` for complete details.

