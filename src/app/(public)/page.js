"use client";

import React from "react";
import Navbar from "@/components/SharedComponents/NavBar/NavBar";
import Hero from "@/components/publicComponents/Hero";
import Services from "@/components/SharedComponents/Services/Services";
import HowItWorks from "@/components/SharedComponents/HowItWorks/HowItWorks";
import Providers from "@/components/SharedComponents/Providers/Providers";
import Footer from "@/components/SharedComponents/Footer/Footer";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
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
        <motion.section 
          id="services"
          className="lp-section lp-services"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Services />
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          id="how-it-works"
          className="lp-section lp-hiw"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <HowItWorks />
        </motion.section>

        {/* Top Rated Providers */}
        <motion.section 
          id="providers"
          className="lp-section lp-providers"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Providers />
        </motion.section>

        {/* Snapping Footer */}
        <footer className="lp-footer">
          <Footer />
        </footer>
      </main>
    </div>
  );
}
