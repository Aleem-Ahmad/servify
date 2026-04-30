"use client";

import ComplaintsSection from "@/components/customerDashboard/ComplaintSection/ComplaintSection";
import "./complaintPage.css";
import { useTheme } from "@/context/ThemeContext";

export default function ComplaintsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    /* ID allows navbar + future hash navigation */
    <section id="complaints" className={`dashboard ${dark ? "dark" : ""}`}>
      <ComplaintsSection />
    </section>
  );
}
