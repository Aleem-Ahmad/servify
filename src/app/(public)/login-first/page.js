"use client";

import "@/styles/publicStyles/login-first.css";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { LockKeyhole } from "lucide-react";

export default function LoginFirst() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`login-first-container ${dark ? "dark" : ""}`}>
      <div className="login-card">
        <div className="icon-wrapper">
          <LockKeyhole size={50} />
        </div>
        
        <h1>{t("Login Required")}</h1>
        <p>
          {t("Please login or create an account before you can book a service and access the dashboard features.")}
        </p>

        <div className="actions">
          <Link href="/" className="btn-secondary">
            {t("Go Back")}
          </Link>
          <Link href="/authentication" className="btn-primary">
            {t("Login Now")}
          </Link>
        </div>
      </div>
    </div>
  );
}
