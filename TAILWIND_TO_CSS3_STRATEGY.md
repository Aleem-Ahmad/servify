# Tailwind CSS to Pure CSS3 Conversion Strategy

**Project**: Servify (Next.js Service Marketplace)  
**Date**: May 30, 2026  
**Scope**: Complete Tailwind removal and CSS3 migration

---

## Table of Contents

1. [Conversion Strategy Overview](#conversion-strategy-overview)
2. [Top 5 Most-Used Tailwind Patterns](#top-5-most-used-tailwind-patterns)
3. [Detailed Conversion Guide](#detailed-conversion-guide)
4. [Complex Pattern Conversions](#complex-pattern-conversions)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Tooling & Utilities](#tooling--utilities)

---

## Conversion Strategy Overview

### Primary Strategy: **CSS Modules + Utility Classes**

This approach combines the best of both worlds:

- **CSS Modules** (`*.module.css`): Component-specific styles to prevent conflicts
- **Globals CSS**: Shared utilities and variables (already partially done)
- **CSS Variables (Custom Properties)**: For colors, spacing, and animations
- **Inline Styles (Selective)**: For dynamic/conditional styles only

### Why This Approach?

| Aspect | Benefit |
|--------|---------|
| **Scoping** | CSS Modules prevent naming conflicts & class collisions |
| **Performance** | No runtime Tailwind compilation; pure CSS parsing |
| **Maintainability** | Clear separation of concerns; easier debugging |
| **Flexibility** | Dynamic styles via JS variables without overhead |
| **RTL Support** | Urdu RTL already in codebase; CSS can handle it natively |
| **Dark Mode** | CSS variables + `.dark` class selector already implemented |

### File Structure After Conversion

```
src/
├── styles/
│   ├── globals.css           # Root variables, resets, shared utilities
│   ├── variables.css         # All CSS custom properties
│   └── animations.css        # Keyframes (fade-in, slide-up, etc.)
│
├── components/
│   ├── publicComponents/
│   │   ├── Hero.jsx
│   │   ├── Hero.module.css   # ← New: Component-scoped styles
│   │   ├── HeroCanvas.jsx
│   │   └── HeroCanvas.module.css
│   │
│   ├── SharedComponents/
│   │   ├── NavBar/
│   │   │   ├── NavBar.jsx
│   │   │   └── NavBar.module.css
│   │   ├── BookingModal.js
│   │   ├── BookingModal.module.css
│   │   └── ...
│   └── ...
│
└── app/
    ├── layout.js
    ├── layout.module.css      # ← New: Layout-specific styles
    └── ...
```

---

## Top 5 Most-Used Tailwind Patterns

### 1. **Flexbox Layout** (~40% of codebase)

**Current Tailwind Usage:**
```jsx
<div className="flex items-center justify-between gap-6 px-4 py-3">
  <div className="flex items-center gap-2">
    <span>Content</span>
  </div>
</div>
```

**Conversion to CSS3:**
```jsx
// Component.jsx
import styles from './Component.module.css';

<div className={styles.flexContainer}>
  <div className={styles.flexSmall}>
    <span>Content</span>
  </div>
</div>
```

```css
/* Component.module.css */
.flexContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;    /* 6 × 0.25rem = 1.5rem */
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.flexSmall {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

---

### 2. **Responsive Grid Layouts** (~25% of codebase)

**Current Tailwind Usage:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>
```

**Conversion to CSS3:**
```jsx
import styles from './GridLayout.module.css';

<div className={styles.responsiveGrid}>
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>
```

```css
/* GridLayout.module.css */
.responsiveGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Mobile: 1 column (default) */
@media (min-width: 768px) {
  /* Tablet: 2 columns (md breakpoint ~768px) */
  .responsiveGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  /* Desktop: 3 columns (lg breakpoint ~1024px) */
  .responsiveGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

### 3. **Color & Opacity Variants** (~20% of codebase)

**Current Tailwind Usage:**
```jsx
<div className="text-slate-600 dark:text-slate-400 bg-orange-500/10 dark:bg-orange-500/5 border border-slate-200 dark:border-slate-800">
  Content
</div>
```

**Conversion to CSS3:**

First, define CSS variables in `globals.css`:
```css
/* globals.css */
:root {
  /* Primary Colors */
  --primary-50: #fff7ed;
  --primary-100: #ffedd5;
  --primary-500: #ff7a00;
  --primary-600: #ea580c;
  
  /* Secondary Colors */
  --secondary-500: #d946ef;
  --secondary-600: #c026d3;
  
  /* Slate (Neutral) */
  --slate-200: #e2e8f0;
  --slate-400: #cbd5e1;
  --slate-600: #475569;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  
  /* Dark Mode */
  --slate-400-dark: #94a3b8;
  --slate-800-dark: #1e293b;
}

.dark {
  /* Override in dark mode */
  --text-primary: var(--slate-400-dark);
  --bg-dark-card: rgba(30, 41, 59, 0.7);
}
```

Then, use in component CSS:
```jsx
import styles from './Card.module.css';

<div className={styles.coloredCard}>
  Content
</div>
```

```css
/* Card.module.css */
.coloredCard {
  color: var(--slate-600);
  background-color: rgba(255, 122, 0, 0.1);  /* orange-500/10 */
  border: 1px solid var(--slate-200);
  padding: 1rem;
  border-radius: 0.75rem;
}

/* Dark mode override */
.dark .coloredCard {
  color: var(--slate-400);
  background-color: rgba(255, 122, 0, 0.05);
  border-color: var(--slate-800);
}
```

---

### 4. **Spacing & Padding Consistency** (~15% of codebase)

**Tailwind Scale to CSS Equivalents:**

| Tailwind | CSS (pixels) | CSS (rem) |
|----------|------------|----------|
| `p-1` | 4px | 0.25rem |
| `p-2` | 8px | 0.5rem |
| `p-3` | 12px | 0.75rem |
| `p-4` | 16px | 1rem |
| `p-6` | 24px | 1.5rem |
| `p-8` | 32px | 2rem |
| `p-12` | 48px | 3rem |
| `gap-2` | 8px | 0.5rem |
| `gap-4` | 16px | 1rem |
| `gap-6` | 24px | 1.5rem |

**Current Tailwind Usage:**
```jsx
<div className="px-4 py-3 mb-8 mt-1">
  <div className="space-y-2">Item</div>
</div>
```

**Conversion to CSS3:**
```css
/* Spacing.module.css */
.container {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
  margin-top: 0.25rem;
}

/* space-y-2: vertical spacing between children */
.spaceY > * + * {
  margin-top: 0.5rem;
}

/* Alternative shorthand */
.container {
  padding: 0.75rem 1rem;
  margin: 0.25rem 0 2rem 0;
}
```

---

### 5. **Hover, Transform & Transitions** (~10% of codebase)

**Current Tailwind Usage:**
```jsx
<button className="hover:scale-105 hover:bg-slate-100 transition-all duration-300 dark:hover:bg-slate-800">
  Hover me
</button>

<div className="group">
  <div className="group-hover:scale-110 transition-transform">Icon</div>
</div>
```

**Conversion to CSS3:**
```jsx
import styles from './Button.module.css';

<button className={styles.interactiveButton}>
  Hover me
</button>

<div className={styles.group}>
  <div className={styles.groupItem}>Icon</div>
</div>
```

```css
/* Button.module.css */
.interactiveButton {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: all 300ms ease;
}

.interactiveButton:hover {
  background-color: #f1f5f9;  /* slate-100 */
  transform: scale(1.05);
}

.dark .interactiveButton:hover {
  background-color: #1e293b;  /* slate-800 */
}

/* Group interaction pattern */
.group {
  display: flex;
  gap: 0.5rem;
}

.groupItem {
  width: 1rem;
  height: 1rem;
  transition: transform 300ms ease;
}

.group:hover .groupItem {
  transform: scale(1.1);
}
```

---

## Detailed Conversion Guide

### CSS3 Color System

**Setup in `styles/variables.css`:**
```css
:root {
  /* Primary Palette (Orange) */
  --primary-50: #fff7ed;
  --primary-100: #ffedd5;
  --primary-200: #fed7aa;
  --primary-300: #fdba74;
  --primary-400: #fb923c;
  --primary-500: #ff7a00;
  --primary-600: #ea580c;
  --primary-700: #c2410c;
  --primary-800: #9a3412;
  --primary-900: #7c2d12;
  
  /* Secondary Palette (Purple) */
  --secondary-50: #fdf4ff;
  --secondary-100: #fae8ff;
  --secondary-500: #d946ef;
  --secondary-600: #c026d3;
  --secondary-700: #a21caf;
  
  /* Accent (Gold) */
  --accent: #F59E0B;
  
  /* Neutral (Slate) */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  
  /* Dark Mode Colors */
  --dark-bg: #0a1128;
  --dark-lighter: #1E293B;
  --dark-card: rgba(30, 41, 59, 0.7);
  
  /* Font Stack */
  --font-main: 'Outfit', system-ui, -apple-system, sans-serif;
  --font-urdu: 'Noto Nastaliq Urdu', serif;
}

/* Light Mode (default) */
body {
  --text-primary: var(--slate-900);
  --text-secondary: var(--slate-600);
  --bg-primary: #ffffff;
  --bg-secondary: var(--slate-50);
  --border-color: var(--slate-200);
}

/* Dark Mode */
body.dark {
  --text-primary: #f1f5f9;
  --text-secondary: var(--slate-400);
  --bg-primary: var(--dark-bg);
  --bg-secondary: var(--dark-lighter);
  --border-color: var(--slate-800);
}
```

### Responsive Design Breakpoints

**Map Tailwind Breakpoints to CSS Media Queries:**
```css
/* Mobile-first approach (no prefix = mobile) */

/* sm: 640px and above */
@media (min-width: 640px) {
  /* Tablet styles */
}

/* md: 768px and above */
@media (min-width: 768px) {
  /* Small desktop styles */
}

/* lg: 1024px and above */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* xl: 1280px and above */
@media (min-width: 1280px) {
  /* Large desktop styles */
}

/* 2xl: 1536px and above */
@media (min-width: 1536px) {
  /* Extra large desktop styles */
}
```

### Dark Mode Implementation

**Already in place with CSS variables:**
```css
/* In globals.css or component.module.css */

.element {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Alternative: Use .dark class selector */
.dark .element {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## Complex Pattern Conversions

### 1. Responsive Classes (md:, lg:)

**Tailwind:**
```jsx
<div className="px-4 py-2 md:px-8 md:py-4 lg:px-12 lg:py-6 text-base md:text-lg lg:text-xl">
  Responsive Padding & Text
</div>
```

**CSS Module:**
```jsx
import styles from './Responsive.module.css';

<div className={styles.responsivePadding}>
  Responsive Padding & Text
</div>
```

```css
/* Responsive.module.css */
.responsivePadding {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .responsivePadding {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .responsivePadding {
    padding: 1.5rem 3rem;
    font-size: 1.25rem;
  }
}
```

---

### 2. State Variants (hover:, focus:, active:)

**Tailwind:**
```jsx
<button className="bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 active:scale-95 transition-all">
  Click me
</button>
```

**CSS Module:**
```jsx
import styles from './Button.module.css';

<button className={styles.primaryButton}>
  Click me
</button>
```

```css
/* Button.module.css */
.primaryButton {
  background-color: var(--primary-500);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.primaryButton:hover {
  background-color: var(--primary-600);
}

.primaryButton:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--primary-500);
  ring-offset: 2px;
  /* CSS ring alternative */
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--primary-500);
}

.primaryButton:active {
  transform: scale(0.95);
}

/* Disabled state */
.primaryButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 3. Gradient Backgrounds

**Tailwind:**
```jsx
<div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
  Gradient Text
</div>

<div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
  Gradient Background
</div>
```

**CSS Module:**
```jsx
import styles from './Gradient.module.css';

<div className={styles.gradientText}>
  Gradient Text
</div>

<div className={styles.gradientBg}>
  Gradient Background
</div>
```

```css
/* Gradient.module.css */

/* Gradient Text */
.gradientText {
  background: linear-gradient(
    to right,
    #ff7a00,           /* orange-500 */
    #fbbf24,           /* amber-500 */
    #ef4444            /* red-500 */
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

/* Gradient Background */
.gradientBg {
  background: linear-gradient(
    135deg,            /* to bottom-right */
    #f8fafc,           /* slate-50 */
    #ffffff,           /* white */
    rgba(255, 122, 0, 0.1)  /* orange-50/20 */
  );
  min-height: 400px;
  padding: 2rem;
}

/* Radial Gradient Example */
.gradientRadial {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 122, 0, 0.12),
    transparent 70%
  );
}

/* Conic Gradient Example */
.gradientConic {
  background: conic-gradient(
    from 180deg at 50% 50%,
    #ff7a00,
    #d946ef,
    #ff7a00
  );
}
```

---

### 4. Transforms & Animations

**Tailwind:**
```jsx
<motion.div
  animate={{
    x: [0, 30, -15, 0],
    y: [0, -30, 20, 0],
    scale: [1, 1.1, 0.95, 1],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="animate-fade-in transition-transform"
/>
```

**CSS Module with Animations:**
```jsx
import styles from './Animations.module.css';

<div className={styles.floatingOrb} />
```

```css
/* Animations.module.css */

/* Transform utilities */
.translate {
  transform: translateY(0.5rem);
}

.scale {
  transform: scale(1.1);
}

.rotate {
  transform: rotate(45deg);
}

/* Keyframe animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(1.25rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes floatOrb {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(1.875rem, -1.875rem) scale(1.1);
  }
  66% {
    transform: translate(-0.9375rem, 1.25rem) scale(0.95);
  }
}

/* Apply animations to elements */
.fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.slideUp {
  animation: slideUp 0.5s ease-out forwards;
}

.pulseSlow {
  animation: pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.floatingOrb {
  width: 600px;
  height: 600px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 122, 0, 0.12) 0%, transparent 70%);
  filter: blur(3.75rem);
  animation: floatOrb 10s ease-in-out infinite;
  position: absolute;
  top: -25%;
  left: -25%;
}

/* Transition utilities */
.transitionAll {
  transition: all 300ms ease;
}

.transitionTransform {
  transition: transform 300ms ease;
}

.transitionBg {
  transition: background-color 300ms ease;
}
```

---

### 5. Grid & Flex Layouts

**Tailwind:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
  {items.map(item => (
    <div key={item.id} className="flex flex-col items-start justify-between h-full gap-4">
      {item.content}
    </div>
  ))}
</div>
```

**CSS Module:**
```jsx
import styles from './GridFlex.module.css';

<div className={styles.complexGrid}>
  {items.map(item => (
    <div key={item.id} className={styles.gridItem}>
      {item.content}
    </div>
  ))}
</div>
```

```css
/* GridFlex.module.css */

.complexGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  auto-rows: max-content;
}

@media (min-width: 768px) {
  .complexGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .complexGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gridItem {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 100%;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

/* Alternative: Flexbox wrap */
.flexContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.flexItem {
  flex: 1 1 calc(33.333% - 1rem);
  min-width: 250px;
}

@media (max-width: 768px) {
  .flexItem {
    flex: 1 1 calc(50% - 0.75rem);
    min-width: 200px;
  }
}
```

---

### 6. Glass Morphism & Backdrop Effects

**Tailwind:**
```jsx
<div className="glass backdrop-blur-md">
  <p className="text-white">Glass effect</p>
</div>
```

**CSS Module:**
```jsx
import styles from './Glass.module.css';

<div className={styles.glassCard}>
  <p className={styles.glassText}>Glass effect</p>
</div>
```

```css
/* Glass.module.css */

.glassCard {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 300ms ease;
}

.glassCard:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: translateY(-0.25rem);
}

/* Dark mode glass */
.dark .glassCard {
  background-color: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.glassText {
  color: white;
  font-weight: 500;
}

/* Strong blur */
.glassBlur {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Weak blur */
.glassSoft {
  backdrop-filter: blur(10px);
}

/* Premium glass with border gradient */
.glassGradient {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

---

## Implementation Roadmap

### Phase 1: Setup & Infrastructure (1-2 days)
- [ ] Create `src/styles/variables.css` with all CSS variables
- [ ] Create `src/styles/animations.css` with keyframes
- [ ] Update `src/styles/globals.css` with utility classes
- [ ] Set up CSS Module build configuration (Next.js ready by default)
- [ ] Create documentation for team

### Phase 2: Component Conversion (2-3 weeks)
**Priority 1 - Core Components:**
- [ ] NavBar (`NavBar.module.css`)
- [ ] Hero component (`Hero.module.css`)
- [ ] BookingModal (`BookingModal.module.css`)
- [ ] Button components (already partially done)

**Priority 2 - Dashboard Components:**
- [ ] Admin Dashboard
- [ ] Customer Dashboard
- [ ] Provider Dashboard

**Priority 3 - Shared Components:**
- [ ] Onboarding flows
- [ ] Form elements
- [ ] Cards and layouts

**Priority 4 - Pages:**
- [ ] Auth pages
- [ ] Public pages
- [ ] Protected pages

### Phase 3: Testing & Cleanup (1 week)
- [ ] Test responsive design at all breakpoints
- [ ] Test dark mode toggle
- [ ] Test RTL (Urdu) layout
- [ ] Remove `tailwindcss` and `@tailwindcss/forms` packages
- [ ] Optimize CSS file sizes

### Phase 4: Optimization (1 week)
- [ ] Minify CSS modules
- [ ] Remove unused styles
- [ ] Implement critical CSS
- [ ] Audit performance

---

## Tooling & Utilities

### CSS Variable Access in JavaScript

For dynamic styling, use CSS variables:

```jsx
// App.jsx
import { useTheme } from '@/context/ThemeContext';

export default function Component() {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}>
      Dynamic theme support
    </div>
  );
}
```

### Helper Function: Conditional Classes

```js
// lib/classNames.js (cn function - already exists)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Usage in components
import styles from './Component.module.css';
import { cn } from '@/lib/utils';

export default function Component({ isActive, isLoading }) {
  return (
    <button 
      className={cn(
        styles.button,
        isActive && styles.buttonActive,
        isLoading && styles.buttonLoading
      )}
    >
      Click me
    </button>
  );
}
```

### CSS Module Import Alias

Already configured in `jsconfig.json` - use `@/` for imports:
```jsx
import styles from '@/components/Button/Button.module.css';
```

### Responsive Design Helper Hook

```jsx
// lib/useMediaQuery.js
import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage
const isTablet = useMediaQuery('(min-width: 768px)');
const isDesktop = useMediaQuery('(min-width: 1024px)');
```

---

## Quick Reference: Tailwind → CSS3 Mapping

| Tailwind | CSS | Value |
|----------|-----|-------|
| `p-4` | `padding` | `1rem` |
| `gap-6` | `gap` | `1.5rem` |
| `text-lg` | `font-size` | `1.125rem` |
| `font-bold` | `font-weight` | `700` |
| `rounded-xl` | `border-radius` | `0.75rem` |
| `shadow-lg` | `box-shadow` | `0 10px 15px -3px rgba(0,0,0,0.1)` |
| `flex items-center` | `display: flex; align-items: center` | - |
| `grid grid-cols-2` | `display: grid; grid-template-columns: repeat(2, 1fr)` | - |
| `md:text-2xl` | `@media (min-width: 768px) { font-size: 1.5rem }` | - |
| `hover:scale-105` | `.element:hover { transform: scale(1.05) }` | - |
| `transition-all` | `transition: all 300ms ease` | - |
| `dark:bg-slate-800` | `.dark .element { background-color: var(--slate-800) }` | - |

---

## Expected Benefits After Migration

✅ **Performance**: Reduced JavaScript bundle size (remove Tailwind compiler)  
✅ **Maintainability**: Clear CSS structure with scoped modules  
✅ **Customization**: Easier to add custom styles without Tailwind constraints  
✅ **Developer Experience**: Direct CSS control, no utility class hunting  
✅ **Optimization**: Unused CSS easily identified and removed  
✅ **RTL Support**: Native CSS support for Urdu right-to-left layout  
✅ **Dark Mode**: Cleaner implementation with CSS variables  

---

## Resources & References

- MDN CSS Grid Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
- CSS Flexbox Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- Next.js CSS Modules: https://nextjs.org/docs/basic-features/built-in-css-support
- CSS Media Queries: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries

---

**Document Version**: 1.0  
**Last Updated**: May 30, 2026  
**Status**: Ready for Implementation
