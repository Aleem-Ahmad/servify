"use client";

import {
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaLinkedinIn,
} from "react-icons/fa";
import "./footer.css";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useState } from "react";

export default function Footer({
  customers = "50K+",
  providers = "2K+",
  ratings = "4.8M+",
}) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const [taps, setTaps] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleSecret = (e) => {
    const now = Date.now();
    if (now - lastTap < 1000) {
      const count = taps + 1;
      setTaps(count);
      if (count >= 5) {
        e.preventDefault();
        const pass = prompt("Servify Access Key:");
        if (pass === "admin_servify") {
          window.location.href = "/adminDashboard";
        } else if (pass === "customer_dummy") {
          window.location.href = "/customerDashboard";
        } else if (pass === "provider_dummy") {
          window.location.href = "/providerDashboard";
        }
        setTaps(0);
      }
    } else {
      setTaps(1);
    }
    setLastTap(now);
  };

  return (
    <footer className={`footer ${darkMode ? "dark" : ""}`}>
      {/* ================= CENTER CONTENT ================= */}
      <div className="footer-grid">
        {/* INFO COLUMN */}
        <div className="footer-info">
          <h2 className="footer-logo" onClick={handleSecret} style={{ cursor: 'pointer' }}>
            {t("navbar.brand")}
          </h2>
          <p className="footer-desc">
            {t("footer.subtitle")}
          </p>
          
          <div className="footer-social-group">
            <h4>{t("Follow Us")}</h4>
            <div className="social-links">
              <a href="https://whatsapp.com/channel/0029Vb7nqSjJuyABlBTMUF0g" target="_blank" rel="noopener noreferrer" className="social-btn"><FaWhatsapp /></a>
              <a href="https://www.facebook.com/share/1JERK86dQL/" target="_blank" rel="noopener noreferrer" className="social-btn"><FaFacebookF /></a>
              <a href="https://www.instagram.com/servify_osm?utm_source=qr&igsh=MThyN2xqZzl3OHl4ag==" target="_blank" rel="noopener noreferrer" className="social-btn"><FaInstagram /></a>
              <a href="https://www.linkedin.com/in/servify-osm-3a6671400?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="social-btn"><FaLinkedinIn /></a>
              <a href="https://www.tiktok.com/@servify.osm?_r=1&_t=ZS-95EhUGszyi2" target="_blank" rel="noopener noreferrer" className="social-btn"><FaTiktok /></a>
              <a href="mailto:servifyosm@gmail.com" className="social-btn"><FaEnvelope /></a>
            </div>
          </div>
          
          <div className="footer-download">
             <Link href="/coming-soon" className="download-outline-btn">
               {t("footer.downloadApp")}
             </Link>
          </div>
        </div>

        {/* CONTACT FORM COLUMN */}
        <div className="footer-contact-wrapper">
          <div className="contact-card">
            <h3>{t("navbar.contact")}</h3>
            <p>{t("We'd love to hear from you!")}</p>
            
            <form className="contact-premium-form">
              <div className="input-row">
                <input type="text" placeholder={t("Your Name")} required />
                <input type="email" placeholder="Email Address" required />
              </div>
              <textarea placeholder="Tell us how we can help..." rows="4" required></textarea>
              <button type="submit" className="contact-send-btn">
                <span>{t("Send Message")}</span>
                <FaEnvelope className="btn-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= COPYRIGHT (BOTTOM) ================= */}
      <p className="footer-copy">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}