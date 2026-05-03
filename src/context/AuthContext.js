"use client";

import { createContext, useContext } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

const AuthContext = createContext({});

function AuthInternalProvider({ children }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const user = session?.user;

  const login = async (email, password) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    
    if (result?.error) {
      return { success: false, message: result.error };
    }
    return { success: true };
  };

  const loginWithGoogle = () => signIn("google");

  const signup = async (userData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, message: data.message, errors: data.errors };
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthInternalProvider>
        {children}
      </AuthInternalProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
