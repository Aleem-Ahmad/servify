"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import "../providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Play, Pause, Clock, Phone, MapPin, Calendar, 
  AlertTriangle, ShieldCheck, User, Zap, Wallet, CheckSquare 
} from "lucide-react";

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
  
  // Scheduling Visit Modal
  const [schedulingBookingId, setSchedulingBookingId] = useState(null);
  const [visitTimeInput, setVisitTimeInput] = useState("");

  // OTP Verification Modal
  const [verifyingBookingId, setVerifyingBookingId] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState("");

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);

  const fetchComplaints = async (userId) => {
    setLoading(true);
    try {
      // Fetch assigned + open bookings of matching category
      const res = await fetch(`/api/bookings?providerId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map(c => ({
          ...c,
          frontendStatus: c.status === "Pending" ? "new"
            : (c.status === "Accepted" || c.status === "In-Progress") ? "pending"
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

  // Trigger Accept Scheduling Prompt
  const promptAccept = (id) => {
    // Set default visit time to current date-time + 1 hour (formatted for datetime-local value)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const tzoffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzoffset)).toISOString().slice(0, 16);
    
    setVisitTimeInput(localISOTime);
    setSchedulingBookingId(id);
  };

  // Confirmed Accept Submission
  const handleAccept = async () => {
    if (!schedulingBookingId) return;
    const id = schedulingBookingId;
    
    if (!visitTimeInput) {
      alert("Please specify your estimated visit arrival time.");
      return;
    }

    const selectedTime = new Date(visitTimeInput);
    const now = new Date();
    if (selectedTime < now) {
      alert("Arrival time cannot be in the past. Please select a future time.");
      return;
    }

    setActionLoading(id + "_accept");
    setSchedulingBookingId(null);
    
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Accepted',
          providerId: user.id,
          providerName: user.name,
          visitTime: new Date(visitTimeInput).toISOString()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh all complaints to ensure the list is synced correctly
        await fetchComplaints(user.id);
        alert(t("Request accepted! It is now in your Active Jobs."));
      } else {
        alert(data.message || "Failed to accept request (this job may have already been accepted by another provider)");
        await fetchComplaints(user.id); // Refresh to clear stale open requests
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
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, frontendStatus: "done", status: "Completed" } : c));
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

  const handleStartWork = async () => {
    if (!verifyingBookingId) return;
    const id = verifyingBookingId;
    
    if (!enteredOtp) {
      alert("Please enter the customer's verification OTP.");
      return;
    }

    setActionLoading(id + "_start");
    
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'In-Progress',
          otp: enteredOtp
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyingBookingId(null);
        setEnteredOtp("");
        await fetchComplaints(user.id);
        alert("Verification successful! The job is now In-Progress.");
      } else {
        alert(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Audio Playback triggers
  const handlePlayVoice = (id, voiceUrl) => {
    if (playingAudioId === id) {
      audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      if (audioRef.current) {
        audioRef.current.src = voiceUrl;
        audioRef.current.play().catch(err => {
          console.error("Playback failed", err);
          setPlayingAudioId(null);
        });
      }
    }
  };

  const cardStyle = {
    background: dark ? '#1e293b' : '#ffffff',
    padding: '26px',
    borderRadius: '24px',
    border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    color: dark ? '#f1f5f9' : '#1e293b'
  };

  const badgeStyle = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    background: status === 'new' ? '#fff3e0' : status === 'pending' ? '#e3f2fd' : '#e8f5e9',
    color: status === 'new' ? '#ff7a00' : status === 'pending' ? '#1565c0' : '#2e7d32',
  });

  const urgencyBadgeStyle = (urgency) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    background: urgency === 'Emergency' ? '#fee2e2' : urgency === 'Urgent' ? '#fef3c7' : '#f1f5f9',
    color: urgency === 'Emergency' ? '#ef4444' : urgency === 'Urgent' ? '#d97706' : '#64748b',
    border: urgency === 'Emergency' ? '1px solid #fecaca' : 'none'
  });

  if (loading) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', opacity: 0.8, color: dark ? '#fff' : '#000' }}>
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="font-semibold">{t("Loading requests...")}</p>
    </div>
  );

  return (
    <div className={`complaints-view-page ${dark ? "dark bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`} style={{ padding: '32px 24px', minHeight: '100vh' }}>
      
      {/* Hidden audio player */}
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} className="hidden" />

      {/* Scheduling Visit Modal */}
      {schedulingBookingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: dark ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '440px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: dark ? '#f1f5f9' : '#1e293b'
          }}>
            <h3 style={{ marginBottom: '16px', fontWeight: '900', color: '#ff7a00', fontSize: '1.4rem' }}>
              📅 Schedule Visit Time
            </h3>
            
            <p style={{ fontSize: '0.88rem', opacity: 0.85, marginBottom: '20px', lineHeight: '1.5' }}>
              Specify the date and estimated time you will arrive at the customer's location. This will be updated transparently to their tracking console.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>
                Estimated Visit Time
              </label>
              <input
                type="datetime-local"
                value={visitTimeInput}
                onChange={(e) => setVisitTimeInput(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: dark ? '1.5px solid #334155' : '1.5px solid #cbd5e1',
                  background: dark ? '#0f172a' : '#f8fafc',
                  color: dark ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.95rem', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSchedulingBookingId(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: dark ? '#334155' : '#f1f5f9',
                  color: dark ? '#f1f5f9' : '#475569',
                  border: 'none', cursor: 'pointer', fontWeight: '700'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#ff7a00', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: '700',
                  boxShadow: '0 8px 20px rgba(255,122,0,0.2)'
                }}
              >
                Confirm & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {verifyingBookingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: dark ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '440px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: dark ? '#f1f5f9' : '#1e293b'
          }}>
            <h3 style={{ marginBottom: '16px', fontWeight: '900', color: '#ff7a00', fontSize: '1.4rem' }}>
              🔑 Security OTP Verification
            </h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.85, marginBottom: '20px', lineHeight: '1.5' }}>
              Please ask the customer for their verification OTP. Enter it below to start work.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>
                Verification OTP
              </label>
              <input
                type="text"
                placeholder="Enter 4-digit code"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: dark ? '1.5px solid #334155' : '1.5px solid #cbd5e1',
                  background: dark ? '#0f172a' : '#f8fafc',
                  color: dark ? '#f1f5f9' : '#1e293b',
                  fontSize: '1.1rem', outline: 'none', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setVerifyingBookingId(null); setEnteredOtp(""); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: dark ? '#334155' : '#f1f5f9',
                  color: dark ? '#f1f5f9' : '#475569',
                  border: 'none', cursor: 'pointer', fontWeight: '700'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartWork}
                disabled={actionLoading === verifyingBookingId + "_start"}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#ff7a00', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: '700',
                  boxShadow: '0 8px 20px rgba(255,122,0,0.2)'
                }}
              >
                {actionLoading === verifyingBookingId + "_start" ? "Verify & Start..." : "Verify & Start"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <div onClick={() => setSelectedComplaint(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: dark ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: dark ? '#f1f5f9' : '#1e293b'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#ff7a00', fontWeight: '900', fontSize: '1.4rem' }}>
              📋 Detailed Request
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Customer</span>
                <strong>{selectedComplaint.customerName || "Anonymous"}</strong>
              </div>
              <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Urgency Level</span>
                <span style={urgencyBadgeStyle(selectedComplaint.urgency)}>
                  {selectedComplaint.urgency}
                </span>
              </div>
              <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Service Needed</span>
                <strong>{selectedComplaint.category}</strong>
              </div>
              <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Description</span>
                <p style={{ margin: '4px 0 0', lineHeight: '1.4' }}>{selectedComplaint.description || "No description provided."}</p>
              </div>
              <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Location Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{selectedComplaint.customerAddress || selectedComplaint.location || "N/A"}</span>
                </div>
              </div>
              
              {selectedComplaint.status !== "Pending" && selectedComplaint.visitTime && (
                <div style={{ borderBottom: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Scheduled Arrival</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#10b981' }}>
                    <Calendar className="w-4 h-4" />
                    <strong>{new Date(selectedComplaint.visitTime).toLocaleString('en-PK')}</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Est. Labor Hours</span>
                  <strong>{selectedComplaint.hours || 1} {selectedComplaint.hours === 1 ? 'hour' : 'hours'}</strong>
                </div>
                <div>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '0.78rem' }}>Payment Gateway</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                    {selectedComplaint.paymentMethod === 'SadaPay' ? <Zap className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                    {selectedComplaint.paymentMethod || 'Cash'}
                  </strong>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedComplaint(null)}
              style={{
                marginTop: '28px', width: '100%', padding: '12px',
                borderRadius: '12px', background: '#ff7a00',
                color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700'
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: '24px', padding: '10px 20px', borderRadius: '12px',
          border: '1px solid #ff7a00', background: 'transparent',
          color: '#ff7a00', cursor: 'pointer', fontWeight: '700',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,122,0,0.05)' }}
        onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
      >
        ← {t("Back")}
      </button>

      {/* Heading Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0 }}>
            {type === "new" ? "🆕 " + t("New Requests")
              : type === "pending" ? "⚡ " + t("Active Jobs")
              : "✅ " + t("Completed Jobs")}
          </h2>
          <p style={{ fontSize: '0.82rem', opacity: 0.6, marginTop: '4px' }}>
            {type === 'new' ? 'Incoming jobs available to you based on your category.' : 'Current active assignments you scheduled.'}
          </p>
        </div>
        <span style={{ background: '#ff7a00', color: '#fff', borderRadius: '20px', padding: '6px 16px', fontWeight: '950', fontSize: '1rem' }}>
          {filtered.length}
        </span>
      </div>

      {/* Complaints Grid List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.7 }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
            {type === 'new' ? '📭' : type === 'pending' ? '🔧' : '🎉'}
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{t("viewComplaint.noRequests")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(c => (
            <div key={c.id} style={cardStyle}>
              
              {/* Header Title with badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#ff7a00', margin: 0, marginBottom: '6px' }}>
                    {c.customerName || t("Anonymous Customer")}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={badgeStyle(c.frontendStatus)}>
                      {c.frontendStatus === 'new' ? '🔔 New Request' : c.frontendStatus === 'pending' ? '⚡ Active Job' : '✅ Completed'}
                    </span>
                    <span style={urgencyBadgeStyle(c.urgency)}>
                      {c.urgency}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '600' }}>
                  {c.date ? new Date(c.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                </span>
              </div>

              {/* Data list parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Service Type</span>
                  <strong>{c.category}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Phone</span>
                  <strong>{c.customerPhone || "N/A"}</strong>
                </div>
                
                <div style={{ borderTop: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ opacity: 0.6, display: 'block', marginBottom: '4px' }}>Issue Description</span>
                  <p style={{ margin: 0, fontWeight: '500' }}>{c.description || "No description text details provided."}</p>
                </div>

                {/* Voice player check */}
                {c.voiceUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', background: dark ? '#0f172a' : '#f8fafc', padding: '10px 14px', borderRadius: '12px', marginTop: '6px' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>Audio Note Details</span>
                    <button
                      onClick={() => handlePlayVoice(c.id, c.voiceUrl)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none',
                        background: playingAudioId === c.id ? '#ef4444' : '#ff7a00',
                        color: '#fff', fontWeight: '700', cursor: 'pointer',
                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto'
                      }}
                    >
                      {playingAudioId === c.id ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
                      {playingAudioId === c.id ? 'Pause' : 'Play'}
                    </button>
                  </div>
                )}

                {/* Optional Media Files Previews */}
                {c.mediaUrls && c.mediaUrls.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ opacity: 0.6, display: 'block', marginBottom: '6px', fontSize: '0.78rem' }}>Uploaded Media Files ({c.mediaUrls.length})</span>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {c.mediaUrls.map((url, i) => (
                        <div key={i} style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(128,128,128,0.2)', shrink: 0 }}>
                          {url.startsWith("data:video/") ? (
                            <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8px' }}>Video</div>
                          ) : (
                            <img src={url} alt="" style={{ width: '100%', height: '105%', objectCover: 'cover' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Payment Method</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                    {c.paymentMethod === 'SadaPay' ? <Zap className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                    {c.paymentMethod || 'Cash'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Labor Duration</span>
                  <strong>{c.hours || 1} {c.hours === 1 ? 'hour' : 'hours'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.6 }}>Total Price Budget</span>
                  <strong className="text-orange-500 font-extrabold">PKR {c.price || "Calculated at accept"}</strong>
                </div>

                {c.status !== "Pending" && c.visitTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', borderTop: dark ? '1px solid #334155' : '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <span>Scheduled Visit</span>
                    <strong>{new Date(c.visitTime).toLocaleDateString()} {new Date(c.visitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons Panel */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {type === "new" && (
                  <button
                    onClick={() => promptAccept(c.id)}
                    disabled={actionLoading === c.id + "_accept"}
                    style={{
                      background: '#ff7a00', color: '#fff', border: 'none',
                      padding: '10px 22px', borderRadius: '12px', fontWeight: '700',
                      cursor: 'pointer', opacity: actionLoading === c.id + "_accept" ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(255,122,0,0.15)', flex: 1
                    }}
                  >
                    Accept & Schedule arrival
                  </button>
                )}
                {type === "pending" && (
                  <>
                    {c.status === "Accepted" ? (
                      <button
                        onClick={() => setVerifyingBookingId(c.id)}
                        disabled={actionLoading === c.id + "_start"}
                        style={{
                          background: '#ff7a00', color: '#fff', border: 'none',
                          padding: '10px 22px', borderRadius: '12px', fontWeight: '700',
                          cursor: 'pointer', opacity: actionLoading === c.id + "_start" ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(255,122,0,0.15)', flex: 1
                        }}
                      >
                        🚀 Start Work (Verify OTP)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleComplete(c.id)}
                        disabled={actionLoading === c.id + "_complete"}
                        style={{
                          background: '#10b981', color: '#fff', border: 'none',
                          padding: '10px 22px', borderRadius: '12px', fontWeight: '700',
                          cursor: 'pointer', opacity: actionLoading === c.id + "_complete" ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(16,185,129,0.15)', flex: 1
                        }}
                      >
                        {actionLoading === c.id + "_complete" ? t("viewComplaint.updating") : "🏁 Mark Completed"}
                      </button>
                    )}
                  </>
                )}
                
                <button
                  onClick={() => setSelectedComplaint(c)}
                  style={{
                    background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(128,128,128,0.05)', 
                    border: dark ? '1px solid #334155' : '1px solid rgba(128,128,128,0.15)',
                    padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
                    color: dark ? '#e2e8f0' : '#475569', fontWeight: '700'
                  }}
                >
                  View Details
                </button>
              </div>

            </div>
          ))}
        </div>
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
