"use client";
import { useState, useRef } from "react";
import "@/styles/publicStyles/forgot-password.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Globe, ArrowLeft, Mail, Send, Lock, KeyRound, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const { t, locale, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=New Password, 4=Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef([]);

  const dark = theme === "dark";

  // Handle Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send reset link.");
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    // We don't actually verify here to save API calls, we verify when setting the new password.
    // However, if we wanted to be strict we could add a verify-only endpoint.
    // For now, let's just proceed to step 3.
    setStep(3);
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    const enteredOtp = otp.join("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        // If OTP expired or invalid, send them back to step 2 or 1
        if (data.message.includes("expired") || data.message.includes("Incorrect")) {
          setStep(2);
        }
      } else {
        setStep(4);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`forgot-password-container ${dark ? "dark" : ""}`}>
      {/* ================= TOP TOOLS ================= */}
      <div className="top-tools">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="icon-btn lang-btn" onClick={() => changeLanguage(locale === "en" ? "ur" : "en")}>
          <Globe size={20} style={{ marginRight: "6px" }} /> {locale.toUpperCase()}
        </button>
      </div>

      <div className="forgot-card">
        {step < 4 && (
          <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()} className="back-link bg-transparent border-none cursor-pointer">
            <ArrowLeft size={18} /> {t("auth.back") || "Back"}
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1>{t("auth.forgotTitle") || "Reset Password"}</h1>
              <p>{t("auth.forgotDesc") || "Enter your email address and we'll send you a 6-digit verification code."}</p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleRequestOTP}>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input 
                    type="email" 
                    placeholder="name@gmail.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  <Send size={18} /> {loading ? "Sending..." : (t("auth.sendLink") || "Send Code")}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1>Enter Verification Code</h1>
              <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleVerifyOTP}>
                <div className="otp-input-group">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="otp-input"
                      required
                    />
                  ))}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  Verify Code
                </button>

                <button type="button" onClick={handleRequestOTP} className="resend-btn" disabled={loading}>
                  Resend Code
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1>Set New Password</h1>
              <p>Enter your new password below.</p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                    minLength={6}
                  />
                </div>
                <div className="input-group">
                  <KeyRound className="input-icon" size={20} />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    minLength={6}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  <CheckCircle size={18} /> {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="success-icon">
                  <CheckCircle size={40} />
              </div>
              <h1>Password Updated!</h1>
              <p>
                Your password has been successfully reset. You can now use your new password to log in to your account.
              </p>
              <Link href="/authentication" style={{ textDecoration: 'none' }}>
                <button className="submit-btn" style={{ marginTop: '20px' }}>
                  Back to Login
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
