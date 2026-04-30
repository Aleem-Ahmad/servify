"use client";

import NavBar from "@/components/SharedComponents/NavBar/NavBar";
import "@/styles/landingPage.css";
import { useTheme } from "@/context/ThemeContext";

export default function CustomerDashboardLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className={`customer-dashboard-layout ${darkMode ? "dark" : ""}`} style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      {/* NAVBAR SHARED ACROSS CUSTOMER DASHBOARD */}
      <NavBar type="dashboard"/>

      {/* PAGE CONTENT */}
      <main className="sections-container" style={{ minHeight: "calc(100vh - 80px)" }}>
        {children}
      </main>
    </div>
  );
}
