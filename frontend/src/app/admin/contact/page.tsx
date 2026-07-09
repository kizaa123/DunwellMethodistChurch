"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function fetchMessages() {
    setLoading(true);
    api.admin
      .getContactMessages()
      .then((data) => {
        setMessages(data);
        setError("");
      })
      .catch(() => setError("Failed to load contact messages."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function handleMarkRead(id: string) {
    await api.admin.markContactRead(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, readAt: new Date().toISOString() } : m))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await api.admin.deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1">Guest Messages</h1>
          <p className="text-xs sm:text-sm text-stone-500">Messages sent from the public contact page</p>
        </div>
        <button
          onClick={fetchMessages}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <span className="text-4xl mb-3 block">✉️</span>
          <p className="text-sm font-semibold">No guest messages yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl p-3 shadow-sm border flex flex-col gap-2 ${
                !msg.readAt ? "border-amber-200 bg-amber-50/30" : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#1e3a5f] truncate">{msg.name}</p>
                  <p className="text-[10px] text-stone-400 truncate">{msg.email}</p>
                </div>
                {!msg.readAt && (
                  <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-stone-700">{msg.subject}</p>
              <p className="text-[11px] text-stone-600 leading-snug line-clamp-4 whitespace-pre-line bg-stone-50 p-2 rounded-lg border border-stone-100">
                {msg.message}
              </p>
              <p className="text-[9px] text-stone-400">
                {new Date(msg.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex gap-2 pt-1">
                {!msg.readAt && (
                  <button
                    onClick={() => handleMarkRead(msg.id)}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-[#1e3a5f] text-white text-[10px] font-semibold hover:bg-[#2a5082] transition-colors cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="px-2 py-1.5 rounded-lg border border-red-200 text-red-600 text-[10px] font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
