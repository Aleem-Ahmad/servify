"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, Clock, Shield, ArrowRight, 
  Calendar, Zap, CheckCircle2, ChevronRight, Activity, Wrench, User
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
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

  const [activeBookings, setActiveBookings] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick categories
  const categories = [
    { name: t("services.electrician"), icon: "⚡", color: "from-yellow-400 to-orange-500", query: "Electrician" },
    { name: t("services.plumber"), icon: "🔧", color: "from-blue-400 to-cyan-500", query: "Plumber" },
    { name: t("services.cleaner"), icon: "🧹", color: "from-emerald-400 to-teal-500", query: "Cleaning" },
    { name: t("services.carpenter"), icon: "🪚", color: "from-amber-500 to-red-500", query: "Carpenter" },
    { name: t("services.painter"), icon: "🎨", color: "from-purple-400 to-pink-500", query: "Painter" },
    { name: t("services.gardener"), icon: "🌿", color: "from-green-400 to-emerald-600", query: "Gardener" },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Fetch active bookings
        const bookingsRes = await fetch(`/api/bookings?userId=${user.id}`);
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          // Filter to only show pending/accepted bookings
          setActiveBookings(bData.filter(b => b.status === "Pending" || b.status === "Accepted").slice(0, 3));
        }

        // Fetch some top providers
        const providersRes = await fetch(`/api/providers`);
        if (providersRes.ok) {
          const pData = await providersRes.json();
          setTopProviders(pData.slice(0, 4)); // Get first 4
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div className={`min-h-screen pb-20 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      
      {/* ── Dashboard Header ── */}
      <div className={`relative pt-28 pb-12 px-6 rounded-b-[3rem] overflow-hidden ${
        dark ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-slate-200 shadow-sm"
      }`}>
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
                dark ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-orange-50 text-orange-600 border border-orange-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> {t("Customer Dashboard")}
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2"
            >
              {getGreeting()} <span className="text-gradient">{user?.name || "User"}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`text-lg ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {isUrdu ? "آج آپ کو کس سروس کی ضرورت ہے؟" : "What service do you need today?"}
            </motion.p>
          </div>

          {/* Quick Search */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className={`w-full md:w-[400px] p-1.5 md:p-2 rounded-[2rem] flex items-center gap-1.5 md:gap-2 shadow-lg ${
              dark ? "bg-slate-800/80 border border-slate-700 backdrop-blur-md" : "bg-white border border-slate-200 backdrop-blur-md"
            }`}
          >
            <div className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shrink-0 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
              <Search className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
            </div>
            <input 
              type="text" 
              placeholder={t("search.placeholder")} 
              className="flex-1 min-w-0 bg-transparent border-none outline-none font-medium px-1.5 text-sm md:text-base"
              onClick={() => router.push("/customerDashboard/allProviders")}
            />
            <button 
              onClick={() => router.push("/customerDashboard/allProviders")}
              className="px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors text-xs md:text-sm whitespace-nowrap shrink-0"
            >
              {isUrdu ? "تلاش کریں" : "Search"}
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* ── Quick Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-6 h-6 text-orange-500" /> {t("Quick Services")}
            </h2>
            <button 
              onClick={() => router.push("/customerDashboard/allProviders")}
              className={`text-sm font-semibold flex items-center gap-1 hover:underline ${dark ? "text-orange-400" : "text-orange-600"}`}
            >
              {isUrdu ? "تمام دیکھیں" : "View All"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/customerDashboard/allProviders?category=${cat.query}`)}
                className={`p-5 rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all ${
                  dark ? "bg-slate-900 border-slate-800 hover:border-orange-500/30 shadow-xl shadow-black/20" : "bg-white border-slate-200 hover:border-orange-300 shadow-lg shadow-slate-200/50"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${cat.color} text-white shadow-inner`}>
                  {cat.icon}
                </div>
                <span className="font-semibold text-sm text-center">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Active Bookings ── */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-500" /> {t("Active Bookings")}
              </h2>
              <button 
                onClick={() => router.push("/customerDashboard/track")}
                className={`text-sm font-semibold flex items-center gap-1 hover:underline ${dark ? "text-purple-400" : "text-purple-600"}`}
              >
                {isUrdu ? "تفصیلات دیکھیں" : "Track All"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className={`p-8 rounded-3xl border flex items-center justify-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeBookings.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center flex flex-col items-center gap-4 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <Calendar className={`w-8 h-8 ${dark ? "text-slate-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{isUrdu ? "کوئی ایکٹو بکنگ نہیں" : "No active bookings"}</h3>
                  <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                    {isUrdu ? "آپ نے ابھی تک کوئی سروس بک نہیں کی ہے۔" : "You don't have any ongoing services right now."}
                  </p>
                </div>
                <button 
                  onClick={() => router.push("/customerDashboard/allProviders")}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-500/20 transition-colors"
                >
                  {isUrdu ? "ابھی بک کریں" : "Book a Service"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking, i) => (
                  <motion.div 
                    key={booking.id || booking._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-lg ${
                      dark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-inner">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.category} Service</h3>
                        <p className={`text-sm flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          <User className="w-3.5 h-3.5" /> {booking.providerName || "Assigned Provider"}
                        </p>
                        {booking.otp && (
                          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${
                            dark ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600"
                          }`}>
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            🔑 {isUrdu ? `او ٹی پی: ${booking.otp}` : `Verification OTP: ${booking.otp}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold w-full sm:w-auto text-center ${
                        booking.status === "Pending" 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {booking.status}
                      </div>
                      <button 
                        onClick={() => router.push(`/customerDashboard/track`)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* ── Top Providers ── */}
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500" /> {t("Top Rated")}
            </h2>
            
            <div className={`rounded-3xl border overflow-hidden ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : topProviders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No providers found.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {topProviders.map((provider, i) => (
                    <div 
                      key={provider.id || provider._id || i}
                      onClick={() => router.push(`/customerDashboard/viewProvider?id=${provider.id || provider._id}`)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                        dark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                      }`}
                    >
                      <img 
                        src={provider.image || "/default-avatar.png"} 
                        alt={provider.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{provider.name}</h4>
                        <p className={`text-xs truncate ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          {provider.category} • {provider.city}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 
                          {provider.rating || "5.0"}
                        </div>
                        <span className="text-xs font-semibold text-orange-500">
                          PKR {provider.rate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div 
                onClick={() => router.push("/customerDashboard/allProviders")}
                className={`p-3 text-center text-sm font-bold cursor-pointer transition-colors ${
                  dark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {isUrdu ? "مزید دیکھیں" : "See More Providers"}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}