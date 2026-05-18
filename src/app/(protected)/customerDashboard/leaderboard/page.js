"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Sparkles, User, Briefcase } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Leaderboard() {
  const { theme } = useTheme();
  const { locale, t } = useLanguage();
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers/leaderboard")
      .then(res => res.json())
      .then(data => {
        if (data.success) setLeaders(data.leaders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen pt-24 pb-20 px-6 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── HEADER ── */}
        <div className="text-center relative py-8 overflow-hidden rounded-[2rem]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl shadow-orange-500/25 mb-6"
          >
            <Trophy className="w-10 h-10 animate-bounce" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-4xl md:text-5xl font-black mb-3 tracking-tight"
          >
            {isUrdu ? "ہفتہ وار لیڈر بورڈ" : "Weekly Leaderboard"}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className={`text-lg max-w-lg mx-auto ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {isUrdu ? "ہمارے بہترین کارکردگی کا مظاہرہ کرنے والے سروس فراہم کنندگان کی شناخت" : "Recognizing our top performing service professionals this week."}
          </motion.p>
        </div>

        {/* ── LEADERBOARD CONTENT ── */}
        <div className="space-y-4">
          {loading ? (
            <div className={`p-12 rounded-3xl border flex items-center justify-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaders.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p className={`text-lg font-bold mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>No champions yet</p>
              <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>Stay tuned! Leaderboard is compiling.</p>
            </div>
          ) : (
            <AnimatePresence>
              {leaders.map((leader, index) => {
                const isTopThree = leader.rank <= 3;
                const cardGlow = 
                  leader.rank === 1 ? "border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/[0.02]" :
                  leader.rank === 2 ? "border-slate-400 bg-slate-400/5 dark:bg-slate-400/[0.02]" :
                  leader.rank === 3 ? "border-amber-700 bg-amber-700/5 dark:bg-amber-700/[0.02]" :
                  dark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300";

                return (
                  <motion.div
                    key={leader.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${cardGlow}`}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                      {/* Rank Indicator */}
                      <div className="flex-shrink-0">
                        {leader.rank === 1 && <Trophy className="w-9 h-9 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />}
                        {leader.rank === 2 && <Medal className="w-9 h-9 text-slate-400 fill-slate-400" />}
                        {leader.rank === 3 && <Award className="w-9 h-9 text-amber-700 fill-amber-700" />}
                        {leader.rank > 3 && (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                            #{leader.rank}
                          </div>
                        )}
                      </div>

                      {/* Provider Image */}
                      <div className="relative">
                        <img 
                          src={leader.image || "/default-avatar.png"} 
                          alt={leader.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/20" 
                        />
                        {leader.rank === 1 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                          {leader.name}
                        </h3>
                        <p className={`text-sm flex items-center justify-center md:justify-start gap-1 mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          <Briefcase className="w-3.5 h-3.5 text-orange-500" /> {leader.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-800">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        leader.badge === "Elite" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                        leader.badge === "Pro" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                      }`}>
                        {leader.badge}
                      </span>

                      <div className="flex items-center gap-1.5 font-bold text-orange-500">
                        <TrendingUp className="w-4 h-4" />
                        <span>{leader.points} pts</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}
