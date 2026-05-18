"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  BellRing, Briefcase, CheckCircle, Clock, Star, 
  TrendingUp, Activity, ArrowRight, Wrench 
} from "lucide-react";

export default function ProviderDashboard() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const [counts, setCounts] = useState({ new: 0, pending: 0, done: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?providerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          let newCount = 0;
          let pendingCount = 0;
          let doneCount = 0;
          
          data.forEach(c => {
            if (c.status === "Pending") newCount++;
            else if (c.status === "Accepted") pendingCount++;
            else if (c.status === "Completed") doneCount++;
          });
          
          setCounts({ new: newCount, pending: pendingCount, done: doneCount });
          
          // Get 3 most recent requests
          setRecentComplaints(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch complaint stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

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
    <div className={`min-h-screen pb-20 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      
      {/* ── Header ── */}
      <div className={`relative pt-28 pb-16 px-6 rounded-b-[3rem] overflow-hidden ${
        dark ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-slate-200 shadow-sm"
      }`}>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 translate-x-1/3" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                dark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-200"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> {isUrdu ? "پرووائیڈر ڈیش بورڈ" : "Provider Dashboard"}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2"
            >
              {isUrdu ? "خوش آمدید،" : "Welcome back,"} <span className="text-gradient-purple">{user?.name || "Professional"}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`text-lg ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {isUrdu ? "یہاں آپ کی سروسز کی تفصیل ہے۔" : "Here's an overview of your service business today."}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className={`p-6 rounded-3xl flex items-center gap-4 shadow-lg ${
              dark ? "bg-slate-800/80 border border-slate-700 backdrop-blur-md" : "bg-white border border-slate-200 backdrop-blur-md"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-inner">
              <Star className="w-8 h-8 fill-white" />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {isUrdu ? "مجموعی ریٹنگ" : "Overall Rating"}
              </p>
              <div className="text-3xl font-black flex items-baseline gap-1">
                4.9 <span className="text-base font-medium text-slate-500">/ 5.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* ── Stats Overview ── */}
        <section>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-500" /> {t("Dashboard Overview")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => router.push(card.path)}
                  className={`p-6 rounded-3xl cursor-pointer border transition-all ${
                    dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl shadow-black/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.text}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                      {isUrdu ? "دیکھیں" : "View"}
                    </div>
                  </div>
                  <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{card.title}</h3>
                  <div className="text-4xl font-black">{loading ? "-" : card.value}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-500" /> {isUrdu ? "حالیہ سرگرمی" : "Recent Activity"}
            </h2>
            <button 
              onClick={() => router.push("/providerDashboard/viewComplaint?type=new")}
              className={`text-sm font-semibold flex items-center gap-1 hover:underline ${dark ? "text-orange-400" : "text-orange-600"}`}
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
                    key={complaint._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
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
                    
                    <button 
                      onClick={() => router.push(`/providerDashboard/viewComplaint?type=${complaint.status.toLowerCase()}`)}
                      className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors"
                    >
                      {isUrdu ? "تفصیلات" : "Details"}
                    </button>
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