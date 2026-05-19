"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { 
  Star, ShieldCheck, Award, Medal, Zap, MapPin, 
  Phone, Mail, MessageSquare, Clock, ArrowLeft, Calendar, User
} from "lucide-react";
import BookingModal from "@/components/SharedComponents/BookingModal";

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star 
          key={s} 
          className={`w-4 h-4 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-700"}`} 
        />
      ))}
    </div>
  );
}

function ViewProviderContent() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const isUrdu = locale === "ur";
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("id");

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }
    const fetchData = async () => {
      try {
        const provRes = await fetch(`/api/providers?id=${providerId}`);
        if (provRes.ok) {
          const provData = await provRes.json();
          setProvider(provData);
        }
        const revRes = await fetch(`/api/feedback?providerId=${providerId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }
      } catch (e) {
        console.error("Failed to load provider data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [providerId]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className={`min-h-screen pt-28 flex justify-center ${dark ? "bg-[#050a14]" : "bg-slate-50"}`}>
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!provider) return (
    <div className={`min-h-screen pt-28 flex flex-col items-center gap-4 ${dark ? "bg-[#050a14] text-white" : "bg-slate-50 text-slate-900"}`}>
      <User className="w-16 h-16 text-slate-400" />
      <h2 className="text-2xl font-bold">Provider not found</h2>
      <button onClick={() => router.back()} className="text-orange-500 font-bold">Go Back</button>
    </div>
  );

  const badge = provider.badge || "Verified";

  return (
    <div className={`min-h-screen pt-24 pb-20 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-6">
        
        <button 
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm font-bold mb-6 transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft className="w-4 h-4" /> {t("Back")}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── LEFT PANEL (Profile Overview) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`w-full lg:w-[400px] flex-shrink-0 rounded-[2rem] border overflow-hidden shadow-2xl relative ${
              dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="h-32 bg-gradient-to-br from-orange-500 to-orange-400 relative">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30 flex items-center gap-1">
                {badge === 'Elite' && <Medal className="w-3.5 h-3.5" />}
                {badge === 'Pro' && <Award className="w-3.5 h-3.5" />}
                {badge === 'Verified' && <ShieldCheck className="w-3.5 h-3.5" />}
                {badge} {isUrdu ? "ماہر" : "Pro"}
              </div>
            </div>
            
            <div className="px-8 pb-8 flex flex-col items-center text-center -mt-16 relative z-10">
              <div className={`w-32 h-32 rounded-full border-4 overflow-hidden mb-4 ${dark ? "border-slate-900 bg-slate-800" : "border-white bg-slate-100"}`}>
                <img 
                  src={provider.image || `https://i.pravatar.cc/150?u=${provider.email}`} 
                  alt={provider.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <h1 className="text-3xl font-black mb-1">{provider.name}</h1>
              <p className={`text-sm font-bold uppercase tracking-wider mb-4 ${dark ? "text-orange-400" : "text-orange-600"}`}>
                {provider.category}
              </p>

              <div className={`flex items-center gap-4 py-3 px-6 rounded-2xl mb-6 w-full justify-center ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                {avgRating ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <StarRow rating={Math.round(parseFloat(avgRating))} />
                      <span className="font-bold text-yellow-500">{avgRating}</span>
                    </div>
                    <span className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>{reviews.length} {t("Reviews")}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                      <Star className="w-4 h-4 fill-yellow-500" /> {provider.trustScore || 100}%
                    </div>
                    <span className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>Trust Score</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => router.push(`/customerDashboard/complaintForm?provider=${providerId}`)}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02]"
              >
                <Zap className="w-5 h-5" /> {t("Book Service Now")}
              </button>

              <div className="w-full mt-8 space-y-4 text-sm text-left">
                {provider.phone && (
                  <div className={`flex items-center gap-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Phone className="w-4 h-4" /></div>
                    {provider.phone}
                  </div>
                )}
                {provider.city && (
                  <div className={`flex items-center gap-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><MapPin className="w-4 h-4" /></div>
                    {provider.city}{provider.district ? `, ${provider.district}` : ''}
                  </div>
                )}
                {provider.email && (
                  <div className={`flex items-center gap-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Mail className="w-4 h-4" /></div>
                    {provider.email}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT PANEL (Details & Reviews) ── */}
          <div className="flex-1 space-y-8">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-8 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-orange-500" /> {t("Professional Overview")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>{t("Services Offered")}</h4>
                  <ul className="space-y-2">
                    {(provider.services || [provider.category]).filter(Boolean).map((svc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {svc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>{t("Experience")}</h4>
                  <p className="text-sm font-medium">{provider.experience || `3+ Years in ${provider.category}`}</p>
                </div>

                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>{t("Schedule")}</h4>
                  <p className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> 9:00 AM – 6:00 PM (Mon-Sat)</p>
                </div>

                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>{t("Pricing")}</h4>
                  <p className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> Starting at PKR {provider.rate || 500}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-8 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-500" /> {t("Client Reviews")}
                </h3>
                {avgRating && (
                  <div className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold text-sm">
                    <Star className="w-4 h-4 fill-blue-500" /> {avgRating}
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed ${dark ? "border-slate-700 bg-slate-800/30" : "border-slate-300 bg-slate-50"}`}>
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-3 opacity-50" />
                  <p className={`font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>No reviews yet. Be the first to leave feedback!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev._id} className={`p-6 rounded-2xl border ${dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">{rev.customerName || "Anonymous User"}</p>
                          <div className="mt-1"><StarRow rating={rev.rating} /></div>
                        </div>
                        <span className={`text-xs font-semibold ${dark ? "text-slate-500" : "text-slate-400"}`}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      {rev.comment && <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          provider={{ ...provider, id: providerId }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

export default function ViewProvider() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ViewProviderContent />
    </Suspense>
  );
}