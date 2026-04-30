"use client";
import { useState } from "react";
import "@/styles/publicStyles/forgot-password.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, ArrowLeft, Mail, Send } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy logic for sending reset link
    console.log("Reset link sent for:", email);
    setIsSent(true);
  };

  const dark = theme === "dark";

  return (
    <div className={`forgot-password-container ${dark ? "dark" : ""}`}>
      {/* ================= TOP TOOLS ================= */}
      <div className="top-tools">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="icon-btn lang-btn" onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}>
          <Globe size={20} style={{ marginRight: "6px" }} /> {locale.toUpperCase()}
        </button>
      </div>

      <div className="forgot-card">
        <Link href="/authentication" className="back-link">
          <ArrowLeft size={18} /> {t("auth.backToLogin") || "Back to Login"}
        </Link>

        {!isSent ? (
          <>
            <h1>{t("auth.forgotTitle") || "Reset Password"}</h1>
            <p>{t("auth.forgotDesc") || "Enter your email address and we'll send you a link to reset your password."}</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="submit-btn">
                <Send size={18} /> {t("auth.sendLink") || "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-content">
            <div className="success-icon">
                <Send size={40} />
            </div>
            <h1>{t("auth.checkEmail") || "Check Your Email"}</h1>
            <p>
              {t("auth.sentDesc") || "We've sent a password reset link to "} <strong>{email}</strong>. 
              {t("auth.checkSpam") || " Please check your inbox and spam folder."}
            </p>
            <button onClick={() => setIsSent(false)} className="resend-btn">
              {t("auth.tryAgain") || "Try with another email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
