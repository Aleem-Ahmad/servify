"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, Navigation, Clock, User, Phone, MessageSquare, 
  ShieldCheck, ArrowLeft, Zap, Wallet, AlertTriangle, DollarSign,
  Camera, Mic, Play, Square, Trash2, X
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import BookingChat from "@/components/SharedComponents/Chat/BookingChat";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function TrackBooking() {
  const router = useRouter();
  const { bookingId } = useParams();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const { t } = useLanguage();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerLoc, setProviderLoc] = useState([30.8138, 73.4534]); 
  const [customerLoc, setCustomerLoc] = useState([30.8080, 73.4450]);
  const [eta, setEta] = useState(12);
  
  // Feedback form state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Audio recording state
  const [recordingStatus, setRecordingStatus] = useState("idle"); // idle, recording, hasRecording
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceUrl(reader.result);
        };
        reader.readAsDataURL(audioBlob);
        audioChunksRef.current = [];
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecordingStatus("recording");
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recordingStatus === "recording") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setRecordingStatus("hasRecording");
    }
  };

  const deleteRecording = () => {
    setVoiceUrl("");
    setRecordingStatus("idle");
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Maximum size is 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaItem = (idx) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== idx));
  };

  // Bargaining state
  const [showBargaining, setShowBargaining] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainMessage, setBargainMessage] = useState("");
  const [bargainOffers, setBargainOffers] = useState([]);
  const [submittingBargain, setSubmittingBargain] = useState(false);

  // Fetch booking details
  useEffect(() => {
    if (!bookingId) return;
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);

          // Show feedback form if booking is just completed
          if (data.status === "Completed") {
            setShowFeedback(true);
          }

          // If customer location coordinates exist in the booking, parse them
          if (data.location && data.location.includes(",")) {
            const parts = data.location.split(",");
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              setCustomerLoc([lat, lng]);
              // Place provider slightly offset initially
              setProviderLoc([lat + 0.0058, lng + 0.0084]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
    // Always fetch bargain offers on load
    fetchBargainOffers(bookingId);
  }, [bookingId]);

  // Poll for new bargain offers every 30 seconds
  useEffect(() => {
    if (!bookingId) return;
    const interval = setInterval(() => {
      fetchBargainOffers(bookingId);
    }, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Fetch bargain offers
  const fetchBargainOffers = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/bargain`);
      if (res.ok) {
        const data = await res.json();
        setBargainOffers(data.offers || []);
      }
    } catch (err) {
      console.error("Error fetching bargain offers:", err);
    }
  };

  // Submit bargain offer
  const handleSubmitBargain = async () => {
    if (!bargainPrice || parseFloat(bargainPrice) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setSubmittingBargain(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/bargain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedPrice: parseFloat(bargainPrice),
          message: bargainMessage,
          proposerType: 'customer'
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert("Bargain offer submitted successfully!");
        setBargainPrice("");
        setBargainMessage("");
        setShowBargaining(false);
        fetchBargainOffers(bookingId);
      } else {
        alert("Failed to submit bargain offer. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setSubmittingBargain(false);
    }
  };

  // Accept bargain offer
  const handleAcceptOffer = async (offerId) => {
    if (!confirm("Are you sure you want to accept this offer?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/bargain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          action: 'accept'
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert("Offer accepted! The agreed price is PKR " + data.agreedPrice);
        fetchBargainOffers(bookingId);
        // Refresh booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        if (bookingRes.ok) {
          setBooking(await bookingRes.json());
        }
      } else {
        alert("Failed to accept offer. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  // Reject bargain offer
  const handleRejectOffer = async (offerId) => {
    if (!confirm("Are you sure you want to reject this offer?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/bargain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          action: 'reject'
        })
      });

      if (res.ok) {
        alert("Offer rejected.");
        fetchBargainOffers(bookingId);
      } else {
        alert("Failed to reject offer. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  // Simulate provider movement on the map if job is active
  useEffect(() => {
    if (!booking || booking.status !== "Accepted") return;
    const interval = setInterval(() => {
      setProviderLoc(prev => {
        const latDiff = customerLoc[0] - prev[0];
        const lngDiff = customerLoc[1] - prev[1];
        
        // Move 10% closer to customer
        return [
          prev[0] + latDiff * 0.1,
          prev[1] + lngDiff * 0.1
        ];
      });
      setEta(prev => (prev > 1 ? prev - 1 : 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [booking, customerLoc]);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }
    
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingId,
          providerId: booking.provider || booking.providerId,
          rating: rating,
          comment: comment,
          mediaUrls: mediaUrls,
          voiceUrl: voiceUrl
        })
      });
      
      if (res.ok) {
        alert("Thank you for your feedback!");
        setShowFeedback(false);
        setRating(0);
        setComment("");
        setMediaUrls([]);
        setVoiceUrl("");
        setRecordingStatus("idle");
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold">Retrieving tracking data...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        <h2 className="text-2xl font-black">Booking not found</h2>
        <button onClick={() => router.push("/customerDashboard/track")} className="text-orange-500 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isPending = booking.status === "Pending";
  const isCompleted = booking.status === "Completed";
  const isAccepted = booking.status === "Accepted" || booking.status === "In-Progress";

  return (
    <div className={`min-h-screen pt-24 pb-12 flex flex-col items-center ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      <div className="w-full max-w-5xl px-6 mb-6">
        <button 
          onClick={() => router.push("/customerDashboard/track")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
            dark 
              ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700" 
              : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> {t("Back to Tracking") || "Back to Tracking"}
        </button>
      </div>

      <div className="w-full max-w-5xl px-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        
        {/* ── MAP CONTAINER OR WAITING BANNER ── */}
        <div className="flex-1 min-h-[300px] lg:min-h-0">
          {isPending ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className={`w-full h-full rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center border relative overflow-hidden ${
                dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
              
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 mb-6 relative">
                <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-black mb-3">Waiting for Provider Acceptance</h2>
              <p className={`max-w-md text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Your general service booking has been published to all matching professionals. You will receive an arrival schedule once accepted.
              </p>

              {booking.urgency === 'Emergency' && (
                <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 animate-bounce" /> Emergency response prioritization active.
                </div>
              )}
            </motion.div>
          ) : isCompleted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className={`w-full h-full rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center border relative overflow-hidden ${
                dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black mb-3">Job Completed successfully!</h2>
              <p className={`max-w-md text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Thank you for utilizing Servify. Our 1-Day service rework or refund policy is active for your protection.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className={`w-full h-full rounded-[2rem] overflow-hidden border shadow-2xl relative z-0 ${dark ? "border-slate-800" : "border-slate-200"}`}
            >
              <MapContainer center={providerLoc} zoom={14} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                <TileLayer
                  url={dark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  }
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={providerLoc}>
                  <Popup>Provider is here!</Popup>
                </Marker>
                <Marker position={customerLoc}>
                  <Popup>Your Location</Popup>
                </Marker>
              </MapContainer>
            </motion.div>
          )}
        </div>

        {/* ── INFO PANEL ── */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className={`w-full lg:w-96 rounded-[2rem] border shadow-2xl flex flex-col overflow-hidden ${
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Provider Profile Summary Header */}
          <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-orange-500/30 overflow-hidden mb-4">
              <img src={booking.providerImage || "/default-avatar.png"} alt="Provider" className="w-full h-full object-cover" onError={(e) => { e.target.src = "/default-avatar.png"; }} />
            </div>
            
            <h2 className="text-xl font-black mb-1">{booking.providerName || "Unassigned Specialist"}</h2>
            
            <div className="mt-2">
              {isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" /> Matching Providers
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Job Finished
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs">
                  <Navigation className="w-3.5 h-3.5 text-blue-500" /> Dispatching Route
                </span>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between gap-4">
            
            {/* ETA / Scheduling Information */}
            {!isPending && !isCompleted && booking.visitTime && (
              <div className={`p-4 rounded-xl flex flex-col items-center justify-center gap-1 border ${dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <Clock className="w-6 h-6 text-emerald-500 mb-1" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Estimated arrival date & time</p>
                <h4 className="text-sm font-black text-center text-slate-800 dark:text-slate-100">
                  {new Date(booking.visitTime).toLocaleDateString()} {new Date(booking.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h4>
                <span className="text-xs text-emerald-500 font-semibold mt-1">Provider visits in ~{eta} min</span>
              </div>
            )}

            {/* Security Verification OTP */}
            {booking.otp && (
              <div className={`p-4 rounded-xl flex flex-col items-center justify-center gap-1 border ${
                dark ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600"
              }`}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Security Verification OTP</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black tracking-widest">{booking.otp}</span>
                </div>
                <p className="text-[10px] text-center opacity-75 mt-1">Share this OTP with the provider when they arrive to verify and start work.</p>
              </div>
            )}

            {/* Receipt Summary (Transparent Pricing) */}
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
              <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-orange-500 border-b pb-1.5 border-slate-250 dark:border-slate-800">
                Transparent Receipt
              </h4>
              <div className="flex justify-between">
                <span className="opacity-75">Service Request:</span>
                <strong>{booking.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Estimated Labor Duration:</span>
                <strong>{booking.hours || 1} {booking.hours === 1 ? 'hour' : 'hours'}</strong>
              </div>
              
              {!isPending && (
                <div className="flex justify-between">
                  <span className="opacity-75">Provider Rate:</span>
                  <strong>PKR {booking.hourlyRate} / hr</strong>
                </div>
              )}

              <div className="flex justify-between">
                <span className="opacity-75">Payment Gateway:</span>
                <span className="flex items-center gap-1 font-bold">
                  {booking.paymentMethod === 'SadaPay' ? <Zap className="w-3 h-3 text-emerald-500" /> : <Wallet className="w-3 h-3 text-orange-500" />}
                  {booking.paymentMethod || 'Cash'}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-orange-500 border-t pt-2 border-slate-250 dark:border-slate-800">
                <span>{isPending ? "Estimated Budget:" : "Total Budget:"}</span>
                <span>PKR {booking.agreedPrice || booking.price || "Depends on provider rate"}</span>
              </div>
            </div>

            {/* Bargaining Section */}
            {isPending && (
              <div className={`p-4 rounded-xl border ${dark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Price Negotiation
                  </h4>
                  {booking.bargainingStatus === 'Agreed' && (
                    <span className="text-xs font-bold text-emerald-500">✓ Agreed</span>
                  )}
                </div>

                {bargainOffers.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {bargainOffers.map((offer) => (
                      <div key={offer.id} className={`p-3 rounded-lg border ${dark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            {offer.proposerType === 'customer' ? (
                              <span>Your Offer</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                {offer.proposer && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                                    <img src={offer.proposer.image || '/default-avatar.png'} alt="Provider" className="w-full h-full object-cover" onError={(e) => { e.target.src = "/default-avatar.png"; }} />
                                  </div>
                                )}
                                <span className="text-slate-800 dark:text-slate-200">
                                  {offer.proposer ? offer.proposer.name : 'Provider Offer'}
                                </span>
                                {offer.proposer?.trustScore > 0 && (
                                  <span className="flex items-center text-[10px] text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                                    {offer.proposer.trustScore}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            offer.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                            offer.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                            offer.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-slate-500/10 text-slate-500'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                        <div className="text-lg font-black text-orange-500">PKR {offer.proposedPrice}</div>
                        {offer.message && <p className="text-xs text-slate-500 mt-1">{offer.message}</p>}
                        {offer.status === 'Pending' && offer.proposerType === 'provider' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectOffer(offer.id)}
                              className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mb-3">No offers yet. Start negotiating!</p>
                )}

                {!showBargaining ? (
                  <button
                    onClick={() => setShowBargaining(true)}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01]"
                  >
                    {booking.bargainingStatus === 'Agreed' ? 'Renegotiate Price' : 'Propose Your Price'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Enter your price (PKR)"
                      value={bargainPrice}
                      onChange={(e) => setBargainPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                    <textarea
                      placeholder="Add a message (optional)"
                      value={bargainMessage}
                      onChange={(e) => setBargainMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/50 dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBargaining(false)}
                        className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitBargain}
                        disabled={submittingBargain}
                        className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {submittingBargain ? 'Submitting...' : 'Submit Offer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {isAccepted && (
              <div className="space-y-2.5 mt-auto">
                <a href={`tel:${booking.providerPhone || "03000000000"}`} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] text-sm text-center">
                  <Phone className="w-4.5 h-4.5" /> Call Provider
                </a>
                <a href="#booking-chat" className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border text-sm ${
                  dark ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200"
                }`}>
                  <MessageSquare className="w-4.5 h-4.5" /> Send Message
                </a>
              </div>
            )}
          </div>

          {/* Guarantee stamp */}
          <div className={`p-4.5 text-center text-xs font-bold flex items-center justify-center gap-2 ${
            dark ? "bg-emerald-500/10 text-emerald-400 border-t border-slate-800" : "bg-emerald-50 text-emerald-600 border-t border-slate-100"
          }`}>
            <ShieldCheck className="w-4.5 h-4.5" /> 1-Day Service Guarantee Active
          </div>
        </motion.div>
      </div>

      {booking.provider && !isPending && (
        <div id="booking-chat" className="w-full max-w-5xl px-6 mt-6">
          <BookingChat
            bookingId={booking.id}
            peerName={booking.providerName || "Provider"}
          />
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && isCompleted && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: dark ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
            color: dark ? '#f1f5f9' : '#1e293b'
          }}>
            <h3 style={{ marginBottom: '16px', fontWeight: '900', color: '#ff7a00', fontSize: '1.4rem' }}>
              ⭐ Rate Your Experience
            </h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.85, marginBottom: '24px', lineHeight: '1.5' }}>
              How was your experience with {booking.providerName || "the provider"}? Your feedback helps us improve our service.
            </p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', opacity: 0.8 }}>
                Star Rating
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      fontSize: '2rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: star <= rating ? '#f59e0b' : dark ? '#475569' : '#cbd5e1',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>
                Your Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: dark ? '1.5px solid #334155' : '1.5px solid #cbd5e1',
                  background: dark ? '#0f172a' : '#f8fafc',
                  color: dark ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.95rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Media Uploads */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.8 }}>
                Attachments (Optional)
              </label>
              
              <div className="flex gap-2 mb-3">
                <label className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 border-slate-300 dark:border-slate-600 transition-colors text-slate-500 hover:text-orange-500 hover:border-orange-500">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Add Photos</span>
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                </label>

                {recordingStatus === "idle" && (
                  <button onClick={startRecording} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 border-slate-300 dark:border-slate-600 transition-colors text-slate-500 hover:text-orange-500 hover:border-orange-500">
                    <Mic className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Voice Note</span>
                  </button>
                )}
                {recordingStatus === "recording" && (
                  <button onClick={stopRecording} className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-orange-500 bg-orange-500/10 text-orange-500 animate-pulse">
                    <Square className="w-6 h-6 mb-1 fill-current" />
                    <span className="text-xs font-bold text-orange-500">Stop Recording</span>
                  </button>
                )}
                {recordingStatus === "hasRecording" && (
                  <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 relative">
                    <audio src={voiceUrl} controls className="w-full h-8 mb-1" />
                    <button onClick={deleteRecording} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} alt="upload" className="w-full h-full object-cover rounded-lg border dark:border-slate-700" />
                      <button onClick={() => removeMediaItem(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowFeedback(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: dark ? '#334155' : '#f1f5f9',
                  color: dark ? '#f1f5f9' : '#475569',
                  border: 'none', cursor: 'pointer', fontWeight: '700'
                }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#ff7a00', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: '700',
                  boxShadow: '0 8px 20px rgba(255,122,0,0.2)',
                  opacity: submittingFeedback ? 0.7 : 1
                }}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
