"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  LogOut,
  MapPin,
  User,
  ShieldCheck,
  Package,
  Clock,
  X,
  Save,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import "@/styles/landingPage.css";
import "../customerDashboard.css";
import "./account.css";

export default function AccountPage() {
  const { t, locale } = useLanguage();
  const { logout } = useAuth();
  const isUrdu = locale === "ur";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
        fetchProfile();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="acc-state">
        <div className="acc-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="acc-state">
        <User className="w-14 h-14 text-slate-400 opacity-50" />
        <h2 className="acc-state-title">{t("Profile not found")}</h2>
      </div>
    );
  }

  const profileRows = [
    { label: t("Gender"), value: profile.gender || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("Religion"), value: profile.religion || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("Marital Status"), value: profile.maritalStatus || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("Birth Date"), value: profile.dob || (isUrdu ? "درج نہیں" : "Not Set") },
  ];

  const contactRows = [
    { label: t("Phone"), value: profile.phone || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("District"), value: profile.district || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("Tehseel"), value: profile.tehseel || (isUrdu ? "درج نہیں" : "Not Set") },
    { label: t("Main Address"), value: profile.address || (isUrdu ? "درج نہیں" : "Not Set"), wide: true },
  ];

  const stats = [
    { label: isUrdu ? "کل بکنگز" : "Total Gigs", value: 0, icon: Package, color: "blue" },
    { label: isUrdu ? "جاری" : "In Progress", value: 0, icon: Clock, color: "amber" },
    { label: isUrdu ? "تنازعات" : "Open Disputes", value: 0, icon: ShieldCheck, color: "emerald" },
  ];

  return (
    <div className="acc-page" dir={isUrdu ? "rtl" : "ltr"}>
      <div className="acc-page-glow" aria-hidden="true">
        <div className="acc-orb acc-orb-1" />
        <div className="acc-orb acc-orb-2" />
      </div>

      <div className="acc-inner">
        <div className="acc-page-header">
          <h1 className="acc-page-title">
            <User className="w-7 h-7 text-orange-500 shrink-0" />
            {t("navbar.account") || (isUrdu ? "میرا اکاؤنٹ" : "My Account")}
          </h1>
          <p className="acc-page-subtitle">
            {isUrdu ? "اپنی پروفائل اور رابطے کی تفصیلات منظم کریں" : "Manage your profile and contact details"}
          </p>
        </div>

        {/* Profile hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="acc-hero"
        >
          <div className="hero-bg-glow">
            <div className="hero-orb hero-orb-1" style={{ opacity: 0.25 }} />
            <div className="hero-orb hero-orb-2" style={{ opacity: 0.18 }} />
          </div>

          <div className="acc-hero-body">
            <div className="acc-hero-profile">
              <div className="acc-avatar-wrap">
                <div className="acc-avatar">
                  <User className="w-12 h-12 text-orange-500" />
                </div>
                <button
                  type="button"
                  className="acc-avatar-edit"
                  onClick={() => setIsEditing(true)}
                  aria-label={t("Edit Profile")}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="acc-hero-info">
                <h2 className="acc-hero-name">{profile.name}</h2>
                <p className="acc-hero-email">
                  <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                  {profile.email}
                </p>
                <div className="acc-badges">
                  <span className="acc-badge acc-badge-orange">{t("Customer")}</span>
                  <span className="acc-badge acc-badge-purple">VIP Member</span>
                </div>
              </div>
            </div>

            <button type="button" onClick={logout} className="acc-btn-logout">
              <LogOut className="w-4 h-4" />
              {t("account.logout")}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="acc-stats">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.08 }}
                className="acc-stat"
              >
                <div className={`acc-stat-icon ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="acc-stat-value">{stat.value}</div>
                  <div className="acc-stat-label">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Details / Edit */}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="acc-grid"
            >
              <div className="acc-card">
                <div className="acc-card-head">
                  <User className="w-5 h-5" />
                  <h3 className="acc-card-title">{t("Profile Information")}</h3>
                </div>
                <div className="acc-rows">
                  {profileRows.map((row) => (
                    <div key={row.label} className="acc-row">
                      <span className="acc-row-label">{row.label}</span>
                      <strong className="acc-row-value">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="acc-card">
                <div className="acc-card-head">
                  <MapPin className="w-5 h-5" />
                  <h3 className="acc-card-title">{t("Contact & Location")}</h3>
                </div>
                <div className="acc-rows">
                  {contactRows.map((row) => (
                    <div key={row.label} className="acc-row">
                      <span className="acc-row-label">{row.label}</span>
                      <strong className="acc-row-value">{row.value}</strong>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setIsEditing(true)} className="acc-btn-update">
                  <Edit3 className="w-4 h-4" />
                  {t("Update Info")}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="acc-edit-card"
            >
              <div className="acc-edit-header">
                <h3 className="acc-edit-title">
                  <Edit3 className="w-5 h-5 text-orange-500" />
                  {t("Edit Profile")}
                </h3>
                <button type="button" onClick={() => setIsEditing(false)} className="acc-btn-close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="acc-form">
                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-name">{isUrdu ? "نام" : "Name"}</label>
                  <input id="acc-name" name="name" value={editForm.name} onChange={handleInputChange} className="acc-input" />
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-phone">{isUrdu ? "فون" : "Phone"}</label>
                  <input id="acc-phone" name="phone" value={editForm.phone} onChange={handleInputChange} className="acc-input" />
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-district">{isUrdu ? "ضلع" : "District"}</label>
                  <select id="acc-district" name="district" value={editForm.district} onChange={handleInputChange} className="acc-select">
                    <option value="Okara">Okara</option>
                  </select>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-tehseel">{isUrdu ? "تحصیل" : "Tehseel"}</label>
                  <select id="acc-tehseel" name="tehseel" value={editForm.tehseel} onChange={handleInputChange} className="acc-select">
                    <option value="">{isUrdu ? "منتخب کریں" : "Select"}</option>
                    <option value="Okara">Okara</option>
                    <option value="Depalpur">Depalpur</option>
                    <option value="Renala">Renala Khurd</option>
                  </select>
                </div>

                <div className="acc-field full">
                  <label className="acc-label" htmlFor="acc-address">{isUrdu ? "پتہ" : "Main Address"}</label>
                  <input id="acc-address" name="address" value={editForm.address} onChange={handleInputChange} className="acc-input" />
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-gender">{t("Gender")}</label>
                  <select id="acc-gender" name="gender" value={editForm.gender} onChange={handleInputChange} className="acc-select">
                    <option value="">{isUrdu ? "منتخب کریں" : "Select"}</option>
                    <option value="Male">{isUrdu ? "مرد" : "Male"}</option>
                    <option value="Female">{isUrdu ? "عورت" : "Female"}</option>
                    <option value="Other">{isUrdu ? "دیگر" : "Other"}</option>
                  </select>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-religion">{t("Religion")}</label>
                  <select id="acc-religion" name="religion" value={editForm.religion} onChange={handleInputChange} className="acc-select">
                    <option value="">{isUrdu ? "منتخب کریں" : "Select"}</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Other">{isUrdu ? "دیگر" : "Other"}</option>
                  </select>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-marital">{t("Marital Status")}</label>
                  <select id="acc-marital" name="maritalStatus" value={editForm.maritalStatus} onChange={handleInputChange} className="acc-select">
                    <option value="">{isUrdu ? "منتخب کریں" : "Select"}</option>
                    <option value="Single">{isUrdu ? "غیر شادی شدہ" : "Single"}</option>
                    <option value="Married">{isUrdu ? "شادی شدہ" : "Married"}</option>
                  </select>
                </div>

                <div className="acc-field">
                  <label className="acc-label" htmlFor="acc-dob">{t("Birth Date")}</label>
                  <input id="acc-dob" type="date" name="dob" value={editForm.dob} onChange={handleInputChange} className="acc-input" />
                </div>

                <div className="acc-form-actions">
                  <button type="button" onClick={() => setIsEditing(false)} className="acc-btn-cancel">
                    {isUrdu ? "منسوخ" : "Cancel"}
                  </button>
                  <button type="submit" className="acc-btn-save">
                    <Save className="w-4 h-4" />
                    {isUrdu ? "محفوظ کریں" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
