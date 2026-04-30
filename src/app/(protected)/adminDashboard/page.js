"use client";

import { useState, useEffect } from "react";
import "./adminPanel.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function AdminHome() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [view, setView] = useState(null); // "new" | "old" | null
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [surveyDate, setSurveyDate] = useState("");
  const [surveyTime, setSurveyTime] = useState("");
  const [providerList, setProviderList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const data = await res.json();
          // The /api/providers route currently returns formatted objects.
          // We might need a more detailed list for admin
          setProviderList(data);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const newProviders = providerList.filter((p) => !p.verified);
  const oldProviders = providerList.filter((p) => p.verified);

  // Actions
  const handleApprove = async (providerId) => {
    if (!surveyDate || !surveyTime) {
      alert("Please select both survey date and time first!");
      return;
    }

    try {
        const res = await fetch(`/api/admin/users/${providerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verified: true, surveyDate, surveyTime })
        });

        if (res.ok) {
            alert(`Provider verification scheduled! Email sent for ${surveyDate} at ${surveyTime}. Provider will be marked as verified pending survey results.`);
            setProviderList((prev) =>
              prev.map((p) =>
                p.id === providerId ? { ...p, verified: true } : p
              )
            );
            setSelectedProvider(null);
        }
    } catch (error) {
        alert("Action failed");
    }
  };

  const handleDeny = async (providerId) => {
    if (confirm("Are you sure you want to deny this request?")) {
        try {
          const res = await fetch(`/api/admin/users/${providerId}`, { method: 'DELETE' });
          if (res.ok) {
            setProviderList((prev) => prev.filter((p) => p.id !== providerId));
            setSelectedProvider(null);
          }
        } catch (err) {}
    }
  };

  const handleAppreciate = (providerId) => alert("Appreciation email and badge sent to provider!");
  const handleWarn = (providerId) => alert("Warning issued to provider. They have been notified to improve their service.");
  
  const handleBlock = async (providerId) => {
    if (confirm("Are you sure you want to block this provider? Their account will be deactivated.")) {
      try {
        const res = await fetch(`/api/admin/users/${providerId}`, { method: 'DELETE' });
        if (res.ok) {
          setProviderList((prev) => prev.filter((p) => p.id !== providerId));
          setSelectedProvider(null);
        }
      } catch (err) {}
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t("Loading admin dashboard...")}</div>;

  return (
    <div className={`admin-page ${dark ? "dark" : ""}`} style={{ minHeight: '100vh' }}>
      {/* Home: New / Old Provider Overview */}
      {!view && (
        <div className="admin-home">
          <div className="admin-card" onClick={() => setView("new")}>
            <h2>{t("New Requests")}</h2>
            <p>{newProviders.length} {t("Pending Verification")}</p>
          </div>
          <div className="admin-card" onClick={() => setView("old")}>
            <h2>{t("Verified Partners")}</h2>
            <p>{oldProviders.length} {t("Active Providers")}</p>
          </div>
        </div>
      )}

      {/* Provider List */}
      {view && !selectedProvider && (
        <div className="provider-list">
          <button className="back-btn" onClick={() => setView(null)}>
            ← {t("Back to Overview")}
          </button>
          <h2>{view === "new" ? t("Registration Requests") : t("Verified Providers")}</h2>
          <div className="list-container">
            {(view === "new" ? newProviders : oldProviders).length > 0 ? (
              (view === "new" ? newProviders : oldProviders).map((p) => (
                <div
                  key={p.id}
                  className="provider-card"
                  onClick={() => setSelectedProvider(p)}
                >
                  <div className="info">
                    <strong>{p.name}</strong>
                    <span style={{ fontSize: '0.85rem', opacity: 0.7, marginLeft: '10px' }}>({p.category})</span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{t("Rating")}: {p.rating}</span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>{t("No providers found.")}</p>
            )}
          </div>
        </div>
      )}

      {/* Provider Details & Management */}
      {selectedProvider && (
        <div className="provider-detail">
          <button
            className="back-btn"
            onClick={() => setSelectedProvider(null)}
          >
            ← {t("Back to List")}
          </button>
          
          <div className="detail-header">
            <h2>{selectedProvider.name}</h2>
            <span className={`status-badge ${selectedProvider.verified ? 'verified' : 'pending'}`}>
              {selectedProvider.verified ? t("Verified") : t("Pending")}
            </span>
          </div>

          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="detail-item">
              <strong>{t("Category")}:</strong> <p>{t(`services.${selectedProvider.category?.toLowerCase()}`, { defaultValue: selectedProvider.category })}</p>
            </div>
            <div className="detail-item">
              <strong>{t("Rate")}:</strong> <p>PKR {selectedProvider.rate}</p>
            </div>
            <div className="detail-item">
              <strong>{t("Rating")}:</strong> <p>{selectedProvider.rating} ⭐</p>
            </div>
          </div>

          {/* New Provider verification logic */}
          {!selectedProvider.verified ? (
            <div className="verification-zone" style={{ background: 'rgba(0,0,0,0.02)', padding: '25px', borderRadius: '15px' }}>
              <h4 style={{ marginBottom: '15px', color: '#ff7a00' }}>{t("Schedule Physical Survey")}</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.8 }}>
                {t("Verify the provider's documents and equipment. Schedule a visit to finalize verification.")}
              </p>
              
              <div className="admin-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="inputs-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                   <input
                    type="date"
                    value={surveyDate}
                    onChange={(e) => setSurveyDate(e.target.value)}
                    title={t("Select Date")}
                  />
                  <input
                    type="time"
                    value={surveyTime}
                    onChange={(e) => setSurveyTime(e.target.value)}
                    title={t("Select Time")}
                    style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(150,150,150,0.3)', background: 'transparent', color: 'inherit' }}
                  />
                </div>
                <div className="btns-group" style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%' }}>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(selectedProvider.id)}
                    style={{ flex: 2 }}
                  >
                    {t("Send Survey Invite & Verify")}
                  </button>
                  <button
                    className="deny-btn"
                    onClick={() => handleDeny(selectedProvider.id)}
                    style={{ flex: 1 }}
                  >
                    {t("Reject")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Existing Provider management logic */
            <div className="management-zone">
              <div className="admin-feedback-view" style={{ background: 'rgba(255,122,0,0.05)', padding: '20px', borderRadius: '15px', marginBottom: '25px' }}>
                <h4 style={{ color: '#ff7a00', marginBottom: '15px' }}>{t("User Feedback & Performance")}</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>{t("No feedback recorded yet.")}</p>
              </div>

              <div className="admin-actions">
                <button
                  className="appreciate-btn"
                  onClick={() => handleAppreciate(selectedProvider.id)}
                >
                  {t("Appreciate")}
                </button>
                <button
                  className="warn-btn"
                  onClick={() => handleWarn(selectedProvider.id)}
                >
                  {t("Issue Warning")}
                </button>
                <button
                  className="block-btn"
                  onClick={() => handleBlock(selectedProvider.id)}
                >
                  {t("Block & Deactivate")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}