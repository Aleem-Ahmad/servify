"use client";

import { useRouter } from "next/navigation";
import "./providerDashboard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ProviderDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`dashboard-home ${dark ? "dark" : ""}`}>
      <h2>{t("Dashboard Overview")}</h2>

      <div className="dashboard-cards">
        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=new")}
        >
          <h3>{t("New Complaints")}</h3>
          <p>0</p>
        </div>

        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=pending")}
        >
          <h3>{t("Pending")}</h3>
          <p>0</p>
        </div>

        <div
          className="card clickable"
          onClick={() => router.push("/providerDashboard/viewComplaint?type=done")}
        >
          <h3>{t("Completed")}</h3>
          <p>0</p>
        </div>
      </div>
    </div>
  );
}