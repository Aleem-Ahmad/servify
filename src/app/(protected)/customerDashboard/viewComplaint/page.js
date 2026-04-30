"use client";

import { useState } from "react";
import "./viewComplaint.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ViewComplaintCard() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [complaint] = useState({
    title: "Air Conditioner Not Cooling",
    description: "The AC in my living room is not cooling properly.",
    status: "Pending", // Can be "Pending" or "Done"
    provider: "Ali Electric Works",
    date: "2026-03-31",
    time: "14:30",
    otp: "839201", // OTP generated once and stored
  });

  const handleContact = () => {
    alert(`Contacting ${complaint.provider}...`);
  };

  const handleFeedback = () => {
    alert("Redirecting to feedback form...");
  };

  return (
    <div className={`complaint-page ${dark ? "dark" : ""}`}>
      <div className="complaint-card">
        <h2 className="complaint-title">{complaint.title}</h2>
        <p className="complaint-provider">{t("Service Provider:")} {complaint.provider}</p>
        <p className={`complaint-status ${complaint.status.toLowerCase()}`}>
          {t("Status:")} {complaint.status}
        </p>
        <p className="complaint-datetime">
          {t("Date:")} {complaint.date} | {t("Time:")} {complaint.time}
        </p>
        <p className="complaint-desc">{complaint.description}</p>

        {/* OTP DISPLAY */}
        {complaint.status.toLowerCase() !== "done" && (
          <p className="complaint-otp">
            <strong>{t("OTP:")}</strong> {complaint.otp}
          </p>
        )}

        <div className="complaint-action">
          {complaint.status.toLowerCase() === "pending" ? (
            <button className="contact-btn" onClick={handleContact}>
              {t("Contact")}
            </button>
          ) : (
            <button className="feedback-btn" onClick={handleFeedback}>
              {t("Leave Feedback")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}