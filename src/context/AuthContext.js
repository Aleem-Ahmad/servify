"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/parseApiResponse";

const AuthContext = createContext({});

const fetchOpts = { credentials: "include" };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch("/api/user/profile", fetchOpts);
        const { data: profile, ok } = await parseApiResponse(res);

        if (ok && profile?.id) {
          const normalized = {
            ...profile,
            id: (profile._id || profile.id)?.toString(),
          };
          setUser(normalized);
          localStorage.setItem("servify_user", JSON.stringify(normalized));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Session fetch failed", e);
      }

      setUser(null);
      localStorage.removeItem("servify_user");
      setLoading(false);
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
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || "Signup failed" };
    } catch (error) {
      console.error("Signup error in AuthContext:", error);
      return { success: false, message: "Network error during signup" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      localStorage.removeItem("servify_user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
