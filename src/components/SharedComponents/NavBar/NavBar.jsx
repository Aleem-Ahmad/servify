"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Sun, Moon, Globe, Home, Wrench, Users, HelpCircle, 
  MessageCircle, User, PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

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
      {/* ─── DESKTOP HEADER NAVBAR (Visible on md and up) ─── */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 hidden md:block",
        isScrolled ? "py-2" : "py-4"
      )}>
        <nav className={cn(
          "max-w-7xl mx-auto rounded-3xl transition-all duration-500",
          isScrolled 
            ? "glass shadow-premium px-6 py-3" 
            : "bg-transparent px-6 py-3"
        )}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span 
                style={{ fontFamily: 'var(--font-sacramento)', fontStyle: 'normal' }}
                className="text-4xl font-normal tracking-wide bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform"
              >
                Servify
              </span>
            </Link>

            {/* Desktop Links */}
            <ul className="flex items-center gap-1">
              {navLinks.filter(l => !l.isSpecial).map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      isActive(link.href) 
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 transition-all cursor-pointer"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105 transition-all cursor-pointer"
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{locale}</span>
              </button>

              {type === "public" ? (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/authentication" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
                    {t("auth.login")}
                  </Link>
                  <Link href="/authentication" className="btn-primary py-2.5 text-sm">
                    {t("auth.signup")}
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/customerDashboard/complaintForm"
                  className="btn-primary py-2.5 text-sm"
                >
                  {t("navbar.bookService")}
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR (Visible on screens below md) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-2 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all relative",
                  link.isSpecial ? "scale-110 -translate-y-2" : ""
                )}
              >
                {link.isSpecial ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/40 transform hover:scale-105 transition-all">
                    {link.icon}
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "p-1.5 rounded-xl transition-all",
                      active 
                        ? "bg-orange-500/10 text-orange-500" 
                        : "text-slate-400 dark:text-slate-500"
                    )}>
                      {link.icon}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold tracking-tight transition-colors",
                      active ? "text-orange-500" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {link.name}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
          
          {/* Quick theme and language toggle inside mobile drawer tabs */}
          <button 
            onClick={toggleTheme} 
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 dark:text-slate-500"
          >
            <div className="p-1.5 rounded-xl">
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold">Theme</span>
          </button>

          <button 
            onClick={() => changeLanguage(locale === "en" ? "ur" : "en")} 
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-slate-400 dark:text-slate-500"
          >
            <div className="p-1.5 rounded-xl">
              <Globe className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-[10px] font-bold uppercase">{locale}</span>
          </button>
        </div>
      </div>
    </>
  );
}
