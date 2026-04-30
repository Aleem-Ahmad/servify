# Servify Theme & Localization Documentation

This document explains how the Light/Dark mode and Bilingual (English/Urdu) features are implemented in this project.

---

## 1. Light/Dark Theme Support

The theme system is built using **React Context** and **CSS Variables**.

### Core Components
- **`src/context/ThemeContext.js`**: 
  - Manages the global `theme` state (`'light'` or `'dark'`).
  - Persists selection in `localStorage`.
  - Automatically detects system preferences on first load.
  - Toggles the `.dark` class on the `<html>` element.
- **`src/styles/globals.css`**:
  - Defines the color palette using CSS variables.
  - `:root` contains Light Theme values (White + Orange).
  - `.dark` contains Dark Theme values (Deep Navy + Orange + Light Navy).

### Usage in Components
To use the theme or toggle it in any component:
```javascript
import { useTheme } from "@/context/ThemeContext";

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Current: {theme}</button>;
};
```

### Styling Strategy
Always use CSS variables in your `.css` files rather than hardcoded hex codes:
```css
.card {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
```

---

## 2. Bilingual Support (English & Urdu)

The localization system is a custom-built solution using **React Context** to handle translations and RTL (Right-to-Left) layouts.

### Core Components
- **`src/locales/en.json` & `ur.json`**:
  - JSON dictionaries containing all text strings.
  - Urdu file uses translated keys corresponding to English ones.
- **`src/context/LanguageContext.js`**:
  - Manages the `locale` state (`'en'` or `'ur'`).
  - Provides the `t(key, params)` function to fetch translations.
  - Automatically updates the HTML `dir` attribute (`rtl` for Urdu, `ltr` for English).
  - Automatically updates the HTML `lang` attribute.

### Translation Helper (`t`)
The `t` function supports simple interpolation:
- **Direct**: `t("hero.title")`
- **Interpolated**: `t("services.count", { num: 5 })` (where JSON value is `"Showing {num} services"`)

### Usage in Components
```javascript
import { useLanguage } from "@/context/LanguageContext";

const MyComponent = () => {
  const { t, locale, changeLanguage } = useLanguage();

  return (
    <div>
      <h1>{t("nav.home")}</h1>
      <button onClick={() => changeLanguage("ur")}>اردو</button>
    </div>
  );
};
```

---

## 3. Implementation Workflow

1.  **Adding a New String**: 
    - Add the key/value pair to `src/locales/en.json`.
    - Add the same key with the Urdu translation to `src/locales/ur.json`.
2.  **RTL Layouts**:
    - The layout automatically flips to RTL when the language is Urdu because `document.documentElement.dir` is set to `rtl`.
    - Most modern browsers handle standard flex/grid layouts correctly in RTL.
    - For specific RTL adjustments, you can use the CSS selector `[dir="rtl"] .your-class { ... }`.
3.  **Dark Mode Specifics**:
    - Ensure all background colors are referencing variables from `globals.css`.
    - If a specific section needs a unique color for dark mode, use `.dark .section-name { ... }`.
