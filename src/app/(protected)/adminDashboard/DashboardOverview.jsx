"use client";

import React, { useEffect, useState } from "react";
import { Users, ShieldCheck, Clock, Briefcase, TrendingUp, AlertCircle, Activity, Zap } from "lucide-react";
import { getAdminStats } from "@/lib/actions/adminActions";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await getAdminStats();
      if (res.success) setStats(res.stats);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Loading dashboard metrics...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: <Users />, colorClass: "blue" },
    { label: "Service Providers", value: stats?.totalProviders, icon: <Briefcase />, colorClass: "purple" },
    { label: "Pending Approvals", value: stats?.pendingProviders, icon: <AlertCircle />, colorClass: "amber", highlight: true },
    { label: "Total Bookings", value: stats?.totalBookings, icon: <TrendingUp />, colorClass: "emerald" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="admin-stat-card"
            style={card.highlight ? { borderColor: 'rgba(245, 158, 11, 0.2)' } : {}}
          >
            <div className={`stat-icon ${card.colorClass}`}>
              {React.cloneElement(card.icon, { style: { width: 24, height: 24 } })}
            </div>
            <div>
              <p className="stat-label">{card.label}</p>
              <h3 className="stat-value">{card.value || 0}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="admin-panel-card"
        >
          <div className="card-title">
            <Clock style={{ width: 16, height: 16 }} className="title-icon" />
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { text: "New user registered", time: "2 minutes ago" },
              { text: "Provider verified", time: "15 minutes ago" },
              { text: "Booking completed", time: "1 hour ago" },
              { text: "New provider request", time: "3 hours ago" },
            ].map((item, i) => (
              <div key={i} className="admin-activity-item">
                <div className="activity-left">
                  <div className="activity-avatar">
                    <Activity style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="activity-text">{item.text}</p>
                    <p className="activity-time">{item.time}</p>
                  </div>
                </div>
                <span className="activity-badge success">Done</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-panel-card"
        >
          <div className="card-title">
            <Zap style={{ width: 16, height: 16 }} className="title-icon" />
            System Health
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>Database Load</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8' }}>24%</span>
              </div>
              <div className="admin-progress-track">
                <div className="admin-progress-fill indigo" style={{ width: '24%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>Storage (Cloudinary)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa' }}>65%</span>
              </div>
              <div className="admin-progress-track">
                <div className="admin-progress-fill purple" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>Server Performance</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399' }}>Excellent</span>
              </div>
              <div className="admin-progress-track">
                <div className="admin-progress-fill emerald" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text-secondary)' }}>API Response Time</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee' }}>~120ms</span>
              </div>
              <div className="admin-progress-track">
                <div className="admin-progress-fill cyan" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
