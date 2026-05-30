"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sun, Moon, Globe, Home, Wrench, Users, HelpCircle, 
  MessageCircle, User, PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import "@/styles/navbar.css";

export default function Navbar({ type = "public" }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const { t, locale, changeLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(() => {
    const links = [
      { name: t("navbar.home"), href: type === "dashboard" ? "/customerDashboard" : "#home", icon: <Home className="w-5 h-5" /> },
      { name: t("navbar.services"), href: type === "dashboard" ? "/customerDashboard#services" : "#services", icon: <Wrench className="w-5 h-5" /> },
    ];

    if (type === "dashboard") {
      links.push(
        { name: t("navbar.bookService") || "Book", href: "/customerDashboard/complaintForm", icon: <PlusCircle className="w-5 h-5 text-orange-500" />, isSpecial: true },
        { name: t("navbar.complaints"), href: "/customerDashboard/complaintPage", icon: <MessageCircle className="w-5 h-5" /> },
        { name: t("navbar.account"), href: "/customerDashboard/accountPage", icon: <User className="w-5 h-5" /> }
      );
    } else {
      links.push(
        { name: t("navbar.providers"), href: "#providers", icon: <Users className="w-5 h-5" /> },
        { name: t("navbar.howItWorks"), href: "#how-it-works", icon: <HelpCircle className="w-5 h-5" /> },
        { name: t("auth.login"), href: "/authentication", icon: <User className="w-5 h-5" /> }
      );
    }
    return links;
  }, [t, type, locale]);

  const isActive = (href) => {
    if (pathname === href) return true;
    if (typeof window !== "undefined" && window.location.hash === href) return true;
    return false;
  };

  return (
    <>
      {/* ─── DESKTOP HEADER NAVBAR ─── */}
      <nav className={cn("svx-nav", isScrolled ? "scrolled" : "", darkMode ? "dark" : "")}>
        {/* Logo */}
        <Link href="/" className="svx-brand">
          Servify
        </Link>

        {/* Desktop Links */}
        <ul className="svx-links">
          {navLinks.filter(l => !l.isSpecial).map((link) => (
            <li key={link.name}>
              <Link 
                href={link.href}
                className={cn("svx-link", isActive(link.href) ? "active" : "")}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="svx-actions">
          <button 
            onClick={toggleTheme}
            className="svx-icon"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
            className="svx-icon svx-lang"
            title="Change Language"
          >
            <Globe size={18} />
            <span>{locale}</span>
          </button>

          <div className="svx-sep"></div>

          {type === "public" ? (
            <>
              <Link href="/authentication" className="svx-link" style={{ fontWeight: 600 }}>
                {t("auth.login")}
              </Link>
              <Link href="/authentication" className="svx-cta">
                {t("auth.signup")}
              </Link>
            </>
          ) : (
            <Link 
              href="/customerDashboard/complaintForm"
              className="svx-cta"
            >
              {t("navbar.bookService")}
            </Link>
          )}
        </div>
      </nav>

      {/* ─── MOBILE TOP HEADER ─── */}
      <div className={cn("svx-mobile-top", isScrolled ? "scrolled" : "", darkMode ? "dark" : "")}>
        <Link href="/" className="svx-brand">
          Servify
        </Link>

        <div className="svx-mobile-tools">
          <button 
            onClick={toggleTheme}
            className="svx-icon"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
            className="svx-icon svx-lang"
          >
            <Globe size={16} />
            <span>{locale}</span>
          </button>

          {type === "public" ? (
            <Link href="/authentication" className="svx-cta" style={{ padding: "6px 12px", fontSize: "0.7rem", borderRadius: "8px" }}>
              {t("auth.login")}
            </Link>
          ) : (
            <Link 
              href="/customerDashboard/complaintForm"
              className="svx-cta" style={{ padding: "6px 12px", fontSize: "0.7rem", borderRadius: "8px" }}
            >
              {t("navbar.bookService") || "Book"}
            </Link>
          )}
        </div>
      </div>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <div className={cn("svx-tabbar", darkMode ? "dark" : "")}>
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const isCta = link.isSpecial;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn("svx-tab", active ? "active" : "", isCta ? "svx-tab-cta" : "")}
            >
              <div className="svx-tab-icon">
                {link.icon}
              </div>
              <span className="svx-tab-label">
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
