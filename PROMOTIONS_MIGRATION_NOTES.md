# Promotions Module Consolidation - Migration Notes

## Overview
The Promotions module has been consolidated from multiple legacy tabs into 5 best-in-class tabs to improve user experience and reduce complexity.

## New Tab Structure

### 1. Campaigns
- **Consolidates**: Promotions (landing), Campaigns
- **Features**: 
  - Campaign creation wizard for discounts, coupons, BOGO, bundles
  - Template picker for seasonal/holiday campaigns
  - Status management (draft/scheduled/active/expired)
  - Quick actions (pause/duplicate/edit)

### 2. Email & Social
- **Consolidates**: Email, Social
- **Features**:
  - Simple composer with saved templates
  - Merge tags support (customer name, vendor name, product)
  - Channel selectors (email, social share)
  - Scheduling integration with Scheduler & Automation

### 3. Scheduler & Automation
- **Consolidates**: Scheduler, Automation rules
- **Features**:
  - Calendar view for campaign scheduling
  - Automation rules (inventory thresholds, sales windows)
  - Recurrence options
  - Conflict detection and rescheduling

### 4. Analytics
- **Consolidates**: A/B Testing, Analytics, Conversion, Recommendations
- **Features**:
  - KPI tiles (impressions, clicks, redemptions, revenue)
  - Conversion funnel visualization
  - A/B testing results with confidence levels
  - AI-powered recommendations for next best promotions
  - Export capabilities (CSV, reports)

### 5. Loyalty & Referrals
- **Consolidates**: Loyalty, Referrals
- **Features**:
  - Loyalty program management (points, punch cards, tiers)
  - Referral program tracking
  - Customer insights with AI predictions
  - Quick actions for customer engagement

## Component Mapping

### New Components Created
- `src/components/promotions/CampaignsTab.tsx`
- `src/components/promotions/EmailSocialTab.tsx`
- `src/components/promotions/SchedulerAutomationTab.tsx`
- `src/components/promotions/AnalyticsTab.tsx`
- `src/components/promotions/LoyaltyReferralsTab.tsx`

### Legacy Components Removed
- All legacy promotion tab components have been consolidated
- Routes under `/dashboard/vendor/promotions/*` for deprecated tabs have been removed
- Navigation constants updated to show only the 5 new tabs

## AI Integration

### Analytics Tab
- **AI Recommendations**: Next best promotion suggestions
- **Optimization Insights**: Subject line and timing recommendations
- **Performance Predictions**: Confidence levels for A/B test results

### Loyalty & Referrals Tab
- **Customer Insights**: 
  - Likely redeemers identification
  - Likely referrers prediction
  - Next best actions for customer engagement
  - Risk assessment for customer churn

## Technical Implementation

### State Management
- Maintained existing query keys for promotions data
- Added adapters for normalizing naming differences
- Preserved existing UTM/link builders as utility functions

### Performance
- Horizontal tab navigation (no sidebar)
- Suspense and skeleton loaders for sub-200ms warm loads
- Search, filter, and sort capabilities on all list views

### Accessibility
- Added `title` and `aria-label` attributes to interactive elements
- Maintained keyboard navigation support
- Preserved screen reader compatibility

## Migration Checklist

- [x] Created new 5-tab horizontal navigation layout
- [x] Consolidated Campaigns tab with wizard and templates
- [x] Consolidated Email & Social tab with composer
- [x] Consolidated Scheduler & Automation tab with calendar
- [x] Consolidated Analytics tab with KPIs and AI recommendations
- [x] Consolidated Loyalty & Referrals tab with points tracking
- [x] Added accessibility attributes to interactive elements
- [x] Maintained existing design tokens and color palette
- [x] Preserved role guards for vendor data scope

## Next Steps

1. **Testing**: Verify all consolidated functionality works end-to-end
2. **Data Migration**: Ensure existing promotion data is accessible in new tabs
3. **User Training**: Update documentation for new tab structure
4. **Performance Monitoring**: Track load times and user engagement

## Notes

- **Pricing**: Moved out of Promotions module (belongs in Inventory/Products)
- **Segments**: Integrated with CRM segmentation (no longer under Promotions)
- **AI**: Integrated across Analytics and Loyalty & Referrals (no separate AI tab)
- **Templates**: Maintained as in-context buttons within Campaigns tab

## File Structure

```
src/
├── pages/dashboard/vendor/promotions/
│   └── index.tsx (updated with 5-tab layout)
├── components/promotions/
│   ├── CampaignsTab.tsx
│   ├── EmailSocialTab.tsx
│   ├── SchedulerAutomationTab.tsx
│   ├── AnalyticsTab.tsx
│   ├── LoyaltyReferralsTab.tsx
│   └── index.ts (exports)
├── types/promotions/
│   └── (existing types preserved)
└── lib/promotions/
    └── (existing utilities preserved)
```

## Breaking Changes

- Legacy promotion tab URLs now redirect to appropriate new tabs
- Some component props may have changed due to consolidation
- Navigation menu updated to show only 5 tabs

## Rollback Plan

If issues arise, the previous tab structure can be restored by:
1. Reverting `VendorPromotionsPage.tsx` to previous version
2. Restoring legacy component files
3. Updating navigation constants
4. Re-enabling legacy routes
