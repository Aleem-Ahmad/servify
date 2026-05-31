"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, PlusCircle } from "lucide-react";
import ComplaintCard from "@/components/customerDashboard/ComplaintCard/ComplaintCard";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ComplaintsSection() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const isUrdu = locale === "ur";
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((b) => ({
            id: b.id || b._id,
            title: b.description || b.category,
            status: b.status || "Pending",
            provider: b.providerName || "Unassigned",
            providerId: b.provider,
            providerPhone: b.providerPhone || null,
            customerPhone: b.customerPhone,
            customerId: b.customer,
            time:
              b.status !== "Pending" && b.visitTime
                ? new Date(b.visitTime).toLocaleString()
                : null,
            category: b.category,
            description: b.description,
            otp: b.otp,
            urgency: b.urgency || "Normal",
          }));
          setComplaints(formatted);
        }
      } catch (err) {
        console.error("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [user]);

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") return c.status === "Pending";
    if (statusFilter === "In-Progress")
      return c.status === "In-Progress" || c.status === "Accepted";
    if (statusFilter === "Completed") return c.status === "Completed" || c.status === "Done";
    if (statusFilter === "Cancelled") return c.status === "Cancelled" || c.status === "Rejected";
    return true;
  });

  const statusLabels = {
    All: t("status.all") || "All",
    Pending: t("status.pending") || "Pending",
    "In-Progress": t("status.inProgress") || "In Progress",
    Completed: t("status.completed") || "Completed",
    Cancelled: t("status.cancelled") || "Cancelled",
  };

  return (
    <section className="cd-section cd-section-light-tint">
      <div className="hero-bg-glow">
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.3 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.2 }} />
      </div>

      <div className="cd-content-box cd-content-box-top">
        <div className="cd-section-header">
          <div>
            <h1 className="cd-section-title">
              <ClipboardList className="w-7 h-7 text-orange-500 shrink-0" />
              {t("Your Complaints")}
            </h1>
            <p className="cd-section-subtitle">
              {isUrdu ? "اپنی تمام بکنگز اور شکایات" : "All your bookings and service requests"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/customerDashboard/complaintForm")}
            className="cd-nav-btn cd-nav-btn-orange"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("navbar.bookService") || (isUrdu ? "نئی بکنگ" : "New Booking")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "In-Progress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`cd-filter-chip ${statusFilter === status ? "active" : ""}`}
            >
              {statusLabels[status] || status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="cd-empty-panel">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="cd-empty-panel">
            <ClipboardList className={`w-12 h-12 mx-auto opacity-40 ${dark ? "text-slate-600" : "text-slate-400"}`} />
            <div>
              <p className="font-bold text-lg mb-1">
                {isUrdu ? "کوئی بکنگ نہیں" : "No bookings or complaints found"}
              </p>
              <p className={`text-sm ${dark ? "text-slate-500" : "text-slate-500"}`}>
                {isUrdu
                  ? "فلٹر بدلیں یا نئی سروس بک کریں۔"
                  : "Try another filter or book a new service."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/customerDashboard/complaintForm")}
              className="cd-action-btn"
            >
              {t("navbar.bookService") || "Book a Service"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="cd-list-wrapper" style={{ maxHeight: "min(62dvh, 520px)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredComplaints.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ComplaintCard complaint={c} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
