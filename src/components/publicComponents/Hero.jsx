"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
  const { t } = useLanguage();
  const { timeOfDay } = useTheme();

  const getGreeting = () => {
    if (timeOfDay === "morning") return t("hero.morning");
    if (timeOfDay === "afternoon") return t("hero.afternoon");
    if (timeOfDay === "evening") return t("hero.evening");
    return t("hero.night");
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] animate-pulse-slow" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 font-bold text-sm mb-8 animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            <span>{getGreeting()}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            {t("hero.title")} <br />
            <span className="text-gradient bg-gradient-to-r from-primary-500 to-orange-400">{t("navbar.brand")}</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass max-w-3xl mx-auto rounded-[2.5rem] p-2 flex flex-col md:flex-row items-center gap-2 border-primary-500/20 shadow-primary-500/5"
          >
            <div className="flex-1 flex items-center gap-3 px-6 py-4 w-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
              <Search className="w-6 h-6 text-primary-500" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                className="bg-transparent border-none outline-none w-full text-lg font-medium"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-6 py-4 w-full">
              <MapPin className="w-6 h-6 text-primary-500" />
              <input
                type="text"
                placeholder={t("search.location")}
                className="bg-transparent border-none outline-none w-full text-lg font-medium"
              />
            </div>
            <button className="btn-primary w-full md:w-auto px-10 py-5 rounded-[2rem] text-lg flex items-center justify-center gap-2">
              {t("hero.cta")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Stats/Social Proof */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { label: t("footer.verifiedProviders"), value: "500+" },
              { label: t("footer.trustedCustomers"), value: "10k+" },
              { label: t("footer.ratings"), value: "4.9/5" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{stat.value}</div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
