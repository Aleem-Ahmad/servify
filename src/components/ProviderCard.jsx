"use client";
// src/components/ProviderCard.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Clock, Tag, Plus, Trash2, Save, 
  Calendar, Zap, BadgePercent, CheckCircle2, AlertTriangle, Timer
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import '@/../src/app/(protected)/providerDashboard/providerDashboard.css';

const DAYS = [
  { label: 'Sun', val: 0 },
  { label: 'Mon', val: 1 },
  { label: 'Tue', val: 2 },
  { label: 'Wed', val: 3 },
  { label: 'Thu', val: 4 },
  { label: 'Fri', val: 5 },
  { label: 'Sat', val: 6 },
];

function getDaysUntilExpiry(validTo) {
  const now = new Date();
  const end = new Date(validTo);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ProviderCard({ provider, editable }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [hourlyRate, setHourlyRate] = useState(provider.hourlyRate || '');
  const [schedule, setSchedule] = useState(
    provider.schedule || { startHour: 9, endHour: 17, daysOfWeek: [1, 2, 3, 4, 5] }
  );
  const [offers, setOffers] = useState(
    (provider.offers || []).filter(o => new Date(o.validTo) >= new Date())
  );
  const [newOffer, setNewOffer] = useState({
    title: '', description: '', discountPct: '', validFrom: '', validTo: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const badgeColors = {
    Basic: { bg: '#1e293b', text: '#94a3b8', border: '#334155' },
    Pro:   { bg: '#1a2744', text: '#60a5fa', border: '#2563eb' },
    Elite: { bg: '#2d1b4e', text: '#c084fc', border: '#9333ea' },
  };
  const badge = provider.badge || 'Basic';
  const bc = badgeColors[badge] || badgeColors.Basic;

  const toggleDay = (dayVal) => {
    const current = schedule.daysOfWeek || [];
    if (current.includes(dayVal)) {
      setSchedule({ ...schedule, daysOfWeek: current.filter(d => d !== dayVal) });
    } else {
      setSchedule({ ...schedule, daysOfWeek: [...current, dayVal].sort() });
    }
  };

  const handleAddOffer = () => {
    if (!newOffer.title || !newOffer.validFrom || !newOffer.validTo) {
      alert('Please fill in Offer Title, Valid From, and Valid To dates.');
      return;
    }
    if (new Date(newOffer.validTo) <= new Date(newOffer.validFrom)) {
      alert('Valid To date must be after Valid From date.');
      return;
    }
    setOffers(prev => [...prev, { id: Date.now().toString(), ...newOffer }]);
    setNewOffer({ title: '', description: '', discountPct: '', validFrom: '', validTo: '' });
  };

  const handleRemoveOffer = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/provider/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRate: parseFloat(hourlyRate) || 0, schedule, offers }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display}:00 ${ampm}`;
  };

  return (
    <div className={`pcard-root ${dark ? 'dark' : ''}`}>
      {/* ── HEADER ── */}
      <div className="pcard-header">
        <div className="pcard-header-left">
          <span className="pcard-badge" style={{ background: bc.bg, color: bc.text, borderColor: bc.border }}>
            {badge === 'Elite' && '👑 '}
            {badge === 'Pro' && '⚡ '}
            {badge}
          </span>
          <h2 className="pcard-name">{provider.name || 'Provider'}</h2>
          <p className="pcard-sub">{provider.category || 'Service Professional'}</p>
        </div>
        <div className="pcard-header-right">
          <div className="pcard-rate-display">
            <span className="pcard-rate-label">Current Rate</span>
            <span className="pcard-rate-value">PKR {provider.hourlyRate || 0}<span>/hr</span></span>
          </div>
        </div>
      </div>

      {editable && (
        <div className="pcard-body">
          
          {/* ── SECTION 1: PRICING ── */}
          <div className="pcard-section">
            <div className="pcard-section-title">
              <DollarSign className="w-4 h-4" /> Hourly Rate (PKR)
            </div>
            <div className="pcard-rate-input-wrap">
              <span className="pcard-currency">PKR</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="pcard-input pcard-rate-input"
                placeholder="e.g. 800"
                min="0"
              />
              <span className="pcard-per-hr">/hr</span>
            </div>
            <p className="pcard-hint">
              <Zap className="w-3 h-3" /> Customers see this as your base rate. Final pricing is negotiated per booking.
            </p>
          </div>

          {/* ── SECTION 2: SCHEDULE ── */}
          <div className="pcard-section">
            <div className="pcard-section-title">
              <Clock className="w-4 h-4" /> Working Schedule
            </div>
            
            <div className="pcard-days-grid">
              {DAYS.map(d => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => toggleDay(d.val)}
                  className={`pcard-day-pill ${(schedule.daysOfWeek || []).includes(d.val) ? 'active' : ''}`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="pcard-time-row">
              <div className="pcard-time-block">
                <label className="pcard-time-label">Start Time</label>
                <div className="pcard-time-select-wrap">
                  <select
                    value={schedule.startHour}
                    onChange={e => setSchedule({ ...schedule, startHour: Number(e.target.value) })}
                    className="pcard-select"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{formatHour(i)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pcard-time-sep">→</div>
              <div className="pcard-time-block">
                <label className="pcard-time-label">End Time</label>
                <div className="pcard-time-select-wrap">
                  <select
                    value={schedule.endHour}
                    onChange={e => setSchedule({ ...schedule, endHour: Number(e.target.value) })}
                    className="pcard-select"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{formatHour(i)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: OFFERS ── */}
          <div className="pcard-section">
            <div className="pcard-section-title">
              <BadgePercent className="w-4 h-4" /> Active Offers & Discounts
            </div>

            {/* Existing Offers */}
            {offers.length > 0 ? (
              <div className="pcard-offers-list">
                {offers.map(o => {
                  const daysLeft = getDaysUntilExpiry(o.validTo);
                  const isExpiringSoon = daysLeft <= 3;
                  return (
                    <div key={o.id} className={`pcard-offer-card ${isExpiringSoon ? 'expiring' : ''}`}>
                      <div className="pcard-offer-top">
                        <div className="pcard-offer-info">
                          <span className="pcard-offer-title">{o.title}</span>
                          {o.discountPct && (
                            <span className="pcard-offer-pct">{o.discountPct}% OFF</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOffer(o.id)}
                          className="pcard-offer-delete"
                          title="Remove offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {o.description && <p className="pcard-offer-desc">{o.description}</p>}
                      <div className="pcard-offer-footer">
                        <span className="pcard-offer-dates">
                          <Calendar className="w-3 h-3" />
                          {new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}
                        </span>
                        <span className={`pcard-offer-expiry ${isExpiringSoon ? 'soon' : ''}`}>
                          <Timer className="w-3 h-3" />
                          {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="pcard-empty-offers">
                <Tag className="w-5 h-5 opacity-40" />
                <span>No active offers. Add one below to attract customers!</span>
              </div>
            )}

            {/* New Offer Form */}
            <div className="pcard-new-offer-form">
              <div className="pcard-new-offer-title">
                <Plus className="w-3.5 h-3.5" /> Add New Offer
              </div>
              <input
                type="text"
                placeholder="Offer title (e.g. Summer Discount)"
                value={newOffer.title}
                onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                className="pcard-input"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newOffer.description}
                onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                className="pcard-input"
              />
              <div className="pcard-offer-inputs-row">
                <div style={{ flex: 1 }}>
                  <label className="pcard-time-label">Discount %</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={newOffer.discountPct}
                    onChange={e => setNewOffer({ ...newOffer, discountPct: e.target.value })}
                    className="pcard-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="pcard-time-label">Valid From</label>
                  <input
                    type="date"
                    value={newOffer.validFrom}
                    onChange={e => setNewOffer({ ...newOffer, validFrom: e.target.value })}
                    className="pcard-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="pcard-time-label">Valid To</label>
                  <input
                    type="date"
                    value={newOffer.validTo}
                    onChange={e => setNewOffer({ ...newOffer, validTo: e.target.value })}
                    className="pcard-input"
                    min={newOffer.validFrom || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button type="button" onClick={handleAddOffer} className="pcard-btn-add-offer">
                <Plus className="w-4 h-4" /> Add Offer
              </button>
            </div>
          </div>

          {/* ── SAVE ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`pcard-btn-save ${saved ? 'saved' : ''}`}
          >
            {saving ? (
              <>
                <div className="pcard-spinner" /> Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
