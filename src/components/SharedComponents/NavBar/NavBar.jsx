"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Globe, Home, Wrench, Users, HelpCircle, 
  MessageCircle, User, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar({ type = "public" }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
      { name: t("navbar.providers"), href: type === "dashboard" ? "/customerDashboard#providers" : "#providers", icon: <Users className="w-5 h-5" /> },
    ];

    if (type === "dashboard") {
      links.push(
        { name: t("navbar.complaints"), href: "/customerDashboard/complaintPage", icon: <MessageCircle className="w-5 h-5" /> },
        { name: t("navbar.account"), href: "/customerDashboard/accountPage", icon: <User className="w-5 h-5" /> }
      );
    } else {
      links.push(
        { name: t("navbar.howItWorks"), href: "#how-it-works", icon: <HelpCircle className="w-5 h-5" /> }
      );
    }
    return links;
  }, [t, type, locale]); // Added locale to dependencies to ensure t updates correctly

  const isActive = (href) => pathname === href || (typeof window !== 'undefined' && window.location.hash === href);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4",
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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform duration-300">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary-500 to-orange-400">
              {t("navbar.brand")}
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive(link.href) 
                      ? "bg-primary-500/10 text-primary-600 dark:text-primary-400" 
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
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-105 transition-all"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{locale}</span>
            </button>

            {type === "public" ? (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link href="/authentication" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors">
                  {t("auth.login")}
                </Link>
                <Link href="/authentication" className="btn-primary py-2.5 text-sm">
                  {t("auth.signup")}
                </Link>
              </div>
            ) : (
              <Link 
                href="/customerDashboard/complaintForm"
                className="btn-primary py-2.5 text-sm hidden sm:block"
              >
                {t("navbar.bookService")}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-24 left-4 right-4 glass rounded-3xl p-6 shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl transition-all",
                      isActive(link.href)
                        ? "bg-primary-500 text-white"
                        : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span className="font-semibold text-lg">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <Link 
                href="/authentication"
                className="btn-primary w-full text-center py-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("auth.login")} / {t("auth.signup")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
