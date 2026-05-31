"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  ArrowRight,
  Calendar,
  Zap,
  ChevronRight,
  Activity,
  Wrench,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "@/components/customerDashboard/SearchBar/SearchBar";
import "@/styles/landingPage.css";
import "./customerDashboard.css";

export default function CustomerDashboard() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return isUrdu ? "صبح بخیر،" : "Good morning,";
    if (hour >= 12 && hour < 17) return isUrdu ? "دوپہر بخیر،" : "Good afternoon,";
    if (hour >= 17 && hour < 21) return isUrdu ? "شام بخیر،" : "Good evening,";
    return isUrdu ? "شب بخیر،" : "Good night,";
  };

  const [activeBookings, setActiveBookings] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: t("services.electrician"), icon: "⚡", color: "from-yellow-400 to-orange-500", query: "Electrician" },
    { name: t("services.plumber"), icon: "🔧", color: "from-blue-400 to-cyan-500", query: "Plumber" },
    { name: t("services.cleaner"), icon: "🧹", color: "from-emerald-400 to-teal-500", query: "Cleaning" },
    { name: t("services.carpenter"), icon: "🪚", color: "from-amber-500 to-red-500", query: "Carpenter" },
    { name: t("services.painter"), icon: "🎨", color: "from-purple-400 to-pink-500", query: "Painter" },
    { name: t("services.gardener"), icon: "🌿", color: "from-green-400 to-emerald-600", query: "Gardener" },
  ];

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const bookingsRes = await fetch(`/api/bookings?userId=${user.id}`);
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setActiveBookings(
            bData.filter((b) => b.status === "Pending" || b.status === "Accepted").slice(0, 3)
          );
        }

        const providersRes = await fetch(`/api/providers`);
        if (providersRes.ok) {
          const pData = await providersRes.json();
          setTopProviders(pData.slice(0, 4));
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
    <div className="cd-main" dir={isUrdu ? "rtl" : "ltr"}>
      {/* ── SECTION 1: Hero & Search ── */}
      <section className="cd-section cd-section-light-tint" id="home">
        <div className="hero-bg-glow">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-mesh" />
        </div>

        <div className="cd-content-box text-center items-center gap-10 w-full">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-badge"
              style={{ marginBottom: "20px", display: "inline-flex" }}
            >
              <Zap className="hero-badge-icon" />
              <span>{t("Customer Dashboard")}</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hero-title"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                marginBottom: "14px",
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              {getGreeting()}{" "}
              <span className="text-gradient">{user?.name || "User"}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-subtitle"
              style={{
                fontSize: "clamp(0.95rem, 1.8vw, 1.2rem)",
                margin: "0 auto",
                maxWidth: "640px",
                textAlign: "center",
              }}
            >
              {isUrdu ? "آج آپ کو کس سروس کی ضرورت ہے؟" : "What service do you need today?"}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl mx-auto"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: Quick Services ── */}
      <section className="cd-section cd-section-purple-tint" id="services">
        <div className="hero-bg-glow">
          <div className="hero-orb hero-orb-2" style={{ top: "20%", left: "70%", opacity: 0.3 }} />
        </div>

        <div className="cd-content-box">
          <div className="cd-section-header">
            <div>
              <h2 className="cd-section-title">
                <Wrench className="w-7 h-7 text-orange-500 shrink-0" />
                {t("Quick Services")}
              </h2>
              <p className="cd-section-subtitle">
                {isUrdu ? "فوری بکنگ کے لیے ایک زمرہ منتخب کریں" : "Pick a category to book instantly"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/customerDashboard/allProviders")}
              className="cd-nav-btn cd-nav-btn-orange"
            >
              <span>{isUrdu ? "تمام دیکھیں" : "Explore All"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.query}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() =>
                  router.push(`/customerDashboard/allProviders?category=${cat.query}`)
                }
                className="cd-category-card"
              >
                <div
                  className={`cd-category-icon-wrap bg-gradient-to-br ${cat.color} text-white shadow-inner`}
                >
                  {cat.icon}
                </div>
                <span className="cd-category-name">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Active Bookings ── */}
      <section className="cd-section cd-section-light-tint">
        <div className="hero-bg-glow">
          <div className="hero-orb hero-orb-1" style={{ top: "60%", left: "10%", opacity: 0.3 }} />
        </div>

        <div className="cd-content-box">
          <div className="cd-section-header">
            <div>
              <h2 className="cd-section-title">
                <Activity className="w-7 h-7 text-purple-500 shrink-0" />
                {t("Active Bookings")}
              </h2>
              <p className="cd-section-subtitle">
                {isUrdu ? "جاری سروسز کی حیثیت" : "Status of your ongoing services"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/customerDashboard/track")}
              className="cd-nav-btn cd-nav-btn-purple"
            >
              <span>{isUrdu ? "تمام ٹریک کریں" : "Track All"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="cd-empty-panel">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="cd-empty-panel">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  dark ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <Calendar className={`w-10 h-10 ${dark ? "text-slate-600" : "text-slate-400"}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {isUrdu ? "کوئی ایکٹو بکنگ نہیں" : "No active bookings"}
                </h3>
                <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                  {isUrdu
                    ? "آپ نے ابھی تک کوئی سروس بک نہیں کی ہے۔"
                    : "You don't have any ongoing services right now."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/customerDashboard/allProviders")}
                className="cd-action-btn"
              >
                {isUrdu ? "ابھی بک کریں" : "Book a Service"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="cd-list-wrapper">
              {activeBookings.map((booking, i) => (
                <motion.div
                  key={booking.id || booking._id || i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="cd-booking-card"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-lg truncate">
                        {booking.category} Service
                      </h3>
                      <p
                        className={`text-sm flex items-center gap-1.5 mt-0.5 ${
                          dark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        <User className="w-4 h-4 text-purple-500 shrink-0" />
                        {booking.providerName || "Assigned Provider"}
                      </p>
                      {booking.otp && (
                        <div
                          className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black border ${
                            dark
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                              : "bg-orange-50 border-orange-200 text-orange-600"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                          {isUrdu ? `او ٹی پی: ${booking.otp}` : `OTP: ${booking.otp}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`px-4 py-2 rounded-xl text-xs font-black ${
                        booking.status === "Pending"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {booking.status}
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/customerDashboard/track")}
                      className="cd-icon-btn"
                      aria-label={isUrdu ? "ٹریک کریں" : "Track booking"}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4: Top Rated Providers ── */}
      <section className="cd-section cd-section-purple-tint">
        <div className="hero-bg-glow">
          <div className="hero-orb hero-orb-2" style={{ top: "80%", left: "80%", opacity: 0.35 }} />
        </div>

        <div className="cd-content-box">
          <div className="cd-section-header">
            <div>
              <h2 className="cd-section-title">
                <Star className="w-7 h-7 text-yellow-500 fill-yellow-500 shrink-0" />
                {t("Top Rated")}
              </h2>
              <p className="cd-section-subtitle">
                {isUrdu ? "بہترین فراہم کنندگان" : "Highest rated providers near you"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/customerDashboard/allProviders")}
              className="cd-nav-btn cd-nav-btn-orange"
            >
              <span>{isUrdu ? "مزید دیکھیں" : "See All"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="cd-empty-panel">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topProviders.length === 0 ? (
            <div className="cd-empty-panel">
              <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                {isUrdu ? "کوئی فراہم کنندہ نہیں ملا" : "No providers found."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/customerDashboard/allProviders")}
                className="cd-nav-btn cd-nav-btn-orange"
              >
                <span>{isUrdu ? "تلاش کریں" : "Browse Providers"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="cd-provider-list">
              {topProviders.map((provider, i) => (
                <motion.div
                  key={provider.id || provider._id || i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() =>
                    router.push(
                      `/customerDashboard/viewProvider?id=${provider.id || provider._id}`
                    )
                  }
                  className="cd-provider-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(
                        `/customerDashboard/viewProvider?id=${provider.id || provider._id}`
                      );
                    }
                  }}
                >
                  <img
                    src={provider.image || "/default-avatar.png"}
                    alt={provider.name}
                    className="cd-provider-img"
                  />
                  <div className="flex-1 min-w-0 cd-provider-info">
                    <strong>{provider.name}</strong>
                    <p className={`cd-provider-meta ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      {provider.category} • {provider.city}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-sm font-black">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {provider.rating || "5.0"}
                    </div>
                    <span className="text-xs font-black text-orange-500 uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-lg">
                      PKR {provider.rate}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
