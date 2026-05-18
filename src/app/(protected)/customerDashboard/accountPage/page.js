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
  Phone,
  Calendar,
  Heart,
  Compass
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { logout } = useAuth();
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

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
      <div className={`min-h-screen pt-28 flex justify-center items-center ${dark ? "bg-[#050a14] text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen pt-28 flex flex-col items-center justify-center gap-4 ${dark ? "bg-[#050a14] text-white" : "bg-slate-50 text-slate-900"}`}>
        <User className="w-16 h-16 text-slate-400" />
        <h2 className="text-xl font-bold">{t("Profile not found")}</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-20 px-6 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ── PROFILE HERO SECTION ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-[2.5rem] p-8 md:p-10 overflow-hidden border shadow-2xl ${
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center overflow-hidden shadow-inner ${
                  dark ? "border-slate-800 bg-slate-800" : "border-slate-100 bg-slate-50"
                }`}>
                  <User className="w-14 h-14 text-orange-500" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all border-4 border-slate-900">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black mb-2">{profile.name}</h1>
                <p className={`text-sm font-semibold mb-4 flex items-center justify-center md:justify-start gap-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  <Mail className="w-4 h-4 text-orange-500" /> {profile.email}
                </p>
                <div className="flex gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 font-bold text-xs border border-orange-500/20">
                    {t("Customer")}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 font-bold text-xs border border-purple-500/20">
                    VIP Member
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={logout}
              className={`w-full md:w-auto px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                dark ? "bg-slate-800 border-slate-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-white" : "bg-slate-100 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700"
              }`}
            >
              <LogOut className="w-4 h-4" /> {t("account.logout")}
            </button>
          </div>
        </motion.div>

        {/* ── STATS STRIP ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Gigs", value: 0, icon: Package, color: "text-blue-500 bg-blue-500/10" },
            { label: "In Progress", value: 0, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
            { label: "Open Disputes", value: 0, icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className={`p-6 rounded-3xl border flex items-center gap-5 shadow-lg ${
                  dark ? "bg-slate-900 border-slate-800 shadow-black/10" : "bg-white border-slate-200 shadow-slate-200/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                  <p className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── DETAILS / EDIT SECTION ── */}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div 
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Profile Information */}
              <div className={`p-8 rounded-[2rem] border shadow-xl ${
                dark ? "bg-slate-900 border-slate-800 shadow-black/10" : "bg-white border-slate-200 shadow-slate-200/50"
              }`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" /> {t("Profile Information")}
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: t("Gender"), value: profile.gender || "Not Set" },
                    { label: t("Religion"), value: profile.religion || "Not Set" },
                    { label: t("Marital Status"), value: profile.maritalStatus || "Not Set" },
                    { label: t("Birth Date"), value: profile.dob || "Not Set" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-dashed border-slate-200 dark:border-slate-800 last:border-b-0">
                      <span className={`text-sm font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>{row.label}</span>
                      <strong className="text-sm font-bold">{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Location */}
              <div className={`p-8 rounded-[2rem] border shadow-xl flex flex-col justify-between ${
                dark ? "bg-slate-900 border-slate-800 shadow-black/10" : "bg-white border-slate-200 shadow-slate-200/50"
              }`}>
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" /> {t("Contact & Location")}
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {[
                      { label: t("Phone"), value: profile.phone || "Not Set" },
                      { label: t("District"), value: profile.district || "Not Set" },
                      { label: t("Tehseel"), value: profile.tehseel || "Not Set" },
                      { label: t("Main Address"), value: profile.address || "Not Set", isAddr: true },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-start py-3 border-b border-dashed border-slate-200 dark:border-slate-800 last:border-b-0">
                        <span className={`text-sm font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>{row.label}</span>
                        <strong className={`text-sm font-bold max-w-[200px] text-right truncate ${row.isAddr ? "whitespace-pre-wrap" : ""}`}>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                >
                  <Edit3 className="w-4 h-4" /> {t("Update Info")}
                </button>
              </div>
            </motion.div>
          ) : (
            /* EDIT FORM */
            <motion.div 
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-8 rounded-[2rem] border shadow-2xl max-w-3xl mx-auto ${
                dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-500" /> {t("Edit Profile")}
                </h3>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Name</label>
                  <input 
                    name="name" value={editForm.name} onChange={handleInputChange} 
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Phone</label>
                  <input 
                    name="phone" value={editForm.phone} onChange={handleInputChange} 
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>District</label>
                  <select 
                    name="district" value={editForm.district} onChange={handleInputChange}
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  >
                    <option value="Okara">Okara</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Tehseel</label>
                  <select 
                    name="tehseel" value={editForm.tehseel} onChange={handleInputChange}
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  >
                    <option value="">Select</option>
                    <option value="Okara">Okara</option>
                    <option value="Depalpur">Depalpur</option>
                    <option value="Renala">Renala Khurd</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Main Address</label>
                  <input 
                    name="address" value={editForm.address} onChange={handleInputChange} 
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Gender</label>
                  <select 
                    name="gender" value={editForm.gender} onChange={handleInputChange}
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Religion</label>
                  <select 
                    name="religion" value={editForm.religion} onChange={handleInputChange}
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  >
                    <option value="">Select</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Marital Status</label>
                  <select 
                    name="maritalStatus" value={editForm.maritalStatus} onChange={handleInputChange}
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className={`text-sm font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>Birth Date</label>
                  <input 
                    type="date" name="dob" value={editForm.dob} onChange={handleInputChange} 
                    className={`p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 focus:border-orange-500 text-white" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <Save className="w-4 h-4" /> Save Changes
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