"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, MapPin, ArrowRight, Star, Shield, Zap, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const stats = [
    { icon: Shield, value: "500+", label: t("footer.verifiedProviders"), color: "text-orange-500" },
    { icon: Star,   value: "4.9★", label: t("footer.ratings"),           color: "text-yellow-500" },
    { icon: Zap,    value: "10k+", label: t("footer.trustedCustomers"),  color: "text-purple-500" },
  ];

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${
        darkMode ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-orange-50/40"
      }`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {/* Three.js Canvas Background */}
      <HeroCanvas darkMode={darkMode} />

      {/* Radial glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(255,122,0,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255,122,0,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">

        {/* Greeting Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 border ${
            darkMode
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-orange-50 border-orange-200 text-orange-600"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          {getGreeting()}
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          {isUrdu ? (
            <>
              پاکستان کا
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #ff7a00, #f59e0b, #ff4500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                سروس مارکیٹ پلیس
              </span>
            </>
          ) : (
            <>
              Pakistan's Premier
              <br />
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #ff7a00, #f59e0b, #ff4500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Service Marketplace
              </span>
            </>
          )}
        </motion.h1>

        {/* Typewriter subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`text-lg sm:text-2xl font-semibold mb-4 h-10 flex items-center justify-center gap-2 ${
            darkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {isUrdu ? "تلاش کریں:" : "Find a"}&nbsp;
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #ff7a00, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="font-extrabold min-w-[8rem] text-left"
          >
            {displayed}
            <span className="animate-pulse">|</span>
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`text-base sm:text-lg max-w-2xl mb-12 leading-relaxed ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={`w-full max-w-3xl rounded-[2rem] p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl ${
            darkMode
              ? "bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 shadow-black/40"
              : "bg-white/90 backdrop-blur-xl border border-white shadow-orange-100/60"
          }`}
          style={{ boxShadow: darkMode ? "0 25px 60px rgba(0,0,0,0.5)" : "0 25px 60px rgba(255,122,0,0.15)" }}
        >
          {/* Service input */}
          <div className={`flex flex-1 items-center gap-3 px-5 py-4 rounded-[1.5rem] ${
            darkMode ? "bg-slate-700/50" : "bg-slate-50/80"
          }`}>
            <Search className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className={`bg-transparent border-none outline-none w-full text-base font-medium placeholder:font-normal ${
                darkMode ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* Divider */}
          <div className={`hidden sm:block w-px h-10 ${darkMode ? "bg-slate-600" : "bg-slate-200"}`} />

          {/* Location input */}
          <div className={`flex flex-1 items-center gap-3 px-5 py-4 rounded-[1.5rem] ${
            darkMode ? "bg-slate-700/50" : "bg-slate-50/80"
          }`}>
            <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <input
              type="text"
              placeholder={t("search.location")}
              className={`bg-transparent border-none outline-none w-full text-base font-medium placeholder:font-normal ${
                darkMode ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-[1.5rem] text-white font-bold text-base flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #ff7a00, #ff4500)",
              boxShadow: "0 8px 24px rgba(255,122,0,0.4)",
            }}
          >
            {t("hero.cta")}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Popular searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          <span className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {isUrdu ? "مشہور:" : "Popular:"}
          </span>
          {(isUrdu ? SERVICES_UR : SERVICES).slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => setSearchQuery(s)}
              className={`text-sm px-3 py-1 rounded-full border transition-all duration-200 ${
                darkMode
                  ? "border-slate-700 text-slate-400 hover:border-orange-500/50 hover:text-orange-400"
                  : "border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {s}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 sm:gap-16"
        >
          {stats.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="text-center group"
            >
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-2xl ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-black mb-1 ${
                darkMode ? "text-white" : "text-slate-900"
              } group-hover:text-orange-500 transition-colors`}>
                {value}
              </div>
              <div className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className={`text-xs font-medium tracking-widest uppercase ${
          darkMode ? "text-slate-600" : "text-slate-400"
        }`}>
          {isUrdu ? "نیچے جائیں" : "Scroll"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className={`w-5 h-5 ${darkMode ? "text-slate-600" : "text-slate-400"}`} />
        </motion.div>
      </motion.div>
    </div>
  );
}
