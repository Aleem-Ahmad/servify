# Tailwind Complex Patterns - Quick Reference Guide

## Search & Filter Guide

### Finding Patterns in Your IDE
Use these regex patterns to find Tailwind utilities that need conversion:

```regex
# Find arbitrary values
\-\[[^\]]+\]

# Find color with opacity combinations
/(10|20|30|40|50|60|70|80|90|95)(?=[^0-9]|$)

# Find calc() expressions
calc\(

# Find animations/keyframes
@keyframes|animate-

# Find inline styles
style\s*=\s*\{
```

---

## Most Common Patterns by Type

### 1. **Opacity Combinations** (Most Frequent - 50+ instances)

**Pattern**: `{color}-{base}/opacity`

**Common Opacities**:
- `/10` → 10% opacity (most common for backgrounds)
- `/20` → 20% opacity (borders, overlays)
- `/30` → 30% opacity (hover states)
- `/50` → 50% opacity (medium contrast)
- `/95` → 95% opacity (near opaque)

**Examples**:
```jsx
// Before
className="bg-orange-500/10 border-orange-500/20"

// After
className="bg-orange-500-10 border-orange-500-20"
// Or with inline
style={{ 
  backgroundColor: 'rgba(249, 115, 22, 0.1)',
  borderColor: 'rgba(249, 115, 22, 0.2)'
}}
```

### 2. **Arbitrary Dimensions** (30+ instances)

**Pattern**: `{property}-[{value}px/rem/vh/vw]`

**Most Common Sizes**:
- `w-[600px]`, `w-[500px]`, `w-[400px]`
- `h-[600px]`, `h-[500px]`, `h-[300px]`
- `min-h-[550px]`, `min-h-[500px]`
- `max-h-[300px]`

**Solution - Create Utilities**:
```css
.w-600px { width: 600px; }
.h-550px { min-height: 550px; }
.max-h-300px { max-height: 300px; }
```

### 3. **Border Radius** (15+ instances)

**Pattern**: `rounded-[{rem/px}]`

**Most Common Values**:
- `rounded-[2rem]` → 32px
- `rounded-[2.5rem]` → 40px
- `rounded-b-[2.5rem]` → bottom only

**Solution**:
```css
.rounded-2rem { border-radius: 2rem; }
.rounded-2\.5rem { border-radius: 2.5rem; }
```

### 4. **Text Sizes** (20+ instances)

**Pattern**: `text-[{size}]`

**Most Common**: `text-[10px]` → 0.625rem

**Solution**:
```css
.text-10px { font-size: 0.625rem; }
.text-9px { font-size: 0.5625rem; }
```

### 5. **Percentage Widths** (8+ instances)

**Pattern**: `w-[{percentage}]`

**Examples**:
- `w-[24%]`, `w-[65%]`, `w-[92%]`

**Solution**:
```css
.w-24pct { width: 24%; }
.w-65pct { width: 65%; }
.w-92pct { width: 92%; }
```

---

## Conversion Checklists

### For Each File (Use this order):

- [ ] **Step 1**: Identify all arbitrary values
  - Search for `\-\[` pattern
  - Note file and line numbers

- [ ] **Step 2**: Create CSS utilities for each type
  - Dimensions → new `.css` utility file
  - Colors → add to color palette
  - Radius → border-radius utilities
  - Text → font-size utilities

- [ ] **Step 3**: Replace in JSX/JS
  - Change className from `w-[400px]` to `w-400px`
  - Or convert to inline styles if dynamic

- [ ] **Step 4**: Test visually
  - Compare before/after screenshots
  - Check responsive behavior
  - Verify hover/active states

- [ ] **Step 5**: Remove old patterns
  - Delete Tailwind arbitrary values
  - Clean up unused utilities

---

## File-by-File Priority

### CRITICAL (Priority 1)
Do these first - they have the most patterns:

1. **authentication.js** (50+ patterns)
   - Arbitrary dimensions
   - Color opacity combinations
   - Text sizes
   - **Est. Time: 4-5 hours**

2. **Hero.jsx** (30+ patterns)
   - Radial gradients
   - Arbitrary dimensions
   - Opacity values
   - **Est. Time: 3-4 hours**

