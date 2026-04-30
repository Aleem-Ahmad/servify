"use client";

import { useState } from "react";
import "./viewProvider.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ViewProvider() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [provider] = useState({
    name: "Ali Electric Works",
    category: "Electrical Services",
    profilePic: "/provider.jpg", // placeholder image path
    services: [
      "AC Repair",
      "Wiring",
      "Appliance Maintenance",
      "Generator Repair",
    ],
    schedule: "Mon - Sat | 9:00 AM - 6:00 PM",
    costing: "Starting from PKR 500",
    offers: "10% off for first-time customers",
    gallery: ["/service1.jpg", "/service2.jpg", "/service3.jpg"], // provider images
  });

  const [feedback] = useState([
    {
      id: 1,
      user: "Muhammad Umar",
      comment: "Excellent service, fast response!",
      media: ["/feedback1.jpg"],
    },
    {
      id: 2,
      user: "Sara Khan",
      comment: "Very professional and reasonable pricing.",
      media: [],
    },
    {
      id: 3,
      user: "Ali Raza",
      comment: "Friendly staff and reliable service.",
      media: ["/feedback2.mp4"],
    },
  ]);

  return (
    <div className={`view-provider-page ${dark ? "dark" : ""}`}>
      {/* PROVIDER DETAILS SECTION */}
      <div className="provider-container">
        {/* LEFT DIV: Profile Pic + Basic Info */}
        <div className="provider-left">
          <div className="provider-card">
            <img
              src={provider.profilePic}
              alt={provider.name}
              className="provider-pic"
            />
            <h2 className="provider-name">{provider.name}</h2>
            <p className="provider-category">{provider.category}</p>
            <button className="book-btn">{t("Book Me")}</button>
          </div>
        </div>

        {/* RIGHT DIV: Provider Details */}
        <div className="provider-right">
          <div className="provider-card">
            <div className="provider-section">
              <h4>{t("Services Offered:")}</h4>
              <ul>
                {provider.services.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>

            <div className="provider-section">
              <h4>{t("Schedule:")}</h4>
              <p>{provider.schedule}</p>
            </div>

            <div className="provider-section">
              <h4>{t("Costing:")}</h4>
              <p>{provider.costing}</p>
            </div>

            <div className="provider-section">
              <h4>{t("Offers:")}</h4>
              <p>{provider.offers}</p>
            </div>

            <div className="provider-section">
              <h4>{t("Gallery:")}</h4>
              <div className="provider-gallery">
                {provider.gallery.map((img, index) => (
                  <img key={index} src={img} alt={`Service ${index + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK SECTION */}
      <div className="feedback-section">
        <h3>{t("Feedback & Comments")}</h3>
        {feedback.map((fb) => (
          <div key={fb.id} className="feedback-card">
            <strong>{fb.user}</strong>
            <p>{fb.comment}</p>
            <div className="feedback-media">
              {fb.media.map((mediaItem, index) =>
                mediaItem.endsWith(".mp4") ? (
                  <video key={index} src={mediaItem} controls />
                ) : (
                  <img key={index} src={mediaItem} alt={`media ${index + 1}`} />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}