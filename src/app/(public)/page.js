"use client";

import "@/styles/landingPage.css";

// COMPONENTS
import NavBar from "@/components/SharedComponents/NavBar/NavBar";
import CustomerHero from "@/components/publicComponents/Hero";
import Services from "@/components/SharedComponents/Services/Services";
import HowItWorks from "@/components/SharedComponents/HowItWorks/HowItWorks";
import Providers from "@/components/SharedComponents/Providers/Providers";
import Footer from "@/components/SharedComponents/Footer/Footer";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className={`lp-page ${darkMode ? "dark" : ""}`}>
      <NavBar type="public" />

      <main className="lp-main">

        <section id="home" className="lp-section lp-hero">
          <CustomerHero />
        </section>

        <section id="services" className="lp-section lp-services">
          <Services />
        </section>

        <section id="how-it-works" className="lp-section lp-hiw">
          <HowItWorks />
        </section>

        <section id="providers" className="lp-section lp-providers">
          <Providers />
        </section>

        <footer id="footer" className="lp-footer">
          <Footer />
        </footer>

      </main>
    </div>
  );
}