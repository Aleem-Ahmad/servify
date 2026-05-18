"use client";

import { useState } from "react";
import { ShieldCheck, Upload, FileText, PlayCircle, MapPin } from "lucide-react";
import "./verification.css";
import { useTheme } from "@/context/ThemeContext";

export default function Verification() {
  const { theme } = useTheme();
  const [status, setStatus] = useState("Unverified");

  const [docs, setDocs] = useState({
    cnicFront: null,
    cnicBack: null,
    skillDemo: null,
    addressProof: null
  });

  const handleUpload = (type) => {
    // Simulating file upload
    alert(`${type} upload started...`);
    setDocs(prev => ({ ...prev, [type]: "uploaded" }));
  };

  const handleSubmit = () => {
    if (Object.values(docs).every(d => d !== null)) {
      setStatus("Pending Review");
      alert("Verification documents submitted for review!");
    } else {
      alert("Please upload all required documents.");
    }
  };

  return (
    <div className={`verification-page ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="verification-header">
        <ShieldCheck size={48} color="#ff7a00" />
        <h1>Provider Verification</h1>
        <p>Complete your profile verification to unlock the <strong>Elite Badge</strong> and <strong>Smart Matching</strong>.</p>
        <div className={`status-pill ${status.toLowerCase().replace(' ', '-')}`}>{status}</div>
      </div>

      <div className="verification-grid">
        {/* CNIC Front */}
        <div className="doc-card">
          <FileText size={32} />
          <h3>CNIC (Front)</h3>
          <p>Original ID Card Front side clear picture.</p>
          <button className={`upload-btn ${docs.cnicFront ? 'done' : ''}`} onClick={() => handleUpload('cnicFront')}>
            {docs.cnicFront ? "Change File" : "Upload Image"} <Upload size={16} />
          </button>
        </div>

        {/* CNIC Back */}
        <div className="doc-card">
          <FileText size={32} />
          <h3>CNIC (Back)</h3>
          <p>Original ID Card Back side clear picture.</p>
          <button className={`upload-btn ${docs.cnicBack ? 'done' : ''}`} onClick={() => handleUpload('cnicBack')}>
            {docs.cnicBack ? "Change File" : "Upload Image"} <Upload size={16} />
          </button>
        </div>

        {/* Skill Demo */}
        <div className="doc-card">
          <PlayCircle size={32} />
          <h3>Skill Demo</h3>
          <p>A short video or portfolio link showing your work.</p>
          <button className={`upload-btn ${docs.skillDemo ? 'done' : ''}`} onClick={() => handleUpload('skillDemo')}>
            {docs.skillDemo ? "Change File" : "Upload Video/Link"} <Upload size={16} />
          </button>
        </div>

        {/* Address Proof */}
        <div className="doc-card">
          <MapPin size={32} />
          <h3>Address Proof</h3>
          <p>Utility bill or domicile showing your current address.</p>
          <button className={`upload-btn ${docs.addressProof ? 'done' : ''}`} onClick={() => handleUpload('addressProof')}>
            {docs.addressProof ? "Change File" : "Upload Document"} <Upload size={16} />
          </button>
        </div>
      </div>

      <button className="final-submit" onClick={handleSubmit}>Submit for Verification</button>
    </div>
  );
}
