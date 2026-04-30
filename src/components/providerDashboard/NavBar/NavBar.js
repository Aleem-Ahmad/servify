"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SunMoon, Languages } from "lucide-react";
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
    <nav className={`provider-navbar ${dark ? "dark" : ""}`}>
      <div className="nav-left">
        <h2 className="logo" style={{ fontFamily: 'var(--font-sacramento)', fontSize: '1.8rem', color: '#ff7a00' }}>
          {t("navbar.brand")}
        </h2>
      </div>

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
  );
}