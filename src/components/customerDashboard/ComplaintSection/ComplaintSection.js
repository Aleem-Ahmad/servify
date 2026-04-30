"use client";

import { useState, useRef, useEffect } from "react";
import { ClipboardList } from "lucide-react";

import ComplaintCard from "@/components/customerDashboard/ComplaintCard/ComplaintCard";
import "./complaintSection.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

export default function ComplaintsSection() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [complaints, setComplaints] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = require("@/context/AuthContext").useAuth();

  const sectionRef = useRef(null);

  /* Detect screen size & fetch data */
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);

    // Fetch real bookings/complaints from the database
    const fetchComplaints = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`/api/bookings?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            // Map backend fields to frontend expected structure
            const formatted = data.map(b => ({
              id: b.id || b._id,
              title: b.description || b.category,
              status: b.status || "Pending",
              provider: b.providerName || "Unassigned",
              time: b.date ? new Date(b.date).toLocaleString() : "Recently",
            }));
            setComplaints(formatted);
          }
        } catch (err) {
          console.error("Failed to load complaints");
        }
      }
    };
    fetchComplaints();

    return () => window.removeEventListener("resize", checkScreen);
  }, [user]);

  /* Show all on mobile */
  const visibleComplaints = isMobile
    ? complaints
    : expanded
    ? complaints
    : complaints.slice(0, 4);

  const handleToggle = () => {
    if (expanded) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setExpanded(!expanded);
  };

  return (
    <section className={`complaints-section ${dark ? "dark" : ""}`} ref={sectionRef}>
      <div className="complaints-container">

        {/* HEADER */}
        <div className="complaints-header">
          <h1>
            <ClipboardList size={22} />
            {t("Your Complaints")}
          </h1>

          {/* Button ONLY on desktop */}
          {!isMobile && complaints.length > 4 && (
            <button onClick={handleToggle}>
              {expanded ? t("See Less") : t("See All")}
            </button>
          )}
        </div>

        {/* GRID */}
        <div className={`complaints-grid ${expanded && !isMobile ? "expanded" : ""}`}>
          {visibleComplaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>

      </div>
    </section>
  );
}