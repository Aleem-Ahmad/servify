"use client";

import { createContext, useState, useContext } from "react";
import en from "@/locales/en.json";
import ur from "@/locales/ur.json";

export const LanguageContext = createContext({});

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en");

  const changeLanguage = (lang) => {
    setLocale(lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    }
  };

  // Supports optional interpolation: t("services.slide", { number: 3 }) → "Go to slide 3"
  const t = (key, params = {}) => {
    const translations = locale === "en" ? en : ur;
    let str = translations[key] ?? key;
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);