// src/app/(protected)/providerDashboard/page.jsx
import React, { useEffect, useState } from 'react';
import ProviderCard from '@/components/ProviderCard';
import '@/../src/app/(protected)/adminDashboard/adminPanel.css';

export default function ProviderDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/provider/me');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>
      <ProviderCard provider={profile} editable={true} />
    </div>
  );
}
