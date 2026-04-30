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
    phone: "",
    city: "",
    cnic: "",
    category: "",
    experience: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    dob: "",
    address: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      // signup() is async — must await it to get the result
      const result = await signup({ ...formData, role });
      if (result.success) {
        alert("Registration Successful! Please log in.");
        setIsSignup(false);
        setStep(1);
        setFormData({ name: "", email: "", password: "", phone: "", city: "", cnic: "", category: "", experience: "" });
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

          {step === 2 && (
            <>
              <h2>{t("auth.basicInfo")}</h2>

              <input name="name" placeholder="Full Name" onChange={handleInputChange} required />
              <input name="cnic" placeholder="CNIC (xxxxx-xxxxxxx-x)" onChange={handleInputChange} required />
              <input name="phone" placeholder="Phone (+92xxxxxxxxxx)" onChange={handleInputChange} required />
              <input name="email" type="email" placeholder="Gmail Address" onChange={handleInputChange} required />
              
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="gender" onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select name="maritalStatus" onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <select name="religion" onChange={handleInputChange} required style={{ width: '50%' }}>
                  <option value="">Select Religion</option>
                  <option value="Islam">Islam</option>
                  <option value="Christianity">Christianity</option>
                  <option value="Hinduism">Hinduism</option>
                  <option value="Other">Other</option>
                </select>
                <input name="dob" type="date" onChange={handleInputChange} required style={{ width: '50%' }} />
              </div>

              <input name="city" placeholder="City" onChange={handleInputChange} required />
              <input name="address" placeholder="Main Address" onChange={handleInputChange} required />
              <div className="password-input-wrapper">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Set Password" 
                  onChange={handleInputChange} 
                  required 
                />
                <button 
                  type="button" 
                  className="eye-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="step-controls">
                <button type="button" onClick={() => setStep(1)}>
                  {t("auth.back")}
                </button>
                <button type="button" onClick={() => setStep(3)}>
                  {t("auth.next")}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>{t("auth.profile")}</h2>

              <input type="file" accept="image/*" />

              {role === "provider" && (
                <>
                  <input name="category" placeholder="Service Category" onChange={handleInputChange} required />
                  <input name="experience" type="number" placeholder="Experience (Years)" onChange={handleInputChange} required />

                  <div className="cnic-upload-container">
                    <p className="upload-label">Upload CNIC Photos</p>
                    <div className="upload-zones">
                      <div className="upload-box">
                        <UploadCloud size={28} className="upload-icon" />
                        <span>Front Side</span>
                        <input type="file" accept="image/*" />
                      </div>
                      <div className="upload-box">
                        <UploadCloud size={28} className="upload-icon" />
                        <span>Back Side</span>
                        <input type="file" accept="image/*" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="step-controls">
                <button type="button" onClick={() => setStep(2)}>
                  {t("auth.back")}
                </button>
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
