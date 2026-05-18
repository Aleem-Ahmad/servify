"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch fresh profile from server (uses httpOnly cookie session)
    const initAuth = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const profile = await res.json();
          // Normalize _id → id for consistent use across the app
          const normalized = { ...profile, id: (profile._id || profile.id)?.toString() };
          setUser(normalized);
          localStorage.setItem("servify_user", JSON.stringify(normalized));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Session fetch failed", e);
      }
      // No valid cookie — clear state
      setUser(null);
      localStorage.removeItem("servify_user");
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // After login the cookie is set — fetch full fresh profile
        let userData = data.user;
        try {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profile = await profileRes.json();
            userData = { ...profile, id: (profile._id || profile.id)?.toString() };
          }
        } catch (e) {}

        setUser(userData);
        localStorage.setItem("servify_user", JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error during login" };
    }
  };

  const signup = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          formData.append(key, userData[key]);
        }
      });

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error in AuthContext:", error);
      return { success: false, message: "Network error during signup" };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
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
