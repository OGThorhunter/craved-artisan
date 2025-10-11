# Cravendor the Wise - Wizard Implementation Guide

## Overview
Cravendor the Wise is the friendly wizard guide that appears in all major wizards throughout the Craved Artisan marketplace. This guide provides instructions for implementing and using Cravendor across different wizard components.

## Implementation

### 1. Reusable Component
Created `client/src/components/ui/CravendorWizard.tsx` - a reusable component that provides:
- Consistent Cravendor wizard image display
- Fallback to wizard emoji if image fails to load
- Consistent styling and layout
- Customizable title and content

### 2. Image Requirements
- **File Path**: `/public/images/cravendor-wizard.png`
- **Dimensions**: 96x96 pixels (or higher resolution)
- **Format**: PNG with transparent background preferred
- **Description**: Friendly wizard with blue pointed hat, white beard, holding wooden staff with curved crook

### 3. Usage Example
```tsx
import CravendorWizard from '../ui/CravendorWizard';

<CravendorWizard title="Greetings, I am Cravendor the Wise!">
  <p>Your custom wizard content here...</p>
  <Button onClick={handleNext}>Next</Button>
</CravendorWizard>
```

## Current Implementation

### Product Wizard
- **File**: `client/src/components/products/AddProductWizard.tsx`
- **Welcome Message**: Updated with Cravendor's introduction
- **Wording**: "Keeper of the marketplace realms and your humble guide on this noble quest to master the Sales Window Wizard"

## Future Wizards to Update

### 1. Sales Window Wizard
- **Location**: To be implemented
- **Cravendor Message**: "I am Cravendor the Wise, keeper of the marketplace realms and your humble guide on this noble quest to master the Sales Window Wizard."

### 2. Inventory Wizard
- **Location**: To be identified
- **Cravendor Message**: "I am Cravendor the Wise, keeper of the marketplace realms and your humble guide on this noble quest to master the Inventory Wizard."

### 3. Orders Wizard
- **Location**: To be identified
- **Cravendor Message**: "I am Cravendor the Wise, keeper of the marketplace realms and your humble guide on this noble quest to master the Orders Wizard."

### 4. Promotions Wizard
- **Location**: To be identified
- **Cravendor Message**: "I am Cravendor the Wise, keeper of the marketplace realms and your humble guide on this noble quest to master the Promotions Wizard."

## Styling Guidelines

### Wizard Image Container
- **Size**: 24x24 (w-24 h-24)
- **Border**: 4px purple border
- **Background**: Gradient from purple-100 to blue-100
- **Shape**: Circular with overflow hidden
- **Magic Sparkle**: Small purple circle with ✨ emoji in top-right corner

### Fallback
- **Emoji**: 🧙‍♂️ (wizard emoji)
- **Size**: 4xl (text-4xl)
- **Display**: Hidden by default, shown if image fails to load

## Image Setup Instructions

1. **Add the Wizard Image**:
   - Save the Cravendor wizard image as `/public/images/cravendor-wizard.png`
   - Ensure it's optimized for web display
   - Test the fallback works if image is missing

2. **Verify Implementation**:
   - Check that the image displays correctly
   - Verify fallback emoji shows if image fails
   - Test responsive behavior

## Benefits

1. **Consistency**: Same wizard appearance across all wizards
2. **Maintainability**: Single component to update styling
3. **User Experience**: Familiar guide character builds trust
4. **Branding**: Reinforces the magical/mystical theme of Craved Artisan

## Next Steps

1. Add the actual Cravendor wizard image to `/public/images/cravendor-wizard.png`
2. Implement Cravendor in remaining wizards (Sales Window, Inventory, Orders, Promotions)
3. Consider adding Cravendor to other user guidance flows
4. Test across different screen sizes and devices
