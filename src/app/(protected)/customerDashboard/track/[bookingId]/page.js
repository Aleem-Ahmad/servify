"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Clock, User } from "lucide-react";
import "./track.css";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet components (to avoid SSR issues)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function TrackBooking({ params }) {
  const [providerLoc, setProviderLoc] = useState([30.8138, 73.4534]); // Okara sample
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
    <div className="track-page">
      <div className="track-header">
        <div className="provider-info-card">
          <img src="/provider.jpg" alt="Provider" className="track-img" />
          <div>
            <h3>Ali Electrician</h3>
            <p className="status">On the way...</p>
          </div>
          <div className="eta-badge">
            <Clock size={16} />
            <span>{eta} min</span>
          </div>
        </div>
      </div>

      <div id="map-container">
        <MapContainer center={providerLoc} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Provider Marker */}
          <Marker position={providerLoc}>
            <Popup>Ali is here!</Popup>
          </Marker>

          {/* Customer Marker */}
          <Marker position={customerLoc}>
            <Popup>Your Location</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="track-footer">
        <div className="action-btns">
          <button className="call-btn">Call Provider</button>
          <button className="msg-btn">Message</button>
        </div>
        <p className="guarantee-note">🛡️ 1-Day Service Guarantee Active</p>
      </div>
    </div>
  );
}
