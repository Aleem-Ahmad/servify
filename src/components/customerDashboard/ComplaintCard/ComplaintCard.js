"use client";

import { useState } from "react";
import { Phone, Star, X, Camera, Video, Mic, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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
      case "Pending":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Accepted":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "In-Progress":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "Completed":
      case "Done":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "Cancelled":
      case "Rejected":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`p-6 rounded-3xl border transition-all flex flex-col justify-between h-full ${
          dark ? "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl shadow-black/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/50"
        }`}
      >
        <div>
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-lg font-black line-clamp-1">{complaint.title}</h2>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusClass(complaint.status)}`}>
              {complaint.status}
            </span>
          </div>

          {/* INFO */}
          <div className="space-y-2 mb-6">
            <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>
              {t("complaints.provider", { defaultValue: "Provider" })}: <strong className={dark ? "text-white" : "text-slate-800"}>{complaint.provider}</strong>
            </p>
            {complaint.time && (
              <p className={`text-xs font-semibold ${dark ? "text-slate-500" : "text-slate-400"}`}>
                {t("complaints.arrival", { defaultValue: "Arrival" })}: {complaint.time}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {showFeedbackButton ? (
            <button 
              onClick={() => setShowFeedback(true)}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10"
            >
              <Star className="w-4 h-4 fill-white" /> {t("complaints.rate", { defaultValue: "Leave Feedback" })}
            </button>
          ) : (
            <button 
              onClick={handleCall}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                dark ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Phone className="w-4 h-4" /> {t("complaints.call", { defaultValue: "Call Provider" })}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── FEEDBACK MODAL ── */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowFeedback(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative w-full max-w-lg rounded-[2rem] overflow-hidden p-8 shadow-2xl border ${
                dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Thank you!</h3>
                  <p className={`text-sm mb-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>Your feedback has been submitted successfully.</p>
                  <button 
                    onClick={() => { setShowFeedback(false); setSubmitted(false); }}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg shadow-orange-500/20"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black">⭐ Rate Your Experience</h3>
                    <button 
                      onClick={() => setShowFeedback(false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className={`text-sm font-semibold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    Provider: <strong className={dark ? "text-white" : "text-slate-800"}>{complaint.provider}</strong>
                  </p>

                  {/* STAR RATING */}
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        className={`text-4xl transition-transform active:scale-95 ${s <= (hoverRating || rating) ? "text-yellow-500" : "text-slate-300 dark:text-slate-700"}`}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-center text-sm font-bold text-orange-500">
                    {rating === 1 ? "Poor 😞" : rating === 2 ? "Fair 😐" : rating === 3 ? "Good 🙂" : rating === 4 ? "Very Good 😊" : rating === 5 ? "Excellent 🌟" : "Select a rating"}
                  </p>

                  {/* COMMENT */}
                  <textarea
                    placeholder="Share your experience (optional)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className={`w-full p-4 rounded-2xl outline-none resize-none transition-all ${
                      dark ? "bg-slate-800/50 border border-slate-700 text-white focus:border-orange-500" : "bg-slate-50 border border-slate-200 focus:border-orange-500 text-slate-900"
                    }`}
                  />

                  {/* OPTIONAL MEDIA */}
                  <div className="space-y-2">
                    <p className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>Attach media (optional)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <label className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
                        photo ? "border-orange-500 bg-orange-500/10 text-orange-500" : dark ? "border-slate-800 hover:border-slate-700" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-bold truncate max-w-full">{photo ? "📷 Photo" : "Photo"}</span>
                        <input type="file" accept="image/*" hidden onChange={e => setPhoto(e.target.files[0])} />
                      </label>

                      <label className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
                        video ? "border-orange-500 bg-orange-500/10 text-orange-500" : dark ? "border-slate-800 hover:border-slate-700" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <Video className="w-5 h-5" />
                        <span className="text-[10px] font-bold truncate max-w-full">{video ? "🎬 Video" : "Video"}</span>
                        <input type="file" accept="video/*" hidden onChange={e => setVideo(e.target.files[0])} />
                      </label>

                      <label className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition-all ${
                        audio ? "border-orange-500 bg-orange-500/10 text-orange-500" : dark ? "border-slate-800 hover:border-slate-700" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <Mic className="w-5 h-5" />
                        <span className="text-[10px] font-bold truncate max-w-full">{audio ? "🎤 Audio" : "Audio"}</span>
                        <input type="file" accept="audio/*" hidden onChange={e => setAudio(e.target.files[0])} />
                      </label>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={submitting || !rating}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20"
                  >
                    {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Feedback</>}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}