"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, ExternalLink, Image as ImageIcon, Calendar, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pending-verifications")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const normalized = (data.providers || []).map(p => ({
            ...p,
            _id: p.id // Normalize PostgreSQL id to client-side expected _id
          }));
          setRequests(normalized);
        }
        setLoading(false);
      });
  }, []);

  const handleDecision = async (id, action, badge, surveyDate) => {
    const body = { providerId: id, action };
    if (badge) body.badge = badge;
    if (surveyDate) body.surveyDate = surveyDate;

    const res = await fetch("/api/admin/verify-provider", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data.success) {
      if (action === 'assign-survey') {
        setRequests(prev => prev.map(req => req._id === id ? { ...req, surveyDate: surveyDate } : req));
      } else {
        setRequests(prev => prev.filter(req => req._id !== id));
      }
      alert(data.message);
    } else {
      alert(data.message || "Failed to process request");
    }
  };

  const [dateInputs, setDateInputs] = useState({});

  const handleDateChange = (id, value) => {
    setDateInputs(prev => ({ ...prev, [id]: value }));
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Checking for new requests...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (requests.length === 0) return (
    <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <CheckCircle style={{ width: 28, height: 28, color: '#34d399' }} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 6 }}>All Clear</h3>
      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontWeight: 500, maxWidth: 360, margin: '0 auto' }}>No pending verification requests at this time. New provider submissions will appear here.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle style={{ width: 18, height: 18, color: '#fbbf24' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {requests.length} Pending {requests.length === 1 ? 'Request' : 'Requests'}
          </span>
        </div>
      </div>

      {/* Request Cards */}
      <AnimatePresence>
        {requests.map((req, i) => (
          <motion.div
            key={req._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ delay: i * 0.06 }}
            className="admin-panel-card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Provider Info Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px', borderBottom: '1px solid var(--admin-border)' }}>
              <img
                src={req.image || `https://i.pravatar.cc/150?u=${req.email}`}
                alt={req.name}
                onError={(e) => { e.target.src = "https://i.pravatar.cc/150?img=33"; }}
                style={{ width: 52, height: 52, borderRadius: 16, objectFit: 'cover', border: '2px solid rgba(99, 102, 241, 0.15)', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 4 }}>{req.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    {req.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                    {req.district}
                  </span>
                </div>
              </div>
              <a href={`mailto:${req.email}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textDecoration: 'none' }}>
                {req.email}
              </a>
            </div>

            {/* CNIC / Phone + Documents Row */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
              {/* Left: Key Info */}
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>CNIC</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{req.cnic || req.cnicNumber || "Not Provided"}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>Phone</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>{req.phone || "Not Provided"}</span>
                </div>
              </div>
              {/* Right: Document Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: "CNIC Front", key: "cnicFront", icon: <ImageIcon style={{ width: 13, height: 13 }} /> },
                  { label: "CNIC Back", key: "cnicBack", icon: <ImageIcon style={{ width: 13, height: 13 }} /> },
                  { label: "Skill Demo", key: "skillDemo", icon: <ExternalLink style={{ width: 13, height: 13 }} /> },
                ].map(doc => (
                  <button
                    key={doc.key}
                    onClick={() => req.documents?.[doc.key] && window.open(req.documents[doc.key])}
                    disabled={!req.documents?.[doc.key]}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 10,
                      fontSize: '0.7rem', fontWeight: 700,
                      background: req.documents?.[doc.key] ? 'rgba(99, 102, 241, 0.08)' : 'rgba(100, 116, 139, 0.05)',
                      border: `1px solid ${req.documents?.[doc.key] ? 'rgba(99, 102, 241, 0.15)' : 'rgba(100, 116, 139, 0.1)'}`,
                      color: req.documents?.[doc.key] ? '#818cf8' : 'var(--admin-text-muted)',
                      cursor: req.documents?.[doc.key] ? 'pointer' : 'not-allowed',
                      opacity: req.documents?.[doc.key] ? 1 : 0.4,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {doc.icon}
                    {doc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Row */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!req.surveyDate ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--admin-border)' }}>
                    <Calendar style={{ width: 15, height: 15, color: '#818cf8' }} />
                    <input
                      type="date"
                      value={dateInputs[req._id] || ''}
                      onChange={(e) => handleDateChange(req._id, e.target.value)}
                      style={{
                        background: 'transparent', border: 'none', outline: 'none',
                        color: 'var(--admin-text-primary)', fontSize: '0.8rem', fontWeight: 600,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleDecision(req._id, 'assign-survey', null, dateInputs[req._id])}
                    disabled={!dateInputs[req._id]}
                    style={{
                      padding: '10px 20px', borderRadius: 12, border: 'none',
                      background: dateInputs[req._id] ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'rgba(99, 102, 241, 0.15)',
                      color: 'white', fontWeight: 700, fontSize: '0.8rem',
                      cursor: dateInputs[req._id] ? 'pointer' : 'not-allowed',
                      opacity: dateInputs[req._id] ? 1 : 0.5,
                      boxShadow: dateInputs[req._id] ? '0 6px 20px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    Assign Survey Date
                  </button>
                  <button
                    onClick={() => handleDecision(req._id, 'reject')}
                    style={{
                      padding: '10px 20px', borderRadius: 12,
                      background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171', fontWeight: 700, fontSize: '0.8rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <XCircle style={{ width: 15, height: 15 }} />
                    Reject
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.12)',
                    fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc'
                  }}>
                    <Calendar style={{ width: 15, height: 15 }} />
                    Survey Assigned: {new Date(req.surveyDate).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: "Approve Elite", badge: "Elite", bg: "linear-gradient(135deg, #b8860b, #d4a843)", shadow: "rgba(184, 134, 11, 0.3)" },
                      { label: "Approve Pro", badge: "Pro", bg: "linear-gradient(135deg, #6366f1, #7c3aed)", shadow: "rgba(99, 102, 241, 0.3)" },
                      { label: "Approve Basic", badge: "Basic", bg: "linear-gradient(135deg, #cd7f32, #e0a058)", shadow: "rgba(205, 127, 50, 0.3)" },
                    ].map(btn => (
                      <button
                        key={btn.badge}
                        onClick={() => handleDecision(req._id, 'approve', btn.badge)}
                        style={{
                          padding: '10px 18px', borderRadius: 12, border: 'none',
                          background: btn.bg, color: 'white', fontWeight: 700,
                          fontSize: '0.78rem', cursor: 'pointer',
                          boxShadow: `0 6px 20px ${btn.shadow}`,
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDecision(req._id, 'reject')}
                      style={{
                        padding: '10px 18px', borderRadius: 12,
                        background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171', fontWeight: 700, fontSize: '0.78rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <XCircle style={{ width: 15, height: 15 }} />
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
