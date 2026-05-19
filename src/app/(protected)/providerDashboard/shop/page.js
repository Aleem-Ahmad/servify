"use client";

import { useState, useEffect } from "react";
import "./shop.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
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
  const { user, logout } = useAuth();
  const dark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // Re-sync whenever user object loads or updates from server
  useEffect(() => {
    if (user) setIsOnline(user.isOnline || false);
  }, [user]);

  // Fetch this provider's reviews
  useEffect(() => {
    if (!user?.id) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/feedback?providerId=${user.id}`);
        if (res.ok) setReviews(await res.json());
      } catch(e) { console.error('Failed to load reviews', e); }
      finally { setReviewsLoading(false); }
    };
    fetchReviews();
  }, [user?.id]);
  
  const isVerified = user?.status === "Active";
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  
  const shopData = {
    shopName: user?.shopName || user?.name || "My Services",
    provider: user?.name || "Provider Name",
    phone: user?.phone || "N/A",
    email: user?.email || "N/A",
    address: user?.address || "N/A",
    category: user?.category || "General Service",
    services: user?.services || [user?.category || "Service"],
    pricing: "Negotiable",
    timing: "9:00 AM - 6:00 PM"
  };

  const stats = [
    { label: "Jobs Done", value: user?.performance?.completedJobs || "0", icon: <Briefcase size={20} />, color: "#ff7a00" },
    { label: "Earnings", value: "PKR 0", icon: <TrendingUp size={20} />, color: "#10b981" },
    { label: "Avg. Rating", value: user?.trustScore ? (user.trustScore / 20).toFixed(1) : "0.0", icon: <Star size={20} />, color: "#f59e0b" },
  ];

  const toggleOnlineStatus = async () => {
    if (!isVerified) {
      alert("You must be verified by an admin to go live!");
      return;
    }
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus })
      });
    } catch(e) {}
  };

  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Populate edit form when editing starts
  const startEditing = () => {
    setEditForm({
      phone: user?.phone || '',
      address: user?.address || '',
      district: user?.district || '',
      tehseel: user?.tehseel || '',
      experience: user?.experience || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        // Refresh page to show new data
        window.location.reload();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={`dashboard-shop-container ${dark ? "dark" : ""}`}>
      
      {/* ── HEADER & PROFILE ── */}
      <div className="shop-premium-header">
        <div className="profile-hero">
          <div className="avatar-wrapper">
             <img src={user?.image || `https://i.pravatar.cc/150?u=${user?.email}`} alt="Profile" className="main-avatar" />
             <button className="upload-badge" title="Change Photo"><Camera size={16} /></button>
          </div>
          <div className="hero-text">
            <h1>{shopData.shopName}</h1>
            <p>{shopData.category} • 
              {isVerified ? (
                <span className="verified-text"><CheckCircle size={14} /> Verified Professional</span>
              ) : (
                <span className="text-rose-500 flex items-center gap-1 text-sm font-medium" style={{ display: 'inline-flex', color: '#ef4444' }}><AlertCircle size={14} /> Verification Pending</span>
              )}
            </p>
          </div>
        </div>

        <div className="availability-toggle">
          <span className={`status-label ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
          <button 
            className={`toggle-pill ${isOnline ? "active" : ""}`} 
            onClick={toggleOnlineStatus}
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
                <button className="btn-edit-inline" onClick={startEditing}>
                  <Settings size={14} /> Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="details-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[['phone', 'Phone'], ['address', 'Address'], ['district', 'District'], ['tehseel', 'Tehseel']].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.82rem', opacity: 0.7, marginBottom: '4px' }}>{label}</label>
                    <input
                      type="text"
                      value={editForm[field] || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px',
                        border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #f9fafb)',
                        color: 'inherit', fontSize: '0.95rem'
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', opacity: 0.7, marginBottom: '4px' }}>Experience / About</label>
                  <textarea
                    value={editForm.experience || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg, #f9fafb)',
                      color: 'inherit', fontSize: '0.95rem', resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            ) : (
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
            )}
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

          <div className="verification-status-card" style={{ borderColor: isVerified ? 'var(--primary)' : '#ef4444' }}>
             <div className="v-icon-wrap" style={{ background: isVerified ? 'rgba(255,122,0,0.1)' : 'rgba(239,68,68,0.1)', color: isVerified ? 'var(--primary)' : '#ef4444' }}>
               {isVerified ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
             </div>
             <div className="v-text">
               <h4 style={{ color: isVerified ? 'inherit' : '#ef4444' }}>
                 {isVerified ? "Profile Verified" : "Verification Pending"}
               </h4>
               <p>
                 {isVerified 
                   ? "Your skills and identity have been verified by SERVIFY team." 
                   : "Your profile is under review by our admin team. You cannot go live until verified."}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS & RATINGS SECTION ── */}
      <div className="content-card" style={{ marginTop: '24px' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border, #e5e7eb)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ {t("Feedback & Comments")}
          </h3>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ {avgRating}</span>
              <span style={{ opacity: 0.6 }}>({reviews.length} {t("reviews", { defaultValue: "reviews" })})</span>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <p style={{ opacity: 0.6, fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>{t("Loading...")}</p>
        ) : reviews.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
            {t("No feedback yet.")}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev._id} style={{
                padding: '16px',
                borderRadius: '12px',
                background: dark ? 'rgba(255,255,255,0.03)' : '#fef8f5',
                borderLeft: '4px solid var(--primary, #ff7a00)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--primary, #ff7a00)', fontSize: '0.95rem' }}>{rev.customerName || "Anonymous"}</strong>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{ fontSize: '0.9rem', color: s <= rev.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', opacity: 0.5 }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                {rev.comment && <p style={{ fontSize: '0.92rem', opacity: 0.9, lineHeight: '1.4' }}>{rev.comment}</p>}
                
                {rev.mediaUrls?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {rev.mediaUrls.map((url, idx) => {
                      if (url.startsWith('data:video') || url.includes('.mp4')) {
                        return <video key={idx} src={url} controls style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />;
                      } else if (url.startsWith('data:audio') || url.includes('.mp3')) {
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,122,0,0.08)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px' }}>🎤</span>
                            <audio controls src={url || null} style={{ height: '32px' }} />
                          </div>
                        );
                      } else {
                        return <img key={idx} src={url} alt={`media-${idx}`} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />;
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="shop-global-actions">
        {isEditing && (
          <div className="edit-overlay-footer">
            <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={saveLoading}>{t("Cancel")}</button>
            <button className="btn-save-prime" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? 'Saving...' : t("Save Changes")}
            </button>
          </div>
        )}
        <button className="btn-logout-alt" onClick={logout}>
          <LogOut size={16} /> {t("Logout")}
        </button>
      </div>

    </div>
  );
}