3. **track/[bookingId]/page.js** (25+ patterns)
   - Calc expressions
   - Arbitrary dimensions
   - Border radius
   - **Est. Time: 3 hours**

### HIGH (Priority 2)
These have 15-20 patterns each:

- ProviderOnboarding.jsx
- ComplaintCard.js
- viewProvider/page.js
- providerDashboard/page.js

### MEDIUM (Priority 3)
10-15 patterns:

- CustomerDashboard pages
- Admin pages
- NavBar components

---

## Color Palette Reference

### Primary Colors Used with Opacity

| Color | Tailwind | RGB | Usage |
|-------|----------|-----|-------|
| Orange | orange-500 | 249, 115, 22 | Primary brand color |
| Purple | purple-500 | 168, 85, 247 | Accents |
| Rose | rose-500 | 244, 63, 94 | Warnings |
| Emerald | emerald-500 | 16, 185, 129 | Success |
| Blue | blue-500 | 59, 130, 246 | Info |
| Amber | amber-500 | 217, 119, 6 | Warnings |

### CSS Variable Strategy
```css
:root {
  --color-orange-500: 249, 115, 22;
  --color-purple-500: 168, 85, 247;
}

.bg-orange-500-10 {
  background-color: rgba(var(--color-orange-500), 0.1);
}
.bg-orange-500-20 {
  background-color: rgba(var(--color-orange-500), 0.2);
}
```

---

## Common Mistakes to Avoid

❌ **DON'T**:
```jsx
// Mixing old arbitrary with new utilities
className="w-[400px] bg-orange-500/10"

// Forgetting to update all instances
// Only converting in one component file
```

✅ **DO**:
```jsx
// Use consistent utility naming
className="w-400px bg-orange-500-10"

// Search project-wide for the pattern
// Replace all instances at once

// Create utilities in central location
// Reference them in components
```

---

## Testing Checklist

After converting a file:

- [ ] All text displays correctly
- [ ] Colors match original design
- [ ] Opacity/transparency is correct
- [ ] Borders and radius look right
- [ ] Responsive behavior unchanged
- [ ] Hover/focus states work
- [ ] No console errors
- [ ] No layout shift
- [ ] Mobile appearance correct
- [ ] Dark mode (if applicable) works

---

## Utilities to Create

### Create file: `src/styles/custom-arbitrary.css`

