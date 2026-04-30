"use client";

import { useEffect, useRef } from "react";
import "./howItWorks.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Search, PenTool, CheckCircle, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const steps = [
    {
      title: t("Explore Services"),
      desc: t("Choose the right professional for your needs from our top-rated categories."),
      icon: <Search size={40} strokeWidth={1.5} />,
    },
    {
      title: t("Book Request"),
      desc: t("Describe your problem, share your location, and request a quick booking."),
      icon: <PenTool size={40} strokeWidth={1.5} />,
    },
    {
      title: t("Direct Arrival"),
      desc: t("The professional arrives at your doorstep. Verify the OTP and get started."),
      icon: <CheckCircle size={40} strokeWidth={1.5} />,
    },
  ];

  return (
    <section className={`hiw-modern-section ${dark ? "dark" : ""}`}>
      <div className="hiw-inner">
        <h2 className="hiw-main-title">{t("Our Simple Workflow")}</h2>
        
        <div className="hiw-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="hiw-step-box">
              <div className="hiw-step-icon-wrap">
                {step.icon}
                <div className="hiw-step-num">{idx + 1}</div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {idx < steps.length - 1 && (
                <div className="hiw-arrow-indicator">
                  <ArrowRight size={24} color="#ff7a00" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}