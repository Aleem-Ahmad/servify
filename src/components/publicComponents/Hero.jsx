"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

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
      className={`relative h-screen w-full flex items-center justify-center overflow-hidden ${
        darkMode ? "bg-[#050a14] text-slate-100" : "bg-gradient-to-br from-slate-50 via-white to-orange-50/20 text-slate-900"
      }`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      
      {/* ─── SPECTACULAR FLUID AMBIENT GLOW ANIMATION ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft floating orb 1 */}
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
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,122,0,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Soft floating orb 2 */}
        <motion.div
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Mesh grid */}
        <div className={`absolute inset-0 opacity-[0.02] ${darkMode ? "bg-[radial-gradient(#ff7a00_1px,transparent_1px)]" : "bg-[radial-gradient(#ff7a00_1.5px,transparent_1.5px)]"}`} style={{ backgroundSize: "24px 24px" }} />
      </div>

      {/* ─── HERO CONTENT CONTAINER ─── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-6">

        {/* 1. Greeting Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold border shadow-sm ${
            darkMode
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-orange-50 border-orange-200 text-orange-600"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin text-orange-500" />
          <span>{getGreeting()}</span>
        </motion.div>

        {/* 2. Spectacular H2 Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          {isUrdu ? (
            <>
              پاکستان کا سب سے بڑا
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                سروس مارکیٹ پلیس
              </span>
            </>
          ) : (
            <>
              Pakistan's Premier
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                Service Marketplace
              </span>
            </>
          )}
        </motion.h2>

        {/* 3. Paragraph Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`text-base sm:text-xl max-w-2xl leading-relaxed font-medium ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {t("hero.subtitle") || "Connect with trusted service professionals in your area instantly."}
        </motion.p>

        {/* 4. Typewriting H3 Effect */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-lg sm:text-2xl font-extrabold flex items-center justify-center gap-2 ${
            darkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <span>{isUrdu ? "تلاش کریں:" : "Find a"}</span>
          <span className="bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent font-black">
            {displayed}
            <span className="animate-pulse ml-0.5">|</span>
          </span>
        </motion.h3>

      </div>
    </div>
  );
}
