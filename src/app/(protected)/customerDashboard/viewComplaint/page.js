"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Clock, User, Calendar, MapPin, 
  Phone, MessageSquare, ArrowLeft, KeyRound, Wrench 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ViewComplaintCard() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const [complaint] = useState({
    title: "Air Conditioner Not Cooling",
    description: "The AC in my living room is not cooling properly.",
    status: "Pending", // Can be "Pending" or "Done"
    provider: "Ali Electric Works",
    date: "2026-03-31",
    time: "14:30",
    otp: "839201",
  });

  const handleContact = () => {
    alert(`Contacting ${complaint.provider}...`);
  };

  const handleFeedback = () => {
    alert("Redirecting to feedback form...");
  };

  return (
    <div className={`min-h-screen pt-24 pb-20 px-6 flex flex-col items-center ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="w-full max-w-2xl">
        <button 
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm font-bold mb-6 transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft className="w-4 h-4" /> {t("Back")}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2rem] border overflow-hidden shadow-2xl p-8 md:p-10 relative ${
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 space-y-6">
            
            {/* Status and category */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status === "Pending" 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}>
                {complaint.status}
              </span>
              
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                <Calendar className="w-4 h-4 text-orange-500" />
                {complaint.date} | {complaint.time}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-3">{complaint.title}</h1>
              <p className={`text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {complaint.description}
              </p>
            </div>

            {/* Provider Section */}
            <div className={`p-5 rounded-2xl border ${dark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>
                    {t("Service Provider:")}
                  </p>
                  <p className="font-extrabold text-lg">{complaint.provider}</p>
                </div>
              </div>
            </div>

            {/* OTP display */}
            {complaint.status.toLowerCase() !== "done" && (
              <div className={`p-6 rounded-2xl border text-center ${dark ? "bg-orange-500/[0.03] border-orange-500/20" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center justify-center gap-2 text-orange-500 font-bold mb-2">
                  <KeyRound className="w-5 h-5 animate-pulse" />
                  <span>{isUrdu ? "سیکورٹی کوڈ (OTP)" : "Security Code (OTP)"}</span>
                </div>
                <div className="text-4xl font-black tracking-[0.2em] text-orange-500">
                  {complaint.otp}
                </div>
                <p className={`text-xs mt-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  {isUrdu ? "فراہم کنندہ کو کام شروع کرنے سے پہلے یہ کوڈ فراہم کریں۔" : "Provide this code to the expert before they begin work."}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {complaint.status.toLowerCase() === "pending" ? (
                <button 
                  onClick={handleContact}
                  className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25"
                >
                  <Phone className="w-5 h-5" /> {t("Contact")}
                </button>
              ) : (
                <button 
                  onClick={handleFeedback}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                >
                  <MessageSquare className="w-5 h-5" /> {t("Leave Feedback")}
                </button>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}