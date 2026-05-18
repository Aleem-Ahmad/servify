"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, User, CheckCircle, XCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import "./verification-requests.css";
import { useTheme } from "@/context/ThemeContext";

export default function VerificationRequests() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pending-verifications")
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.providers);
        setLoading(false);
      });
  }, []);

  const handleDecision = async (id, action, badge, surveyDate) => {
    const body = { providerId: id, action };
    if (badge) body.badge = badge;
    if (surveyDate) body.surveyDate = surveyDate;

    const res = await fetch("/api/admin/verify-provider", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data.success) {
      if (action === 'assign-survey') {
        setRequests(prev => prev.map(req => req._id === id ? { ...req, surveyDate: surveyDate } : req));
      } else {
        setRequests(prev => prev.filter(req => req._id !== id));
      }
      alert(data.message);
    } else {
      alert(data.message || "Failed to process request");
    }
  };

  const [dateInputs, setDateInputs] = useState({});

  const handleDateChange = (id, value) => {
    setDateInputs(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className={`admin-verification-page ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="admin-header">
        <ShieldCheck size={40} color="#ff7a00" />
        <h1>Verification Portal</h1>
        <p>Review and approve new service provider registrations</p>
      </div>

      <div className="requests-container">
        {loading ? (
          <div className="loading">Checking for new requests...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">No pending verification requests.</div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-info">
                <img src={req.image || `https://i.pravatar.cc/150?u=${req.email}`} className="req-img" />
                <div>
                  <h3>{req.name}</h3>
                  <p>{req.category} | {req.district}</p>
                  <p className="font-mono text-sm" style={{ color: 'var(--primary)', marginTop: '4px' }}>
                    CNIC: {req.cnic || req.cnicNumber || "Not Provided"} | Phone: {req.phone || "Not Provided"}
                  </p>
                  <a href={`mailto:${req.email}`} className="email-link">{req.email}</a>
                </div>
              </div>

              <div className="docs-preview">
                <div className="doc-item">
                  <ImageIcon size={16} /> <span>CNIC Front</span>
                  <button 
                    onClick={() => req.documents?.cnicFront && window.open(req.documents.cnicFront)}
                    disabled={!req.documents?.cnicFront}
                    style={{ opacity: req.documents?.cnicFront ? 1 : 0.5, cursor: req.documents?.cnicFront ? 'pointer' : 'not-allowed' }}
                  >
                    {req.documents?.cnicFront ? "View" : "Missing"}
                  </button>
                </div>
                <div className="doc-item">
                  <ImageIcon size={16} /> <span>CNIC Back</span>
                  <button 
                    onClick={() => req.documents?.cnicBack && window.open(req.documents.cnicBack)}
                    disabled={!req.documents?.cnicBack}
                    style={{ opacity: req.documents?.cnicBack ? 1 : 0.5, cursor: req.documents?.cnicBack ? 'pointer' : 'not-allowed' }}
                  >
                    {req.documents?.cnicBack ? "View" : "Missing"}
                  </button>
                </div>
                <div className="doc-item">
                  <ExternalLink size={16} /> <span>Skill Demo</span>
                  <button 
                    onClick={() => req.documents?.skillDemo && window.open(req.documents.skillDemo)}
                    disabled={!req.documents?.skillDemo}
                    style={{ opacity: req.documents?.skillDemo ? 1 : 0.5, cursor: req.documents?.skillDemo ? 'pointer' : 'not-allowed' }}
                  >
                    {req.documents?.skillDemo ? "View" : "Missing"}
                  </button>
                </div>
              </div>

              <div className="action-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!req.surveyDate ? (
                  <div className="survey-assignment" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="date" 
                      value={dateInputs[req._id] || ''} 
                      onChange={(e) => handleDateChange(req._id, e.target.value)}
                      style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <button 
                      className="approve-btn pro" 
                      onClick={() => handleDecision(req._id, 'assign-survey', null, dateInputs[req._id])}
                      disabled={!dateInputs[req._id]}
                    >
                      Assign Survey Date
                    </button>
                    <button className="reject-btn" onClick={() => handleDecision(req._id, 'reject')}><XCircle size={18} /> Reject</button>
                  </div>
                ) : (
                  <>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                      Survey Assigned: {new Date(req.surveyDate).toLocaleDateString()}
                    </div>
                    <div className="badge-selector">
                      <button className="approve-btn elite" onClick={() => handleDecision(req._id, 'approve', 'Elite')}>Approve Elite</button>
                      <button className="approve-btn pro" onClick={() => handleDecision(req._id, 'approve', 'Pro')}>Approve Pro</button>
                      <button className="approve-btn basic" onClick={() => handleDecision(req._id, 'approve', 'Basic')}>Approve Basic</button>
                    </div>
                    <button className="reject-btn" onClick={() => handleDecision(req._id, 'reject')}><XCircle size={18} /> Reject</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
