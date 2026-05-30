"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  UserX, 
  UserCheck, 
  Shield, 
  Loader2, 
  User, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  X
} from "lucide-react";
import { getAllUsers } from "@/lib/actions/adminActions";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  
  // Modal states
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const [monitoredProvider, setMonitoredProvider] = useState(null);
  const [providerFeedbacks, setProviderFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);

  async function handleOpenProviderModal(provider) {
    setMonitoredProvider(provider);
    setWarningText(provider.warning || "");
    setFeedbacksLoading(true);
    try {
      const res = await fetch(`/api/feedback?providerId=${provider._id}`);
      if (res.ok) {
        const data = await res.json();
        setProviderFeedbacks(data);
      } else {
        setProviderFeedbacks([]);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
      setProviderFeedbacks([]);
    }
    setFeedbacksLoading(false);
  }

  async function handleSendWarning() {
    if (!monitoredProvider) return;
    setSendingWarning(true);
    try {
      const res = await fetch(`/api/admin/users/${monitoredProvider._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warning: warningText })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === monitoredProvider._id ? { ...u, warning: warningText } : u));
        setMonitoredProvider(prev => ({ ...prev, warning: warningText }));
        showAlert("Warning sent to provider successfully!", "success");
      } else {
        showAlert(data.message || "Failed to send warning", "error");
      }
    } catch (error) {
      showAlert("Network error sending warning", "error");
    }
    setSendingWarning(false);
  }

  async function handleModalToggleStatus() {
    if (!monitoredProvider) return;
    const isBlocking = monitoredProvider.status !== "Blocked";
    
    if (isBlocking) {
      const confirmDelete = window.confirm(
        "Blocking a provider will permanently delete their account and all their records from the system. Do you want to proceed?"
      );
      if (!confirmDelete) return;
      
      setUpdatingId(monitoredProvider._id);
      try {
        const res = await fetch(`/api/admin/users/${monitoredProvider._id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          setUsers(prev => prev.filter(u => u._id !== monitoredProvider._id));
          showAlert("Provider blocked and account permanently deleted!", "success");
          setMonitoredProvider(null);
        } else {
          showAlert(data.message || "Failed to block and delete provider", "error");
        }
      } catch (error) {
        showAlert("Network error blocking provider", "error");
      }
      setUpdatingId(null);
      return;
    }
    
    // Otherwise, unblock (Active)
    setUpdatingId(monitoredProvider._id);
    try {
      const res = await fetch(`/api/admin/users/${monitoredProvider._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === monitoredProvider._id ? { ...u, status: "Active" } : u));
        setMonitoredProvider(prev => ({ ...prev, status: "Active" }));
        showAlert("Provider unblocked successfully!", "success");
      } else {
        showAlert(data.message || "Failed to unblock provider", "error");
      }
    } catch (error) {
      showAlert("Network error unblocking status", "error");
    }
    setUpdatingId(null);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsersList();
  }, [users, searchTerm, roleFilter, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success) {
      const normalized = (res.users || []).map(u => ({
        ...u,
        _id: u.id, // Map PostgreSQL id to client-side expected _id
      }));
      setUsers(normalized);
    } else {
      showAlert(res.message || "Failed to load users", "error");
    }
    setLoading(false);
  }

  function filterUsersList() {
    let result = [...users];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term) ||
        u.phone?.includes(term) ||
        u.district?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(u => u.status === statusFilter);
    }

    setFilteredUsers(result);
  }

  function showAlert(text, type = "success") {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  }

  async function handleToggleStatus(userId, currentStatus) {
    const nextStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
    const userToToggle = users.find(u => u._id === userId);
    
    if (nextStatus === "Blocked" && userToToggle?.role === "provider") {
      const confirmDelete = window.confirm(
        "Blocking a provider will permanently delete their account and all their records from the system. Do you want to proceed?"
      );
      if (!confirmDelete) return;
      
      setUpdatingId(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          setUsers(prev => prev.filter(u => u._id !== userId));
          showAlert("Provider blocked and account permanently deleted!", "success");
        } else {
          showAlert(data.message || "Failed to block and delete provider", "error");
        }
      } catch (error) {
        showAlert("Network error blocking provider", "error");
      }
      setUpdatingId(null);
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
        showAlert(`User ${nextStatus === "Blocked" ? "blocked" : "unblocked"} successfully!`, "success");
      } else {
        showAlert(data.message || "Failed to update user status", "error");
      }
    } catch (error) {
      showAlert("Network error updating status", "error");
    }
    setUpdatingId(null);
  }

  async function handleChangeRole(userId, newRole) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showAlert(`User role updated to ${newRole}!`, "success");
      } else {
        showAlert(data.message || "Failed to update user role", "error");
      }
    } catch (error) {
      showAlert("Network error updating role", "error");
    }
    setUpdatingId(null);
  }

  async function handleDeleteUser() {
    const userId = confirmDeleteId;
    if (!userId) return;

    setUpdatingId(userId);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        showAlert("User deleted successfully!", "success");
      } else {
        showAlert(data.message || "Failed to delete user", "error");
      }
    } catch (error) {
      showAlert("Network error deleting user", "error");
    }
    setUpdatingId(null);
  }

  const roleColors = {
    admin: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' },
    provider: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
    customer: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Alert Toast Notification */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 60,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px', borderRadius: 16,
              backdropFilter: 'blur(16px)',
              background: alertMessage.type === "error" ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${alertMessage.type === "error" ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              color: alertMessage.type === "error" ? '#f87171' : '#34d399',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {alertMessage.type === "error" ? <AlertTriangle style={{ width: 18, height: 18 }} /> : <CheckCircle style={{ width: 18, height: 18 }} />}
            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%', maxWidth: 420,
                background: 'var(--admin-surface-raised)',
                border: '1px solid var(--admin-border)',
                borderRadius: 24, padding: 28,
                boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                display: 'flex', flexDirection: 'column', gap: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#f87171' }}>
                <AlertTriangle style={{ width: 28, height: 28 }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900 }}>Confirm Deletion</h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontWeight: 500, fontSize: '0.85rem', lineHeight: 1.7 }}>
                Are you absolutely sure you want to delete this user? This action is permanent and cannot be undone. All associated data will be removed.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  style={{
                    padding: '10px 18px', borderRadius: 12,
                    background: 'rgba(100, 116, 139, 0.1)', border: '1px solid var(--admin-border)',
                    color: 'var(--admin-text-secondary)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Provider Monitor Modal */}
      <AnimatePresence>
        {monitoredProvider && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', padding: 16, overflowY: 'auto' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: 1000,
                background: 'var(--admin-surface-raised)',
                border: '1px solid var(--admin-border)',
                borderRadius: 24, overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column',
                margin: '32px auto', maxHeight: '90vh'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 28px', borderBottom: '1px solid var(--admin-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(99, 102, 241, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Shield style={{ width: 24, height: 24, color: '#818cf8' }} />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--admin-text-primary)' }}>Provider Monitor & Security</h3>
                    <p style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Review ratings, feedbacks, details, send warnings, or block accounts.</p>
                  </div>
                </div>
                <button
                  onClick={() => setMonitoredProvider(null)}
                  style={{
                    padding: 8, borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(100, 116, 139, 0.08)', border: '1px solid var(--admin-border)',
                    color: 'var(--admin-text-muted)', transition: 'all 0.2s ease'
                  }}
                >
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Content Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                {/* Left: Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--admin-border)', padding: 20, borderRadius: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                      <img
                        src={monitoredProvider.image || `https://i.pravatar.cc/150?u=${monitoredProvider.email}`}
                        alt={monitoredProvider.name}
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/150?img=33"; }}
                        style={{ width: 56, height: 56, borderRadius: 18, objectFit: 'cover', border: '2px solid rgba(99, 102, 241, 0.2)' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>{monitoredProvider.name}</h4>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8' }}>@{monitoredProvider.username || "no_username"}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          <span className={`admin-status ${monitoredProvider.status === 'Active' ? 'active' : monitoredProvider.status === 'Pending' ? 'pending' : 'blocked'}`} style={{ fontSize: '0.6rem' }}>
                            <span className="status-dot" />
                            {monitoredProvider.status}
                          </span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.12)', color: '#a5b4fc' }}>
                            {monitoredProvider.badge || "Basic"} Badge
                          </span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.12)', color: '#c4b5fd' }}>
                            Trust: {monitoredProvider.trustScore || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 14, borderTop: '1px solid var(--admin-border)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}>
                      {[
                        { label: "Email", value: <a href={`mailto:${monitoredProvider.email}`} style={{ color: '#a5b4fc', textDecoration: 'none' }}>{monitoredProvider.email}</a> },
                        { label: "Phone", value: monitoredProvider.phone || "Not Provided" },
                        { label: "Category", value: <span style={{ color: 'var(--admin-text-primary)' }}>{monitoredProvider.category || "Not Specified"}</span> },
                        { label: "Location", value: `${monitoredProvider.tehseel ? monitoredProvider.tehseel + ', ' : ''}${monitoredProvider.district || "Not Specified"}` },
                        { label: "Experience", value: <span style={{ color: 'var(--admin-text-primary)' }}>{monitoredProvider.experience || "Not Provided"}</span> },
                        { label: "CNIC", value: monitoredProvider.cnic || "Not Provided" },
                      ].map(item => (
                        <div key={item.label}>
                          <span style={{ display: 'block', fontSize: '0.58rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</span>
                          {item.value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--admin-border)', padding: 20, borderRadius: 18 }}>
                    <h5 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Documents & Verification</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { label: "CNIC Front", key: "cnicFront" },
                        { label: "CNIC Back", key: "cnicBack" },
                        { label: "Skill Demo", key: "skillDemo" },
                      ].map(doc => (
                        <button
                          key={doc.key}
                          onClick={() => monitoredProvider.documents?.[doc.key] && window.open(monitoredProvider.documents[doc.key])}
                          disabled={!monitoredProvider.documents?.[doc.key]}
                          style={{
                            padding: '8px 12px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700,
                            background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--admin-border)',
                            color: monitoredProvider.documents?.[doc.key] ? '#a5b4fc' : 'var(--admin-text-muted)',
                            cursor: monitoredProvider.documents?.[doc.key] ? 'pointer' : 'not-allowed',
                            opacity: monitoredProvider.documents?.[doc.key] ? 1 : 0.3,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {doc.label}
                        </button>
                      ))}
                    </div>
                    {monitoredProvider.surveyDate && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 12,
                        background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.1)',
                        fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <span>Survey: {new Date(monitoredProvider.surveyDate).toLocaleDateString()}</span>
                        <span>{new Date(monitoredProvider.surveyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Panel */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--admin-border)', padding: 20, borderRadius: 18 }}>
                    <h5 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Account Actions</h5>
                    <button
                      onClick={handleModalToggleStatus}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 14, border: 'none',
                        background: monitoredProvider.status === "Blocked"
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: monitoredProvider.status === "Blocked"
                          ? '0 6px 20px rgba(16, 185, 129, 0.3)'
                          : '0 6px 20px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {monitoredProvider.status === "Blocked" ? (
                        <><UserCheck style={{ width: 16, height: 16 }} /> Unblock Account</>
                      ) : (
                        <><UserX style={{ width: 16, height: 16 }} /> Block Account</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Feedbacks + Warning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Feedback History */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--admin-border)', padding: 20, borderRadius: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--admin-border)', marginBottom: 12 }}>
                      <h5 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Feedback</h5>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.08)', color: '#a5b4fc' }}>
                        {monitoredProvider.performance?.rating || 5.0} ⭐
                      </span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                      {feedbacksLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                          <Loader2 style={{ width: 24, height: 24, color: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      ) : providerFeedbacks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.78rem' }}>
                          No feedbacks submitted for this provider.
                        </div>
                      ) : (
                        providerFeedbacks.map((f) => (
                          <div key={f._id} style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', padding: 14, borderRadius: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, color: 'var(--admin-text-primary)', fontSize: '0.75rem' }}>{f.customerName}</span>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    style={{
                                      width: 12, height: 12,
                                      color: i < f.rating ? '#fbbf24' : 'var(--admin-text-muted)',
                                      fill: i < f.rating ? '#fbbf24' : 'none'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.6 }}>
                              {f.comment || <em style={{ opacity: 0.4 }}>No comment provided</em>}
                            </p>
                            <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--admin-text-muted)', fontWeight: 700, marginTop: 6 }}>
                              {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Warning System */}
                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid var(--admin-border)', padding: 20, borderRadius: 18 }}>
                    <h5 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--admin-text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: '#f87171' }} />
                      Warning System
                    </h5>
                    <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>
                      Issue an official warning. It will display as a persistent red notification banner on their dashboard.
                    </p>
                    
                    {monitoredProvider.warning && (
                      <div style={{
                        padding: 12, borderRadius: 12, marginBottom: 12,
                        background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)',
                        fontSize: '0.72rem', fontWeight: 600, color: '#fca5a5'
                      }}>
                        <span style={{ fontWeight: 800, color: '#f87171', display: 'block', marginBottom: 4 }}>Active Warning:</span>
                        &ldquo;{monitoredProvider.warning}&rdquo;
                      </div>
                    )}

                    <textarea
                      value={warningText}
                      onChange={(e) => setWarningText(e.target.value)}
                      placeholder="Type detailed warnings regarding behavior or terms violations..."
                      style={{
                        width: '100%', height: 80, padding: 12, borderRadius: 12, resize: 'none',
                        background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', outline: 'none',
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-primary)',
                        fontFamily: 'inherit', transition: 'border-color 0.2s ease'
                      }}
                    />
                    <button
                      onClick={handleSendWarning}
                      disabled={sendingWarning}
                      style={{
                        width: '100%', marginTop: 10, padding: '12px 16px', borderRadius: 14, border: 'none',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.2)',
                        opacity: sendingWarning ? 0.5 : 1, transition: 'all 0.25s ease'
                      }}
                    >
                      {sendingWarning ? (
                        <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} />
                      ) : monitoredProvider.warning ? (
                        "Update Active Warning"
                      ) : (
                        "Send Official Warning"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar filters */}
      <div className="admin-panel-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 14, width: 18, height: 18, color: 'var(--admin-text-muted)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
              borderRadius: 14, fontSize: '0.82rem', fontWeight: 600,
              background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', outline: 'none',
              color: 'var(--admin-text-primary)', fontFamily: 'inherit', transition: 'border-color 0.2s ease'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: "Role", value: roleFilter, setter: setRoleFilter, options: [["all", "All Roles"], ["customer", "Customer"], ["provider", "Provider"], ["admin", "Admin"]] },
            { label: "Status", value: statusFilter, setter: setStatusFilter, options: [["all", "All Status"], ["Active", "Active"], ["Pending", "Pending"], ["Blocked", "Blocked"]] },
          ].map(filter => (
            <div key={filter.label} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderRadius: 12, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)'
            }}>
              <Filter style={{ width: 14, height: 14, color: 'var(--admin-text-muted)' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>{filter.label}:</span>
              <select
                value={filter.value}
                onChange={(e) => filter.setter(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  color: 'var(--admin-text-secondary)', fontFamily: 'inherit'
                }}
              >
                {filter.options.map(([val, label]) => (
                  <option key={val} value={val} style={{ background: 'var(--admin-surface-raised)', color: 'var(--admin-text-primary)' }}>{label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Users Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--admin-accent)', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--admin-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Retrieving system database...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(99, 102, 241, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <User style={{ width: 28, height: 28, color: 'var(--admin-text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 6 }}>No Users Found</h4>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontWeight: 500, maxWidth: 400, margin: '0 auto' }}>
            No accounts matched your search terms or filters. Try adjusting your filter parameters.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={u.image || `https://i.pravatar.cc/150?u=${u.email}`} 
                          alt={u.name}
                          onError={(e) => { e.target.src = "https://i.pravatar.cc/150?img=33"; }}
                          style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--admin-border)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--admin-text-primary)', fontSize: '0.85rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>@{u.username || "no_username"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                          <Mail style={{ width: 13, height: 13 }} />
                          {u.email}
                        </div>
                        {u.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                            <Phone style={{ width: 13, height: 13 }} />
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {u.district || u.tehseel ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}>
                          <MapPin style={{ width: 13, height: 13, color: 'var(--admin-text-muted)' }} />
                          {u.tehseel ? `${u.tehseel}, ` : ""}{u.district}
                        </div>
                      ) : (
                        <span style={{ opacity: 0.3 }}>-</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        style={{
                          padding: '5px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', outline: 'none',
                          background: roleColors[u.role]?.bg || 'transparent',
                          border: `1px solid ${roleColors[u.role]?.border || 'var(--admin-border)'}`,
                          color: roleColors[u.role]?.color || 'var(--admin-text-secondary)',
                          fontFamily: 'inherit', opacity: updatingId === u._id ? 0.5 : 1
                        }}
                      >
                        <option value="customer" style={{ background: 'var(--admin-surface-raised)', color: 'var(--admin-text-primary)' }}>Customer</option>
                        <option value="provider" style={{ background: 'var(--admin-surface-raised)', color: 'var(--admin-text-primary)' }}>Provider</option>
                        <option value="admin" style={{ background: 'var(--admin-surface-raised)', color: 'var(--admin-text-primary)' }}>Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`admin-status ${u.status === 'Active' ? 'active' : u.status === 'Pending' ? 'pending' : 'blocked'}`}>
                        <span className="status-dot" />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        {u.role === "provider" && (
                          <button
                            onClick={() => handleOpenProviderModal(u)}
                            className="admin-action-btn monitor"
                            title="Monitor Feedbacks & Details"
                          >
                            <Shield style={{ width: 15, height: 15 }} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          disabled={updatingId === u._id}
                          title={u.status === "Blocked" ? "Unblock user" : "Block user"}
                          className={`admin-action-btn ${u.status === 'Blocked' ? 'unblock' : 'block'}`}
                        >
                          {u.status === "Blocked" ? <UserCheck style={{ width: 15, height: 15 }} /> : <UserX style={{ width: 15, height: 15 }} />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(u._id)}
                          disabled={updatingId === u._id || u.email === "www.aleemahmadghias@gmail.com"}
                          title={u.email === "www.aleemahmadghias@gmail.com" ? "Owner Admin cannot be deleted" : "Delete user"}
                          className="admin-action-btn delete"
                        >
                          <Trash2 style={{ width: 15, height: 15 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
