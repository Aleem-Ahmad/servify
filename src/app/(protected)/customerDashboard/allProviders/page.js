"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Phone, Search, Award, X, CheckSquare, Zap, ChevronRight, Briefcase } from "lucide-react";

function AllProvidersContent() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ["All", "Electrician", "Plumber", "Cleaning", "Carpenter", "Gardener", "Painter"];
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (location) queryParams.append("location", location);
        
        const res = await fetch(`/api/providers?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProviders(data);
        }
      } catch (error) {
        console.error("Failed to fetch providers");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [search, location]);

  const filteredProviders = useMemo(() => {
    if (activeCategory === "All" || activeCategory === "") return providers;
    return providers.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory, providers]);

  return (
    <div className={`min-h-screen pt-28 pb-20 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      
      {/* ── HERO & FILTERS ── */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 font-bold text-sm mb-4 border border-orange-500/20">
          <Briefcase className="w-4 h-4" /> {isUrdu ? "ماہرین تلاش کریں" : "Find Experts"}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          {t("Our Top Professionals")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`text-lg max-w-2xl mx-auto mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {t("Select a category to find experts in that specific field.")}
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-6 py-3 rounded-full font-bold transition-all border ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white border-transparent shadow-lg shadow-orange-500/25 scale-105"
                  : dark ? "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-orange-500/50 hover:text-orange-400" : "bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-500"
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {t(cat)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No professionals found</h3>
            <p className={dark ? "text-slate-500" : "text-slate-500"}>Try adjusting your category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProviders.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedProvider(p)}
                  className={`rounded-[2rem] overflow-hidden border cursor-pointer group transition-shadow hover:shadow-2xl ${
                    dark ? "bg-slate-900 border-slate-800 shadow-black/40" : "bg-white border-slate-200 shadow-slate-200/50"
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={p.image || "/default-avatar.png"} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                      {p.category || "Professional"}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-black mb-1 group-hover:text-orange-500 transition-colors">{p.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <Star className="w-4 h-4 fill-yellow-500" /> {p.rating || "5.0"}
                      </div>
                      <span className="text-slate-400">•</span>
                      <div className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        {p.city || "Remote"}
                      </div>
                    </div>
                    
                    <div className="mb-6 flex items-end justify-between">
                      <div>
                        <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Starting at</p>
                        <p className="text-lg font-black text-orange-500">PKR {p.rate}</p>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Available
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customerDashboard/viewProvider?id=${p.id}`);
                      }}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        dark ? "bg-slate-800 group-hover:bg-orange-500 text-white" : "bg-slate-100 group-hover:bg-orange-500 group-hover:text-white text-slate-700"
                      }`}
                    >
                      {t("View Full Profile")} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedProvider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProvider(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl ${
                dark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
              }`}
            >
              <button 
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-orange-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                onClick={() => setSelectedProvider(null)}
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`md:w-2/5 p-10 flex flex-col items-center justify-center text-center ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                <div className="w-32 h-32 rounded-full border-4 border-orange-500 p-1 mb-6">
                  <img src={selectedProvider.image || "/default-avatar.png"} alt={selectedProvider.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <h2 className="text-3xl font-black mb-2">{selectedProvider.name}</h2>
                <div className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold mb-6">
                  {selectedProvider.category}
                </div>
                
                <div className="w-full space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-xl ${dark ? "bg-slate-900/50" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center gap-3 text-slate-500"><Award className="w-5 h-5 text-orange-500" /> Experience</div>
                    <div className="font-bold">{selectedProvider.experience || 0} {t("Years")}</div>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-xl ${dark ? "bg-slate-900/50" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center gap-3 text-slate-500"><MapPin className="w-5 h-5 text-orange-500" /> Location</div>
                    <div className="font-bold">{selectedProvider.city || "N/A"}</div>
                  </div>
                </div>
              </div>

              <div className="md:w-3/5 p-10 flex flex-col">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <CheckSquare className="w-6 h-6 text-orange-500" /> {t("Overview")}
                </h3>
                <p className={`leading-relaxed mb-8 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                  This is a verified professional on the Servify platform, offering top-tier services in their respective field. Book now to get instant assistance.
                </p>

                <div className={`mt-auto pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${dark ? "border-slate-800" : "border-slate-200"}`}>
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Service Rate</p>
                    <h2 className="text-3xl font-black text-orange-500">PKR {selectedProvider.rate}</h2>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => router.push(`/customerDashboard/viewProvider?id=${selectedProvider.id}`)}
                      className={`px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto text-center ${
                        dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => router.push(`/customerDashboard/complaintForm?provider=${selectedProvider.id}`)}
                      className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/25 w-full sm:w-auto text-center"
                    >
                      {t("Book Now")}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AllProviders() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AllProvidersContent />
    </Suspense>
  );
}