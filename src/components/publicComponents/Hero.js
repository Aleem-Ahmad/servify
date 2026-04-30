"use client";

import Link from "next/link";
import "@/styles/publicStyles/hero.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function CustomerHero() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <section className={`hero ${dark ? "dark" : ""}`}>
      {/* Animated Background */}
      <div className="hero-bg-animation">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Content */}
      <div className="hero-content">
        <p className="tagline">{t("hero.tagline")}</p>

        <h1>{t("hero.title")}</h1>

        <p className="subtitle">
          {t("hero.subtitle")}
        </p>

        <Link href="/authentication" className="btn primary">
          {t("hero.cta")}
        </Link>
      </div>
    </section>
  );
}