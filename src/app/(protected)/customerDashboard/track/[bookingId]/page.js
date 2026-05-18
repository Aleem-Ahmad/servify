"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Clock, User, Phone, MessageSquare, ShieldCheck, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function TrackBooking({ params }) {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [providerLoc, setProviderLoc] = useState([30.8138, 73.4534]); 
  const [customerLoc] = useState([30.8080, 73.4450]);
  const [eta, setEta] = useState(12);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProviderLoc(prev => [
        prev[0] - 0.0005,
        prev[1] - 0.0008
      ]);
      setEta(prev => (prev > 1 ? prev - 1 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen pt-24 pb-12 flex flex-col items-center ${dark ? "bg-[#050a14] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      <div className="w-full max-w-5xl px-6 mb-6">
        <button 
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </button>
      </div>

      <div className="w-full max-w-5xl px-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        
        {/* ── MAP CONTAINER ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className={`flex-1 rounded-[2rem] overflow-hidden border shadow-2xl relative z-0 ${dark ? "border-slate-800" : "border-slate-200"}`}
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

        {/* ── INFO PANEL ── */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className={`w-full lg:w-96 rounded-[2rem] border shadow-2xl flex flex-col overflow-hidden ${
            dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="p-8 pb-6 border-b border-slate-200 dark:border-slate-800 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-orange-500/30 overflow-hidden mb-4">
              <img src="/provider.jpg" alt="Provider" className="w-full h-full object-cover" onError={(e) => { e.target.src = "/default-avatar.png"; }} />
            </div>
            <h2 className="text-2xl font-black mb-1">Ali Electrician</h2>
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 font-bold text-sm">
              <Navigation className="w-4 h-4" /> On the way
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col gap-6">
            <div className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-2 border ${dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <Clock className="w-8 h-8 text-emerald-500 mb-1" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Estimated Arrival</p>
              <h3 className="text-4xl font-black text-emerald-500">{eta} <span className="text-xl">min</span></h3>
            </div>

            <div className="space-y-3 mt-auto">
              <button className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]">
                <Phone className="w-5 h-5" /> Call Provider
              </button>
              <button className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border ${
                dark ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200"
              }`}>
                <MessageSquare className="w-5 h-5" /> Send Message
              </button>
            </div>
          </div>

          <div className={`p-4 text-center text-xs font-bold flex items-center justify-center gap-2 ${
            dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
          }`}>
            <ShieldCheck className="w-4 h-4" /> 1-Day Service Guarantee Active
          </div>
        </motion.div>
      </div>
    </div>
  );
}
