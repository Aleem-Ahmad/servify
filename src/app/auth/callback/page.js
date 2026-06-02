"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { parseApiResponse } from "@/lib/parseApiResponse";

export default function SupabaseAuthCallback() {
  const [message, setMessage] = useState("Finishing Google sign in...");

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.access_token) {
          setMessage("Google sign in failed. Please try again.");
          window.setTimeout(() => {
            window.location.href = "/authentication";
          }, 1200);
          return;
        }

        const response = await fetch("/api/auth/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });

        const { data: authData, ok } = await parseApiResponse(response);
        if (!ok || !authData?.success) {
          setMessage(authData?.message || "Google sign in failed. Please try again.");
          window.setTimeout(() => {
            window.location.href = "/authentication";
          }, 1200);
          return;
        }

        const role = authData.user?.role;
        if (role === "admin") window.location.href = "/adminDashboard";
        else if (role === "provider") window.location.href = "/providerDashboard";
        else window.location.href = "/customerDashboard";
      } catch (error) {
        console.error("Google callback error:", error);
        setMessage("Google sign in failed. Please try again.");
        window.setTimeout(() => {
          window.location.href = "/authentication";
        }, 1200);
      }
    };

    completeLogin();
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <p style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700 }}>{message}</p>
    </main>
  );
}
