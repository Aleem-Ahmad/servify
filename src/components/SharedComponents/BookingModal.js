"use client";

import { useState } from "react";
import { X, Zap, Shield, Wallet } from "lucide-react";
import "./bookingModal.css";

export default function BookingModal({ provider, onClose }) {
  const [urgency, setUrgency] = useState("Normal");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      alert(`Booking request sent! \nUrgency: ${urgency} \nMethod: ${paymentMethod} \n1-Day Guarantee Active!`);
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="booking-modal">
        <button className="close-btn" onClick={onClose}><X /></button>
        
        <h2>Confirm Booking</h2>
        <p>Service for: <strong>{provider.name}</strong></p>

        <div className="booking-options">
          {/* Urgency Selection */}
          <div className="option-section">
            <label><Zap size={18} /> Select Urgency</label>
            <div className="urgency-grid">
              {['Normal', 'Urgent', 'Emergency'].map((type) => (
                <button 
                  key={type}
                  className={`urgency-btn ${type.toLowerCase()} ${urgency === type ? 'active' : ''}`}
                  onClick={() => setUrgency(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            {urgency === 'Emergency' && (
              <p className="emergency-notice">🚨 Priority dispatch! Higher response time guaranteed.</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="option-section">
            <label><Wallet size={18} /> Payment Method</label>
            <div className="payment-grid">
              {['Cash', 'EasyPaisa', 'JazzCash'].map((method) => (
                <button 
                  key={method}
                  className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Guarantee Info */}
          <div className="guarantee-box">
            <Shield size={20} color="#ff7a00" />
            <div>
              <strong>1-Day Service Guarantee</strong>
              <p>Free rework or full refund if not fixed within 24 hours.</p>
            </div>
          </div>
        </div>

        <button className="confirm-btn" onClick={handleBook} disabled={loading}>
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
