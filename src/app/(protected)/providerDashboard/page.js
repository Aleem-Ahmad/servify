"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function ProviderDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";

  const [counts, setCounts] = useState({ new: 0, pending: 0, done: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/bookings?providerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          let newCount = 0;
          let pendingCount = 0;
          let doneCount = 0;
          
          data.forEach(c => {
            if (c.status === "Pending") newCount++;
            else if (c.status === "Accepted") pendingCount++;
            else if (c.status === "Completed") doneCount++;
          });
          
          setCounts({ new: newCount, pending: pendingCount, done: doneCount });
        }
      } catch (error) {
        console.error("Failed to fetch complaint stats:", error);
      }
    };
    fetchComplaints();
  }, [user]);

  return (
    <div className={`dashboard-home ${dark ? "dark" : ""}`}>
      <h2>{t("Dashboard Overview")}</h2>

      <div className="dashboard-cards">
        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=new")}
        >
          <h3>{t("New Complaints")}</h3>
          <p>{counts.new}</p>
        </div>

        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=pending")}
        >
          <h3>{t("Pending")}</h3>
          <p>{counts.pending}</p>
        </div>

        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=done")}
        >
          <h3>{t("Completed")}</h3>
          <p>{counts.done}</p>
        </div>
      </div>
    </div>
  );
}