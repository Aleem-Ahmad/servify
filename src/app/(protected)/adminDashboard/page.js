"use client";

import React, { useState } from "react";
import DashboardOverview from "./DashboardOverview";
import VerificationRequests from "./verification-requests/page";
import UserManagement from "./UserManagement";
import RegisterAdmin from "./RegisterAdmin";
import { LayoutDashboard, Users, UserCheck, Settings, LogOut, Search, Bell, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "providers", label: "Provider Requests", icon: <UserCheck className="w-5 h-5" /> },
    { id: "users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { id: "register-admin", label: "Register Admin", icon: <UserPlus className="w-5 h-5" /> },
    { id: "settings", label: "System Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* ─── MOBILE TOP HEADER (Visible on lg:hidden) ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight">Admin Console</span>
        </div>
        
        <button 
          onClick={() => logout()}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* ─── DESKTOP SIDEBAR (Visible on lg and up) ─── */}
      <aside className="w-64 glass border-r hidden lg:flex flex-col p-6 fixed inset-y-0 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Admin Console</span>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all",
                activeTab === tab.id 
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => logout()}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-24 lg:pt-8 pb-24 lg:pb-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-gradient">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 font-medium">Welcome back, {user?.name || "Admin"}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl glass border">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
            </div>
            <button className="relative p-2.5 rounded-xl glass border text-slate-500 hover:scale-110 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <DashboardOverview />}
            {activeTab === "providers" && <VerificationRequests />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "register-admin" && <RegisterAdmin />}
            {activeTab === "settings" && (
              <div className="premium-card">
                <h2 className="text-xl font-bold mb-6">System Settings</h2>
                <p className="text-slate-500">Configuration panel coming soon.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── MOBILE BOTTOM TAB BAR (Visible on screens below lg) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all",
                activeTab === tab.id 
                  ? "text-primary-500 font-bold scale-105" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
              )}
            >
              {tab.icon}
              <span className="text-[9px] tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function ShieldCheck({ className }) {
  return (
    <svg 
      className={className} 
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
