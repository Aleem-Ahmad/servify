"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, UploadCloud, Eye, EyeOff, User, Lock, Mail, ChevronRight, ArrowLeft, Shield, Wrench, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import "./auth.css";

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
    <div className={`auth-page ${dark ? "dark" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      
      {/* Animated Background Orbs */}
      <div className="auth-orb auth-orb--orange" />
      <div className="auth-orb auth-orb--purple" />

      {/* ── Top Bar ── */}
      <div className="auth-topbar">
        <Link href="/" className="auth-logo">
          Servify
        </Link>
        
        <div className="auth-controls">
          <button onClick={toggleTheme} className="auth-icon-btn">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}
            className="auth-lang-btn"
          >
            <Globe className="w-4 h-4" />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="auth-container">
        
        {/* Left: Hero Copy */}
        <div className="auth-hero">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-hero-badge"
          >
            <Shield className="w-4 h-4" /> Real-time OTP Verified Network
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="auth-hero-title"
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
            className="auth-hero-desc"
          >
            {isSignup 
              ? (isUrdu ? "ہمارے ساتھ شامل ہوں اور بہترین ماہرین کی خدمات حاصل کریں یا اپنی مہارت پیش کریں۔" : "Discover top local experts or monetize your technical expertise on the safest, OTP-secured platform.")
              : (isUrdu ? "اپنے اکاؤنٹ تک رسائی کے لیے اپنی اسناد درج کریں۔" : "Securely sign in to connect with service professionals and manage your bookings.")
            }
          </motion.p>
        </div>

        {/* Right: Auth Card */}
        <div className="auth-card">
          <div className="auth-card-glow" />

          <AnimatePresence mode="wait">
            {!isSignup ? (
              /* ─── LOGIN FORM ─── */
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
              >
                <div className="auth-form-header">
                  <h2 className="auth-form-title">{t("auth.login")}</h2>
                  <p className="auth-form-subtitle">Enter your registered credentials below</p>
                </div>

                <div className="auth-field-group">
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-icon w-5 h-5" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Gmail Address (e.g. name@gmail.com)"
                      onChange={handleInputChange} 
                      required
                      className="auth-input auth-input--icon"
                    />
                  </div>

                  <div className="auth-input-wrap">
                    <Lock className="auth-input-icon w-5 h-5" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Password"
                      onChange={handleInputChange} 
                      required
                      className="auth-input auth-input--icon auth-input--icon-right"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye-btn"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="auth-forgot">
                  <Link href="/forgot-password">
                    {t("auth.forgot")}
                  </Link>
                </div>

                <button 
                  type="submit" 
                  disabled={loadingAuth}
                  className="auth-btn auth-btn--primary"
                >
                  {loadingAuth ? "Signing in..." : t("auth.login")}
                </button>

                <p className="auth-toggle">
                  {t("auth.noAccount")}{" "}
                  <button 
                    type="button" 
                    onClick={() => { setIsSignup(true); setStep(1); }}
                    className="auth-toggle-btn"
                  >
                    {t("auth.signup")}
                  </button>
                </p>
              </motion.form>
            ) : (
              /* ─── SIGNUP STEPPER ─── */
              <motion.div 
                key="signup-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                
                {/* Step Header */}
                <div className="auth-step-header">
                  <div className="auth-step-info">
                    <h3>{t("auth.signup")}</h3>
                    <p className="auth-step-counter">Step {step} of {role === "provider" ? 7 : 5}</p>
                  </div>
                  
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(prev => prev - 1)}
                      className="auth-back-btn"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>

                {/* ── STEP 1: ROLE SELECT ── */}
                {step === 1 && (
                  <div>
                    <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px' }}>Choose Your Account Role</p>
                    <div className="auth-role-grid">
                      <button 
                        type="button" 
                        onClick={() => { setRole("customer"); setStep(2); }}
                        className="auth-role-card"
                      >
                        <div className="auth-role-icon auth-role-icon--customer">
                          <User className="w-6 h-6" />
                        </div>
                        <span className="auth-role-name">{t("auth.customer")}</span>
                        <span className="auth-role-desc">I want to hire local service pros</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => { setRole("provider"); setStep(2); }}
                        className="auth-role-card"
                      >
                        <div className="auth-role-icon auth-role-icon--provider">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <span className="auth-role-name">{t("auth.provider")}</span>
                        <span className="auth-role-desc">I want to sell my skill services</span>
                      </button>
                    </div>

                    <p className="auth-toggle">
                      {t("auth.haveAccount")}{" "}
                      <button type="button" onClick={() => setIsSignup(false)} className="auth-toggle-btn">
                        {t("auth.login")}
                      </button>
                    </p>
                  </div>
                )}

                {/* ── STEP 2: PERSONAL IDENTITY ── */}
                {step === 2 && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>{t("auth.personalInfo")}</h4>

                    <div className="auth-field-group">
                      <div className="auth-field-row">
                        <div className="auth-input-wrap">
                          <input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required className="auth-input" />
                          {isCheckingUsername && <span className="auth-field-checking">Checking uniqueness...</span>}
                          {usernameMessage && (
                            <span className={usernameMessage === "Username is available" ? "auth-field-success" : "auth-field-error"}>
                              {usernameMessage}
                            </span>
                          )}
                          {errors.username && <span className="auth-field-error">{errors.username}</span>}
                        </div>

                        <div className="auth-input-wrap">
                          <input name="name" placeholder={t("auth.fullName")} value={formData.name} onChange={handleInputChange} required className="auth-input" />
                          {errors.name && <span className="auth-field-error">{errors.name}</span>}
                        </div>
                      </div>

                      <div className="auth-input-wrap">
                        <input name="cnic" placeholder={t("auth.cnicPlaceholder")} value={formData.cnic} onChange={handleInputChange} required className="auth-input" />
                        {errors.cnic && <span className="auth-field-error">{errors.cnic}</span>}
                      </div>

                      <div className="auth-field-row">
                        <select name="gender" value={formData.gender} onChange={handleInputChange} required className="auth-select">
                          <option value="">{t("auth.selectGender")}</option>
                          <option value="Male">{t("auth.male")}</option>
                          <option value="Female">{t("auth.female")}</option>
                          <option value="Other">{t("auth.other")}</option>
                        </select>

                        <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} required className="auth-input" />
                      </div>

                      <div className="auth-field-row">
                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required className="auth-select">
                          <option value="">{t("auth.maritalStatus")}</option>
                          <option value="Single">{t("auth.single")}</option>
                          <option value="Married">{t("auth.married")}</option>
                        </select>

                        <select name="religion" value={formData.religion} onChange={handleInputChange} required className="auth-select">
                          <option value="">{t("auth.religion")}</option>
                          <option value="Islam">{t("auth.islam")}</option>
                          <option value="Christianity">{t("auth.christianity")}</option>
                          <option value="Hinduism">{t("auth.hinduism")}</option>
                          <option value="Other">{t("auth.other")}</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      disabled={!isStepValid()}
                      className="auth-btn auth-btn--primary"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 3: CONTACT & LOCATION ── */}
                {step === 3 && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>{t("auth.contactInfo")}</h4>

                    <div className="auth-field-group">
                      <div className="auth-input-wrap">
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8', zIndex: 2 }}>+92</span>
                        <input 
                          name="phone" placeholder={t("auth.phonePlaceholder")} value={formData.phone} onChange={handleInputChange} required 
                          className="auth-input" style={{ paddingLeft: '52px' }}
                        />
                        {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
                      </div>

                      <div className="auth-input-wrap">
                        <input name="email" type="email" placeholder={t("auth.emailPlaceholder")} value={formData.email} onChange={handleInputChange} required className="auth-input" />
                        {errors.email && <span className="auth-field-error">{errors.email}</span>}
                      </div>

                      <div className="auth-field-row">
                        <select name="district" value={formData.district} onChange={handleInputChange} required className="auth-select">
                          <option value="">{t("auth.selectDistrict")}</option>
                          <option value="Okara">{t("auth.okara")}</option>
                        </select>
                        <select name="tehseel" value={formData.tehseel} onChange={handleInputChange} required className="auth-select">
                          <option value="">{t("auth.selectTehseel")}</option>
                          <option value="Okara">{t("auth.okara")}</option>
                          <option value="Depalpur">{t("auth.depalpur")}</option>
                          <option value="Renala">{t("auth.renala")}</option>
                        </select>
                      </div>

                      <input name="address" placeholder={t("auth.addressPlaceholder")} value={formData.address} onChange={handleInputChange} required className="auth-input" />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(4)}
                      disabled={!isStepValid()}
                      className="auth-btn auth-btn--primary"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 4: SECURITY ── */}
                {step === 4 && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>{t("auth.security")}</h4>

                    <div className="auth-field-group">
                      <div className="auth-input-wrap">
                        <input 
                          name="password" type={showPassword ? "text" : "password"} placeholder={t("auth.setPassword")} value={formData.password} onChange={handleInputChange} required 
                          className="auth-input auth-input--icon-right"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {errors.password && <span className="auth-field-error">{errors.password}</span>}
                      </div>

                      <div className="auth-input-wrap">
                        <input 
                          name="confirmPassword" type={showPassword ? "text" : "password"} placeholder={t("auth.confirmPassword")} value={formData.confirmPassword} onChange={handleInputChange} required 
                          className="auth-input auth-input--icon-right"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setStep(5)}
                      disabled={!isStepValid()}
                      className="auth-btn auth-btn--primary"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 5: PROFILE PICTURE & SPECS ── */}
                {step === 5 && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>{t("auth.profile")}</h4>

                    <div className="auth-field-group">
                      <div className="auth-upload-area">
                        <label style={{ cursor: 'pointer' }}>
                          <div className="auth-upload-circle">
                            {previews.profile ? <img src={previews.profile} alt="Profile" /> : <UploadCloud className="w-6 h-6" style={{ color: 'var(--auth-orange)' }} />}
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile")} style={{ display: 'none' }} />
                        </label>
                        <div>
                          <div className="auth-upload-label">{t("auth.uploadPhoto") || "Profile Picture"}</div>
                          <div className="auth-upload-hint">Click the circle to upload your photo</div>
                        </div>
                      </div>

                      {role === "provider" && (
                        <>
                          <select name="providerType" value={formData.providerType} onChange={handleInputChange} required className="auth-select">
                            <option value="Individual">{t("auth.individual")}</option>
                            <option value="Company">{t("auth.company")}</option>
                            <option value="Agency">{t("auth.agency")}</option>
                          </select>
                          
                          <select name="category" value={formData.category} onChange={handleInputChange} required className="auth-select">
                            <option value="">{t("auth.selectCategory")}</option>
                            <option value="Electrician">{t("services.electrician")}</option>
                            <option value="Plumber">{t("services.plumber")}</option>
                            <option value="Cleaning">{t("services.cleaner")}</option>
                            <option value="Carpenter">{t("services.carpenter")}</option>
                            <option value="Gardener">{t("services.gardener")}</option>
                            <option value="Painter">{t("services.painter")}</option>
                          </select>
                          
                          <div className="auth-input-wrap">
                            <input name="experience" placeholder={t("auth.experiencePlaceholder")} value={formData.experience} onChange={handleInputChange} required className="auth-input" />
                            {errors.experience && <span className="auth-field-error">{errors.experience}</span>}
                          </div>
                        </>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        if (role === "customer") handleSignup();
                        else setStep(6);
                      }}
                      disabled={!isStepValid()}
                      className="auth-btn auth-btn--primary"
                    >
                      {role === "customer" ? (loadingAuth ? "Sending OTP..." : "Get OTP Verification") : "Continue"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── STEP 6: CNIC UPLOAD (Providers Only) ── */}
                {step === 6 && (
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>CNIC Card Verification</h4>
                    <p className="auth-form-subtitle" style={{ marginBottom: '20px' }}>{t("auth.uploadCnic")}</p>

                    <div className="auth-field-group">
                      <div className="auth-cnic-grid">
                        <div className="auth-cnic-box">
                          {previews.cnicFront ? (
                            <img src={previews.cnicFront} alt="CNIC Front" />
                          ) : (
                            <div className="auth-cnic-placeholder">
                              <UploadCloud className="w-7 h-7" />
                              <span>{t("auth.frontSide") || "CNIC Front Side"}</span>
                              <small>Click to Upload</small>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicFront")} />
                        </div>

                        <div className="auth-cnic-box">
                          {previews.cnicBack ? (
                            <img src={previews.cnicBack} alt="CNIC Back" />
                          ) : (
                            <div className="auth-cnic-placeholder">
                              <UploadCloud className="w-7 h-7" />
                              <span>{t("auth.backSide") || "CNIC Back Side"}</span>
                              <small>Click to Upload</small>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicBack")} />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleSignup}
                      disabled={loadingAuth || !isStepValid()}
                      className="auth-btn auth-btn--primary"
                    >
                      {loadingAuth ? "Sending OTP..." : t("auth.create")}
                    </button>
                  </div>
                )}

                {/* ── STEP 7: OTP VERIFICATION ── */}
                {step === 7 && (
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '8px' }}>Verify Email Address</h4>
                    <p className="auth-form-subtitle" style={{ marginBottom: '24px' }}>
                      We've sent a 6-digit security code to <strong>{formData.email}</strong>
                    </p>

                    <div className="auth-field-group">
                      <input 
                        type="text" 
                        placeholder="000000" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="auth-otp-input"
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || verifying || loadingAuth}
                      className="auth-btn auth-btn--primary"
                    >
                      {verifying || loadingAuth ? "Processing..." : "Verify & Complete Signup"}
                    </button>

                    <p style={{ fontSize: '0.8rem', marginTop: '16px' }}>
                      Didn't receive it?{" "}
                      <button type="button" onClick={handleSendOTP} className="auth-toggle-btn">
                        Resend OTP
                      </button>
                    </p>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
