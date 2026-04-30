"use client";

import "@/styles/not-found.css";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function NotFound() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`not-found-container ${dark ? "dark" : ""}`}>
      <div className="not-found-card">
        <h1>404</h1>
        <h2>{t("Page Not Found")}</h2>
        <p>{t("The page you are looking for doesn't exist or has been moved.")}</p>
        <Link href="/" className="btn-primary" style={{ display: "inline-block" }}>
          {t("Return Home")}
        </Link>
      </div>
    </div>
  );
}
