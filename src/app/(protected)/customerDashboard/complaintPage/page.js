"use client";

import ComplaintsSection from "@/components/customerDashboard/ComplaintSection/ComplaintSection";
import { useTheme } from "@/context/ThemeContext";

export default function ComplaintsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <div className={`cd-main ${dark ? "dark" : ""}`} id="complaints">
      <ComplaintsSection />
    </div>
  );
}
