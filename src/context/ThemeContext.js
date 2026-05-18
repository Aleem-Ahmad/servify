"use client";

import { createContext, useState, useContext, useEffect, useMemo } from "react";

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  const getTimeStatus = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  useEffect(() => {
    const status = getTimeStatus();
    setTimeOfDay(status);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Auto-set theme based on time if no manual preference exists
      const shouldBeDark = status === "evening" || status === "night";
      const initialTheme = shouldBeDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", shouldBeDark);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  };

  const value = useMemo(() => ({ 
    theme, 
    toggleTheme, 
    timeOfDay 
  }), [theme, timeOfDay]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
