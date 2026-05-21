"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, UploadCloud, Eye, EyeOff, User, Lock, Mail, ChevronRight, ArrowLeft, Shield, Wrench, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Authentication() {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { login, signup } = useAuth();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    district: "Okara",
    tehseel: "",
    cnic: "",
    category: "",
    experience: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    dob: "",
    address: "",
    providerType: "Individual",
  });

  const [previews, setPreviews] = useState({
    profile: null,
    cnicFront: null,
    cnicBack: null
  });

  const patterns = {
    username: /^.{1,}$/,
    name: /^[a-zA-Z\s]{3,30}$/,
    email: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
    password: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
    phone: /^[1-9]\d{9}$/,
    district: /^[a-zA-Z\s]{3,20}$/,
    tehseel: /^[a-zA-Z\s]{3,20}$/,
    cnic: /^\d{5}-\d{7}-\d{1}$/,
    experience: /^.{10,500}$/,
    category: /^[a-zA-Z\s]{3,30}$/,
  };

  const validateField = (name, value) => {
    let error = "";
    if (patterns[name] && !patterns[name].test(value)) {
      if (name === "username") error = "Username is required";
      else if (name === "email") error = "Only @gmail.com addresses are allowed";
      else if (name === "password") error = "6+ chars, incl. letters and numbers";
      else if (name === "phone") error = "Format: 3xxxxxxxxx (10 digits, no leading 0)";
      else if (name === "cnic") error = "Format: xxxxx-xxxxxxx-x";
      else if (name === "name") error = "3-30 alphabetic characters";
      else if (name === "experience") error = "Minimum 10 characters required";
      else error = "Invalid format";
    }

    if (name === "confirmPassword" && value !== formData.password) {
      error = "Passwords do not match";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "cnic") {
      let val = value.replace(/\D/g, "");
      if (val.length > 13) val = val.slice(0, 13);
      let formatted = val;
      if (val.length > 5) formatted = val.slice(0, 5) + "-" + val.slice(5, 12);
      if (val.length > 12) formatted = formatted + "-" + val.slice(12, 13);
      finalValue = formatted;
    } else if (name === "phone") {
      let val = value.replace(/\D/g, "");
      if (val.length > 10) val = val.slice(0, 10);
      finalValue = val;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    validateField(name, finalValue);
  };

  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username && patterns.username.test(formData.username)) {
        setIsCheckingUsername(true);
        try {
          const res = await fetch(`/api/auth/check-username-unique?username=${formData.username}`);
          const data = await res.json();
          setUsernameMessage(data.message);
        } catch (err) {
          setUsernameMessage("Error checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        setUsernameMessage("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleSendOTP = async () => {
    if (!patterns.email.test(formData.email)) {
      alert("Please enter a valid Gmail address first");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (data.success) {
        alert("Verification code sent to your Gmail!");
        setStep(7);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("OTP Error:", err);
      alert("Connection error. Please check your internet and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert("Please enter 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otp })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        alert("Email verified successfully! You can now log in.");
        setIsSignup(false);
        setStep(1);
        setOtp("");
      } else {
        alert(data.message || "Invalid or expired code");
      }
    } catch (err) {
      console.error("Verify Error:", err);
      alert("Connection error during verification.");
    } finally {
      setVerifying(false);
    }
  };

  const isStepValid = () => {
    if (!isSignup) return true;

    if (step === 2) {
      const isUserValid = patterns.username.test(formData.username) && (usernameMessage === "Username is available" || usernameMessage === "");
      return isUserValid &&
        patterns.name.test(formData.name) &&
        patterns.cnic.test(formData.cnic) &&
        formData.gender && formData.dob &&
        formData.maritalStatus && formData.religion;
    }
    if (step === 3) {
      return patterns.phone.test(formData.phone) &&
        patterns.email.test(formData.email) &&
        formData.district && formData.tehseel &&
        formData.address;
    }
    if (step === 4) {
      return patterns.password.test(formData.password) &&
        formData.password === formData.confirmPassword;
    }
    if (step === 5) {
      if (role === "provider") {
        return formData.category && patterns.experience.test(formData.experience) && previews.profile;
      }
      return previews.profile;
    }
    if (step === 6) {
      if (role === "provider") {
        return previews.cnicFront && previews.cnicBack;
      }
      return true;
    }
    if (step === 7) {
      return isVerified;
    }
    return true;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
        setFormData(prev => ({ ...prev, [type]: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const role = result.user.role;
        if (role === "admin") window.location.href = "/adminDashboard";
        else if (role === "provider") window.location.href = "/providerDashboard";
        else window.location.href = "/customerDashboard";
      } else {
        alert(result.message || "Invalid email or password");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (!isStepValid()) return;

    setLoadingAuth(true);
    try {
      const result = await signup({ ...formData, role });
      if (result.success) {
        alert("Verification code sent to your Gmail!");
        setStep(7);
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup flow error:", err);
      alert("Network error. Please check your connection.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const dark = theme === "dark";
  const isUrdu = locale === "ur";

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 p-4 ${
      dark ? "bg-[#0a1128] text-slate-100" : "bg-white text-slate-900"
    }`} dir={isUrdu ? "rtl" : "ltr"}>
      
      {/* Decorative Glow Ambient Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* ================= TOP UTILITIES ================= */}
      <div className="absolute top-6 right-6 left-6 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center group">
          <span 
            style={{ fontFamily: 'var(--font-great-vibes)', fontStyle: 'normal' }}
            className="text-4xl font-normal tracking-wide bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform"
          >
            Servify
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
              dark ? "bg-slate-900 border-slate-800 text-yellow-500 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
            className={`px-4 h-10 rounded-full flex items-center gap-2 border font-bold text-xs transition-all ${
              dark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Globe className="w-4 h-4 text-orange-500" />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pt-20 pb-10">
        
        {/* Left Grid: Copywriting & Theme Intro */}
        <div className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex self-center lg:self-start items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 font-bold text-sm border border-orange-500/20"
          >
            <Shield className="w-4 h-4" /> Real-time OTP Verified Network
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            {isSignup 
              ? (isUrdu ? "نئے سفر کا آغاز کریں" : "Join Servify Community") 
              : (isUrdu ? "اپنے اکاؤنٹ میں لاگ ان کریں" : "Welcome Back To Servify")
            }
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg leading-relaxed max-w-md mx-auto lg:mx-0 ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {isSignup 
              ? (isUrdu ? "ہمارے ساتھ شامل ہوں اور بہترین ماہرین کی خدمات حاصل کریں یا اپنی مہارت پیش کریں۔" : "Discover top local experts or monetize your technical expertise on the safest, OTP-secured platform.")
              : (isUrdu ? "اپنے اکاؤنٹ تک رسائی کے لیے اپنی اسناد درج کریں۔" : "Securely sign in to connect with service professionals and manage your bookings.")
            }
          </motion.p>
        </div>

        {/* Right Grid: Glassmorphic Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={`lg:col-span-7 rounded-[2.5rem] p-8 md:p-12 border shadow-2xl relative overflow-hidden backdrop-blur-md ${
            dark ? "bg-slate-900/60 border-slate-800/80 shadow-black/20" : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
          }`}
        >
          {/* Subtle inside ambient accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {!isSignup ? (
              // ─── LOGIN FORM ───
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div className="space-y-2 text-center lg:text-left">
                  <h2 className="text-3xl font-black">{t("auth.login")}</h2>
                  <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>Enter your registered credentials below</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Gmail Address (e.g. name@gmail.com)"
                      onChange={handleInputChange} 
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all ${
                        dark ? "bg-slate-800/30 border-slate-800 text-white focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500"
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Password"
                      onChange={handleInputChange} 
                      required
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl outline-none border transition-all ${
                        dark ? "bg-slate-800/30 border-slate-800 text-white focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500"
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-bold text-orange-500 hover:underline">
                    {t("auth.forgot")}
                  </Link>
                </div>

                <button 
                  type="submit" 
                  disabled={loadingAuth}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {loadingAuth ? "Signing in..." : t("auth.login")}
                </button>

                <p className={`text-center text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {t("auth.noAccount")}{" "}
                  <button 
                    type="button" 
                    onClick={() => { setIsSignup(true); setStep(1); }}
                    className="font-bold text-orange-500 hover:underline"
                  >
                    {t("auth.signup")}
                  </button>
                </p>
              </motion.form>
            ) : (
              // ─── SIGNUP STEPPER ───
              <motion.div 
                key="signup-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                
                {/* Step Indicators */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-2xl font-black">{t("auth.signup")}</h3>
                    <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Step {step} of {role === "provider" ? 7 : 5}</p>
                  </div>
                  
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(prev => prev - 1)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                        dark ? "border-slate-800 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>

                {/* ── STEP 1: ROLE SELECT ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <p className="text-center font-bold text-lg">Choose Your Account Role</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => { setRole("customer"); setStep(2); }}
                        className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${
                          dark ? "bg-slate-800/30 border-slate-800 hover:border-orange-500/50" : "bg-slate-50 border-slate-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <User className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-lg">{t("auth.customer")}</span>
                        <span className="text-xs text-slate-400 text-center">I want to hire local service pros</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => { setRole("provider"); setStep(2); }}
                        className={`p-6 rounded-3xl border flex flex-col items-center gap-3 transition-all ${
                          dark ? "bg-slate-800/30 border-slate-800 hover:border-orange-500/50" : "bg-slate-50 border-slate-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-lg">{t("auth.provider")}</span>
                        <span className="text-xs text-slate-400 text-center">I want to sell my skill services</span>
                      </button>
                    </div>

                    <p className="text-center text-sm">
                      {t("auth.haveAccount")}{" "}
                      <button type="button" onClick={() => setIsSignup(false)} className="font-bold text-orange-500 hover:underline">
                        {t("auth.login")}
                      </button>
                    </p>
                  </div>
                )}

                {/* ── STEP 2: PERSONAL IDENTITY ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base">{t("auth.personalInfo")}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <input 
                          name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required 
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {isCheckingUsername && <span className="text-[10px] text-slate-400 animate-pulse">Checking uniqueness...</span>}
                        {usernameMessage && (
                          <span className={`text-[10px] font-bold ${usernameMessage === "Username is available" ? "text-emerald-500" : "text-red-500"}`}>
                            {usernameMessage}
                          </span>
                        )}
                        {errors.username && <span className="text-[10px] text-red-500">{errors.username}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <input 
                          name="name" placeholder={t("auth.fullName")} value={formData.name} onChange={handleInputChange} required 
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {errors.name && <span className="text-[10px] text-red-500">{errors.name}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <input 
                          name="cnic" placeholder={t("auth.cnicPlaceholder")} value={formData.cnic} onChange={handleInputChange} required 
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {errors.cnic && <span className="text-[10px] text-red-500">{errors.cnic}</span>}
                      </div>

                      <select 
                        name="gender" value={formData.gender} onChange={handleInputChange} required
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      >
                        <option value="">{t("auth.selectGender")}</option>
                        <option value="Male">{t("auth.male")}</option>
                        <option value="Female">{t("auth.female")}</option>
                        <option value="Other">{t("auth.other")}</option>
                      </select>

                      <input 
                        name="dob" type="date" value={formData.dob} onChange={handleInputChange} required 
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      />

                      <select 
                        name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      >
                        <option value="">{t("auth.maritalStatus")}</option>
                        <option value="Single">{t("auth.single")}</option>
                        <option value="Married">{t("auth.married")}</option>
                      </select>

                      <select 
                        name="religion" value={formData.religion} onChange={handleInputChange} required
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      >
                        <option value="">{t("auth.religion")}</option>
                        <option value="Islam">{t("auth.islam")}</option>
                        <option value="Christianity">{t("auth.christianity")}</option>
                        <option value="Hinduism">{t("auth.hinduism")}</option>
                        <option value="Other">{t("auth.other")}</option>
                      </select>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      disabled={!isStepValid()}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 3: CONTACT & LOCATION ── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base">{t("auth.contactInfo")}</h4>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+92</span>
                        <input 
                          name="phone" placeholder={t("auth.phonePlaceholder")} value={formData.phone} onChange={handleInputChange} required 
                          className={`w-full pl-14 pr-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {errors.phone && <span className="text-[10px] text-red-500">{errors.phone}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <input 
                          name="email" type="email" placeholder={t("auth.emailPlaceholder")} value={formData.email} onChange={handleInputChange} required 
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {errors.email && <span className="text-[10px] text-red-500">{errors.email}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <select 
                          name="district" value={formData.district} onChange={handleInputChange} required
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        >
                          <option value="">{t("auth.selectDistrict")}</option>
                          <option value="Okara">{t("auth.okara")}</option>
                        </select>
                        <select 
                          name="tehseel" value={formData.tehseel} onChange={handleInputChange} required
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        >
                          <option value="">{t("auth.selectTehseel")}</option>
                          <option value="Okara">{t("auth.okara")}</option>
                          <option value="Depalpur">{t("auth.depalpur")}</option>
                          <option value="Renala">{t("auth.renala")}</option>
                        </select>
                      </div>

                      <input 
                        name="address" placeholder={t("auth.addressPlaceholder")} value={formData.address} onChange={handleInputChange} required 
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(4)}
                      disabled={!isStepValid()}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 4: SECURITY ── */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base">{t("auth.security")}</h4>

                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          name="password" type={showPassword ? "text" : "password"} placeholder={t("auth.setPassword")} value={formData.password} onChange={handleInputChange} required 
                          className={`w-full pl-4 pr-12 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <span className="text-[10px] text-red-500">{errors.password}</span>}

                      <div className="relative">
                        <input 
                          name="confirmPassword" type={showPassword ? "text" : "password"} placeholder={t("auth.confirmPassword")} value={formData.confirmPassword} onChange={handleInputChange} required 
                          className={`w-full pl-4 pr-12 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="text-[10px] text-red-500">{errors.confirmPassword}</span>}
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(5)}
                      disabled={!isStepValid()}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 5: PROFILE PICTURE & SPECS ── */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base">{t("auth.profile")}</h4>

                    <div className="flex items-center gap-4 p-4 border border-dashed rounded-2xl dark:border-slate-800 dark:bg-slate-950/30">
                      <label className="relative cursor-pointer group flex-shrink-0">
                        <div className="w-16 h-16 rounded-full border-2 border-orange-500/30 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          {previews.profile ? <img src={previews.profile} alt="Profile" className="w-full h-full object-cover" /> : <UploadCloud className="w-6 h-6 text-orange-500" />}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile")} className="hidden" />
                      </label>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-extrabold">{t("auth.uploadPhoto") || "Profile Picture"}</span>
                        <span className="text-xs text-slate-400">Click the circle to upload your photo</span>
                      </div>
                    </div>

                    {role === "provider" && (
                      <div className="space-y-4">
                        <select 
                          name="providerType" value={formData.providerType} onChange={handleInputChange} required
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        >
                          <option value="Individual">{t("auth.individual")}</option>
                          <option value="Company">{t("auth.company")}</option>
                          <option value="Agency">{t("auth.agency")}</option>
                        </select>
                        
                        <select 
                          name="category" value={formData.category} onChange={handleInputChange} required
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        >
                          <option value="">{t("auth.selectCategory")}</option>
                          <option value="Electrician">{t("services.electrician")}</option>
                          <option value="Plumber">{t("services.plumber")}</option>
                          <option value="Cleaning">{t("services.cleaner")}</option>
                          <option value="Carpenter">{t("services.carpenter")}</option>
                          <option value="Gardener">{t("services.gardener")}</option>
                          <option value="Painter">{t("services.painter")}</option>
                        </select>
                        
                        <input 
                          name="experience" placeholder={t("auth.experiencePlaceholder")} value={formData.experience} onChange={handleInputChange} required 
                          className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${dark ? "bg-slate-800/30 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                        />
                        {errors.experience && <span className="text-[10px] text-red-500">{errors.experience}</span>}
                      </div>
                    )}

                    <button 
                      type="button" 
                      onClick={() => {
                        if (role === "customer") handleSignup();
                        else setStep(6);
                      }}
                      disabled={!isStepValid()}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {role === "customer" ? (loadingAuth ? "Sending OTP..." : "Get OTP Verification") : "Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 6: CNIC UPLOAD (Providers Only) ── */}
                {step === 6 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base">CNIC Card Verification</h4>
                    <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{t("auth.uploadCnic")}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative border-2 border-dashed rounded-3xl overflow-hidden h-36 flex flex-col items-center justify-center dark:border-slate-800 bg-slate-950/20">
                        {previews.cnicFront ? (
                          <img src={previews.cnicFront} alt="CNIC Front" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <img src="/CNIC_FRONT.jpeg" alt="CNIC Front Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                            <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
                              <UploadCloud className="w-7 h-7 text-orange-500 drop-shadow" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 drop-shadow-sm">{t("auth.frontSide") || "CNIC Front Side"}</span>
                              <span className="text-[9px] text-slate-400">Click to Upload</span>
                            </div>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicFront")} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      </div>

                      <div className="relative border-2 border-dashed rounded-3xl overflow-hidden h-36 flex flex-col items-center justify-center dark:border-slate-800 bg-slate-950/20">
                        {previews.cnicBack ? (
                          <img src={previews.cnicBack} alt="CNIC Back" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <img src="/CNIC_BACK.jpeg" alt="CNIC Back Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                            <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
                              <UploadCloud className="w-7 h-7 text-orange-500 drop-shadow" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 drop-shadow-sm">{t("auth.backSide") || "CNIC Back Side"}</span>
                              <span className="text-[9px] text-slate-400">Click to Upload</span>
                            </div>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicBack")} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleSignup}
                      disabled={loadingAuth || !isStepValid()}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold transition-all disabled:opacity-50"
                    >
                      {loadingAuth ? "Sending OTP..." : t("auth.create")}
                    </button>
                  </div>
                )}

                {/* ── STEP 7: OTP VERIFICATION ── */}
                {step === 7 && (
                  <div className="space-y-6 text-center">
                    <h4 className="font-bold text-xl">Verify Email Address</h4>
                    <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      We've sent a 6-digit security code to <strong>{formData.email}</strong>
                    </p>

                    <input 
                      type="text" 
                      placeholder="6-Digit OTP" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`w-full text-center text-3xl font-bold tracking-[0.2em] py-4 rounded-2xl border outline-none transition-all ${
                        dark ? "bg-slate-800/30 border-slate-800 text-white focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-orange-500"
                      }`}
                    />

                    <button 
                      type="button" 
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || verifying || loadingAuth}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                    >
                      {verifying || loadingAuth ? "Processing..." : "Verify & Complete Signup"}
                    </button>

                    <p className="text-xs">
                      Didn't receive it?{" "}
                      <button type="button" onClick={handleSendOTP} className="text-orange-500 font-bold hover:underline">
                        Resend OTP
                      </button>
                    </p>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

      </div>
    </div>
  );
}
