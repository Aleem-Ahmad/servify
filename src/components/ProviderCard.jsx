"use client";
// src/components/ProviderCard.jsx
import React, { useState } from 'react';
import '@/../src/app/(protected)/providerDashboard/providerDashboard.css';

export default function ProviderCard({ provider, editable }) {
  const [hourlyRate, setHourlyRate] = useState(provider.hourlyRate || '');
  const [schedule, setSchedule] = useState(provider.schedule || { startHour: 9, endHour: 17, daysOfWeek: [1,2,3,4,5] });
  const [offers, setOffers] = useState(provider.offers || []);
  const [newOffer, setNewOffer] = useState({ title: '', discountPct: '', validFrom: '', validTo: '' });

  const badgeClass = {
    Basic: 'badge-basic',
    Pro: 'badge-pro',
    Elite: 'badge-elite',
  }[provider.badge] || 'badge-basic';

  const handleAddOffer = () => {
    if (!newOffer.title) return;
    const offer = {
      id: Date.now().toString(),
      ...newOffer,
    };
    setOffers([...offers, offer]);
    setNewOffer({ title: '', discountPct: '', validFrom: '', validTo: '' });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/provider/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRate, schedule, offers }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="provider-card-premium">
      <div className="provider-header">
        <span className={`provider-badge ${badgeClass}`}>{provider.badge || 'Basic'}</span>
        <h2 className="provider-name">{provider.name || 'Provider Name'}</h2>
      </div>

      <div className="provider-survey">
        <strong>Last Survey:</strong>{' '}
        {provider.lastSurveyAt ? new Date(provider.lastSurveyAt).toLocaleDateString() : 'N/A'}
      </div>

      {editable && (
        <>
          <div className="provider-section">
            <label className="provider-label">Hourly Rate ($/hr)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              className="provider-input"
            />
          </div>

          <div className="provider-section">
            <label className="provider-label">Working Hours</label>
            <div className="provider-flex-row">
              <input
                type="number"
                min="0"
                max="24"
                value={schedule.startHour}
                onChange={e => setSchedule({ ...schedule, startHour: Number(e.target.value) })}
                className="provider-input provider-input-small"
                placeholder="Start"
              />
              <span className="provider-divider">-</span>
              <input
                type="number"
                min="0"
                max="24"
                value={schedule.endHour}
                onChange={e => setSchedule({ ...schedule, endHour: Number(e.target.value) })}
                className="provider-input provider-input-small"
                placeholder="End"
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <span className="provider-label">Working Days (Sun=0 … Sat=6)</span>
              <input
                type="text"
                value={schedule.daysOfWeek.join(',')}
                onChange={e =>
                  setSchedule({ ...schedule, daysOfWeek: e.target.value.split(',').map(v => Number(v.trim())) })
                }
                className="provider-input"
                placeholder="e.g., 1,2,3,4,5"
              />
            </div>
          </div>

          <div className="provider-section">
            <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>Offers / Discounts</h3>
            {offers.map(o => (
              <div key={o.id} className="provider-offer-tag">
                <div>
                  <span className="provider-offer-title">{o.title}</span> 
                  {o.discountPct ? <span style={{ marginLeft: '10px', color: 'var(--primary)' }}>{o.discountPct}% OFF</span> : ''}
                </div>
                <div className="provider-offer-date">{new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}</div>
              </div>
            ))}
            <div className="provider-offers-container">
              <input
                type="text"
                placeholder="Offer title"
                value={newOffer.title}
                onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                className="provider-input"
                style={{ marginBottom: '10px' }}
              />
              <input
                type="number"
                placeholder="Discount %"
                value={newOffer.discountPct}
                onChange={e => setNewOffer({ ...newOffer, discountPct: e.target.value })}
                className="provider-input"
                style={{ marginBottom: '10px' }}
              />
              <input
                type="date"
                placeholder="Valid from"
                value={newOffer.validFrom}
                onChange={e => setNewOffer({ ...newOffer, validFrom: e.target.value })}
                className="provider-input"
                style={{ marginBottom: '10px' }}
              />
              <input
                type="date"
                placeholder="Valid to"
                value={newOffer.validTo}
                onChange={e => setNewOffer({ ...newOffer, validTo: e.target.value })}
                className="provider-input"
                style={{ marginBottom: '10px' }}
              />
              <button onClick={handleAddOffer} className="provider-btn-outline">
                Add Offer
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="provider-btn-primary">
            Save Changes
          </button>
        </>
      )}
    </div>
  );
}
