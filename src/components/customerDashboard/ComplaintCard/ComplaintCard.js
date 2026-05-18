"use client";

import { useState } from "react";
import { Phone, Star, X, Camera, Video, Mic, Send, CheckCircle } from "lucide-react";
import "./complaintCard.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function ComplaintCard({ complaint }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";

  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [audio, setAudio] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isDone = complaint.status === "Completed" || complaint.status === "Done";
  const isCancelled = complaint.status === "Cancelled" || complaint.status === "Rejected";
  const showFeedbackButton = isDone || isCancelled;

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "Accepted": return "status-accepted";
      case "In-Progress": return "status-inprogress";
      case "Completed":
      case "Done": return "status-done";
      case "Cancelled":
      case "Rejected": return "status-rejected";
      default: return "";
    }
  };

  const handleCall = () => {
    const phone = complaint.providerPhone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(`Provider contact: ${complaint.provider}\nPhone not available — please contact support.`);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!rating) { alert("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bookingId", complaint.id);
      formData.append("customerId", user?.id || complaint.customerId);
      formData.append("providerId", complaint.providerId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (photo) formData.append("photo", photo);
      if (video) formData.append("video", video);
      if (audio) formData.append("audio", audio);

      const res = await fetch("/api/feedback", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (e) {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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

        {/* ACTIONS */}
        <div className="complaint-actions">
          {showFeedbackButton ? (
            <button className="button-rate" onClick={() => setShowFeedback(true)}>
              <Star className="icon" /> {t("complaints.rate", { defaultValue: "Leave Feedback" })}
            </button>
          ) : (
            <button className="button-call" onClick={handleCall}>
              <Phone className="icon" /> {t("complaints.call", { defaultValue: "Call Provider" })}
            </button>
          )}
        </div>
      </div>

      {/* ── FEEDBACK MODAL ── */}
      {showFeedback && (
        <div className="feedback-overlay" onClick={() => !submitting && setShowFeedback(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>

            {submitted ? (
              <div className="feedback-success">
                <CheckCircle size={52} color="#10b981" />
                <h3>Thank you!</h3>
                <p>Your feedback has been submitted successfully.</p>
                <button className="close-feedback-btn" onClick={() => { setShowFeedback(false); setSubmitted(false); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="feedback-modal-header">
                  <h3>⭐ Rate Your Experience</h3>
                  <button className="close-x" onClick={() => setShowFeedback(false)}><X size={20} /></button>
                </div>

                <p className="feedback-provider-name">Provider: <strong>{complaint.provider}</strong></p>

                {/* STAR RATING */}
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      className={`star-btn ${s <= (hoverRating || rating) ? "filled" : ""}`}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="rating-label">
                  {rating === 1 ? "Poor 😞" : rating === 2 ? "Fair 😐" : rating === 3 ? "Good 🙂" : rating === 4 ? "Very Good 😊" : rating === 5 ? "Excellent 🌟" : "Select a rating"}
                </p>

                {/* COMMENT */}
                <textarea
                  className="feedback-textarea"
                  placeholder="Share your experience (optional)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                />

                {/* OPTIONAL MEDIA */}
                <p className="media-label">Attach media (optional):</p>
                <div className="media-row">

                  <label className="media-btn" title="Attach photo">
                    <Camera size={18} />
                    <span>{photo ? "📷 Photo" : "Photo"}</span>
                    <input
                      type="file" accept="image/*" hidden
                      onChange={e => setPhoto(e.target.files[0])}
                    />
                  </label>

                  <label className="media-btn" title="Attach video">
                    <Video size={18} />
                    <span>{video ? "🎬 Video" : "Video"}</span>
                    <input
                      type="file" accept="video/*" hidden
                      onChange={e => setVideo(e.target.files[0])}
                    />
                  </label>

                  <label className="media-btn" title="Attach audio">
                    <Mic size={18} />
                    <span>{audio ? "🎤 Audio" : "Audio"}</span>
                    <input
                      type="file" accept="audio/*" hidden
                      onChange={e => setAudio(e.target.files[0])}
                    />
                  </label>
                </div>

                {/* SUBMIT */}
                <button
                  className="feedback-submit-btn"
                  onClick={handleFeedbackSubmit}
                  disabled={submitting || !rating}
                >
                  {submitting ? "Submitting..." : <><Send size={16} /> Submit Feedback</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}