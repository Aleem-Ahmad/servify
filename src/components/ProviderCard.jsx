"use client";
// src/components/ProviderCard.jsx
import React, { useState } from 'react';
import '@/../src/app/(protected)/adminDashboard/adminPanel.css';

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
    <div className="provider-card p-6 bg-slate-800 rounded-2-5xl text-white">
      <div className="flex items-center mb-4">
        <span className={`badge ${badgeClass} px-3 py-1 rounded`}>{provider.badge || 'Basic'}</span>
        <h2 className="ml-4 text-2xl font-semibold">{provider.name || 'Provider Name'}</h2>
      </div>

      <div className="mb-4">
        <strong>Last Survey:</strong>{' '}
        {provider.lastSurveyAt ? new Date(provider.lastSurveyAt).toLocaleDateString() : 'N/A'}
      </div>

      {editable && (
        <>
          <div className="mb-4">
            <label className="block mb-1">Hourly Rate ($/hr)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              className="input w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Working Hours</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                max="24"
                value={schedule.startHour}
                onChange={e => setSchedule({ ...schedule, startHour: Number(e.target.value) })}
                className="input w-20"
                placeholder="Start"
              />
              <span className="self-center">-</span>
              <input
                type="number"
                min="0"
                max="24"
                value={schedule.endHour}
                onChange={e => setSchedule({ ...schedule, endHour: Number(e.target.value) })}
                className="input w-20"
                placeholder="End"
              />
            </div>
            <div className="mt-2">
              <span className="block mb-1">Working Days (Sun=0 … Sat=6)</span>
              <input
                type="text"
                value={schedule.daysOfWeek.join(',')}
                onChange={e =>
                  setSchedule({ ...schedule, daysOfWeek: e.target.value.split(',').map(v => Number(v.trim())) })
                }
                className="input w-full"
                placeholder="e.g., 1,2,3,4,5"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-medium mb-2">Offers / Discounts</h3>
            {offers.map(o => (
              <div key={o.id} className="offer-tag mb-1 p-2 bg-slate-700 rounded">
                <strong>{o.title}</strong> - {o.discountPct ? `${o.discountPct}%` : ''}
                <div className="text-sm">{new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}</div>
              </div>
            ))}
            <div className="mt-2 p-3 bg-slate-700 rounded">
              <input
                type="text"
                placeholder="Offer title"
                value={newOffer.title}
                onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                className="input w-full mb-1"
              />
              <input
                type="number"
                placeholder="Discount %"
                value={newOffer.discountPct}
                onChange={e => setNewOffer({ ...newOffer, discountPct: e.target.value })}
                className="input w-full mb-1"
              />
              <input
                type="date"
                placeholder="Valid from"
                value={newOffer.validFrom}
                onChange={e => setNewOffer({ ...newOffer, validFrom: e.target.value })}
                className="input w-full mb-1"
              />
              <input
                type="date"
                placeholder="Valid to"
                value={newOffer.validTo}
                onChange={e => setNewOffer({ ...newOffer, validTo: e.target.value })}
                className="input w-full mb-1"
              />
              <button onClick={handleAddOffer} className="btn mt-1">
                Add Offer
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary mt-4">
            Save Changes
          </button>
        </>
      )}
    </div>
  );
}
