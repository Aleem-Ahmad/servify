"use client";

import { useState, useEffect, useRef } from "react";
import "./searchBar.css";

// ── Inline SVGs ──
const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconPin = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconDollar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconCategory = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconFilter = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    style={{ display: "block", flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconChevron = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = ["Any", "Under 200", "200–350", "350–500", "500–1000", "1000+"];
const CATEGORIES = ["Electrician", "Plumber", "Cleaner", "Carpenter", "Gardener", "Painter"];

export default function SearchBar() {
  const [showFilter, setShowFilter] = useState(false);
  const [location, setLocation]     = useState("");
  const [budget, setBudget]         = useState("");
  const [category, setCategory]     = useState("");
  const [query, setQuery]           = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);

  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const { t } = useLanguage();

  const inputRef = useRef(null);
  const filterActive = location || budget || category;

  // Animate sheet in after mount
  useEffect(() => {
    if (showFilter) {
      requestAnimationFrame(() => setSheetVisible(true));
    } else {
      setSheetVisible(false);
    }
  }, [showFilter]);

  const openFilter = () => setShowFilter(true);
  const closeFilter = () => {
    setSheetVisible(false);
    setTimeout(() => setShowFilter(false), 320);
  };

  const openMap = () => {
    setLocation("Karachi, PK");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (location) params.append("location", location);
    if (category) params.append("category", category);
    
    // Redirect to the providers list with the search query
    window.location.href = `/customerDashboard/allProviders?${params.toString()}`;
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
          SEARCH BAR
      ══════════════════════════════════════════════ */}
      <div className={`sb-wrap ${darkMode ? "dark" : ""}`}>

        {/* Search input */}
        <div className="sb-field sb-main">
          <span className="sb-field-icon">
            <IconSearch size={17} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={t("search.placeholder", { defaultValue: "What are you looking for?" })}
            className="sb-input"
          />
          {query && (
            <button className="sb-clear" onClick={() => setQuery("")} aria-label="Clear">
              <IconClose size={14} />
            </button>
          )}
        </div>

        {/* ── Desktop only: location + category + budget inline ── */}
        <div className="sb-desktop-filters">
          <div className="sb-divider" />

          {/* Location */}
          <button className="sb-field sb-location" onClick={openMap}>
            <span className="sb-field-icon"><IconPin size={15} /></span>
            <span className="sb-field-text">{location || t("search.location", { defaultValue: "Location" })}</span>
          </button>

          <div className="sb-divider" />

          {/* Category */}
          <div className="sb-field sb-category">
            <span className="sb-field-icon"><IconCategory size={15} /></span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="sb-select"
            >
              <option value="">{t("navbar.services", { defaultValue: "Category" })}</option>
              {CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="sb-chevron"><IconChevron size={13} /></span>
          </div>

          <div className="sb-divider" />

          {/* Budget */}
          <div className="sb-field sb-budget">
            <span className="sb-field-icon"><IconDollar size={15} /></span>
            <select
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="sb-select"
            >
              <option value="">{t("search.budget", { defaultValue: "Budget" })}</option>
              {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="sb-chevron"><IconChevron size={13} /></span>
          </div>
        </div>

        {/* ── Mobile only: filter trigger ── */}
        <button
          className={`sb-filter-btn ${filterActive ? "active" : ""}`}
          onClick={openFilter}
          aria-label="Filters"
        >
          <IconFilter size={18} />
          {filterActive && <span className="sb-filter-dot" />}
        </button>

        {/* Search button */}
        <button className="sb-search-btn" onClick={handleSearch} aria-label="Search">
          <IconSearch size={18} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          FILTER BOTTOM SHEET
      ══════════════════════════════════════════════ */}
      {showFilter && (
        <div
          className={`sb-overlay ${sheetVisible ? "visible" : ""}`}
          onClick={closeFilter}
        >
          <div
            className={`sb-sheet ${sheetVisible ? "open" : ""} ${darkMode ? "dark" : ""}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="sb-handle" />

            {/* Header */}
            <div className="sb-sheet-header">
              <span className="sb-sheet-title">{t("search.filters", { defaultValue: "Filters" })}</span>
              <button className="sb-sheet-close" onClick={closeFilter}>
                <IconClose size={18} />
              </button>
            </div>

            {/* Location */}
            <div className="sb-sheet-section">
              <label className="sb-sheet-label">
                <IconPin size={14} /> {t("search.location", { defaultValue: "Location" })}
              </label>
              <button
                className={`sb-sheet-field ${location ? "filled" : ""}`}
                onClick={openMap}
              >
                <span>{location || t("search.tapLocation", { defaultValue: "Tap to select location" })}</span>
                <IconChevron size={14} />
              </button>
            </div>

            {/* Category */}
            <div className="sb-sheet-section">
              <label className="sb-sheet-label">
                <IconCategory size={14} /> {t("navbar.services", { defaultValue: "Category" })}
              </label>
              <div className="sb-chip-grid">
                {CATEGORIES.map(o => (
                  <button
                    key={o}
                    className={`sb-chip ${category === o ? "selected" : ""}`}
                    onClick={() => setCategory(category === o ? "" : o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="sb-sheet-section">
              <label className="sb-sheet-label">
                <IconDollar size={14} /> {t("search.budgetRange", { defaultValue: "Budget range" })}
              </label>
              <div className="sb-chip-grid">
                {BUDGET_OPTIONS.filter(o => o !== "Any").map(o => (
                  <button
                    key={o}
                    className={`sb-chip ${budget === o ? "selected" : ""}`}
                    onClick={() => setBudget(budget === o ? "" : o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="sb-sheet-actions">
              <button
                className="sb-sheet-reset"
                onClick={() => { setLocation(""); setBudget(""); setCategory(""); }}
              >
                {t("search.reset", { defaultValue: "Reset" })}
              </button>
              <button className="sb-sheet-apply" onClick={closeFilter}>
                {t("search.applyFilters", { defaultValue: "Apply filters" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}