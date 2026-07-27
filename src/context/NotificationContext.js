"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { Bell, CheckCircle, AlertTriangle, MessageSquare, DollarSign, X } from "lucide-react";

const NotificationContext = createContext({
  permission: "default",
  requestPermission: async () => {},
  toasts: [],
  removeToast: () => {},
  triggerNotification: () => {},
});

// Sound Chime Synthesizer using Web Audio API
function playChimeSound(type = "info") {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";

    if (type === "success") {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    } else if (type === "alert") {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2); // A4
    } else {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio context play error handled silently
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState("default");
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res;
    }
    return "denied";
  };

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Display both Browser Notification AND In-App Toast
  const triggerNotification = useCallback(
    ({ title, body, icon = "bell", type = "info", url = null }) => {
      // 1. Play Chime
      playChimeSound(type);

      // 2. Native Browser Notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const n = new Notification(title, {
            body,
            icon: "/favicon.png",
            badge: "/favicon.png",
            tag: `servify-${Date.now()}`,
          });

          if (url) {
            n.onclick = () => {
              window.focus();
              window.location.href = url;
            };
          }
        } catch (e) {
          console.error("Native notification error:", e);
        }
      }

      // 3. In-App Floating Toast
      const toastId = Date.now() + Math.random().toString();
      setToasts((prev) => [
        { id: toastId, title, body, icon, type, url, timestamp: new Date() },
        ...prev.slice(0, 4), // max 5 toasts visible
      ]);

      // Auto dismiss in 6 seconds
      setTimeout(() => {
        removeToast(toastId);
      }, 6000);
    },
    [removeToast]
  );

  // Subscribe to Realtime Supabase Broadcast Events
  useEffect(() => {
    if (!user?.id) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase.channel("servify:events");

    channel
      .on("broadcast", { event: "*" }, (payload) => {
        const { event, payload: data } = payload;
        if (!data) return;

        const userId = user.id;
        const userRole = user.role;
        const eventKey = `${event}-${data.bookingId || data.messageId || data.offerId}-${data._ts || ""}`;

        if (seenIdsRef.current.has(eventKey)) return;
        seenIdsRef.current.add(eventKey);

        // 1. NEW BOOKING CREATED (Notify providers matching category or emergency)
        if (event === "booking.created" && userRole === "provider") {
          if (!data.providerId || data.providerId === userId) {
            triggerNotification({
              title: "🔔 New Service Request Posted!",
              body: `New request for ${data.service || "Service"}. Urgency: ${data.urgency || "Normal"}`,
              type: data.urgency === "Emergency" ? "alert" : "info",
              url: "/providerDashboard",
            });
          }
        }

        // 2. BOOKING STATUS CHANGES (Accepted, Cancelled, Completed, Rejected, In-Progress)
        if (event === "booking.accepted" && data.customerId === userId) {
          triggerNotification({
            title: "🎉 Provider Accepted Your Booking!",
            body: `${data.providerName || "A provider"} accepted your request and is heading your way.`,
            type: "success",
            url: `/customerDashboard/track/${data.bookingId}`,
          });
        }

        if (event === "booking.cancelled") {
          if (data.customerId === userId || data.providerId === userId) {
            triggerNotification({
              title: "⚠️ Booking Cancelled",
              body: `Service request #${data.bookingId?.slice(0, 8)} was cancelled.`,
              type: "alert",
              url: userRole === "provider" ? "/providerDashboard" : `/customerDashboard/track/${data.bookingId}`,
            });
          }
        }

        if (event === "booking.completed" && data.customerId === userId) {
          triggerNotification({
            title: "✨ Job Finished!",
            body: `Your provider completed the work. Please leave feedback!`,
            type: "success",
            url: `/customerDashboard/track/${data.bookingId}`,
          });
        }

        if (event === "booking.rejected" && data.customerId === userId) {
          triggerNotification({
            title: "❌ Request Declined",
            body: `The provider declined your booking request.`,
            type: "alert",
            url: "/customerDashboard/track",
          });
        }

        // 3. BARGAINING OFFERS
        if (event === "bargain.offer_made" && data.targetId === userId) {
          triggerNotification({
            title: "💰 New Price Negotiation Offer!",
            body: `Proposed Price: PKR ${data.proposedPrice}. Check details to accept or counter.`,
            type: "info",
            url: userRole === "provider" ? "/providerDashboard" : `/customerDashboard/track/${data.bookingId}`,
          });
        }

        if (event === "bargain.offer_accepted" && (data.customerId === userId || data.providerId === userId)) {
          triggerNotification({
            title: "🤝 Bargain Price Agreed!",
            body: `Agreed Price: PKR ${data.agreedPrice}. Booking confirmed!`,
            type: "success",
            url: userRole === "provider" ? "/providerDashboard" : `/customerDashboard/track/${data.bookingId}`,
          });
        }

        // 4. CHAT MESSAGES
        if (event === "chat.message" && data.recipientId === userId) {
          triggerNotification({
            title: `💬 Message from ${data.senderName || "User"}`,
            body: data.body,
            type: "info",
            url: userRole === "provider" ? "/providerDashboard" : `/customerDashboard/track/${data.bookingId}`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, triggerNotification]);

  // Fallback polling check for unread chat/bargain notifications every 10 seconds
  useEffect(() => {
    if (!user?.id) return;

    let lastCheckedTime = new Date().toISOString();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings?userId=${user.id}&providerId=${user.role === "provider" ? user.id : ""}`);
        if (!res.ok) return;

        const bookings = await res.json();
        if (!Array.isArray(bookings)) return;

        // Check for recent booking changes since last checked
        bookings.forEach((b) => {
          const updatedAt = new Date(b.createdAt || Date.now());
          if (updatedAt.toISOString() > lastCheckedTime) {
            if (user.role === "provider" && b.status === "Pending" && !seenIdsRef.current.has(`poll-${b.id}`)) {
              seenIdsRef.current.add(`poll-${b.id}`);
              triggerNotification({
                title: "🔔 New Job Available",
                body: `New request: ${b.category}`,
                type: "info",
                url: "/providerDashboard",
              });
            }
          }
        });

        lastCheckedTime = new Date().toISOString();
      } catch (e) {
        // Polling error silently caught
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [user, triggerNotification]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        toasts,
        removeToast,
        triggerNotification,
      }}
    >
      {children}

      {/* Floating In-App Toast Stack */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.url) window.location.href = toast.url;
            }}
            className={`pointer-events-auto cursor-pointer p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 backdrop-blur-xl flex items-start gap-3 ${
              toast.type === "alert"
                ? "bg-red-950/90 border-red-500/30 text-red-100"
                : toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
                : "bg-slate-900/90 border-orange-500/30 text-slate-100"
            }`}
          >
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0 mt-0.5">
              {toast.type === "alert" ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-orange-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider mb-1">{toast.title}</h4>
              <p className="text-xs opacity-90 line-clamp-2 leading-relaxed">{toast.body}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
