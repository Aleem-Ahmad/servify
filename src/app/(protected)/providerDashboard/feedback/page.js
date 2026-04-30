"use client";
import "./feedback.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function FeedbackPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const feedbacks = [
    { user: "Usman Nawaz", rating: 5, comment: "Excellent work! Ahmar finished the wiring perfectly and on time.", media: [] },
    { user: "Quratulnain", rating: 4, comment: "Shahzad was very professional, though he arrived 10 minutes late.", media: [] },
    { user: "Samran Naveed", rating: 5, comment: "Muhammad Umar is the best electrician in the area. Highly recommended!", media: ["https://images.unsplash.com/photo-1558211583-d26f610c1eb1?w=200"] },
    { user: "M Tayyab", rating: 4, comment: "Good service by Mohsin. Clean work and fair pricing.", media: [] },
  ];

  return (
    <div className={`dashboard-feedback ${dark ? "dark" : ""}`}>
      <h2>{t("User Feedback")}</h2>

      {feedbacks.length === 0 ? (
        <p>{t("No feedback yet.")}</p>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((f, idx) => (
            <div key={idx} className="feedback-card">
              <p><strong>{f.user}</strong> ({f.rating}/5)</p>
              <p>{f.comment}</p>

              {f.media?.length > 0 && (
                <div className="feedback-media">
                  {f.media.map((m, i) => (
                    <img key={i} src={m} alt="feedback" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}