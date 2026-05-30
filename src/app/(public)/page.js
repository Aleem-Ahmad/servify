"use client";

import React from "react";
import Navbar from "@/components/SharedComponents/NavBar/NavBar";
import Hero from "@/components/publicComponents/Hero";
import Services from "@/components/SharedComponents/Services/Services";
import HowItWorks from "@/components/SharedComponents/HowItWorks/HowItWorks";
import Providers from "@/components/SharedComponents/Providers/Providers";
import Footer from "@/components/SharedComponents/Footer/Footer";
import { useTheme } from "@/context/ThemeContext";
import "@/styles/landingPage.css";

export default function LandingPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className={`lp-page ${darkMode ? "dark" : ""}`}>
      <Navbar type="public" />

      <main className="lp-main">
        {/* Hero Section */}
        <section id="home" className="lp-section lp-hero">
          <Hero />
        </section>

        {/* Services Section */}
        <section 
          id="services"
          className="lp-section lp-services svx-animate-fade-in"
        >
          <Services />
        </section>

        {/* How It Works Section */}
        <section 
          id="how-it-works"
          className="lp-section lp-hiw svx-animate-slide-up"
        >
          <HowItWorks />
        </section>

        {/* Top Rated Providers */}
        <section 
          id="providers"
          className="lp-section lp-providers svx-animate-fade-in"
        >
          <Providers />
        </section>

        {/* Snapping Footer */}
        <footer className="lp-footer">
          <Footer />
        </footer>
      </main>
    </div>
  );
}
