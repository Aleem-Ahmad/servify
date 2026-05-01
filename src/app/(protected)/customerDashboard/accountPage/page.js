"use client";

import { useState, useEffect } from "react";
import {
  Edit3,
  LogOut,
  MapPin,
  User,
  ShieldCheck,
  Package,
  Clock,
  X,
  Save
} from "lucide-react";

import "./account.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { logout } = useAuth();
  const dark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for form editing
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    district: "",
    tehseel: "",
    address: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    dob: "",
  });

  // Fetch full profile from DB
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          name: data.name || "",
          phone: data.phone || "",
          district: data.district || "",
          tehseel: data.tehseel || "",
          address: data.address || "",
          gender: data.gender || "",
          religion: data.religion || "",
          maritalStatus: data.maritalStatus || "",
          dob: data.dob || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        alert(t("Profile updated successfully!"));
        setIsEditing(false);
        fetchProfile(); // refresh data
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>{t("Loading profile...")}</div>;
  }

  if (!profile) {
    return <div style={{ padding: "40px", textAlign: "center" }}>{t("Profile not found")}</div>;
  }

  return (
    <div className={`acc-view ${dark ? "dark" : ""}`}>
      
      {/* PROFILE HEADER HERO */}
      <div className="acc-hero-section">
        <div className="acc-hero-top">
          <div className="acc-avatar-container">
            <div className="acc-avatar-main">
               <User size={60} color="#ff7a00" />
            </div>
            <button className="acc-avatar-edit">
              <Edit3 size={14} />
            </button>
          </div>
          <div className="acc-hero-text">
            <h1>{profile.name}</h1>
            <p>{profile.email}</p>
            <div className="acc-tags">
              <span className="acc-tag-role">{t("Customer")}</span>
              <span className="acc-tag-level">VIP Member</span>
            </div>
          </div>
          <div className="acc-hero-cta">
            <button className="acc-logout-btn" onClick={logout}>
              <LogOut size={18} /> {t("account.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="acc-content-wrapper">
        
        {/* STATS STRIP */}
        <div className="acc-stats-strip">
          <div className="acc-stat-item">
            <Package size={20} className="acc-stat-icon" />
            <div className="acc-stat-data">
              <span className="acc-stat-num">0</span>
              <span className="acc-stat-label">Total Gigs</span>
            </div>
          </div>
          <div className="acc-stat-item">
            <Clock size={20} className="acc-stat-icon" />
            <div className="acc-stat-data">
              <span className="acc-stat-num">0</span>
              <span className="acc-stat-label">In Progress</span>
            </div>
          </div>
          <div className="acc-stat-item">
            <ShieldCheck size={20} className="acc-stat-icon" />
            <div className="acc-stat-data">
              <span className="acc-stat-num">0</span>
              <span className="acc-stat-label">Open Disputes</span>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        {!isEditing ? (
          <div className="acc-details-grid">
            <div className="acc-details-card">
              <div className="acc-card-head">
                <User size={18} />
                <h3>{t("Profile Information")}</h3>
              </div>
              <div className="acc-card-list">
                <div className="acc-list-row"><span>{t("Gender")}</span><strong>{profile.gender || "Not Set"}</strong></div>
                <div className="acc-list-row"><span>{t("Religion")}</span><strong>{profile.religion || "Not Set"}</strong></div>
                <div className="acc-list-row"><span>{t("Marital Status")}</span><strong>{profile.maritalStatus || "Not Set"}</strong></div>
                <div className="acc-list-row"><span>{t("Birth Date")}</span><strong>{profile.dob || "Not Set"}</strong></div>
              </div>
            </div>

            <div className="acc-details-card">
              <div className="acc-card-head">
                <MapPin size={18} />
                <h3>{t("Contact & Location")}</h3>
              </div>
              <div className="acc-card-list">
                 <div className="acc-list-row"><span>{t("Phone")}</span><strong>{profile.phone || "Not Set"}</strong></div>
                 <div className="acc-list-row"><span>{t("District")}</span><strong>{profile.district || "Not Set"}</strong></div>
                 <div className="acc-list-row"><span>{t("Tehseel")}</span><strong>{profile.tehseel || "Not Set"}</strong></div>
                 <div className="acc-list-row"><span>{t("Main Address")}</span><strong className="acc-addr">{profile.address || "Not Set"}</strong></div>
              </div>
              <button className="acc-update-btn" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} style={{marginRight: '8px'}} /> {t("Update Info")}
              </button>
            </div>
          </div>
        ) : (
          /* EDIT FORM */
          <div className="acc-details-card" style={{ maxWidth: '800px', margin: '0 auto', gridColumn: '1 / -1' }}>
            <div className="acc-card-head" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 size={18} />
                <h3>{t("Edit Profile")}</h3>
              </div>
              <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="acc-edit-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Name</label>
                <input name="name" value={editForm.name} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Phone</label>
                <input name="phone" value={editForm.phone} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>District</label>
                <select name="district" value={editForm.district} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                  <option value="Okara">Okara</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Tehseel</label>
                <select name="tehseel" value={editForm.tehseel} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                  <option value="">Select</option>
                  <option value="Okara">Okara</option>
                  <option value="Depalpur">Depalpur</option>
                  <option value="Renala">Renala Khurd</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Main Address</label>
                <input name="address" value={editForm.address} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Gender</label>
                <select name="gender" value={editForm.gender} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Religion</label>
                <select name="religion" value={editForm.religion} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                  <option value="">Select</option>
                  <option value="Islam">Islam</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Marital Status</label>
                <select name="maritalStatus" value={editForm.maritalStatus} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Birth Date</label>
                <input type="date" name="dob" value={editForm.dob} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ff7a00', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}