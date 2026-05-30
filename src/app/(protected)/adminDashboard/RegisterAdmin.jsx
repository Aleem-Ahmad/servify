"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldAlert, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterAdmin() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Check if current user is the owner admin
  const isOwnerAdmin = user?.email === "www.aleemahmadghias@gmail.com";

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Admin registered successfully!" });
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Failed to register admin." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
    setLoading(false);
  }

  if (!isOwnerAdmin) {
    return (
      <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 560, margin: '0 auto', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldAlert style={{ width: 28, height: 28, color: '#f87171' }} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f87171', marginBottom: 8 }}>Access Restricted</h2>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontWeight: 500, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Only the primary Owner Admin (<span style={{ color: 'var(--admin-text-secondary)', fontWeight: 700 }}>www.aleemahmadghias@gmail.com</span>) is authorized to register and provision new administrator accounts.
        </p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 14, fontSize: '0.85rem', fontWeight: 600,
    background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', outline: 'none',
    color: 'var(--admin-text-primary)', fontFamily: 'inherit', transition: 'border-color 0.2s ease'
  };

  const labelStyle = {
    fontSize: '0.68rem', fontWeight: 800, color: 'var(--admin-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em'
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-panel-card"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '22px 28px',
          borderBottom: '1px solid var(--admin-border)',
          background: 'rgba(99, 102, 241, 0.03)'
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--admin-accent), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            boxShadow: '0 6px 20px var(--admin-accent-glow)'
          }}>
            <UserPlus style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--admin-text-primary)' }}>Register Admin</h2>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Provision a new administrator account with system privileges.</p>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Message Alert */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                  borderRadius: 14, overflow: 'hidden', fontSize: '0.82rem', fontWeight: 700,
                  background: message.type === "error" ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${message.type === "error" ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                  color: message.type === "error" ? '#f87171' : '#34d399'
                }}
              >
                {message.type === "error" ? <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} /> : <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User style={{ position: 'absolute', left: 14, width: 16, height: 16, color: 'var(--admin-text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail style={{ position: 'absolute', left: 14, width: 16, height: 16, color: 'var(--admin-text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="admin@servify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock style={{ position: 'absolute', left: 14, width: 16, height: 16, color: 'var(--admin-text-muted)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, padding: 4, background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Confirm</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock style={{ position: 'absolute', left: 14, width: 16, height: 16, color: 'var(--admin-text-muted)' }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 12, padding: 4, background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: 8, padding: '14px 20px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, var(--admin-accent), #7c3aed)',
                color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px var(--admin-accent-glow)',
                opacity: loading ? 0.5 : 1, transition: 'all 0.25s ease',
                fontFamily: 'inherit'
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} />
                  <span>Registering Account...</span>
                </>
              ) : (
                <span>Create Admin Account</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
