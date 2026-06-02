"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, RefreshCw, Bot } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import "./bookingChat.css";

const quickReplies = [
  "I am on my way.",
  "Please share your exact location.",
  "I will arrive in a few minutes.",
  "Can you send a photo of the issue?",
];

export default function BookingChat({ bookingId, peerName = "Service partner", compact = false }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === "dark";
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [chatLocked, setChatLocked] = useState(false);
  const listRef = useRef(null);

  const fetchMessages = useCallback(async ({ quiet = false } = {}) => {
    if (!bookingId) return;
    if (!quiet) setLoading(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 403) {
          setChatLocked(true);
        }
        throw new Error(data.message || "Failed to load chat");
      }
      setMessages(data.messages || []);
      setChatLocked(false);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages({ quiet: true }), 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async (messageText = draft) => {
    const text = messageText.trim();
    if (!text || sending || chatLocked) return;

    setSending(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 403) {
          setChatLocked(true);
        }
        throw new Error(data.message || "Failed to send message");
      }
      setDraft("");
      setMessages((current) => [...current, data.message]);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`booking-chat ${dark ? "booking-chat--dark" : ""} ${compact ? "booking-chat--compact" : ""}`}>
      <div className="booking-chat__header">
        <div className="booking-chat__icon">
          <MessageSquare size={18} />
        </div>
        <div>
          <h3>Booking Chat</h3>
          <p>{peerName}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchMessages()}
          className="booking-chat__refresh"
          aria-label="Refresh chat"
          title="Refresh chat"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="booking-chat__assistant">
        <Bot size={15} />
        <span>Use chat for arrival time, location, photos, and job details.</span>
      </div>

      <div ref={listRef} className="booking-chat__messages">
        {loading ? (
          <div className="booking-chat__empty">Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className="booking-chat__empty">No messages yet. Start the conversation.</div>
        ) : (
          messages.map((message) => {
            const mine = message.mine || message.senderId === user?.id;
            return (
              <div key={message.id} className={`booking-chat__row ${mine ? "booking-chat__row--mine" : ""}`}>
                <div className="booking-chat__bubble">
                  <p>{message.body}</p>
                  <span>
                    {message.sender?.name || (mine ? "You" : peerName)} · {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && <div className="booking-chat__error">{error}</div>}

      <div className="booking-chat__quick">
        {quickReplies.map((reply) => (
          <button key={reply} type="button" onClick={() => setDraft(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <form
        className="booking-chat__form"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={chatLocked ? "Chat is locked until provider acceptance..." : "Type your message..."}
          maxLength={1000}
          disabled={chatLocked}
        />
        <button type="submit" disabled={sending || !draft.trim() || chatLocked} aria-label="Send message">
          <Send size={17} />
        </button>
      </form>
    </section>
  );
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
