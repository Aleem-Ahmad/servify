"use client";
import { useState } from "react";
import "@/styles/authentication.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, UploadCloud, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Authentication() {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { login, loginWithGoogle, signup } = useAuth();
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

  // Regex patterns (mirroring the backend)
  const patterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/,
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
      if (name === "username") error = "3-20 characters (letters, numbers, _)";
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
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Username uniqueness state
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Debounced username check
  useState(() => {
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
        setStep(6); // Move to final OTP step
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Network error");
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
        // alert("Email verified successfully!"); // Removed to make it smoother
        setIsVerified(true);
        // Instead of just setting verified, we now trigger the actual signup
        await processFinalSignup();
      } else {
        alert(data.message || "Invalid or expired code");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setVerifying(false);
    }
  };

  const processFinalSignup = async () => {
    setLoadingAuth(true);
    try {
      const result = await signup({ ...formData, role });
      if (result.success) {
        alert(role === "provider" 
          ? "Registration Successful! Your profile is pending admin verification." 
          : "Registration Successful! Please log in.");
        setIsSignup(false);
        setStep(1);
        // Reset form
        setFormData({ 
          name: "", email: "", password: "", confirmPassword: "", phone: "", 
          district: "Okara", tehseel: "", cnic: "", category: "", experience: "",
          gender: "", religion: "", maritalStatus: "", dob: "", address: "",
          providerType: "Individual"
        });
        setErrors({});
        setPreviews({ profile: null, cnicFront: null, cnicBack: null });
        setOtp("");
        setIsVerified(false);
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (err) {
      alert("Something went wrong during final registration.");
    } finally {
      setLoadingAuth(false);
    }
  };

  // Helper to check if a step is valid
  const isStepValid = () => {
    if (!isSignup) return true;

    if (step === 2) {
      return patterns.username.test(formData.username) &&
             usernameMessage === "Username is available" &&
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
        return formData.category && patterns.experience.test(formData.experience) && 
               previews.cnicFront && previews.cnicBack;
      }
      return true;
    }
    if (step === 6) {
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

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
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

  // ─── SIGNUP ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (!isStepValid()) return;
    
    // This now only triggers the OTP flow
    await handleSendOTP();
  };

  const dark = theme === "dark";

  return (
    <div
      className={`auth-container 
        ${isSignup ? "right-panel-active" : ""} 
        ${dark ? "dark" : ""}`}
    >
      {/* ================= TOP TOOLS ================= */}
      <div className="top-tools">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="icon-btn lang-btn" onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}>
          <Globe size={20} style={{ marginRight: "6px" }} /> {locale.toUpperCase()}
        </button>
      </div>

      {/* ================= SIGN IN ================= */}
      <div id="login" className="form-container sign-in-container">
        <form onSubmit={handleLogin}>
          <h1>{t("auth.login")}</h1>

          <input 
            type="email" 
            name="email" 
            placeholder="Gmail Address" 
            onChange={handleInputChange} 
            required 
          />
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              onChange={handleInputChange} 
              required 
            />
            <button 
              type="button" 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Link href="/forgot-password" title="Go to Forgot Password Page" className="link-left">
            {t("auth.forgot")}
          </Link>

          <button type="submit" disabled={loadingAuth}>
            {loadingAuth ? "Please wait..." : t("auth.login")}
          </button>

          <div className="social-login">
            <p>{t("auth.orContinueWith") || "Or continue with"}</p>
            <button 
              type="button" 
              className="google-btn" 
              onClick={loginWithGoogle}
              disabled={loadingAuth}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
              Google
            </button>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>
              * For Customers only
            </span>
          </div>

          <p className="switch-link">
            {t("auth.noAccount")}{" "}
            <span onClick={() => {
              setIsSignup(true);
              setStep(1);
            }}>
              {t("auth.signup")}
            </span>
          </p>
        </form>
      </div>

      {/* ================= SIGN UP ================= */}
      <div id="signup" className="form-container sign-up-container">
        <form onSubmit={handleSignup}>
          {step === 1 && (
            <>
              <h1>{t("auth.signup")}</h1>

              <div className="role-select">
                <button
                  type="button"
                  className={role === "customer" ? "active" : ""}
                  onClick={() => {
                    setRole("customer");
                    setStep(2);
                  }}
                >
                  {t("auth.customer")}
                </button>

                <button
                  type="button"
                  className={role === "provider" ? "active" : ""}
                  onClick={() => {
                    setRole("provider");
                    setStep(2);
                  }}
                >
                  {t("auth.provider")}
                </button>
              </div>

              <p className="switch-link">
                {t("auth.haveAccount")}{" "}
                <span onClick={() => setIsSignup(false)}>
                  {t("auth.login")}
                </span>
              </p>
            </>
          )}

          {/* STEP 2: PERSONAL IDENTITY */}
          {step === 2 && (
            <>
              <h2>{t("auth.personalInfo")}</h2>
              
              <div className="input-group">
                <input 
                  name="username" 
                  placeholder="Username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                />
                {isCheckingUsername && <span className="loader-text">Checking...</span>}
                {usernameMessage && (
                  <span className={`msg-text ${usernameMessage === "Username is available" ? "success" : "error"}`}>
                    {usernameMessage}
                  </span>
                )}
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

              <input 
                name="name" 
                placeholder={t("auth.fullName")} 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
              {errors.name && <span className="error-text">{errors.name}</span>}

              <input 
                name="cnic" 
                placeholder={t("auth.cnicPlaceholder")} 
                value={formData.cnic} 
                onChange={handleInputChange} 
                required 
              />
              {errors.cnic && <span className="error-text">{errors.cnic}</span>}

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">{t("auth.selectGender")}</option>
                  <option value="Male">{t("auth.male")}</option>
                  <option value="Female">{t("auth.female")}</option>
                  <option value="Other">{t("auth.other")}</option>
                </select>
                <input 
                  name="dob" 
                  type="date" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  required 
                  style={{ width: '50%' }} 
                  placeholder={t("auth.dob")}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">{t("auth.maritalStatus")}</option>
                  <option value="Single">{t("auth.single")}</option>
                  <option value="Married">{t("auth.married")}</option>
                </select>
                <select name="religion" value={formData.religion} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">{t("auth.religion")}</option>
                  <option value="Islam">{t("auth.islam")}</option>
                  <option value="Christianity">{t("auth.christianity")}</option>
                  <option value="Hinduism">{t("auth.hinduism")}</option>
                  <option value="Other">{t("auth.other")}</option>
                </select>
              </div>

              <div className="step-controls">
                <button type="button" onClick={() => setStep(1)}>{t("auth.back")}</button>
                <button type="button" onClick={() => setStep(3)} disabled={!isStepValid()}>{t("auth.next")}</button>
              </div>
            </>
          )}

          {/* STEP 3: CONTACT & LOCATION */}
          {/* STEP 3: CONTACT & LOCATION */}
          {step === 3 && (
            <>
              <h2>{t("auth.contactInfo")}</h2>
              <div className="phone-input-group" style={{ position: 'relative', width: '100%' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: dark ? '#8892b0' : '#7a7a7a' }}>+92</span>
                <input 
                  name="phone" 
                  placeholder={t("auth.phonePlaceholder")} 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  style={{ paddingLeft: '45px' }}
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}

              <input 
                name="email" 
                type="email" 
                placeholder={t("auth.emailPlaceholder")} 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
              {errors.email && <span className="error-text">{errors.email}</span>}

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="district" value={formData.district} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">{t("auth.selectDistrict")}</option>
                  <option value="Okara">{t("auth.okara")}</option>
                </select>
                <select name="tehseel" value={formData.tehseel} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">{t("auth.selectTehseel")}</option>
                  <option value="Okara">{t("auth.okara")}</option>
                  <option value="Depalpur">{t("auth.depalpur")}</option>
                  <option value="Renala">{t("auth.renala")}</option>
                </select>
              </div>
              <input 
                name="address" 
                placeholder={t("auth.addressPlaceholder")} 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
              />

              <div className="step-controls">
                <button type="button" onClick={() => setStep(2)}>{t("auth.back")}</button>
                <button 
                  type="button" 
                  onClick={() => setStep(4)} 
                  disabled={!isStepValid()}
                >
                  {t("auth.next")}
                </button>
              </div>
            </>
          )}

          {/* STEP 4: SECURITY */}
          {step === 4 && (
            <>
              <h2>{t("auth.security")}</h2>
              <div className="password-input-wrapper">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t("auth.setPassword")} 
                  value={formData.password}
                  onChange={handleInputChange} 
                  required 
                />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}

              <div className="password-input-wrapper">
                <input 
                  name="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder={t("auth.confirmPassword")} 
                  value={formData.confirmPassword}
                  onChange={handleInputChange} 
                  required 
                />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

              <div className="step-controls">
                <button type="button" onClick={() => setStep(3)}>{t("auth.back")}</button>
                <button type="button" onClick={() => setStep(5)} disabled={!isStepValid()}>{t("auth.next")}</button>
              </div>
            </>
          )}

          {/* STEP 5: PROFILE & PROFESSIONAL */}
          {step === 5 && (
            <>
              <h2>{t("auth.profile")}</h2>
              <div className="profile-preview-wrapper">
                <label className="circular-preview">
                  {previews.profile ? <img src={previews.profile} alt="Profile" /> : <UploadCloud size={32} className="placeholder-icon" />}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile")} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Upload Profile Picture</span>
              </div>

              {role === "provider" && (
                <>
                  <select name="providerType" value={formData.providerType} onChange={handleInputChange} required style={{ marginBottom: '10px' }}>
                    <option value="Individual">{t("auth.individual")}</option>
                    <option value="Company">{t("auth.company")}</option>
                    <option value="Agency">{t("auth.agency")}</option>
                  </select>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">{t("auth.selectCategory")}</option>
                    <option value="Electrician">{t("services.electrician")}</option>
                    <option value="Plumber">{t("services.plumber")}</option>
                    <option value="Cleaning">{t("services.cleaner")}</option>
                    <option value="Carpenter">{t("services.carpenter")}</option>
                    <option value="Gardener">{t("services.gardener")}</option>
                    <option value="Painter">{t("services.painter")}</option>
                  </select>
                  <input 
                    name="experience" 
                    type="text" 
                    placeholder={t("auth.experiencePlaceholder")} 
                    value={formData.experience} 
                    onChange={handleInputChange} 
                    required 
                  />
                  {errors.experience && <span className="error-text">{errors.experience}</span>}

                  <div className="cnic-upload-container">
                    <p className="upload-label" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>{t("auth.uploadCnic")}</p>
                    <div className="upload-zones">
                      <div className="upload-box" style={{ borderColor: previews.cnicFront ? 'var(--primary)' : '' }}>
                        {previews.cnicFront ? <img src={previews.cnicFront} alt="CNIC Front" className="preview-img-full" /> : <><UploadCloud size={24} className="upload-icon" /><span>{t("auth.frontSide")}</span></>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicFront")} />
                      </div>
                      <div className="upload-box" style={{ borderColor: previews.cnicBack ? 'var(--primary)' : '' }}>
                        {previews.cnicBack ? <img src={previews.cnicBack} alt="CNIC Back" className="preview-img-full" /> : <><UploadCloud size={24} className="upload-icon" /><span>{t("auth.backSide")}</span></>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicBack")} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="step-controls">
                <button type="button" onClick={() => setStep(4)}>{t("auth.back")}</button>
                <button type="submit" disabled={loadingAuth || !isStepValid()}>
                  {loadingAuth ? "Please wait..." : t("auth.create")}
                </button>
              </div>
            </>
          )}

          {/* STEP 6: OTP VERIFICATION */}
          {step === 6 && (
            <>
              <h2>Verify Email</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center', marginBottom: '15px' }}>
                We've sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
              <input 
                type="text" 
                placeholder="6-Digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px' }}
                required 
              />
              <div className="step-controls">
                <button type="button" onClick={() => setStep(5)}>{t("auth.back")}</button>
                <button 
                  type="button" 
                  onClick={handleVerifyOTP} 
                  disabled={otp.length !== 6 || verifying || loadingAuth}
                >
                  {verifying || loadingAuth ? "Processing..." : "Verify & Finish"}
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', marginTop: '10px', textAlign: 'center' }}>
                Didn't receive it? <span onClick={handleSendOTP} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Resend OTP</span>
              </p>
            </>
          )}
        </form>
      </div>

      {/* ================= OVERLAY ================= */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>{t("auth.welcomeBack")}</h1>
            <p>{t("auth.loginDesc")}</p>
            <button onClick={() => {
              setIsSignup(false);
              setStep(1);
            }}>
              {t("auth.login")}
            </button>
          </div>

          <div className="overlay-panel overlay-right">
            <h1>{t("auth.join")}</h1>
            <p>{t("auth.signupDesc")}</p>
            <button onClick={() => {
              setIsSignup(true);
              setStep(1);
            }}>
              {t("auth.signup")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
