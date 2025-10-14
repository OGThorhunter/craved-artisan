# Orders Page Testing Guide

## Quick Test Checklist

### 1. KPI Boxes (Top of Page)
**Test**: Click each box to verify filtering works
- [ ] Click "Total Orders" → Should reset filters and show all orders
- [ ] Click "Due Today" → Should filter to orders due today (shows count in toast)
- [ ] Click "Delivered" → Should filter to DELIVERED status
- [ ] Click "Finished" → Should filter to READY status
- [ ] **Visual**: Verify shadow-lg appears on all boxes
- [ ] **Hover**: Verify hover effects (border color change, shadow-xl)

### 2. View Mode Buttons
**Test**: Click each workflow step button
- [ ] Click "List" → Shows order table
- [ ] Click "Calendar" → Shows calendar view grouped by date
- [ ] **Click "Kitchen" (Step 1)** → Shows production batching view
- [ ] **Click "Labels" (Step 2)** → Shows labeling & packaging view
- [ ] **Click "QA" (Step 3)** → Shows final QA checklist view
- [ ] **Visual**: Verify numbered badges (1, 2, 3) appear
- [ ] **Visual**: Verify arrows (→) connect the steps
- [ ] **Active State**: Active step should be larger (scale-105) with shadow

### 3. Export Functionality
**Test**: Export orders to CSV
- [ ] Click "Export" button (red/maroon colored)
- [ ] Verify CSV file downloads
- [ ] Open CSV and verify columns: Order Number, Customer, Status, Priority, Items, Total, Due Date
- [ ] **With Filters**: Apply a filter, then export → CSV should only include filtered orders

### 4. Production Kitchen (Step 1)
**Test**: Production scheduling and checklist

#### Lead Time Display
- [ ] Switch to "Kitchen" view
- [ ] Find a production batch card
- [ ] Look for "Kitchen Start → Delivery" date display
- [ ] Verify calculation: Kitchen Start = Delivery Date - 3 days

#### Production Step Checklist
- [ ] Expand a production batch
- [ ] **Verify 6 steps appear**:
  1. Prep Starter (30 min)
  2. Mixing (20 min)
  3. Proofing (180 min)
  4. Shaping (30 min)
  5. Cold Retard (720 min)
  6. Bake (45 min)
  
- [ ] **Step 1 - Starter Integration**:
  - Verify "Sourdough Starter Check" section appears
  - See three starter types: White, Whole Wheat, Rye
  - Check Available/Required amounts display
  - **Low Starter**: If required > available, box should be red with ⚠️

#### Interactive Buttons
- [ ] Click "Start" on Step 1 → Status changes to "in-progress" (yellow)
- [ ] Click "Complete" on Step 1 → Status changes to "complete" (green)
- [ ] Verify buttons disable after state change
- [ ] Test with multiple steps in sequence

#### System Alerts
- [ ] When page loads, check for production alerts
- [ ] Should see toast notification if an order needs to start production today
- [ ] Alert format: "🔔 Production Alert - Order #[X] for [Customer] needs to start production today!"
- [ ] **Note**: Alert only shows once per order (uses localStorage)

### 5. Labeling & Packaging (Step 2)
**Test**: Label generation and package management

#### View Mode
- [ ] Click "Labels" (Step 2) button
- [ ] Verify labeling & packaging view loads
- [ ] **Header Buttons**: Verify three buttons appear:
  - "Manage Package Templates"
  - "Advanced Label Generator" 
  - "Create New Template"

#### Package-Label Status
- [ ] Find "Package Label Templates" status card
- [ ] Shows count of packages with/without labels
- [ ] If packages missing templates, warning box appears in yellow

#### Label Generator Modal
- [ ] Click "Advanced Label Generator" button
- [ ] Modal should open with multiple tabs:
  - Generate Labels
  - Create Template
  - Templates
  - Print Queue
  - Analytics
- [ ] Select orders from list
- [ ] Select a template
- [ ] Click "Generate Labels"
- [ ] Verify toast shows: "Generating X labels using [template name]"
- [ ] Check Print Queue tab for job progress
- [ ] Close modal with X button

#### Per-Product Packaging
- [ ] Find a product card in packaging view
- [ ] **Package Selection**: Dropdown should list available packages
- [ ] Select a package type
- [ ] Verify selected package info displays (size, material, stock)
- [ ] Click "+ Add Custom Package Size" → Opens modal
- [ ] Fill in custom package details
- [ ] Click "Add to Inventory & Select"
- [ ] Verify package added to dropdown

#### Label Generation Buttons
- [ ] Click "Generate Labels" button on product card
- [ ] If package has no template → Redirects to template creation
- [ ] If package has template → Opens label generator modal
- [ ] **Click "Print 1 Label" button (amber colored)**
- [ ] Verify toast: "Printing 1 label for [Product] (misprint/error replacement)"
- [ ] Button should be disabled if no template assigned
- [ ] **Expand "View Orders for This Product"**
- [ ] **Click "Print Label" button next to specific order**
- [ ] Verify toast shows correct quantity for that order
- [ ] Click "Mark as Packaged"
- [ ] Verify success toast appears

### 6. Final QA (Step 3)
**Test**: QA checklist and printing

#### QA Print Preference
- [ ] Click "QA" (Step 3) button
- [ ] Find print preference toggle in header
- [ ] Click "📄 Paper (8.5x11)" → Should highlight white
- [ ] Click "🏷️ Thermal Label" → Should highlight white
- [ ] Verify toast notification confirms selection

