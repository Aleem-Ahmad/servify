// Supabase OAuth callback page — handles Google sign-in redirect
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

        // Step 1: Exchange the code for a Supabase session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw new Error(`Code exchange failed: ${exchangeError.message}`);
          }
        }

        // Step 2: Retry getSession up to 5 times to handle browser timing differences
        // (some browsers are slower to persist the session after exchangeCodeForSession)
        let session = null;
        for (let attempt = 1; attempt <= 5; attempt++) {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session?.access_token) {
            session = data.session;
            break;
          }
          if (attempt < 5) {
            await new Promise((r) => setTimeout(r, 500 * attempt)); // 500ms, 1s, 1.5s, 2s
          }
        }

        if (!session?.access_token) {
          setMessage("Google sign in failed. Could not establish session. Please try again.");
          setTimeout(() => { window.location.href = "/authentication"; }, 2000);
          return;
        }

        // Step 3: Send access token to our backend to upsert user in Prisma DB
        setMessage("Setting up your account...");
        const response = await fetch("/api/auth/supabase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accessToken: session.access_token }),
        });

        const { data: authData, ok } = await parseApiResponse(response);
        if (!ok || !authData?.success) {
          setMessage(authData?.message || "Google sign in failed. Please try again.");
          setTimeout(() => { window.location.href = "/authentication"; }, 2000);
          return;
        }

        // Step 4: Store user in localStorage BEFORE navigating so AuthContext
        // finds a warm cache immediately and does NOT trigger a 401 kick-out
        // while the HTTP-only cookie is still propagating to the browser.
        if (authData.user) {
          const userData = {
            ...authData.user,
            id: (authData.user._id || authData.user.id)?.toString(),
          };
          localStorage.setItem("servify_user", JSON.stringify(userData));
        }

        // Step 5: Redirect to the correct dashboard
        setMessage("Redirecting...");
        const role = authData.user?.role;
        if (role === "admin") window.location.href = "/adminDashboard";
        else if (role === "provider") window.location.href = "/providerDashboard";
        else window.location.href = "/customerDashboard";

      } catch (error) {
        console.error("Google callback error:", error);
        setMessage("Google sign in failed. Please try again.");
        setTimeout(() => { window.location.href = "/authentication"; }, 2000);
      }
    };

    completeLogin();
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
    }}>
      <div style={{ textAlign: "center", fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid #6366f1",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 20px",
        }} />
        <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem" }}>{message}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}

