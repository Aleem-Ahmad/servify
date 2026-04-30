"use client";

import "@/styles/navbar.css";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

// ── Icons ──
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TabHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const TabServices = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const TabProviders = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const TabHowItWorks = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const TabContact = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const TabComplaints = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const TabAccount = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const TabBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block" }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar({ type = "public" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  // ✅ Correctly destructure locale & changeLanguage from context
  const { t, locale, changeLanguage } = useLanguage();

  // ── Optimized Scroll Listener (avoids redundant state updates) ──
  useEffect(() => {
    let wasScrolled = window.scrollY > 24;
    const onScroll = () => {
      const isScrolled = window.scrollY > 24;
      if (isScrolled !== wasScrolled) {
        setScrolled(isScrolled);
        wasScrolled = isScrolled;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Memoized Link sets (prevents recreation on every render) ──
  const publicLinks = useMemo(() => [
    { name: t("navbar.home"),        href: "#home",         icon: <TabHome /> },
    { name: t("navbar.services"),    href: "#services",     icon: <TabServices /> },
    { name: t("navbar.howItWorks"),  href: "#how-it-works", icon: <TabHowItWorks /> },
    { name: t("navbar.providers"),   href: "#providers",    icon: <TabProviders /> },
    { name: t("navbar.contact"),     href: "#footer",       icon: <TabContact /> },
  ], [t]);

  const dashLinks = useMemo(() => [
    { name: t("navbar.home"),        href: "/customerDashboard#home",          icon: <TabHome /> },
    { name: t("navbar.services"),    href: "/customerDashboard#services",      icon: <TabServices /> },
    { name: t("navbar.howItWorks"),  href: "/customerDashboard#how-it-works",  icon: <TabHowItWorks /> },
    { name: t("navbar.providers"),   href: "/customerDashboard#providers",     icon: <TabProviders /> },
    { name: t("navbar.complaints"),  href: "/customerDashboard/complaintPage", icon: <TabComplaints /> },
    { name: t("navbar.account"),     href: "/customerDashboard/accountPage",   icon: <TabAccount /> },
    { name: t("navbar.contact"),     href: "#footer",                          icon: <TabContact /> },
  ], [t]);

  const navLinks = useMemo(() => 
    type === "dashboard" ? dashLinks : publicLinks, 
  [type, dashLinks, publicLinks]);

  const ctaHref = useMemo(() => 
    type === "dashboard" ? "/customerDashboard/complaintForm#complaint-form" : "/login-first",
  [type]);

  // ── Active tab detection ──
  const [activeHref, setActiveHref] = useState("");
  useEffect(() => {
    const update = () => setActiveHref(window.location.hash || pathname);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);

  const isActive = (href) =>
    href === "#home"
      ? activeHref === "" || activeHref === "#home"
      : activeHref === href || pathname === href;

  const handleLangToggle = () => {
    changeLanguage(locale === "en" ? "ur" : "en");
  };

  const handleSecretAccess = (e) => {
    const now = Date.now();
    if (now - lastTapTime < 600) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 5) {
        e.preventDefault();
        const pass = prompt("Servify Access Key:");
        if (pass === "admin_servify") {
          window.location.href = "/adminDashboard";
        } else if (pass === "customer_dummy") {
          window.location.href = "/customerDashboard";
        } else if (pass === "provider_dummy") {
          window.location.href = "/providerDashboard";
        }
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <nav className={`svx-nav ${darkMode ? "dark" : ""} ${scrolled ? "scrolled" : ""}`}>
        <Link 
          href={type === "dashboard" ? "/customerDashboard" : "/"} 
          className="svx-brand" 
          onClick={handleSecretAccess}
        >
          {t("navbar.brand")}
        </Link>

        <ul className="svx-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className={`svx-link ${isActive(link.href) ? "active" : ""}`}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="svx-actions">
          <Link href={ctaHref} className="svx-cta">{t("navbar.bookService")}</Link>
          <span className="svx-sep" />
          <button className="svx-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
          {/* ✅ locale is always defined, .toUpperCase() is safe */}
          <button className="svx-icon svx-lang" onClick={handleLangToggle} aria-label="Toggle language">
            <IconGlobe />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </nav>

      {/* MOBILE TOP STRIP */}
      <div className={`svx-mobile-top ${darkMode ? "dark" : ""} ${scrolled ? "scrolled" : ""}`}>
        <Link 
          href={type === "dashboard" ? "/customerDashboard" : "/"} 
          className="svx-brand" 
          onClick={handleSecretAccess}
        >
          {t("navbar.brand")}
        </Link>
        <div className="svx-mobile-tools">
          <button className="svx-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
          <button className="svx-icon svx-lang" onClick={handleLangToggle} aria-label="Toggle language">
            <IconGlobe />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* MOBILE TABBAR */}
      <nav className={`svx-tabbar ${darkMode ? "dark" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className={`svx-tab ${isActive(link.href) ? "active" : ""}`}>
            <span className="svx-tab-icon">{link.icon}</span>
            <span className="svx-tab-label">{link.name}</span>
          </Link>
        ))}
        <Link href={ctaHref} className="svx-tab svx-tab-cta">
          <span className="svx-tab-icon"><TabBook /></span>
          <span className="svx-tab-label">{t("navbar.book")}</span>
        </Link>
      </nav>
    </>
  );
}