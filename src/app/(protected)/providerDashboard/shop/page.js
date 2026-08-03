"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./shop.css";
import "../providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Camera, MapPin, Phone, Mail, Clock, Settings, LogOut, Star, 
  Briefcase, TrendingUp, LayoutGrid, CheckCircle, AlertCircle, 
  User, ShieldCheck, Plus, X, Trash2, Upload, Users, UserPlus
} from "lucide-react";

export default function ShopPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const dark = theme === "dark";
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  
  // Services state
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [servicesSaving, setServicesSaving] = useState(false);
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioSaving, setPortfolioSaving] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", role: "Technician", phone: "", cnic: "" });
  const [teamLoading, setTeamLoading] = useState(false);
  
  const isAgency = user?.providerType === "Agency" || user?.providerType === "Company";

  useEffect(() => {
    if (user) {
      setIsOnline(user.isOnline || false);
      setServices(user.services || [user.category || "Service"]);
      setPortfolio(user.documents?.portfolio || []);
    }
  }, [user]);

  // Fetch reviews
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

  // Fetch offers
  useEffect(() => {
    if (!user?.id) return;
    const fetchOffers = async () => {
      try {
        const res = await fetch(`/api/provider/settings`);
        if (res.ok) {
          const data = await res.json();
          setOffers(data.offers || []);
        }
      } catch(e) { console.error('Failed to load offers', e); }
    };
    fetchOffers();
  }, [user?.id]);

  // Fetch team members
  useEffect(() => {
    if (!user?.id || !isAgency) return;
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/provider/team');
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data);
        }
      } catch(e) { console.error('Failed to load team', e); }
    };
    fetchTeam();
  }, [user?.id, isAgency]);
  
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
    pricing: user?.hourlyRate ? `PKR ${user.hourlyRate}/hour` : "Negotiable",
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
    setIsOnline(newStatus); // optimistic update
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus })
      });
      if (res.ok) {
        // Sync localStorage so the status survives a page refresh
        try {
          const cached = localStorage.getItem("servify_user");
          if (cached) {
            const parsed = JSON.parse(cached);
            parsed.isOnline = newStatus;
            localStorage.setItem("servify_user", JSON.stringify(parsed));
          }
        } catch (_) {}
      } else {
        // Revert if API failed
        setIsOnline(!newStatus);
        alert("Failed to update availability. Please try again.");
      }
    } catch(e) {
      setIsOnline(!newStatus); // revert on network error
      console.error("Toggle status error:", e);
    }
  };

  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

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

  // ─── SERVICES MANAGEMENT ───
  const handleAddService = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) {
      alert("This service already exists!");
      return;
    }
    const updated = [...services, trimmed];
    setServices(updated);
    setNewService("");
    saveServices(updated);
  };

  const handleRemoveService = (svc) => {
    const updated = services.filter(s => s !== svc);
    setServices(updated);
    saveServices(updated);
  };

  const saveServices = async (list) => {
    setServicesSaving(true);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: list })
      });
    } catch(e) { console.error("Failed to save services"); }
    finally { setServicesSaving(false); }
  };

  // ─── PORTFOLIO UPLOAD ───
  const handlePortfolioUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum 2MB per image.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolio(prev => {
          const updated = [...prev, reader.result];
          savePortfolio(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemovePortfolioImage = (idx) => {
    setPortfolio(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      savePortfolio(updated);
      return updated;
    });
  };

  const savePortfolio = async (images) => {
    setPortfolioSaving(true);
    try {
      // Get current documents and merge portfolio
      const currentDocs = user?.documents || {};
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: { ...currentDocs, portfolio: images } })
      });
    } catch(e) { console.error("Failed to save portfolio"); }
    finally { setPortfolioSaving(false); }
  };

  // ─── TEAM MANAGEMENT ───
  const handleAddTeamMember = async () => {
    if (!teamForm.name.trim()) {
      alert("Team member name is required.");
      return;
    }
    setTeamLoading(true);
    try {
      const res = await fetch('/api/provider/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      if (res.ok) {
        const member = await res.json();
        setTeamMembers(prev => [...prev, member]);
        setTeamForm({ name: "", role: "Technician", phone: "", cnic: "" });
        setShowTeamForm(false);
      }
    } catch(e) { alert("Failed to add team member."); }
    finally { setTeamLoading(false); }
  };

  const handleRemoveTeamMember = async (id) => {
    if (!confirm("Remove this team member?")) return;
    try {
      await fetch(`/api/provider/team?id=${id}`, { method: 'DELETE' });
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    } catch(e) { console.error("Failed to remove member"); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({ ...prev, image: data.url }));
        alert("Profile picture updated successfully!");
      } else {
        alert(data.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    }
  };

  return (
    <div className={`dashboard-shop-container ${dark ? "dark" : ""}`}>
      
      {/* ── HEADER & PROFILE ── */}
      <div className="shop-premium-header">
        <div className="profile-hero">
          <div className="avatar-wrapper">
             <img src={user?.image || (user?.documents?.profile) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'P')}&background=ff7a00&color=fff&size=150`} alt="Profile" className="main-avatar" fetchPriority="high" loading="eager" />
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
             <button className="upload-badge" title="Change Photo" onClick={() => fileInputRef.current?.click()}><Camera size={16} /></button>
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

          {/* ── SERVICES OFFERED (EDITABLE) ── */}
          <div className="content-card">
            <div className="card-header">
              <h3>{t("Services Offered")}</h3>
              {servicesSaving && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Saving...</span>}
            </div>
            <div className="services-tag-cloud">
              {services.map((svc, i) => (
                <span key={i} className="service-chip">
                  {svc}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(svc)}
                    style={{
                      background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                      marginLeft: '6px', padding: '0', fontSize: '14px', opacity: 0.6, lineHeight: 1
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                placeholder="Add a service (e.g. Wiring)"
                value={newService}
                onChange={e => setNewService(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddService()}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '12px',
                  border: '1.5px solid var(--border)', background: 'transparent',
                  color: 'inherit', fontSize: '14px', fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={handleAddService}
                style={{
                  padding: '10px 18px', borderRadius: '12px',
                  background: 'var(--primary)', color: 'white', border: 'none',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', transition: 'transform 0.2s'
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* ── CURRENT OFFERS ── */}
          <div className="content-card">
            <h3>{t("Current Offers")}</h3>
            {offers.length === 0 ? (
              <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>No active offers. Create offers from the Settings card above!</p>
            ) : (
              <div className="space-y-3">
                {offers.filter(o => new Date(o.validTo) >= new Date()).map((offer) => {
                  const daysLeft = Math.ceil((new Date(offer.validTo) - new Date()) / (1000*60*60*24));
                  return (
                    <div key={offer.id} className={`p-3 rounded-xl ${dark ? "bg-orange-500/10 border border-orange-500/20" : "bg-orange-50 border border-orange-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-600 dark:text-orange-400">{offer.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {offer.discountPct && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${dark ? "bg-orange-500/20 text-orange-400" : "bg-orange-500 text-white"}`}>
                              {offer.discountPct}% OFF
                            </span>
                          )}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: daysLeft <= 3 ? '#ef4444' : '#10b981' }}>
                            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                      {offer.description && (
                        <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>{offer.description}</p>
                      )}
                      <p className={`text-xs mt-2 ${dark ? "text-slate-500" : "text-slate-500"}`}>
                        Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PORTFOLIO & TEAM */}
        <div className="shop-right">
          
          {/* ── PORTFOLIO (REAL UPLOAD) ── */}
          <div className="content-card">
            <div className="card-header">
              <h3>{t("Portfolio")} — Proof of Work</h3>
              {portfolioSaving && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Saving...</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePortfolioUpload}
              style={{ display: 'none' }}
            />
            <div className="portfolio-upload-grid">
              {portfolio.map((img, idx) => (
                <div key={idx} className="portfolio-thumb">
                  <img src={img} alt={`Portfolio ${idx + 1}`} />
                  <button
                    className="portfolio-thumb-remove"
                    onClick={() => handleRemovePortfolioImage(idx)}
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div
                className="portfolio-add-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                <span>Upload</span>
              </div>
            </div>
            {portfolio.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px' }}>
                Upload photos of your past work to build trust with customers.
              </p>
            )}
          </div>

          {/* ── TEAM MANAGEMENT (Agency/Company only) ── */}
          {isAgency && (
            <div className="content-card">
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} /> {t("Team Members")}
                </h3>
                <button
                  className="btn-edit-inline"
                  onClick={() => setShowTeamForm(!showTeamForm)}
                >
                  <UserPlus size={14} /> Add
                </button>
              </div>

              {showTeamForm && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  padding: '16px', borderRadius: '14px', marginBottom: '16px',
                  border: '1.5px dashed var(--border)', background: 'rgba(0,0,0,0.02)'
                }}>
                  <input
                    type="text" placeholder="Member Name"
                    value={teamForm.name}
                    onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))}
                    className="pcard-input"
                  />
                  <select
                    value={teamForm.role}
                    onChange={e => setTeamForm(p => ({ ...p, role: e.target.value }))}
                    className="pcard-select"
                  >
                    <option value="Technician">Technician</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                    <option value="Helper">Helper</option>
                  </select>
                  <input
                    type="text" placeholder="Phone (optional)"
                    value={teamForm.phone}
                    onChange={e => setTeamForm(p => ({ ...p, phone: e.target.value }))}
                    className="pcard-input"
                  />
                  <input
                    type="text" placeholder="CNIC (optional)"
                    value={teamForm.cnic}
                    onChange={e => setTeamForm(p => ({ ...p, cnic: e.target.value }))}
                    className="pcard-input"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleAddTeamMember}
                      disabled={teamLoading}
                      className="pcard-btn-add-offer"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {teamLoading ? "Adding..." : "Add Member"}
                    </button>
                    <button
                      onClick={() => setShowTeamForm(false)}
                      style={{
                        padding: '10px 16px', borderRadius: '12px',
                        border: '1.5px solid var(--border)', background: 'transparent',
                        color: 'inherit', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {teamMembers.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No team members added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teamMembers.map(m => (
                    <div key={m.id} className="team-member-card">
                      <div className="team-member-avatar">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="team-member-info">
                        <div className="team-member-name">{m.name}</div>
                        <div className="team-member-role">{m.role}{m.phone ? ` • ${m.phone}` : ''}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeamMember(m.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ef4444', padding: '4px', borderRadius: '8px'
                        }}
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── VERIFICATION STATUS ── */}
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