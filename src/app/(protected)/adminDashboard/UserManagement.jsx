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
import { cn } from "@/lib/utils";

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
        // Update user locally
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
    const nextStatus = monitoredProvider.status === "Blocked" ? "Active" : "Blocked";
    setUpdatingId(monitoredProvider._id);
    try {
      const res = await fetch(`/api/admin/users/${monitoredProvider._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === monitoredProvider._id ? { ...u, status: nextStatus } : u));
        setMonitoredProvider(prev => ({ ...prev, status: nextStatus }));
        showAlert(`Provider ${nextStatus === "Blocked" ? "blocked" : "unblocked"} successfully!`, "success");
      } else {
        showAlert(data.message || "Failed to update status", "error");
      }
    } catch (error) {
      showAlert("Network error updating status", "error");
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
      setUsers(res.users || []);
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

  return (
    <div className="space-y-6">
      {/* Alert Toast Notification */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md",
              alertMessage.type === "error" 
                ? "bg-rose-500/20 border-rose-500/30 text-rose-200" 
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-200"
            )}
          >
            {alertMessage.type === "error" ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-semibold text-sm">{alertMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-xl font-bold">Confirm Deletion</h3>
              </div>
              <p className="text-slate-400 font-medium">
                Are you absolutely sure you want to delete this user? This action is permanent and cannot be undone. All associated data will be removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all text-sm shadow-lg shadow-rose-600/20"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h3 className="text-xl font-black text-white">Provider Monitor & Security</h3>
                    <p className="text-xs text-slate-400 font-bold">Review ratings, feedbacks, details, send warnings, or block accounts.</p>
                  </div>
                </div>
                <button
                  onClick={() => setMonitoredProvider(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Container split into Grid */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 bg-slate-900/50">
                {/* Left Column: Full Provider Profile Data & Docs */}
                <div className="space-y-6">
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={monitoredProvider.image || `https://i.pravatar.cc/150?u=${monitoredProvider.email}`}
                        alt={monitoredProvider.name}
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/150?img=33"; }}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-white">{monitoredProvider.name}</h4>
                        <p className="text-xs text-indigo-400 font-bold">@{monitoredProvider.username || "no_username"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider border",
                            monitoredProvider.status === "Active" 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : monitoredProvider.status === "Pending"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          )}>
                            {monitoredProvider.status}
                          </span>
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded text-xs font-bold">
                            {monitoredProvider.badge || "Basic"} Badge
                          </span>
                          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded text-xs font-bold">
                            Trust Score: {monitoredProvider.trustScore || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/60 text-xs font-semibold text-slate-300">
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">Email</span>
                        <a href={`mailto:${monitoredProvider.email}`} className="text-indigo-300 hover:underline">{monitoredProvider.email}</a>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">Phone</span>
                        <span>{monitoredProvider.phone || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">Category</span>
                        <span className="text-white">{monitoredProvider.category || "Not Specified"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">Location</span>
                        <span>{monitoredProvider.tehseel ? `${monitoredProvider.tehseel}, ` : ""}{monitoredProvider.district || "Not Specified"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">Experience</span>
                        <span className="text-white">{monitoredProvider.experience || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-black tracking-wider mb-0.5">CNIC Number</span>
                        <span>{monitoredProvider.cnic || "Not Provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents & Credentials */}
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider">Provider Documents & Verification</h5>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => monitoredProvider.documents?.cnicFront && window.open(monitoredProvider.documents.cnicFront)}
                        disabled={!monitoredProvider.documents?.cnicFront}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        CNIC Front
                      </button>
                      <button
                        onClick={() => monitoredProvider.documents?.cnicBack && window.open(monitoredProvider.documents.cnicBack)}
                        disabled={!monitoredProvider.documents?.cnicBack}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        CNIC Back
                      </button>
                      <button
                        onClick={() => monitoredProvider.documents?.skillDemo && window.open(monitoredProvider.documents.skillDemo)}
                        disabled={!monitoredProvider.documents?.skillDemo}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Skill Demo
                      </button>
                    </div>
                    {monitoredProvider.surveyDate && (
                      <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-between">
                        <span>Survey Assigned: {new Date(monitoredProvider.surveyDate).toLocaleDateString()}</span>
                        <span>{new Date(monitoredProvider.surveyDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Quick-Control */}
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider">Account Action Panel</h5>
                    <div className="flex gap-3">
                      <button
                        onClick={handleModalToggleStatus}
                        className={cn(
                          "flex-1 px-4 py-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2",
                          monitoredProvider.status === "Blocked"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20"
                        )}
                      >
                        {monitoredProvider.status === "Blocked" ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Unblock Account
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Block Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer Feedback Monitoring & Warning Submission */}
                <div className="flex flex-col gap-6">
                  {/* Feedback History */}
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col min-h-0 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider">Customer Feedback & Reviews</h5>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black">
                        Rating: {monitoredProvider.performance?.rating || 5.0} ⭐
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 min-h-0 max-h-[300px] pr-2">
                      {feedbacksLoading ? (
                        <div className="flex justify-center items-center h-24">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        </div>
                      ) : providerFeedbacks.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 font-bold text-xs">
                          No feedbacks submitted for this provider.
                        </div>
                      ) : (
                        providerFeedbacks.map((f) => (
                          <div key={f._id} className="bg-slate-900 border border-slate-800/50 p-3.5 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{f.customerName}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3 h-3",
                                      i < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                              {f.comment || <em className="opacity-40">No comment provided</em>}
                            </p>
                            <span className="block text-[10px] text-slate-500 font-bold">
                              {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Warning System */}
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Administrative Warning System
                    </h5>
                    <p className="text-xs text-slate-400 font-bold">
                      Issue an official warning to the provider. It will display prominently as a persistent red notification banner on their homepage.
                    </p>
                    
                    {monitoredProvider.warning && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                        <span className="font-bold text-rose-400 block mb-1">Active Warning:</span>
                        "{monitoredProvider.warning}"
                      </div>
                    )}

                    <div className="space-y-2">
                      <textarea
                        value={warningText}
                        onChange={(e) => setWarningText(e.target.value)}
                        placeholder="Type detailed warnings regarding customer reviews, negative behavior or violation of terms..."
                        className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-800 outline-none text-xs text-white placeholder-slate-500 font-bold transition-all focus:border-rose-500 focus:bg-slate-900/80"
                      />
                      <button
                        onClick={handleSendWarning}
                        disabled={sendingWarning}
                        className="w-full px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                      >
                        {sendingWarning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : monitoredProvider.warning ? (
                          "Update Active Warning"
                        ) : (
                          "Send Official Warning"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toolbar filters */}
      <div className="premium-card flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 outline-none text-sm font-semibold transition-all focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold w-full sm:w-28 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold w-full sm:w-28 cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-100/20 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/50 rounded-3xl">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
          <p className="font-semibold text-slate-500">Retrieving system database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-100/20 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/50 rounded-3xl text-center px-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border dark:border-slate-800">
            <User className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold">No Users Found</h4>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-md">
            No accounts matched your search terms or filters. Try adjusting your filter parameters or checking your spelling.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                {filteredUsers.map((u) => (
                  <tr 
                    key={u._id} 
                    className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.image || `https://i.pravatar.cc/150?u=${u.email}`} 
                          alt={u.name}
                          onError={(e) => { e.target.src = "https://i.pravatar.cc/150?img=33"; }}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <div className="font-bold">{u.name}</div>
                          <div className="text-xs text-slate-400 font-medium">@{u.username || "no_username"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {u.district || u.tehseel ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.tehseel ? `${u.tehseel}, ` : ""}{u.district}</span>
                        </div>
                      ) : (
                        <span className="opacity-40">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer outline-none transition-all disabled:opacity-50",
                          u.role === "admin" 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400" 
                            : u.role === "provider"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400"
                        )}
                      >
                        <option value="customer" className="bg-slate-900 text-white">Customer</option>
                        <option value="provider" className="bg-slate-900 text-white">Provider</option>
                        <option value="admin" className="bg-slate-900 text-white">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                        u.status === "Active"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : u.status === "Pending"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", 
                          u.status === "Active" ? "bg-emerald-500" : u.status === "Pending" ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "provider" && (
                          <button
                            onClick={() => handleOpenProviderModal(u)}
                            className="p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:scale-105 hover:bg-indigo-500/20 transition-all font-bold"
                            title="Monitor Feedbacks & Details"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          disabled={updatingId === u._id}
                          title={u.status === "Blocked" ? "Unblock user" : "Block user"}
                          className={cn(
                            "p-2 rounded-xl border transition-all disabled:opacity-50",
                            u.status === "Blocked"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:scale-105 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:scale-105 hover:bg-amber-500/20"
                          )}
                        >
                          {u.status === "Blocked" ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(u._id)}
                          disabled={updatingId === u._id || u.email === "www.aleemahmadghias@gmail.com"}
                          title={u.email === "www.aleemahmadghias@gmail.com" ? "Owner Admin cannot be deleted" : "Delete user"}
                          className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:scale-105 hover:bg-rose-500/20 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
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
