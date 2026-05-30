"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Calendar,
  Briefcase, 
  User, 
  FileText,
  Receipt
} from "lucide-react";
import { getAdminEarnings } from "@/lib/actions/adminActions";
import { motion } from "framer-motion";

export default function Earnings() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if current user is the owner admin
  const isOwnerAdmin = user?.email === "www.aleemahmadghias@gmail.com";

  useEffect(() => {
    if (!isOwnerAdmin) return;
    
    async function fetchEarnings() {
      try {
        const res = await getAdminEarnings();
        if (res.success) {
          setData(res.earnings);
        } else {
          setError(res.message || "Failed to load earnings statistics.");
        }
      } catch (err) {
        setError("Network error fetching earnings data.");
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, [isOwnerAdmin]);

  if (!isOwnerAdmin) {
    return (
      <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 560, margin: '0 auto', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldAlert style={{ width: 28, height: 28, color: '#f87171' }} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f87171', marginBottom: 8 }}>Access Restricted</h2>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontWeight: 500, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Only the primary Owner Admin (<span style={{ color: 'var(--admin-text-secondary)', fontWeight: 700 }}>www.aleemahmadghias@gmail.com</span>) has access privileges to the Platform Earnings and Financial Ledger.
        </p>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Compiling ledger & calculating platform cuts...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="admin-panel-card" style={{ textAlign: 'center', padding: '48px 24px', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
      <ShieldAlert style={{ width: 48, height: 48, color: '#f87171', margin: '0 auto 16px' }} />
      <p style={{ color: '#f87171', fontWeight: 700, fontSize: '0.9rem' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ── Revenue Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-stat-card"
        >
          <div className="stat-icon indigo">
            <DollarSign style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <p className="stat-label">Gross Transaction Volume</p>
            <h3 className="stat-value">Rs. {(data?.totalProcessed || 0).toLocaleString()}</h3>
            <p className="stat-hint">Total processed through platform</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-stat-card"
          style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
        >
          <div className="stat-icon emerald">
            <Percent style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <p className="stat-label" style={{ color: '#34d399' }}>Platform Cut (10%)</p>
            <h3 className="stat-value" style={{ color: '#6ee7b7' }}>Rs. {Math.round(data?.platformCut || 0).toLocaleString()}</h3>
            <p className="stat-hint" style={{ color: 'rgba(16, 185, 129, 0.5)' }}>Net website administrative earnings</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-stat-card"
        >
          <div className="stat-icon cyan">
            <TrendingUp style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <p className="stat-label">Completed Jobs</p>
            <h3 className="stat-value">{data?.bookingsCount || 0}</h3>
            <p className="stat-hint">Successful client services delivered</p>
          </div>
        </motion.div>
      </div>

      {/* ── Bookings Ledger ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Receipt style={{ width: 18, height: 18, color: '#818cf8' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Financial Ledger
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999,
            background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.12)',
            color: '#a5b4fc'
          }}>
            {data?.bookings?.length || 0} Records
          </span>
        </div>

        {data?.bookings?.length === 0 ? (
          <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText style={{ width: 24, height: 24, color: 'var(--admin-text-muted)' }} />
            </div>
            <h5 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--admin-text-primary)', marginBottom: 6 }}>No Financial Transactions</h5>
            <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', fontWeight: 500, maxWidth: 380, margin: '0 auto' }}>
              Once service providers complete customer bookings, detailed platform fees and ledger transactions will populate here.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Service & ID</th>
                    <th>Customer</th>
                    <th>Provider</th>
                    <th>Date</th>
                    <th>Total Budget</th>
                    <th style={{ textAlign: 'right' }}>Platform Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.bookings?.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                            <Briefcase style={{ width: 16, height: 16 }} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--admin-text-primary)', display: 'block', fontSize: '0.82rem' }}>{b.service}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--admin-text-muted)' }}>#{b.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User style={{ width: 14, height: 14, color: 'var(--admin-text-muted)' }} />
                          <span style={{ fontWeight: 600 }}>{b.customerName || "Customer"}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User style={{ width: 14, height: 14, color: 'var(--admin-text-muted)' }} />
                          <span style={{ fontWeight: 600 }}>{b.providerName || "Verified Provider"}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>
                          <Calendar style={{ width: 13, height: 13 }} />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                        Rs. {(b.budget || 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 900, color: '#34d399', fontSize: '0.85rem' }}>
                        +Rs. {Math.round((b.budget || 0) * 0.10).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
