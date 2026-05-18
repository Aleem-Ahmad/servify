"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "./viewProvider.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Star, ShieldCheck, Award, Medal, Zap, MapPin, Phone, Mail, MessageSquare, Image as ImageIcon, Volume2, Video } from "lucide-react";
import BookingModal from "@/components/SharedComponents/BookingModal";

function StarRow({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: '1rem', color: s <= rating ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </div>
  );
}

function ViewProviderContent() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const searchParams = useSearchParams();
  const providerId = searchParams.get("id");

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!providerId) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        // Fetch provider profile
        const provRes = await fetch(`/api/providers?id=${providerId}`);
        if (provRes.ok) {
          const provData = await provRes.json();
          setProvider(provData);
        }
        // Fetch real reviews
        const revRes = await fetch(`/api/feedback?providerId=${providerId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData);
        }
      } catch (e) {
        console.error("Failed to load provider data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [providerId]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', opacity: 0.6 }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
      Loading provider...
    </div>
  );

  if (!provider) return (
    <div style={{ padding: '80px', textAlign: 'center', opacity: 0.6 }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>😕</div>
      Provider not found.
    </div>
  );

  const badge = provider.badge || "Basic";

  return (
    <div className={`view-provider-page ${dark ? "dark" : ""}`}>

      {/* ── TOP SECTION ── */}
      <div className="provider-container">

        {/* LEFT: Profile Card */}
        <div className="provider-left">
          <div className="provider-card">
            <img
              src={provider.image || `https://i.pravatar.cc/150?u=${provider.email}`}
              alt={provider.name}
              className="provider-pic"
            />
            <div className={`badge-tag ${badge.toLowerCase()}`}>
              {badge === 'Elite' && <Medal size={14} />}
              {badge === 'Pro' && <Award size={14} />}
              {badge === 'Basic' && <ShieldCheck size={14} />}
              {badge} Provider
            </div>
            <h2 className="provider-name">{provider.name}</h2>
            <p className="provider-category">{provider.category}</p>

            {/* Rating summary */}
            <div className="provider-trust" style={{ flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              {avgRating ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <StarRow rating={Math.round(parseFloat(avgRating))} />
                    <strong style={{ color: '#f59e0b', fontSize: '1rem' }}>{avgRating}</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </>
              ) : (
                <>
                  <Star size={16} fill="#ff7a00" stroke="#ff7a00" />
                  <span>Trust Score: <strong>{provider.trustScore || 0}%</strong></span>
                </>
              )}
            </div>

            <button className="book-btn" onClick={() => setShowBooking(true)}>
              <Zap size={18} /> {t("Book Now")}
            </button>

            {/* Contact info */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {provider.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                  <Phone size={14} color="#ff7a00" /> {provider.phone}
                </div>
              )}
              {provider.district && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                  <MapPin size={14} color="#ff7a00" /> {provider.district}{provider.tehseel ? `, ${provider.tehseel}` : ''}
                </div>
              )}
              {provider.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                  <Mail size={14} color="#ff7a00" /> {provider.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="provider-right">
          <div className="provider-card">
            <div className="provider-section">
              <h4>{t("Services Offered:")}</h4>
              <ul>
                {(provider.services || [provider.category]).filter(Boolean).map((svc, i) => (
                  <li key={i}>{svc}</li>
                ))}
              </ul>
            </div>

            {provider.experience && (
              <div className="provider-section">
                <h4>Experience / About</h4>
                <p>{provider.experience}</p>
              </div>
            )}

            <div className="provider-section">
              <h4>{t("Schedule:")}</h4>
              <p>9:00 AM – 6:00 PM (Mon – Sat)</p>
            </div>

            <div className="provider-section">
              <h4>{t("Costing:")}</h4>
              <p>Negotiable</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div className="feedback-section">
        <div className="feedback-header">
          <h3>{t("Feedback & Comments")}</h3>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarRow rating={Math.round(parseFloat(avgRating))} />
              <strong style={{ color: '#f59e0b' }}>{avgRating}</strong>
              <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>({reviews.length})</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.55 }}>
            <MessageSquare size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No reviews yet. Be the first to leave feedback!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((rev) => (
              <div key={rev._id} className="feedback-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong>{rev.customerName || "Anonymous"}</strong>
                    <div style={{ marginTop: '4px' }}>
                      <StarRow rating={rev.rating} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', opacity: 0.5 }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
                {rev.comment && <p style={{ fontSize: '0.92rem', marginBottom: '10px', lineHeight: '1.5' }}>{rev.comment}</p>}
                {/* Media attachments */}
                {rev.mediaUrls?.length > 0 && (
                  <div className="feedback-media">
                    {rev.mediaUrls.map((url, idx) => {
                      if (url.startsWith('data:video') || url.includes('.mp4')) {
                        return <video key={idx} src={url} controls style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />;
                      } else if (url.startsWith('data:audio') || url.includes('.mp3')) {
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,122,0,0.08)', borderRadius: '8px' }}>
                            <Volume2 size={16} color="#ff7a00" />
                            <audio controls src={url} style={{ height: '32px' }} />
                          </div>
                        );
                      } else {
                        return <img key={idx} src={url} alt={`feedback-${idx}`} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />;
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showBooking && (
        <BookingModal
          provider={{ ...provider, id: providerId }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

export default function ViewProvider() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading...</div>}>
      <ViewProviderContent />
    </Suspense>
  );
}