"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Activity, Clock, MapPin, ChevronRight, Search, ShieldCheck } from "lucide-react";

export default function TrackingOverview() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out completed/cancelled if we only want active ones, 
          // or show all. Let's show all but sort active first.
          const sorted = data.sort((a, b) => {
            if (a.status === "Pending" || a.status === "Accepted") return -1;
            if (b.status === "Pending" || b.status === "Accepted") return 1;
            return new Date(b.date) - new Date(a.date);
          });
          setBookings(sorted);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const filteredBookings = bookings.filter(b => 
    b.category.toLowerCase().includes(search.toLowerCase()) || 
    (b.providerName && b.providerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`min-h-screen pt-28 pb-20 px-6 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center gap-3"
            >
              <Activity className="w-10 h-10 text-orange-500" />
              {isUrdu ? "بکنگ ٹریکنگ" : "Track Bookings"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`text-lg ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              {isUrdu ? "اپنی تمام حالیہ اور پرانی سروسز کا ریکارڈ دیکھیں۔" : "Monitor all your active and past service requests."}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className={`flex items-center gap-2 p-2 rounded-2xl border w-full md:w-72 shadow-sm ${
              dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <Search className={`w-5 h-5 ml-2 ${dark ? "text-slate-500" : "text-slate-400"}`} />
            <input 
              type="text" 
              placeholder={isUrdu ? "تلاش کریں..." : "Search bookings..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`bg-transparent border-none outline-none w-full text-sm font-medium ${dark ? "text-white" : "text-slate-900"}`}
            />
          </motion.div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className={`p-12 rounded-3xl border flex items-center justify-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <p className={`text-lg font-bold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {isUrdu ? "کوئی بکنگ نہیں ملی" : "No bookings found"}
              </p>
              <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                {isUrdu ? "آپ نے ابھی تک کوئی سروس بک نہیں کی ہے۔" : "You haven't made any bookings yet."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredBookings.map((booking, i) => (
                <motion.div 
                  key={booking.id || booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-xl ${
                    dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-black/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-slate-200/50"
                  }`}
                >
                  <div className="flex items-start md:items-center gap-5 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-inner ${
                      booking.status === "Pending" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                      booking.status === "Accepted" ? "bg-gradient-to-br from-blue-400 to-indigo-500" :
                      "bg-gradient-to-br from-emerald-400 to-teal-500"
                    }`}>
                      {booking.status === "Completed" ? <ShieldCheck className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          booking.status === "Pending" ? "bg-amber-500/10 text-amber-550" :
                          booking.status === "Accepted" ? "bg-blue-500/10 text-blue-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {booking.status}
                        </span>
                        <span className={`text-xs font-semibold ${dark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-lg truncate">{booking.category} Service</h3>
                      <p className={`text-sm truncate mt-0.5 flex items-center gap-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        <MapPin className="w-3.5 h-3.5" /> {booking.location || "Location not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <p className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>
                        {isUrdu ? "پرووائیڈر" : "Provider"}
                      </p>
                      <p className="font-bold">{booking.providerName || "Pending Assignment"}</p>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/customerDashboard/track/${booking.id || booking._id}`)}
                      className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                        dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                    >
                      {isUrdu ? "ٹریک کریں" : "Track"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
