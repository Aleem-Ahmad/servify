"use client";

import { Phone, Star } from "lucide-react";
import "./complaintCard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ComplaintCard({ complaint }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "Accepted": return "status-accepted";
      case "Rejected": return "status-rejected";
      case "Done": return "status-done";
      default: return "";
    }
  };

  return (
    <div className={`complaint-card ${dark ? "dark" : ""}`}>
      
      {/* HEADER */}
      <div className="complaint-header">
        <h2>{complaint.title}</h2>
        <span className={`status-badge ${getStatusClass(complaint.status)}`}>
          {complaint.status}
        </span>
      </div>

      {/* INFO */}
      <div className="complaint-info">
        <p>{t("complaints.provider", { defaultValue: "Provider" })}: <span>{complaint.provider}</span></p>
        {complaint.time && (
          <p className="arrival-time">{t("complaints.arrival", { defaultValue: "Arrival" })}: {complaint.time}</p>
        )}
      </div>

      {/* ACTION */}
      <div className="complaint-actions">
        {complaint.status === "Done" || complaint.status === "Rejected" ? (
          <button className="button-rate">
            <Star className="icon" /> {t("complaints.rate", { defaultValue: "Rate" })}
          </button>
        ) : (
          <button className="button-call">
            <Phone className="icon" /> {t("complaints.call", { defaultValue: "Call" })}
          </button>
        )}
      </div>
    </div>
  );
}