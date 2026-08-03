"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/parseApiResponse";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

const AuthContext = createContext({});

const fetchOpts = { credentials: "include" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Pre-warm from localStorage first — this prevents a flash-logout
      // when a freshly Google-logged-in user navigates to a protected page
      // before the HTTP-only cookie has fully propagated to the browser.
      const cachedRaw = localStorage.getItem("servify_user");
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (cached?.id) {
            setUser(cached);
            setLoading(false);
            // Continue to background-verify with the server, but don't block the UI
          }
        } catch (_) {
          localStorage.removeItem("servify_user");
        }
      }

      // Helper: fetch profile with up to `attempts` retries on network failure
      const fetchProfile = async (attempts = 3, delayMs = 600) => {
        for (let i = 0; i < attempts; i++) {
          try {
            const res = await fetch("/api/user/profile", fetchOpts);
            // If the server explicitly says "not authenticated" or user not found, stop retrying
            if (res.status === 401 || res.status === 403 || res.status === 404) {
              return { profile: null, definitelyUnauthenticated: true };
            }
            const { data: profile, ok } = await parseApiResponse(res);
            if (ok && profile?.id) {
              return { profile, definitelyUnauthenticated: false };
            }
          } catch (e) {
            console.warn(`Session fetch attempt ${i + 1} failed:`, e.message);
          }
          if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, delayMs));
          }
        }
        return { profile: null, definitelyUnauthenticated: false };
      };

      const { profile, definitelyUnauthenticated } = await fetchProfile();

      if (profile?.id) {
        const normalized = {
          ...profile,
          id: (profile._id || profile.id)?.toString(),
        };
        setUser(normalized);
        localStorage.setItem("servify_user", JSON.stringify(normalized));
        setLoading(false);
        return;
      }

      // If the server returned 401/403, the session is definitely gone.
      // Otherwise, a network/server error occurred — fall back to localStorage
      // so the user is not kicked out due to a transient problem.
      if (!definitelyUnauthenticated) {
        const cached = localStorage.getItem("servify_user");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.id) {
              console.warn("Profile API unreachable — using cached session.");
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch (_) {
            // Corrupted cache — fall through to logout below
          }
        }
      }

      // Definitively unauthenticated (or no cache to fall back to)
      setUser(null);
      localStorage.removeItem("servify_user");
      setLoading(false);

      if (typeof window !== "undefined") {
        const path = window.location.pathname.toLowerCase();
        if (
          path.startsWith("/customerdashboard") ||
          path.startsWith("/providerdashboard") ||
          path.startsWith("/admindashboard")
        ) {
          window.location.href = "/authentication";
        }
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const { data, ok, status } = await parseApiResponse(response);

      if (!ok && !data?.message) {
        return {
          success: false,
          message: `Login failed (${status}). Wait for the dev server to finish compiling, then try again.`,
        };
      }

      if (data.success && data.user) {
        let userData = {
          ...data.user,
          id: (data.user._id || data.user.id)?.toString(),
        };

        try {
          const profileRes = await fetch("/api/user/profile", fetchOpts);
          const { data: profile, ok: profileOk } = await parseApiResponse(profileRes);
          if (profileOk && profile?.id) {
            userData = {
              ...profile,
              id: (profile._id || profile.id)?.toString(),
            };
          }
        } catch (e) {
          console.warn("Profile fetch after login failed", e);
        }

        setUser(userData);
        localStorage.setItem("servify_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }

      return {
        success: false,
        message: data.message || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          "Network error during login. Check that the dev server is running on the same URL you opened in the browser.",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key]);
        }
      });

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const { data } = await parseApiResponse(response);

      if (data.success) {
        // If server returned user data (OTP verified + account created), store in context
        if (data.user) {
          const userData = {
            ...data.user,
            id: (data.user._id || data.user.id)?.toString(),
          };
          setUser(userData);
          localStorage.setItem("servify_user", JSON.stringify(userData));
        }
        return { success: true, message: data.message, user: data.user };
      }

      return { success: false, message: data.message || "Signup failed" };
    } catch (error) {
      console.error("Signup error in AuthContext:", error);
      return { success: false, message: "Network error during signup" };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        return { success: false, message: error.message || "Google login failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Google login error:", error);
      return {
        success: false,
        message:
          error.message ||
          "Google login is not configured. Check your Supabase URL and anon key.",
      };
    }
  };

  const logout = async () => {
    try {
      try {
        await getSupabaseBrowserClient().auth.signOut();
      } catch (error) {
        console.warn("Supabase sign out skipped:", error.message);
      }

      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      localStorage.removeItem("servify_user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
