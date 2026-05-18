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

export default function LandingPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar type="public" />

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section id="home">
          <Hero />
        </section>

        {/* Services Section */}
        <motion.section 
          id="services"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 bg-white dark:bg-slate-950"
        >
          <Services />
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          id="how-it-works"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-12 bg-slate-50 dark:bg-slate-900/50"
        >
          <HowItWorks />
        </motion.section>

        {/* Top Rated Providers */}
        <motion.section 
          id="providers"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 bg-white dark:bg-slate-950"
        >
          <Providers />
        </motion.section>

        <Footer />
      </main>
    </div>
  );
}
