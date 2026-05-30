"use client";

import React, { useState } from "react";
import DashboardOverview from "./DashboardOverview";
import VerificationRequests from "./verification-requests/page";
import UserManagement from "./UserManagement";
import RegisterAdmin from "./RegisterAdmin";
import Earnings from "./Earnings";
import "./adminPanel.css";
import { LayoutDashboard, Users, UserCheck, Settings, LogOut, Search, Bell, UserPlus, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  const isOwnerAdmin = user?.email === "www.aleemahmadghias@gmail.com";

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="nav-icon" /> },
    { id: "providers", label: "Provider Requests", icon: <UserCheck className="nav-icon" /> },
    { id: "users", label: "User Management", icon: <Users className="nav-icon" /> },
    ...(isOwnerAdmin ? [
      { id: "earnings", label: "Earnings", icon: <Coins className="nav-icon" /> },
      { id: "register-admin", label: "Register Admin", icon: <UserPlus className="nav-icon" /> }
    ] : []),
    { id: "settings", label: "System Settings", icon: <Settings className="nav-icon" /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--admin-surface)', color: 'var(--admin-text-primary)', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      
      {/* ─── MOBILE TOP HEADER ─── */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <ShieldCheck style={{ width: 18, height: 18 }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f1f5f9' }}>Admin</span>
        </div>
        <button 
          onClick={() => logout()}
          style={{ padding: 8, borderRadius: 10, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Logout"
        >
          <LogOut style={{ width: 20, height: 20 }} />
        </button>
      </header>

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div className="brand-text">Servify</div>
            <div className="brand-sub">Admin Console</div>
          </div>
        </div>

        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => logout()}
          className="admin-sidebar-logout"
        >
          <LogOut style={{ width: 18, height: 18 }} />
          <span>Logout</span>
        </button>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1 className="header-title">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="header-subtitle">Welcome back, {user?.name || "Admin"}</p>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search-box" style={{ display: 'none' }}> {/* Hidden on mobile via CSS */}
              <Search className="search-icon" />
              <input type="text" placeholder="Search anything..." />
            </div>
            <button className="admin-notif-btn">
              <Bell style={{ width: 18, height: 18 }} />
              <span className="notif-dot" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {activeTab === "overview" && <DashboardOverview />}
            {activeTab === "providers" && <VerificationRequests />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "earnings" && <Earnings />}
            {activeTab === "register-admin" && <RegisterAdmin />}
            {activeTab === "settings" && (
              <div className="admin-panel-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <Settings style={{ width: 48, height: 48, color: 'var(--admin-text-muted)', marginBottom: 16, margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: 8 }}>System Settings</h2>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Configuration panel coming soon.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <div className="admin-mobile-nav">
        <div className="nav-items">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function ShieldCheck({ className, style }) {
  return (
    <svg 
      className={className}
      style={style}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
