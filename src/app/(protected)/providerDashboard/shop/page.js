"use client";

import { useState } from "react";
import "./shop.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Settings, 
  LogOut, 
  Star, 
  Briefcase, 
  TrendingUp,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  User,
  ShieldCheck
} from "lucide-react";

export default function ShopPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const [shopData, setShopData] = useState({
    shopName: "ABC Services",
    provider: "Muhammad Umar",
    phone: "0300-0000000",
    email: "example@gmail.com",
    address: "Okara, Punjab",
    category: "Electrician",
    services: ["AC Repair", "Industrial Wiring", "Solar Setup", "UPS Fix"],
    pricing: "Negotiable",
    timing: "9:00 AM - 6:00 PM"
  });

  const stats = [
    { label: "Jobs Done", value: "86", icon: <Briefcase size={20} />, color: "#ff7a00" },
    { label: "Earnings", value: "PKR 45K", icon: <TrendingUp size={20} />, color: "#10b981" },
    { label: "Avg. Rating", value: "4.9", icon: <Star size={20} />, color: "#f59e0b" },
  ];

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className={`dashboard-shop-container ${dark ? "dark" : ""}`}>
      
      {/* ── HEADER & PROFILE ── */}
      <div className="shop-premium-header">
        <div className="profile-hero">
          <div className="avatar-wrapper">
             <img src="https://i.pravatar.cc/150?u=umar" alt="Profile" className="main-avatar" />
             <button className="upload-badge" title="Change Photo"><Camera size={16} /></button>
          </div>
          <div className="hero-text">
            <h1>{shopData.shopName}</h1>
            <p>{shopData.category} • <span className="verified-text"><CheckCircle size={14} /> Verified Professional</span></p>
          </div>
        </div>

        <div className="availability-toggle">
          <span className={`status-label ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
          <button 
            className={`toggle-pill ${isOnline ? "active" : ""}`} 
            onClick={() => setIsOnline(!isOnline)}
          >
            <div className="toggle-handle"></div>
          </button>
        </div>
      </div>

      {/* ── STATS GRID ── */}
      <div className="shop-stats-grid">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ color: s.color, background: `${s.color}15` }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{t(s.label)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTENT GRID ── */}
      <div className="shop-main-layout">
        
        {/* LEFT COLUMN: INFO & SERVICES */}
        <div className="shop-left">
          <div className="content-card">
            <div className="card-header">
              <h3>{t("Business Details")}</h3>
              {!isEditing && (
                <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>
                  <Settings size={14} /> Edit
                </button>
              )}
            </div>
            
            <div className="details-list">
              <div className="detail-item">
                <User size={16} /><div className="d-val"><strong>Provider:</strong> <span>{shopData.provider}</span></div>
              </div>
              <div className="detail-item">
                <Phone size={16} /><div className="d-val"><strong>Phone:</strong> <span>{shopData.phone}</span></div>
              </div>
              <div className="detail-item">
                <Mail size={16} /><div className="d-val"><strong>Email:</strong> <span>{shopData.email}</span></div>
              </div>
              <div className="detail-item">
                <MapPin size={16} /><div className="d-val"><strong>Address:</strong> <span>{shopData.address}</span></div>
              </div>
              <div className="detail-item">
                <Clock size={16} /><div className="d-val"><strong>Hours:</strong> <span>{shopData.timing}</span></div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3>{t("Services Offered")}</h3>
            <div className="services-tag-cloud">
              {shopData.services.map((svc, i) => (
                <span key={i} className="service-chip">{svc}</span>
              ))}
              <button className="add-chip-btn">+</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PORTFOLIO */}
        <div className="shop-right">
          <div className="content-card">
            <div className="card-header">
              <h3>{t("Portfolio")}</h3>
              <LayoutGrid size={16} opacity={0.5} />
            </div>
            <div className="portfolio-gallery">
               <div className="gallery-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1621905235213-979929259275?w=300)' }}></div>
               <div className="gallery-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300)' }}></div>
               <div className="gallery-add">
                 <span>Add Photo</span>
               </div>
            </div>
          </div>

          <div className="verification-status-card">
             <div className="v-icon-wrap"><ShieldCheck size={24} /></div>
             <div className="v-text">
               <h4>Profile Verified</h4>
               <p>Your skills and identity have been verified by SERVIFY team.</p>
             </div>
          </div>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="shop-global-actions">
        {isEditing && (
          <div className="edit-overlay-footer">
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>{t("Cancel")}</button>
            <button className="btn-save-prime" onClick={handleSave}>{t("Save Changes")}</button>
          </div>
        )}
        <button className="btn-logout-alt">
          <LogOut size={16} /> {t("Logout")}
        </button>
      </div>

    </div>
  );
}