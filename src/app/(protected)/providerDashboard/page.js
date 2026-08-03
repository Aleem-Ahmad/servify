"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  BellRing, Briefcase, CheckCircle, Clock, Star, 
  TrendingUp, Activity, ArrowRight, Wrench, ShieldAlert, Calendar, MapPin, AlertCircle, MessageCircle
} from "lucide-react";
import ProviderCard from '@/components/ProviderCard';
import InstallPWA from "@/components/SharedComponents/InstallPWA/InstallPWA";

export default function ProviderDashboard() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return isUrdu ? "صبح بخیر،" : "Good morning,";
    } else if (hour >= 12 && hour < 17) {
      return isUrdu ? "دوپہر بخیر،" : "Good afternoon,";
    } else if (hour >= 17 && hour < 21) {
      return isUrdu ? "شام بخیر،" : "Good evening,";
    } else {
      return isUrdu ? "شب بخیر،" : "Good night,";
    }
  };

  const [counts, setCounts] = useState({ new: 0, pending: 0, done: 0, emergencies: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Single parallel fetch for all dashboard data
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const loadAll = async () => {
      try {
        const [profileRes, bookingsRes, emergencyRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch(`/api/bookings?providerId=${user.id}`),
          fetch("/api/bookings/emergency"),
        ]);

        if (cancelled) return;

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          let newCount = 0, pendingCount = 0, doneCount = 0;
          data.forEach(c => {
            if (c.status === "Pending") newCount++;
            else if (c.status === "Accepted") pendingCount++;
            else if (c.status === "Completed") doneCount++;
          });
          setCounts(prev => ({ ...prev, new: newCount, pending: pendingCount, done: doneCount }));
          setRecentComplaints(data.slice(0, 3));
        }

        if (emergencyRes.ok) {
          const emergencyData = await emergencyRes.json();
          setCounts(prev => ({ ...prev, emergencies: emergencyData.length }));
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProfileLoading(false);
        }
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [user?.id]);

  const statCards = [
    { 
      title: isUrdu ? "نئی درخواستیں" : "New Requests", 
      value: counts.new, 
      icon: BellRing, 
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      path: "/providerDashboard/viewComplaint?type=new"
    },
    { 
      title: isUrdu ? "ہنگامی صورتحال" : "🚨 Emergencies", 
      value: counts.emergencies, 
      icon: AlertCircle, 
      color: "from-red-500 to-rose-600",
      bg: "bg-red-500/10",
      text: "text-red-500",
      path: "/providerDashboard/viewComplaint?type=emergency"
    },
    { 
      title: isUrdu ? "زیر التوا کام" : "Active Jobs", 
      value: counts.pending, 
      icon: Clock, 
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      path: "/providerDashboard/viewComplaint?type=pending"
    },
    { 
      title: isUrdu ? "مکمل کام" : "Completed", 
      value: counts.done, 
      icon: CheckCircle, 
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      path: "/providerDashboard/viewComplaint?type=done"
    }
  ];

  return (
    <div className={`min-h-screen pb-48 ${dark ? "bg-[#050a14] text-slate-100" : "bg-gray-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>

      {/* ── Hero Header ── */}
      <div className={`relative overflow-hidden ${
        dark
          ? "bg-gradient-to-br from-slate-900 via-[#0f0c29] to-slate-900"
          : "bg-gradient-to-br from-orange-50 via-white to-purple-50"
      }`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-400/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            {/* Left: Greeting */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  dark ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-purple-100 text-purple-700 border-purple-200"
                }`}>
                  <Briefcase className="w-3.5 h-3.5" />
                  {isUrdu ? "پرووائیڈر ڈیش بورڈ" : "Provider Dashboard"}
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black tracking-tight mb-2 leading-tight"
              >
                {isUrdu ? (
                  (() => {
                    const h = new Date().getHours();
                    if (h >= 5 && h < 12) return "صبح بخیر،";
                    if (h >= 12 && h < 17) return "دوپہر بخیر،";
                    if (h >= 17 && h < 21) return "شام بخیر،";
                    return "شب بخیر،";
                  })()
                ) : getGreeting()}{" "}
                <span className="bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                  {user?.name || "Professional"}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={`text-base mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                {isUrdu ? "یہاں آپ کی سروسز کی تفصیل ہے۔" : "Here's an overview of your service business today."}
              </motion.p>

              {/* Quick stat pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                  dark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <Clock className="w-4 h-4" />
                  {loading ? "—" : counts.pending} {isUrdu ? "فعال جابز" : "Active Jobs"}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                  dark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  <BellRing className="w-4 h-4" />
                  {loading ? "—" : counts.new} {isUrdu ? "نئی درخواستیں" : "New Requests"}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                  dark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {loading ? "—" : counts.done} {isUrdu ? "مکمل" : "Completed"}
                </div>
              </motion.div>
            </div>

            {/* Right: Rating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
              className={`flex-shrink-0 p-6 rounded-3xl min-w-[220px] ${
                dark
                  ? "bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl shadow-2xl shadow-black/40"
                  : "bg-white/80 border border-white backdrop-blur-xl shadow-xl shadow-orange-100/60"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-300/40">
                  <Star className="w-7 h-7 fill-white" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                    {isUrdu ? "مجموعی ریٹنگ" : "Overall Rating"}
                  </p>
                  <div className="text-3xl font-black flex items-baseline gap-1 leading-none">
                    4.9
                    <span className={`text-sm font-semibold ${dark ? "text-slate-500" : "text-slate-400"}`}>/5.0</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= 5 ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                ))}
              </div>
              <InstallPWA />
            </motion.div>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Active Notifications & Warning Banners */}
        {profile?.warning && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/25 backdrop-blur-md text-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-rose-500/5"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="text-lg font-black tracking-tight text-white mb-1 uppercase">Official Administrative Warning</h3>
                <p className="text-sm font-semibold text-rose-200/90 leading-relaxed">
                  {profile.warning}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissWarning}
              className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] flex-shrink-0"
            >
              Acknowledge & Dismiss
            </button>
          </motion.div>
        )}

        {profile?.status === 'Pending' && profile?.surveyDate && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-amber-500/5"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white mb-1 uppercase">Verification Survey Scheduled</h3>
                <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                  Our verification team has scheduled an on-site survey for your business virtual shop on:
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(profile.surveyDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(profile.surveyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.address || profile.district || "Your registered address"}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/25 text-amber-400 text-xs font-black uppercase tracking-wider text-center flex-shrink-0">
              Awaiting On-Site Survey
            </div>
          </motion.div>
        )}

        {profile?.status === 'Pending' && !profile?.surveyDate && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 backdrop-blur-md text-orange-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="text-lg font-black tracking-tight text-white mb-1 uppercase">Awaiting Survey Assignment</h3>
                <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                  Your verification application has been submitted successfully and is currently under review by our administration. We will assign your on-site verification survey date and time shortly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* ── Provider Settings ── */}
        <section className="mb-12">
          {profile && <ProviderCard provider={profile} editable={true} />}
        </section>
        
        {/* ── Stats Overview ── */}
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-500" /> {t("Dashboard Overview")}
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  onClick={() => router.push(card.path)}
                  className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                    dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl shadow-black/20" : "bg-white border-slate-200 hover:border-orange-200 shadow-md shadow-slate-100/80"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg} ${card.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                      {isUrdu ? "دیکھیں" : "View"}
                    </div>
                  </div>
                  <h3 className={`text-xs font-semibold mb-1 uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>{card.title}</h3>
                  <div className="text-3xl font-black">{loading ? "-" : card.value}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section className="mt-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-500" /> {isUrdu ? "حالیہ سرگرمی" : "Recent Activity"}
            </h2>
            <button 
              onClick={() => router.push("/providerDashboard/viewComplaint?type=new")}
              className="btn btn-secondary btn-sm"
            >
              {isUrdu ? "تمام دیکھیں" : "View All"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className={`rounded-3xl border overflow-hidden ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <Wrench className={`w-8 h-8 ${dark ? "text-slate-600" : "text-slate-400"}`} />
                </div>
                <h3 className="text-lg font-bold mb-1">{isUrdu ? "کوئی نیا کام نہیں" : "No recent requests"}</h3>
                <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                  {isUrdu ? "آپ کی تمام درخواستیں مکمل ہو چکی ہیں۔" : "You're all caught up with your service requests."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentComplaints.map((complaint, i) => (
                  <motion.div 
                    key={complaint.id || complaint._id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                      dark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          complaint.status === "Pending" ? "bg-blue-500/10 text-blue-500" :
                          complaint.status === "Accepted" ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {complaint.status}
                        </span>
                        <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(complaint.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{complaint.category} Service</h4>
                      <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
                        {complaint.customerName} • {complaint.location || "Location not provided"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => router.push(`/providerDashboard/viewComplaint?type=${complaint.status === 'Pending' ? 'new' : complaint.status === 'Accepted' ? 'pending' : 'done'}&chat=${complaint.id || complaint._id}`)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          dark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> {isUrdu ? "چیٹ" : "Chat"}
                      </button>
                      
                      <button 
                        onClick={() => router.push(`/providerDashboard/viewComplaint?type=${complaint.status === 'Pending' ? 'new' : complaint.status === 'Accepted' ? 'pending' : 'done'}`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                      >
                        {isUrdu ? "تفصیلات" : "Details"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}