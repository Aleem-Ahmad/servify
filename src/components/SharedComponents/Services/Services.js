"use client";

import { useState, useRef, useEffect, useCallback, useContext } from "react";
import "./services.css";
import { LanguageContext } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const SERVICES = [
  { key: "services.electrician",  descKey: "services.electricianDesc",  icon: "⚡" },
  { key: "services.plumber",      descKey: "services.plumberDesc",      icon: "🔧" },
  { key: "services.cleaner",      descKey: "services.cleanerDesc",      icon: "🧹" },
  { key: "services.carpenter",    descKey: "services.carpenterDesc",    icon: "🪚" },
  { key: "services.gardener",     descKey: "services.gardenerDesc",     icon: "🌿" },
  { key: "services.painter",      descKey: "services.painterDesc",      icon: "🎨" },
];

export default function Services() {
  const { t } = useContext(LanguageContext);
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const total = SERVICES.length;
  const [current, setCurrent] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const updateItemsPerPage = useCallback(() => {
    const w = window.innerWidth;
    if (w <= 640) setItemsPerPage(1);
    else if (w <= 1024) setItemsPerPage(2);
    else setItemsPerPage(3);
  }, []);

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [updateItemsPerPage]);

  const maxIndex = Math.max(0, total - itemsPerPage);
  const next = useCallback(() => setCurrent(p => (p >= maxIndex ? 0 : p + 1)), [maxIndex]);
  const prev = useCallback(() => setCurrent(p => (p <= 0 ? maxIndex : p - 1)), [maxIndex]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={`svc-section ${darkMode ? "dark" : ""}`}>
      <div className="svc-inner">
        <div className="svc-header">
          <span className="svc-eyebrow">{t("services.whatWeOffer")}</span>
          <h2 className="svc-title">{t("services.ourServices")}</h2>
          <p className="svc-subtitle">{t("services.trustedProfessionals")}</p>
        </div>

        <div className="svc-carousel-container">
          <div className="svc-carousel-viewport">
            <div 
              className="svc-carousel-track"
              style={{ transform: `translateX(-${(current * 100) / itemsPerPage}%)` }}
            >
              {SERVICES.map((s, i) => (
                <div 
                  key={i} 
                  className="svc-card-wrapper"
                  style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                >
                  <div className="svc-card-inner">
                    <div className="svc-icon-wrap">
                      <span className="svc-emoji">{s.icon}</span>
                    </div>
                    <h3 className="svc-card-name">{t(s.key)}</h3>
                    <p className="svc-card-desc">{t(s.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="svc-nav-btn svc-prev" onClick={prev} aria-label={t("services.prev")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="svc-nav-btn svc-next" onClick={next} aria-label={t("services.next")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="svc-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button 
              key={i} 
              className={`svc-dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={t("services.slide", { number: i + 1 })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}