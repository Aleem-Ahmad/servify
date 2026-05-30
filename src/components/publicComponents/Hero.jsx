"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

const SERVICES = ["Electrician", "Plumber", "Cleaner", "Carpenter", "Painter", "Gardener"];
const SERVICES_UR = ["الیکٹریشن", "پلمبر", "صفائی کار", "بڑھئی", "رنگ ساز", "مالی"];

export default function Hero() {
  const { t, locale } = useLanguage();
  const { theme, timeOfDay } = useTheme();
  const darkMode = theme === "dark";
  const isUrdu = locale === "ur";

  const [serviceIdx, setServiceIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    const services = isUrdu ? SERVICES_UR : SERVICES;
    const target = services[serviceIdx];
    let timeout;
    if (typing) {
      if (displayed.length < target.length) {
        timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80);
      } else {
        timeout = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
      } else {
        setServiceIdx((i) => (i + 1) % services.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, serviceIdx, isUrdu]);

  const getGreeting = () => {
    if (timeOfDay === "morning")   return t("hero.morning");
    if (timeOfDay === "afternoon") return t("hero.afternoon");
    if (timeOfDay === "evening")   return t("hero.evening");
    return t("hero.night");
  };

  return (
    <div
      className={`hero-container ${darkMode ? "dark" : ""}`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {/* ─── SPECTACULAR FLUID AMBIENT GLOW ANIMATION ─── */}
      <div className="hero-bg-glow">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-mesh" />
      </div>

      {/* ─── HERO CONTENT CONTAINER ─── */}
      <div className="hero-content">
        
        {/* 1. Greeting Badge */}
        <div className="hero-badge fade-in-up">
          <Sparkles className="hero-badge-icon" />
          <span>{getGreeting()}</span>
        </div>

        {/* 2. Spectacular Title */}
        <h2 className="hero-title fade-in-up delay-1">
          {isUrdu ? (
            <>
              پاکستان کا سب سے بڑا
              <br />
              <span className="text-gradient">سروس مارکیٹ پلیس</span>
            </>
          ) : (
            <>
              Pakistan's Premier
              <br />
              <span className="text-gradient">Service Marketplace</span>
            </>
          )}
        </h2>

        {/* 3. Paragraph Subtitle */}
        <p className="hero-subtitle fade-in-up delay-2">
          {t("hero.subtitle") || "Connect with trusted service professionals in your area instantly."}
        </p>

        {/* 4. Typewriting Effect */}
        <h3 className="hero-typewriter fade-in-up delay-3">
          <span>{isUrdu ? "تلاش کریں:" : "Find a"}</span>
          <span className="hero-typewriter-text">
            {displayed}
            <span className="hero-cursor">|</span>
          </span>
        </h3>

        {/* 5. Premium CTA Buttons */}
        <div className="hero-actions fade-in-up delay-4">
          <Link href="/authentication" className="btn-primary btn-hero">
            <span>{isUrdu ? "کام شروع کریں" : "Get Started"}</span>
            <ArrowRight size={18} className="hero-btn-arrow" />
          </Link>
          <Link href="/login-first" className="btn-ghost btn-hero">
            <span>{isUrdu ? "سروسز دیکھیں" : "Explore Services"}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
