"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SunMoon, Languages, Home, Store, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ProviderNavbar() {
  const pathname = usePathname();
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const handleLangToggle = () => {
    changeLanguage(locale === "en" ? "ur" : "en");
  };

  return (
    <>
      {/* ─── TOP HEADER NAVBAR ─── */}
      <nav className={`provider-navbar ${dark ? "dark" : ""}`}>
        <div className="nav-left">
          <h2 className="logo" style={{ fontFamily: 'var(--font-sacramento)', fontSize: '1.8rem', color: '#ff7a00' }}>
            {t("navbar.brand") || "Servify"}
          </h2>
        </div>

        {/* Desktop Links (Hidden on mobile via CSS) */}
        <ul className="nav-links">
          <li className={pathname === "/providerDashboard" ? "active" : ""}>
            <Link href="/providerDashboard">{t("Home")}</Link>
          </li>

          <li className={pathname === "/providerDashboard/shop" ? "active" : ""}>
            <Link href="/providerDashboard/shop">{t("Shop")}</Link>
          </li>

          <li className={pathname === "/providerDashboard/feedback" ? "active" : ""}>
            <Link href="/providerDashboard/feedback">{t("Feedback")}</Link>
          </li>
        </ul>

        <div className="nav-right">
          <span className="revenue">Rs. 0</span>
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
            <SunMoon className="icon" />
          </button>
          <button onClick={handleLangToggle} className="icon-btn" aria-label="Toggle Language">
            <Languages className="icon" />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE BOTTOM TAB BAR (Visible on mobile/tablet under 900px) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link 
            href="/providerDashboard"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all ${
              pathname === "/providerDashboard" 
                ? "text-orange-500 font-bold scale-105" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
            }`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight">{t("Home")}</span>
          </Link>

          <Link 
            href="/providerDashboard/shop"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all ${
              pathname === "/providerDashboard/shop" 
                ? "text-orange-500 font-bold scale-105" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
            }`}
          >
            <Store className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight">{t("Shop")}</span>
          </Link>

          <Link 
            href="/providerDashboard/feedback"
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all ${
              pathname === "/providerDashboard/feedback" 
                ? "text-orange-500 font-bold scale-105" 
                : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
            }`}
          >
            <MessageSquare className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight">{t("Feedback")}</span>
          </Link>
        </div>
      </div>
    </>
  );
}