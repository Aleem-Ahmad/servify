"use client";

import { useState, useRef, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import ComplaintCard from "@/components/customerDashboard/ComplaintCard/ComplaintCard";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ComplaintsSection() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [complaints, setComplaints] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = require("@/context/AuthContext").useAuth();

  const sectionRef = useRef(null);

  /* Detect screen size & fetch data */
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    // Fetch real bookings/complaints from the database
    const fetchComplaints = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`/api/bookings?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            // Map backend fields to frontend expected structure
            const formatted = data.map(b => ({
              id: b.id || b._id,
              title: b.description || b.category,
              status: b.status || "Pending",
              provider: b.providerName || "Unassigned",
              providerId: b.provider,
              providerPhone: b.providerPhone || null,
              customerPhone: b.customerPhone,
              customerId: b.customer,
              time: b.status !== "Pending" && b.visitTime ? new Date(b.visitTime).toLocaleString() : null,
              category: b.category,
              description: b.description,
              otp: b.otp,
            }));
            setComplaints(formatted);
          }
        } catch (err) {
          console.error("Failed to load complaints");
        }
      }
    };
    fetchComplaints();

    return () => window.removeEventListener("resize", checkScreen);
  }, [user]);

  /* Show all on mobile */
  const visibleComplaints = isMobile
    ? complaints
    : expanded
    ? complaints
    : complaints.slice(0, 4);

  const handleToggle = () => {
    if (expanded) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setExpanded(!expanded);
  };

  return (
    <section className={`py-12 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-orange-500" />
            {t("Your Complaints")}
          </h1>

          {/* Button ONLY on desktop */}
          {!isMobile && complaints.length > 4 && (
            <button 
              onClick={handleToggle}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all border ${
                dark 
                  ? "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300" 
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              {expanded ? t("See Less") : t("See All")}
            </button>
          )}
        </div>

        {/* GRID */}
        {complaints.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <p className="font-bold text-lg mb-1">No bookings or complaints found</p>
            <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>All your future requests will be listed here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {visibleComplaints.map((c) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ComplaintCard complaint={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
}