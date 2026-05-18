"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icons in Next.js
if (typeof window !== 'undefined') {
  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;
}

export default function DiscoveryMap({ providers = [] }) {
  return (
    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-premium border-4 border-white dark:border-slate-900">
      <MapContainer 
        center={[30.8138, 73.4534]} // Centered on Okara by default
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {providers.map((provider) => (
          <Marker 
            key={provider.id} 
            position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-slate-900">{provider.name}</h3>
                <p className="text-xs text-slate-500 uppercase font-bold">{provider.category}</p>
                <button className="mt-2 text-xs font-bold text-primary-600 hover:underline">
                  View Profile & Book
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