```css
/* ============ DIMENSIONS ============ */
.w-600px { width: 600px; }
.w-500px { width: 500px; }
.w-400px { width: 400px; }
.h-600px { height: 600px; }
.h-500px { height: 500px; }
.h-300px { height: 300px; }
.min-h-550px { min-height: 550px; }
.min-h-500px { min-height: 500px; }
.min-h-300px { min-height: 300px; }
.max-h-300px { max-height: 300px; }
.max-h-90vh { max-height: 90vh; }

/* ============ BORDER RADIUS ============ */
.rounded-2rem { border-radius: 2rem; }
.rounded-2\.5rem { border-radius: 2.5rem; }
.rounded-3rem { border-radius: 3rem; }
.rounded-b-2\.5rem {
  border-bottom-left-radius: 2.5rem;
  border-bottom-right-radius: 2.5rem;
}

/* ============ TEXT SIZES ============ */
.text-10px { font-size: 0.625rem; }
.text-9px { font-size: 0.5625rem; }

/* ============ WIDTHS (PERCENTAGE) ============ */
.w-24pct { width: 24%; }
.w-65pct { width: 65%; }
.w-92pct { width: 92%; }

/* ============ OPACITY UTILITY ============ */
.opacity-02 { opacity: 0.02; }

/* ============ Z-INDEX ============ */
.z-100 { z-index: 100; }

/* ============ CALC EXPRESSIONS ============ */
.h-screen-140px { height: calc(100vh - 140px); }
.w-calc-full-30px { width: calc(100% - 30px); }
.w-calc-full-240px { width: calc(100% - 240px); }

/* ============ COLOR + OPACITY COMBINATIONS ============ */

/* Orange */
.bg-orange-500-10 { background-color: rgba(249, 115, 22, 0.1); }
.bg-orange-500-20 { background-color: rgba(249, 115, 22, 0.2); }
.bg-orange-500-30 { background-color: rgba(249, 115, 22, 0.3); }
.border-orange-500-20 { border-color: rgba(249, 115, 22, 0.2); }
.shadow-orange-500-10 { box-shadow: 0 1px 3px rgba(249, 115, 22, 0.1); }
.shadow-orange-500-20 { box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2); }
.shadow-orange-500-25 { box-shadow: 0 10px 15px rgba(249, 115, 22, 0.25); }

/* Purple */
.bg-purple-500-10 { background-color: rgba(168, 85, 247, 0.1); }
.border-purple-500-20 { border-color: rgba(168, 85, 247, 0.2); }

/* Rose */
.bg-rose-500-10 { background-color: rgba(244, 63, 94, 0.1); }
.border-rose-500-25 { border-color: rgba(244, 63, 94, 0.25); }
.shadow-rose-500-5 { box-shadow: 0 1px 3px rgba(244, 63, 94, 0.05); }

/* Blue */
.bg-blue-500-10 { background-color: rgba(59, 130, 246, 0.1); }
.border-blue-500-20 { border-color: rgba(59, 130, 246, 0.2); }

/* Amber */
.bg-amber-500-10 { background-color: rgba(217, 119, 6, 0.1); }
.border-amber-500-20 { border-color: rgba(217, 119, 6, 0.2); }

/* Emerald */
.bg-emerald-500-10 { background-color: rgba(16, 185, 129, 0.1); }
.border-emerald-500-20 { border-color: rgba(16, 185, 129, 0.2); }

/* Red */
.bg-red-500-10 { background-color: rgba(239, 68, 68, 0.1); }
.border-red-500-20 { border-color: rgba(239, 68, 68, 0.2); }

/* Slate */
.bg-slate-500-10 { background-color: rgba(100, 116, 139, 0.1); }
.bg-slate-50-50 { background-color: rgba(248, 250, 252, 0.5); }
.bg-slate-900-50 { background-color: rgba(15, 23, 42, 0.5); }
.bg-slate-900-60 { background-color: rgba(15, 23, 42, 0.6); }
.bg-slate-800-30 { background-color: rgba(30, 41, 59, 0.3); }
.bg-slate-800-50 { background-color: rgba(30, 41, 59, 0.5); }
.border-slate-500-20 { border-color: rgba(100, 116, 139, 0.2); }
.bg-slate-950-95 { background-color: rgba(2, 6, 23, 0.95); }
.bg-white-95 { background-color: rgba(255, 255, 255, 0.95); }
.bg-white-90 { background-color: rgba(255, 255, 255, 0.9); }
.bg-black-60 { background-color: rgba(0, 0, 0, 0.6); }

/* ============ SPECIAL GRADIENTS ============ */
.bg-radial-grid-1px {
  background-image: radial-gradient(#ff7a00 1px, transparent 1px);
  background-size: 24px 24px;
}
.bg-radial-grid-1.5px {
  background-image: radial-gradient(#ff7a00 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}
```

---

## Quick Copy-Paste Templates

### Converting Arbitrary Value in JSX
```jsx
// Before
className="w-[400px] h-[300px] rounded-[2rem] text-[10px]"

// After
className="w-400px h-300px rounded-2rem text-10px"
```

### Converting Multiple Opacity Combinations
```jsx
// Before
className={`
  bg-orange-500/10 
  border-orange-500/20 
  shadow-orange-500/20 
  hover:bg-orange-600/30
`}

// After
className={`
  bg-orange-500-10
  border-orange-500-20
  shadow-orange-500-20
  hover:bg-orange-600-30
`}
```

### Converting Dynamic Styles
```jsx
// Before - if using arbitrary values
style={{ height: `calc(100vh - 140px)` }}

// After - use utility class
className="h-screen-140px"
```

---

## Resources

- **Tailwind Docs**: https://tailwindcss.com/docs/adding-custom-styles
- **CSS Reference**: https://developer.mozilla.org/en-US/docs/Web/CSS
- **Conversion Tools**: Check your IDE's find/replace with regex

## Questions?

Refer to the main report: `TAILWIND_COMPLEX_PATTERNS_REPORT.md`  
Detailed pattern list: `TAILWIND_PATTERNS_DETAILED.csv`
