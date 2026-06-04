"use client";

import "@/styles/publicStyles/coming-soon.css";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComingSoon() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const dark = theme === "dark";

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'provider') {
        router.push('/providerDashboard');
      } else if (user.role === 'customer') {
        router.push('/customerDashboard');
      } else if (user.role === 'admin') {
        router.push('/adminDashboard');
      }
    }
  }, [user, router]);

  return (
    <div className={`coming-soon-container ${dark ? "dark" : ""}`}>
      <div className="coming-soon-card">
        <div className="spinner-wrapper">
          <Loader2 size={50} className="spinner-icon" />
        </div>
        
        <h1>{t("Coming Soon")}</h1>
        <p>
          {t("We are currently working on this feature Insha'Allah. It will be live soon!")}
        </p>

        <Link href="/" className="btn-primary" style={{ display: "inline-block", padding: "14px 28px", textDecoration: "none", color: "white", background: "#ff7a00", borderRadius: "30px", fontWeight: "600" }}>
          {t("Return Home")}
        </Link>
      </div>
    </div>
  );
}
