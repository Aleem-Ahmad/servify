"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "./allProviders.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Star, MapPin, Phone, Mail, Award, X, MessageCircle, Clock, Calendar, CheckSquare } from "lucide-react";

function AllProvidersContent() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ["All", "Electrician", "Plumber", "Cleaning", "Carpenter", "Gardener", "Painter"];
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (location) queryParams.append("location", location);
        // We will fetch all and filter category on frontend, or fetch specific. Let's fetch with search params.
        const res = await fetch(`/api/providers?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProviders(data);
        }
      } catch (error) {
        console.error("Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [search, location]);

  const filteredProviders = useMemo(() => {
    if (activeCategory === "All" || activeCategory === "") return providers;
    return providers.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory, providers]);

  return (
    <div className={`all-providers-view ${dark ? "dark" : ""}`}>
      
      <div className="providers-hero">
        <h1 className="providers-title">{t("Our Top Professionals")}</h1>
        <p className="providers-subtitle">{t("Select a category to find experts in that specific field.")}</p>
        
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading providers...</div>
      ) : filteredProviders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>No providers found matching your search.</div>
      ) : (
        <div className="providers-grid-container">
          {filteredProviders.map((p) => (
            <div key={p.id} className="pro-card" onClick={() => setSelectedProvider(p)}>
              <div className="pro-img-wrap">
                 <img src={p.image} alt={p.name} />
                 <div className="pro-badge">{p.category || "Professional"}</div>
              </div>
              <div className="pro-content">
                <h3>{p.name}</h3>
                <div className="pro-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{p.rating}</span>
                  <span className="pro-city"> • {p.city || "Remote"}</span>
                </div>
                <p className="pro-price-sum"><strong>PKR {p.rate}</strong> / service</p>
                <div className="pro-avail-chip available-now">Available Now</div>
                <button className="pro-view-btn">{t("View Full Profile")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProvider && (
        <div className="pro-modal-overlay" onClick={() => setSelectedProvider(null)}>
          <div className="pro-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="pro-modal-close" onClick={() => setSelectedProvider(null)}>
               <X />
            </button>

            <div className="pro-modal-body">
              <div className="pro-modal-left">
                 <img src={selectedProvider.image} alt={selectedProvider.name} className="pro-modal-img" />
                 <h2>{selectedProvider.name}</h2>
                 <p className="pro-modal-cat">{selectedProvider.category}</p>
                 <div className="pro-modal-stats">
                    <div className="pro-m-stat"><Award size={18} color="#ff7a00"/> {selectedProvider.experience || 0} {t("Years Exp")}</div>
                    <div className="pro-m-stat"><MapPin size={18} color="#ff7a00"/> {selectedProvider.city || "N/A"}</div>
                    <div className="pro-m-stat"><Phone size={18} color="#ff7a00"/> {selectedProvider.phone || "N/A"}</div>
                 </div>
              </div>

              <div className="pro-modal-right">
                 <h3 className="section-title"><CheckSquare size={18} color="#ff7a00" /> {t("Overview")}</h3>
                 <p>This is a registered professional on the Servify platform.</p>

                 <div className="modal-price-footer" style={{ marginTop: 'auto' }}>
                    <div className="modal-price-data">
                      <span>{t("Estimated Price")}</span>
                      <h2>PKR {selectedProvider.rate}</h2>
                    </div>
                    <button className="book-now-modal-btn" onClick={() => window.location.href = `/customerDashboard/complaintForm?provider=${selectedProvider.id}`}>{t("Instant Booking")}</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AllProviders() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
      <AllProvidersContent />
    </Suspense>
  );
}