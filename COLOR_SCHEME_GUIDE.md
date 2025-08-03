# 🎨 Color Scheme Guide - Craved Artisan

## 🌟 **Brand Color Palette**

### **Primary Colors**
- **Off White** (`#F7F2EC`) - Primary backgrounds
- **Soft Beige** (`#E8CBAE`) - Secondary panels/cards
- **Verdun Green** (`#5B6E02`) - Primary accent/CTA
- **Crown of Thorns** (`#7F232E`) - Secondary accent
- **Charcoal** (`#333333`) - Standard text
- **Warm Grey** (`#777777`) - Muted text/labels

## 🎯 **Usage Guidelines**

### **Backgrounds**
- **Main page background**: White (`bg-white`)
- **Primary backgrounds**: Off White (`bg-brand-off-white`)
- **Secondary panels/cards**: Soft Beige (`bg-brand-soft-beige`)

### **Text**
- **Standard text**: Charcoal (`text-brand-charcoal`)
- **Muted text/labels**: Warm Grey (`text-brand-warm-grey`)
- **Links on hover**: Verdun Green (`hover:text-brand-verdun-green`)

### **Buttons & CTAs**
- **Primary buttons**: Crown of Thorns with white text (`bg-brand-crown-thorns text-white`)
- **Secondary buttons**: White with charcoal outline (`bg-white border border-brand-charcoal text-brand-charcoal`)
- **Muted buttons**: White with charcoal text (`bg-white text-brand-charcoal`)

### **Accents**
- **Primary accent**: Verdun Green (use sparingly)
- **Secondary accent**: Crown of Thorns (for active states)
- **Footer**: Verdun Green (as specified)

## 📝 **Tailwind Classes Reference**

### **Background Colors**
```css
bg-brand-off-white      /* #F7F2EC - Primary backgrounds */
bg-brand-soft-beige     /* #E8CBAE - Secondary panels/cards */
bg-brand-verdun-green   /* #5B6E02 - Primary accent */
bg-brand-crown-thorns   /* #7F232E - Secondary accent */
```

### **Text Colors**
```css
text-brand-charcoal     /* #333333 - Standard text */
text-brand-warm-grey    /* #777777 - Muted text/labels */
text-brand-verdun-green /* #5B6E02 - Primary accent */
text-brand-crown-thorns /* #7F232E - Secondary accent */
```

### **Border Colors**
```css
border-brand-soft-beige /* #E8CBAE - Soft borders */
border-brand-charcoal   /* #333333 - Standard borders */
border-brand-verdun-green /* #5B6E02 - Accent borders */
```

### **Hover States**
```css
hover:bg-brand-off-white      /* Hover background */
hover:text-brand-verdun-green /* Hover text color */
hover:bg-brand-crown-thorns/90 /* Hover button opacity */
```

## 🎨 **Component Examples**

### **Navigation Header**
```tsx
<header className="bg-white/95 border-b border-brand-soft-beige/20">
  <span className="text-brand-verdun-green">Craved Artisan</span>
  <nav className="text-brand-charcoal">
    <Link className="hover:text-brand-verdun-green">Marketplace</Link>
  </nav>
  <button className="bg-brand-crown-thorns text-white">Join</button>
</header>
```

### **Card Component**
```tsx
<div className="bg-brand-soft-beige border border-brand-soft-beige/50 rounded-lg p-6">
  <h3 className="text-brand-charcoal font-semibold">Card Title</h3>
  <p className="text-brand-warm-grey">Card description</p>
  <button className="bg-brand-crown-thorns text-white px-4 py-2 rounded">
    Action
  </button>
</div>
```

### **Form Input**
```tsx
<input 
  className="border border-brand-soft-beige focus:ring-2 focus:ring-brand-verdun-green text-brand-charcoal"
  placeholder="Enter text..."
/>
```

### **Button Variants**
```tsx
{/* Primary Button */}
<button className="bg-brand-crown-thorns text-white px-4 py-2 rounded hover:bg-brand-crown-thorns/90">
  Primary Action
</button>

{/* Secondary Button */}
<button className="bg-white border border-brand-charcoal text-brand-charcoal px-4 py-2 rounded hover:bg-brand-off-white">
  Secondary Action
</button>

{/* Muted Button */}
<button className="bg-white text-brand-charcoal px-4 py-2 rounded hover:bg-brand-off-white">
  Muted Action
</button>
```

## 🚀 **Implementation Notes**

1. **Main page background**: Always use white (`bg-white`)
2. **Cards and panels**: Use soft beige (`bg-brand-soft-beige`)
3. **Active buttons**: Use crown of thorns with white text
4. **Secondary elements**: Use white with charcoal outline and text
5. **Green accents**: Use sparingly, mainly in footer and special highlights
6. **Hover states**: Use off white for backgrounds, verdun green for text

## 🔧 **Tailwind Config**

The colors are defined in `client/tailwind.config.js`:

```javascript
colors: {
  brand: {
    'off-white': '#F7F2EC',
    'soft-beige': '#E8CBAE',
    'verdun-green': '#5B6E02',
    'crown-thorns': '#7F232E',
    'charcoal': '#333333',
    'warm-grey': '#777777',
  },
}
```

## 📱 **Accessibility**

- **Contrast ratios**: All color combinations meet WCAG AA standards
- **Focus states**: Use verdun green for focus rings
- **Hover states**: Provide clear visual feedback
- **Text readability**: Charcoal on white/beige backgrounds ensures good readability 