"use client";

import { useState, useEffect } from "react";
import "./feedback.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Star, Volume2 } from "lucide-react";

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(`/api/feedback?providerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);
        }
      } catch (error) {
        console.error("Failed to fetch provider feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [user?.id]);

  return (
    <div className={`dashboard-feedback ${dark ? "dark" : ""}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>{t("User Feedback")}</h2>
        {feedbacks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', background: 'rgba(255,122,0,0.1)', padding: '6px 14px', borderRadius: '20px', color: '#ff7a00', fontWeight: '600' }}>
            <span>⭐ {(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)}</span>
            <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>({feedbacks.length} {t("Reviews")})</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>{t("Loading...")}</div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.55 }}>
          <MessageSquare size={44} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <p>{t("No feedback yet.")}</p>
        </div>
      ) : (
        <div className="feedback-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {feedbacks.map((f, idx) => (
            <div key={f._id || idx} className="feedback-card" style={{ padding: '20px', borderRadius: '12px', background: dark ? 'rgba(255,255,255,0.03)' : '#fef8f5', borderLeft: '4px solid #ff7a00', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <strong>{f.customerName || "Anonymous"}</strong>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ fontSize: '1rem', color: s <= f.rating ? '#f59e0b' : '#d1d5db' }}>★</span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', opacity: 0.5 }}>
                  {f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.94rem', lineHeight: '1.5' }}>{f.comment}</p>

              {f.mediaUrls?.length > 0 && (
                <div className="feedback-media" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {f.mediaUrls.map((url, i) => {
                    if (url.startsWith('data:video') || url.includes('.mp4')) {
                      return <video key={i} src={url} controls style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover' }} />;
                    } else if (url.startsWith('data:audio') || url.includes('.mp3')) {
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,122,0,0.08)', borderRadius: '8px' }}>
                          <Volume2 size={16} color="#ff7a00" />
                          <audio controls src={url || null} style={{ height: '32px' }} />
                        </div>
                      );
                    } else {
                      return <img key={i} src={url} alt="feedback" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />;
                    }
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}