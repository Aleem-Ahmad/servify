"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "@/styles/authentication.css"; // Reuse existing auth styles

export default function AdminLogin() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const result = await login(email, password);
    if (result.success) {
      window.location.href = "/adminDashboard";
    } else {
      setError(result.message || "Invalid Admin Credentials");
    }
  };

  return (
    <div className="auth-container dark"> {/* Force dark mode for admin */}
      <div className="top-tools">
        <Link href="/" className="icon-btn">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="form-container" style={{ width: '100%', left: 0, opacity: 1 }}>
        <form onSubmit={handleSubmit} style={{ border: '2px solid var(--primary)' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <ShieldAlert size={50} color="var(--primary)" style={{ margin: '0 auto' }} />
            <h1 style={{ marginTop: '10px' }}>Admin Portal</h1>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Restricted Access Area</p>
          </div>

          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="password-input-wrapper">
            <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', zIndex: 1 }} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ paddingLeft: '45px' }}
            />
            <button 
              type="button" 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <span className="error-text" style={{ textAlign: 'center', marginTop: '0' }}>{error}</span>}

          <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? "Authenticating..." : "Verify Identity"}
          </button>
          
          <p style={{ fontSize: '0.7rem', textAlign: 'center', opacity: 0.5, marginTop: '10px' }}>
            Unauthorized access attempts are logged.
          </p>
        </form>
      </div>
    </div>
  );
}
