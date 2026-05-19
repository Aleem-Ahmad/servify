"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, Navigation, Clock, User, Phone, MessageSquare, 
  ShieldCheck, ArrowLeft, Zap, Wallet, AlertTriangle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function TrackBooking({ params }) {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerLoc, setProviderLoc] = useState([30.8138, 73.4534]); 
  const [customerLoc, setCustomerLoc] = useState([30.8080, 73.4450]);
  const [eta, setEta] = useState(12);

  // Unwrap params and fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/bookings/${resolvedParams.bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
          
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
  }, [params]);

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
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tracking
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
                <span>PKR {booking.price || "Depends on provider rate"}</span>
              </div>
            </div>

            {/* Quick Actions */}
            {isAccepted && (
              <div className="space-y-2.5 mt-auto">
                <a href={`tel:${booking.providerPhone || "03000000000"}`} className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] text-sm text-center">
                  <Phone className="w-4.5 h-4.5" /> Call Provider
                </a>
                <button className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border text-sm ${
                  dark ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200"
                }`}>
                  <MessageSquare className="w-4.5 h-4.5" /> Send Message
                </button>
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
    </div>
  );
}
