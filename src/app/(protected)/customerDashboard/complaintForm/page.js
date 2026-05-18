"use client";

import { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, MapPin, User, ShieldCheck, 
  Zap, CheckCircle2, Lock, Star, Wrench
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Services", desc: "Select category & detail your issue" },
  { id: 2, label: "Details", desc: "Your contact and location info" },
  { id: 3, label: "Provider", desc: "Choose expert & verify service" },
];

function BookingFormContent() {
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  const [allProviders, setAllProviders] = useState([]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [providerChosen, setProviderChosen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "",
    problem: "",
    name: "",
    phone: "",
    address: "",
    location: "",
    otpInput: "",
  });

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setAllProviders(data);
        
        const pId = searchParams.get("provider");
        if (pId) {
          const found = data.find(p => p.id === pId);
          if (found) {
            setProviderChosen(found);
            setFormData(prev => ({ ...prev, category: found.category }));
          }
        }
      }
    };
    fetchProviders();
  }, [searchParams]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && !formData.category) {
      setFormData(prev => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || ""
        }));
    }
  }, [user]);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateOtp = () => {
    setIsGeneratingOtp(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setOtp(generatedOtp);
      setFormData(prev => ({ ...prev, otpInput: generatedOtp })); 
      setIsGeneratingOtp(false);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please generate a verification code first.");
    if (formData.otpInput !== otp) return alert("Invalid OTP. Please check.");

    setIsSubmitting(true);
    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user?.id,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                location: formData.location,
                category: formData.category,
                description: formData.problem,
                providerId: providerChosen?.id,
                providerName: providerChosen?.name,
                price: providerChosen?.rate,
                date: new Date().toISOString()
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Booking confirmed! The professional has been notified.");
            router.push("/customerDashboard");
        } else {
            alert("Booking failed: " + data.message);
        }
    } catch (error) {
        alert("An error occurred during booking.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      });
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 pt-24 pb-20 ${dark ? "bg-[#050a14]" : "bg-slate-50"}`} dir={isUrdu ? "rtl" : "ltr"}>
      
      <div className={`w-full max-w-5xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl ${
        dark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
      }`}>
        
        {/* ── LEFT PANEL (HERO) ── */}
        <div className="md:w-2/5 p-10 flex flex-col justify-between text-white relative overflow-hidden" 
             style={{ background: "linear-gradient(135deg, #ff7a00, #ff4500)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            <ShieldCheck className="w-12 h-12 mb-6 opacity-90" />
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              {isUrdu ? "اپنی سروس بک کریں" : "Book Your Service"}
            </h2>
            <p className="opacity-90 leading-relaxed mb-10">
              {providerChosen 
                ? `${t("Booking with")} ${providerChosen.name}` 
                : t("Tell us what you need, and we'll connect you with professional experts.")}
            </p>

            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-opacity duration-300 ${step === s.id ? "opacity-100" : step > s.id ? "opacity-60" : "opacity-40"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 ${
                    step === s.id ? "bg-white text-orange-600 border-white" : "border-white/50 text-white"
                  }`}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                  </div>
                  <div>
                    <h4 className="font-bold">{t(s.label)}</h4>
                    <p className="text-xs opacity-80">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mt-12 flex items-center gap-2 text-sm font-semibold opacity-90 bg-black/10 w-max px-4 py-2 rounded-full">
            <Zap className="w-4 h-4" /> {t("Verified Professionals Only")}
          </div>
        </div>

        {/* ── RIGHT PANEL (FORM) ── */}
        <div className="md:w-3/5 p-10 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CATEGORY & PROBLEM */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <h3 className={`text-2xl font-bold flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <Wrench className="w-6 h-6 text-orange-500" /> {t("Select Service")}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("Category")}
                    </label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      disabled={!!providerChosen}
                      className={`w-full p-4 rounded-2xl outline-none transition-all ${
                        providerChosen 
                          ? dark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                          : dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"
                      }`}
                    >
                      <option value="">{t("-- Select category --")}</option>
                      <option value="Plumbing">{t("Plumbing")}</option>
                      <option value="Electrician">{t("Electrician")}</option>
                      <option value="Cleaning">{t("Cleaning")}</option>
                      <option value="Carpenter">{t("Carpenter")}</option>
                      <option value="Painter">{t("Painter")}</option>
                      <option value="Gardener">{t("Gardener")}</option>
                    </select>
                    {providerChosen && (
                      <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t("Category locked for selected provider")}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("Describe the Issue")}
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleChange}
                      placeholder={t("e.g. Broken pipe in kitchen, Ceiling fan repair...")}
                      rows={4}
                      className={`w-full p-4 rounded-2xl outline-none resize-none transition-all ${
                        dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTACT DETAILS */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <h3 className={`text-2xl font-bold flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <User className="w-6 h-6 text-orange-500" /> {t("Your Details")}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("Full Name")}
                    </label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange} 
                      className={`w-full p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("Phone")}
                    </label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="03XXXXXXXXX" 
                      className={`w-full p-4 rounded-2xl outline-none transition-all ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-bold mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("Complete Address")}
                  </label>
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleChange} 
                    className={`w-full p-4 rounded-2xl outline-none transition-all mb-4 ${dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"}`}
                  />
                  <button 
                    type="button" 
                    onClick={shareLocation}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.location 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                        : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                    }`}
                  >
                    <MapPin className="w-5 h-5" /> 
                    {formData.location ? t("Location Linked") : t("Share Live Location")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OTP & CONFIRM */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <h3 className={`text-2xl font-bold flex items-center gap-3 ${dark ? "text-white" : "text-slate-900"}`}>
                  <ShieldCheck className="w-6 h-6 text-orange-500" /> {t("Verification")}
                </h3>
                
                {/* Provider Selection Box */}
                <div className={`p-5 rounded-2xl border ${dark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  {providerChosen ? (
                    <div className="flex items-center gap-4">
                      <img src={providerChosen.image || "/default-avatar.png"} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30" />
                      <div>
                        <h4 className="font-bold text-lg">{providerChosen.name}</h4>
                        <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          {providerChosen.category} • PKR {providerChosen.rate}
                        </p>
                      </div>
                      <div className="ml-auto text-yellow-500 flex items-center gap-1 font-bold">
                        <Star className="w-4 h-4 fill-yellow-500" /> {providerChosen.rating || "5.0"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm font-bold mb-3 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                        {t("Choose your professional:")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {allProviders.filter(p => !formData.category || p.category === formData.category).slice(0,3).map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setProviderChosen(p)}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                              providerChosen?.id === p.id 
                                ? "border-orange-500 bg-orange-500/10 text-orange-500 font-bold" 
                                : dark ? "border-slate-700 hover:border-slate-500 text-slate-300" : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {p.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* OTP Box */}
                <div className={`p-6 rounded-2xl border text-center ${dark ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  {!otp ? (
                    <button 
                      type="button" 
                      onClick={handleGenerateOtp} 
                      disabled={isGeneratingOtp || !providerChosen}
                      className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
                    >
                      {isGeneratingOtp ? t("Generating Code...") : t("Get Verification OTP")}
                    </button>
                  ) : (
                    <div>
                      <p className="text-emerald-500 font-bold mb-2 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> {t("Verification Code Sent")}
                      </p>
                      <div className="text-4xl font-black tracking-[0.2em] text-orange-500 my-4">
                        {otp}
                      </div>
                      <input
                        type="text"
                        name="otpInput"
                        value={formData.otpInput}
                        readOnly
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── BOTTOM NAVIGATION ── */}
          <div className={`mt-auto pt-8 flex gap-4 ${step === 1 ? "justify-end" : "justify-between"}`}>
            {step > 1 && (
              <button 
                type="button" 
                onClick={handlePrev}
                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> {t("Back")}
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={step === 1 && (!formData.category || !formData.problem)}
                className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
              >
                {t("Continue")} <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={!otp || !providerChosen || isSubmitting}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
              >
                {isSubmitting ? t("Processing...") : t("Book Service Now")}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}