"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "../providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

function ComplaintsList() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "new";
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchComplaints = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?providerId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map(c => ({
          ...c,
          frontendStatus: c.status === "Pending" ? "new"
            : c.status === "Accepted" ? "pending"
            : c.status === "Completed" ? "done"
            : c.status
        }));
        setComplaints(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchComplaints(user.id);
    }
  }, [user?.id]);

  const filtered = complaints.filter(c => c.frontendStatus === type);

  const handleAccept = async (id) => {
    setActionLoading(id + "_accept");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Accepted' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, frontendStatus: "pending" } : c));
        alert(t("Request accepted! It is now in your Active Jobs."));
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    if (!confirm(t("Are you sure you want to mark this job as completed?"))) return;
    setActionLoading(id + "_complete");
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, frontendStatus: "done" } : c));
        alert(t("Job marked as completed!"));
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const cardStyle = {
    background: 'var(--card-bg, #fff)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid var(--border, #e5e7eb)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  };

  const badgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: status === 'new' ? '#fff3e0' : status === 'pending' ? '#e3f2fd' : '#e8f5e9',
    color: status === 'new' ? '#ff7a00' : status === 'pending' ? '#1565c0' : '#2e7d32',
  });

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', opacity: 0.7 }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
      {t("Loading requests...")}
    </div>
  );

  return (
    <div className={`complaints-view-page ${dark ? "dark" : ""}`} style={{ padding: '24px', minHeight: '100vh' }}>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div onClick={() => setSelectedComplaint(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card-bg, #fff)', borderRadius: '20px', padding: '32px',
            maxWidth: '480px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary, #ff7a00)' }}>
              📋 Request Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>Customer:</strong> {selectedComplaint.customerName || "Anonymous"}</div>
              <div><strong>Phone:</strong> {selectedComplaint.customerPhone || "N/A"}</div>
              <div><strong>Service:</strong> {selectedComplaint.category}</div>
              <div><strong>Issue:</strong> {selectedComplaint.description}</div>
              <div><strong>Address:</strong> {selectedComplaint.customerAddress || selectedComplaint.location || "N/A"}</div>
              <div><strong>Date:</strong> {selectedComplaint.date ? new Date(selectedComplaint.date).toLocaleDateString() : "N/A"}</div>
              <div><strong>Budget:</strong> PKR {selectedComplaint.price || "Negotiable"}</div>
              <div>
                <strong>Status:</strong>{" "}
                <span style={badgeStyle(selectedComplaint.frontendStatus)}>
                  {selectedComplaint.frontendStatus === 'new' ? 'New' : selectedComplaint.frontendStatus === 'pending' ? 'Active' : 'Completed'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{
                marginTop: '24px', width: '100%', padding: '12px',
                borderRadius: '10px', background: 'var(--primary, #ff7a00)',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        style={{
          marginBottom: '20px', padding: '8px 18px', borderRadius: '10px',
          border: '1px solid var(--primary, #ff7a00)', background: 'transparent',
          color: 'var(--primary, #ff7a00)', cursor: 'pointer', fontWeight: '500'
        }}
      >
        ← {t("Back")}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>
          {type === "new" ? "🆕 " + t("New Requests")
            : type === "pending" ? "⚡ " + t("Active Jobs")
            : "✅ " + t("Completed Jobs")}
        </h2>
        <span style={{ background: 'var(--primary, #ff7a00)', color: '#fff', borderRadius: '20px', padding: '4px 14px', fontWeight: '700', fontSize: '0.9rem' }}>
          {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.6 }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
            {type === 'new' ? '📭' : type === 'pending' ? '🔧' : '🎉'}
          </div>
          <p>{t("viewComplaint.noRequests")}</p>
        </div>
      ) : (
        filtered.map(c => (
          <div key={c.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ color: 'var(--primary, #ff7a00)', margin: 0, marginBottom: '4px' }}>
                  {c.customerName || t("Anonymous Customer")}
                </h3>
                <span style={badgeStyle(c.frontendStatus)}>
                  {c.frontendStatus === 'new' ? '🔔 New' : c.frontendStatus === 'pending' ? '⚡ Active' : '✅ Completed'}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', opacity: 0.6 }}>
                {c.date ? new Date(c.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem', marginBottom: '12px' }}>
              <div><span style={{ opacity: 0.6 }}>Service:</span> <strong>{c.category}</strong></div>
              <div><span style={{ opacity: 0.6 }}>Phone:</span> <strong>{c.customerPhone || "N/A"}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ opacity: 0.6 }}>Issue:</span> {c.description}</div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ opacity: 0.6 }}>Address:</span> {c.customerAddress || c.location || "N/A"}</div>
              <div><span style={{ opacity: 0.6 }}>Budget:</span> <strong>PKR {c.price || "Negotiable"}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {type === "new" && (
                <button
                  onClick={() => handleAccept(c.id)}
                  disabled={actionLoading === c.id + "_accept"}
                  style={{
                    background: '#ff7a00', color: '#fff', border: 'none',
                    padding: '10px 22px', borderRadius: '10px', fontWeight: '600',
                    cursor: 'pointer', opacity: actionLoading === c.id + "_accept" ? 0.7 : 1
                  }}
                >
                  {actionLoading === c.id + "_accept" ? t("viewComplaint.accepting") : "✅ " + t("viewComplaint.acceptRequest")}
                </button>
              )}
              {type === "pending" && (
                <button
                  onClick={() => handleComplete(c.id)}
                  disabled={actionLoading === c.id + "_complete"}
                  style={{
                    background: '#10b981', color: '#fff', border: 'none',
                    padding: '10px 22px', borderRadius: '10px', fontWeight: '600',
                    cursor: 'pointer', opacity: actionLoading === c.id + "_complete" ? 0.7 : 1
                  }}
                >
                  {actionLoading === c.id + "_complete" ? t("viewComplaint.updating") : "🏁 " + t("viewComplaint.markDone")}
                </button>
              )}
              <button
                onClick={() => setSelectedComplaint(c)}
                style={{
                  background: 'rgba(128,128,128,0.1)', border: '1px solid rgba(128,128,128,0.2)',
                  padding: '10px 22px', borderRadius: '10px', cursor: 'pointer',
                  color: 'inherit', fontWeight: '500'
                }}
              >
                👁 {t("viewComplaint.viewDetails")}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function ProviderViewComplaint() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>}>
      <ComplaintsList />
    </Suspense>
  );
}