#### QA Checklist Display
- [ ] Find an order in QA view (status: READY or IN_PRODUCTION)
- [ ] **Order Info**: Verify customer name, phone, email, due date displayed
- [ ] **Standard Checklist Items**: Each product should have:
  - ✓ Products match receipt
  - ✓ Packaging correct
  - ✓ Appearance of labels good
  - ✓ Product quality
- [ ] Check boxes should be interactive

#### Custom QA Fields
- [ ] **Click "Manage Custom Fields (X)" button** in QA Instructions card
- [ ] Modal opens showing custom field management
- [ ] **Add Custom Field**:
  - Type "Temperature within range" in input field
  - Press Enter or click "Add Field"
  - Verify toast: "Custom QA field added!"
  - Field should appear in modal list
- [ ] **Field Appears in Checklist**:
  - Close modal (click "Done")
  - Check that new field appears in order QA checklists
  - Hover over custom field → "Remove" button appears
- [ ] **Remove Custom Field**:
  - Hover over custom field in checklist
  - Click "Remove" button
  - Verify field disappears
  - Or remove from modal list
- [ ] **Persistence Test**:
  - Add 2-3 custom fields
  - Refresh page (F5)
  - Verify custom fields still present
- [ ] **Print Integration**:
  - Add a custom field
  - Print QA checklist
  - Verify custom field appears in printed output

#### Customer Receipt Section
- [ ] Find "Order Receipt" section in purple/blue gradient
- [ ] Verify displays:
  - Customer info
  - Order number and dates
  - Itemized products with prices
  - Total amount in large green text
  - "Thank You" message section

#### Action Buttons
- [ ] **Print QA Checklist Button**:
  - Shows current preference (Paper or Thermal)
  - Click → Opens new window with printable checklist
  - Verify all items appear in print preview
  - Has inspector signature line

- [ ] **Print Receipt Button**:
  - Click → Opens new window with customer receipt
  - Verify brand colors (#5B6E02 green)
  - Thank you message appears
  - Professional layout

- [ ] **QA Approved Button**:
  - Click → Success toast appears
  - Order marked as approved

#### Special Notes
- [ ] If order has notes field, verify yellow warning box appears
- [ ] Notes content should be visible

### 7. Filter and Search
**Test**: Order filtering and search

- [ ] Enter text in search box → Orders filter in real-time
- [ ] Select status from dropdown → List updates
- [ ] Select priority from dropdown → List updates
- [ ] **Clear filters**: Click "Total Orders" KPI box

### 8. Bulk Actions
**Test**: Multi-select functionality

- [ ] In List view, select multiple orders (checkboxes)
- [ ] Blue banner appears showing count
- [ ] Click "Confirm" → Toast confirms bulk update
- [ ] Click "Start Production" → Toast confirms
- [ ] Click "Mark Ready" → Toast confirms
- [ ] Click "Clear" → Selection clears

### 9. Responsive Design
**Test**: Different screen sizes

- [ ] Desktop (1920px): All elements visible, proper spacing
- [ ] Laptop (1366px): Layout adjusts, no overflow
- [ ] Tablet (768px): View mode buttons stack properly
- [ ] Mobile (375px): Single column layout, touch-friendly buttons

### 10. Performance
**Test**: Page load and interactions

- [ ] Page loads in < 2 seconds
- [ ] View mode switching is instant
- [ ] No console errors (check browser dev tools)
- [ ] Smooth animations and transitions
- [ ] No layout shift/flicker

## Common Issues to Check

### If Export Doesn't Work
- Check browser blocked popup/download
- Verify orders array is populated
- Check console for JavaScript errors

### If Labels Don't Generate
- Verify AdvancedLabelGenerator component is imported
- Check modal state (showLabelModal)
- Verify orders are being passed to component

### If Production Alerts Don't Appear
- Check if orders have dueAt field
- Verify leadTimeDays is set (default: 3)
- Clear localStorage to reset alert tracking

### If Starter Inventory Shows Wrong
- Check starterInventory state initialization
- Verify calculation: required = starterAmount * batchQuantity
- Refresh page to reset state

### If Print Windows Don't Open
- Check if popup blocker is active
- Verify window.open() is allowed
- Try in incognito/private mode

## Expected Behavior Summary

✅ **All buttons are clickable and functional**  
✅ **View mode transitions are smooth**  
✅ **Data persists during session (localStorage)**  
✅ **Toast notifications confirm all actions**  
✅ **Print windows open with proper formatting**  
✅ **Color scheme matches brand (#5B6E02, #7F232E)**  
✅ **No linting errors in console**  
✅ **Responsive on all device sizes**

## Success Criteria

- [ ] **100% of buttons work** (no broken onclick handlers)
- [ ] **Visual hierarchy is clear** (numbered steps, shadows, colors)
- [ ] **Workflow is intuitive** (Kitchen → Labels → QA)
- [ ] **Print outputs are professional** (QA checklist, receipts)
- [ ] **Performance is good** (< 2s load, smooth transitions)
- [ ] **No console errors** (clean JavaScript execution)

---

**Testing Date**: __________  
**Tested By**: __________  
**Issues Found**: __________  
**Status**: ☐ Pass ☐ Fail (with notes)

