"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setIsInstallable(false);
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px" }}>
      <button
        onClick={handleInstallClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 22px",
          background: "#f97316",
          color: "white",
          fontWeight: 700,
          fontSize: "0.875rem",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
          transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#ea580c";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(249,115,22,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#f97316";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.4)";
        }}
      >
        <Download size={15} />
        {t("Install App") || "Install App"}
      </button>
    </div>
  );
}
