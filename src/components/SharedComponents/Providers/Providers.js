"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, ShieldCheck, Award, Medal } from "lucide-react";
import Link from "next/link";
import "./providers.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function Providers({ exploreHref = "/login-first" }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const data = await res.json();
          setProviders(data);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const rowRef = useRef(null);

  const scrollLeft = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  return (
    <section className={`providers-section ${darkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="providers-header">
        <h2>{t("providers.title")}</h2>
      </div>

      {/* Carousel */}
      <div className="carousel-wrapper">
        <button className="carousel-btn left" onClick={scrollLeft}>
          <ChevronLeft size={28} />
        </button>

        <div className="providers-row" ref={rowRef}>
          {loading ? (
            <p style={{ padding: '20px', opacity: 0.7 }}>{t("Loading providers...")}</p>
          ) : (
            providers.map((p, i) => (
              <Link href={`/customerDashboard/viewProvider?id=${p.id}`} className={`provider-card ${p.badge?.toLowerCase() || 'basic'}`} key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="badge-overlay">
                  {p.badge === 'Elite' && <Medal size={16} className="badge-icon elite" />}
                  {p.badge === 'Pro' && <Award size={16} className="badge-icon pro" />}
                  {p.badge === 'Basic' && <ShieldCheck size={16} className="badge-icon basic" />}
                  <span className="badge-text">{p.badge || 'Basic'}</span>
                </div>
                <img src={p.image || `https://i.pravatar.cc/150?u=${p.email}`} alt={p.name} />
                <h3>{p.name}</h3>
                <div className="card-stats">
                  <div className="rating">
                    <Star size={14} fill="#ff7a00" stroke="#ff7a00" />
                    {p.rating || 0}
                  </div>
                  <div className="trust-score">
                    Trust: {p.trustScore || 0}%
                  </div>
                </div>
                <p className="category-tag">{p.category}</p>
                <p className="price-tag">{t("providers.startsFrom", { rate: p.rate || 500 })}</p>
              </Link>
            ))
          )}
        </div>

        <button className="carousel-btn right" onClick={scrollRight}>
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="providers-footer">
        <Link href={exploreHref} className="link-btn">
          {t("providers.exploreAll")}
        </Link>
      </div>
    </section>
  );
}