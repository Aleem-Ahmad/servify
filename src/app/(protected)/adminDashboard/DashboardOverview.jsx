"use client";

import React, { useEffect, useState } from "react";
import { Users, ShieldCheck, Clock, Briefcase, TrendingUp, AlertCircle } from "lucide-react";
import { getAdminStats } from "@/lib/actions/adminActions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" />
    </div>
  );

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: <Users />, color: "bg-blue-500" },
    { label: "Service Providers", value: stats?.totalProviders, icon: <Briefcase />, color: "bg-purple-500" },
    { label: "Pending Approvals", value: stats?.pendingProviders, icon: <AlertCircle />, color: "bg-amber-500", highlight: true },
    { label: "Total Bookings", value: stats?.totalBookings, icon: <TrendingUp />, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "premium-card flex items-center gap-6 group",
              card.highlight && "border-amber-500/50 bg-amber-500/5"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
              card.color
            )}>
              {React.cloneElement(card.icon, { className: "w-7 h-7" })}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-black">{card.value || 0}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">New user registered</p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">Success</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            System Status
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Database Load</span>
                <span>24%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 w-[24%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Storage (Cloudinary)</span>
                <span>65%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-500 w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Server Performance</span>
                <span>Excellent</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
