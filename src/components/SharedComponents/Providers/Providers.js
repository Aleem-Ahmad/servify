"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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
              <div className="provider-card" key={i}>
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <div className="rating">
                  <Star size={16} fill="#ff7a00" />
                  {p.rating}
                </div>
                <p className="price-tag">{t("providers.startsFrom", { rate: p.rate })}</p>
              </div>
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