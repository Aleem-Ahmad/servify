"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "../providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

function ComplaintsList() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "new"; // new | pending | done
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?providerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Map backend status to frontend types
          const mappedData = data.map(c => ({
            ...c,
            status: c.status === "Pending" ? "new" : c.status === "Accepted" ? "pending" : c.status === "Completed" ? "done" : c.status
          }));
          setComplaints(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  const filtered = complaints.filter(c => c.status === type);

  const handleAccept = async (id) => {
    try {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Accepted' })
        });
        if (res.ok) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "pending" } : c));
            alert(t("Complaint accepted! It is now in your pending list."));
        }
    } catch (error) {
        alert("Action failed");
    }
  };

  const handleComplete = async (id) => {
    try {
        const res = await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
        });
        if (res.ok) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: "done" } : c));
            alert(t("Great! Job marked as completed."));
        }
    } catch (error) {
        alert("Action failed");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t("Loading...")}</div>;

  return (
    <div className={`complaints-view-page ${dark ? "dark" : ""}`} style={{ minHeight: '100vh', padding: '20px' }}>
      <button className="back-btn" onClick={() => router.back()} style={{ marginBottom: '20px', padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}>
        ← {t("Back")}
      </button>

      <h2 style={{ marginBottom: '25px' }}>
        {type === "new" ? t("Open Service Requests") : type === "pending" ? t("My Active Jobs") : t("Completed Jobs")}
      </h2>

      <div className="complaints-grid" style={{ display: 'grid', gap: '20px' }}>
        {filtered.length > 0 ? (
          filtered.map(c => (
            <div key={c.id} className="complaint-item-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ color: 'var(--primary)' }}>{c.customerName || t("Anonymous")}</h3>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{c.date ? new Date(c.date).toLocaleDateString() : ""}</span>
              </div>
              <p><strong>{t("Service")}:</strong> {c.category}</p>
              <p><strong>{t("Issue")}:</strong> {c.description}</p>
              <p><strong>{t("Location")}:</strong> {c.customerAddress || c.address}</p>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                {type === "new" && (
                  <button 
                    onClick={() => handleAccept(c.id)}
                    style={{ background: '#ff7a00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {t("Accept Request")}
                  </button>
                )}
                {type === "pending" && (
                  <button 
                    onClick={() => handleComplete(c.id)}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {t("Mark as Done")}
                  </button>
                )}
                <button style={{ background: 'rgba(128,128,128,0.1)', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', color: 'inherit' }}>
                  {t("View Details")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '40px' }}>{t("No complaints found in this category.")}</p>
        )}
      </div>
    </div>
  );
}

export default function ProviderViewComplaint() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComplaintsList />
    </Suspense>
  );
}
