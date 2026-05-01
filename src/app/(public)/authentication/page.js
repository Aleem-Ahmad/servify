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
  const { login, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
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
    providerType: "Individual", // Default for providers
  });

  const [previews, setPreviews] = useState({
    profile: null,
    cnicFront: null,
    cnicBack: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cnic") {
      // Format CNIC: xxxxx-xxxxxxx-x
      let val = value.replace(/\D/g, "");
      if (val.length > 13) val = val.slice(0, 13);
      let formatted = val;
      if (val.length > 5) formatted = val.slice(0, 5) + "-" + val.slice(5);
      if (val.length > 12) formatted = formatted.slice(0, 13) + "-" + formatted.slice(13);
      setFormData({ ...formData, cnic: formatted });
    } else if (name === "phone") {
      // Format Phone: +92xxxxxxxxxx (10 digits input)
      let val = value.replace(/\D/g, "");
      if (val.startsWith("0")) val = val.slice(1);
      if (val.length > 10) val = val.slice(0, 10);
      setFormData({ ...formData, phone: val });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
        setFormData(prev => ({ ...prev, [type]: file })); // Store file object or base64 as per backend needs
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      // login() is async — must await it to get the result
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on role
        const role = result.user.role;
        if (role === "admin") {
          window.location.href = "/adminDashboard";
        } else if (role === "provider") {
          window.location.href = "/providerDashboard";
        } else {
          window.location.href = "/customerDashboard";
        }
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
    e.preventDefault();
    setLoadingAuth(true);
    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        setLoadingAuth(false);
        return;
      }

      if (role === "provider" && (!formData.category || !formData.cnicFront || !formData.cnicBack)) {
        alert("Please provide all required professional details and CNIC photos.");
        setLoadingAuth(false);
        return;
      }

      const result = await signup({ ...formData, role });
      if (result.success) {
        alert(role === "provider" 
          ? "Registration Successful! Your profile is pending admin verification." 
          : "Registration Successful! Please log in.");
        setIsSignup(false);
        setStep(1);
        setFormData({ 
          name: "", email: "", password: "", confirmPassword: "", phone: "", 
          district: "Okara", tehseel: "", cnic: "", category: "", experience: "",
          gender: "", religion: "", maritalStatus: "", dob: "", address: "",
          providerType: "Individual"
        });
        setPreviews({ profile: null, cnicFront: null, cnicBack: null });
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingAuth(false);
    }
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
              <input 
                name="name" 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
              <input 
                name="cnic" 
                placeholder="CNIC (xxxxx-xxxxxxx-x)" 
                value={formData.cnic} 
                onChange={handleInputChange} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  name="dob" 
                  type="date" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  required 
                  style={{ width: '50%' }} 
                  placeholder="Date of Birth"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
                <select name="religion" value={formData.religion} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Religion</option>
                  <option value="Islam">Islam</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="step-controls">
                <button type="button" onClick={() => setStep(1)}>{t("auth.back")}</button>
                <button type="button" onClick={() => setStep(3)}>{t("auth.next")}</button>
              </div>
            </>
          )}

          {/* STEP 3: CONTACT & LOCATION */}
          {step === 3 && (
            <>
              <h2>{t("auth.contactInfo")}</h2>
              <div className="phone-input-group" style={{ position: 'relative', width: '100%' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: dark ? '#8892b0' : '#7a7a7a' }}>+92</span>
                <input 
                  name="phone" 
                  placeholder="Enter Phone (3xxxxxxxxx)" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  style={{ paddingLeft: '45px' }}
                />
              </div>
              <input 
                name="email" 
                type="email" 
                placeholder="Gmail Address" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="district" value={formData.district} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Select District</option>
                  <option value="Okara">Okara</option>
                </select>
                <select name="tehseel" value={formData.tehseel} onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Select Tehseel</option>
                  <option value="Okara">Okara</option>
                  <option value="Depalpur">Depalpur</option>
                  <option value="Renala">Renala Khurd</option>
                </select>
              </div>
              <input 
                name="address" 
                placeholder="Complete Address (House #, Street, Area...)" 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
              />

              <div className="step-controls">
                <button type="button" onClick={() => setStep(2)}>{t("auth.back")}</button>
                <button type="button" onClick={() => setStep(4)}>{t("auth.next")}</button>
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
                  placeholder="Set Password" 
                  value={formData.password}
                  onChange={handleInputChange} 
                  required 
                />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="password-input-wrapper">
                <input 
                  name="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange} 
                  required 
                />
                <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="step-controls">
                <button type="button" onClick={() => setStep(3)}>{t("auth.back")}</button>
                <button type="button" onClick={() => setStep(5)}>{t("auth.next")}</button>
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
                    <option value="Individual">Individual Professional</option>
                    <option value="Company">Registered Company</option>
                    <option value="Agency">Service Agency</option>
                  </select>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Service Category</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Gardener">Gardener</option>
                    <option value="Painter">Painter</option>
                  </select>
                  <input name="experience" type="number" placeholder="Years of Experience" value={formData.experience} onChange={handleInputChange} required />
                  <div className="cnic-upload-container">
                    <p className="upload-label" style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Upload CNIC Photos (Required)</p>
                    <div className="upload-zones">
                      <div className="upload-box" style={{ borderColor: previews.cnicFront ? 'var(--primary)' : '' }}>
                        {previews.cnicFront ? <img src={previews.cnicFront} alt="CNIC Front" className="preview-img-full" /> : <><UploadCloud size={24} className="upload-icon" /><span>Front Side</span></>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicFront")} />
                      </div>
                      <div className="upload-box" style={{ borderColor: previews.cnicBack ? 'var(--primary)' : '' }}>
                        {previews.cnicBack ? <img src={previews.cnicBack} alt="CNIC Back" className="preview-img-full" /> : <><UploadCloud size={24} className="upload-icon" /><span>Back Side</span></>}
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "cnicBack")} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="step-controls">
                <button type="button" onClick={() => setStep(4)}>{t("auth.back")}</button>
                <button type="submit" disabled={loadingAuth}>
                  {loadingAuth ? "Please wait..." : t("auth.create")}
                </button>
              </div>
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
