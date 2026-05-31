"use client";

import NavBar from "@/components/SharedComponents/NavBar/NavBar";
import "@/styles/landingPage.css";
import "./customerDashboard.css";
import { useTheme } from "@/context/ThemeContext";

export default function CustomerDashboardLayout({ children }) {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className={`cd-layout ${darkMode ? "dark" : ""}`}>
      <NavBar type="dashboard" />
      {children}
    </div>
  );
}
