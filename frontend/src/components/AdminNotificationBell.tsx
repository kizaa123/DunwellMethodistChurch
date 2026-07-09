"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type NotificationItem = {
  id: string;
  type: string;
  label: string;
  detail?: string;
  time: string;
  href: string;
  unread: boolean;
};

type Summary = {
  total: number;
  contact: number;
  prayer: number;
  testimony: number;
  donation: number;
  event: number;
};

const TYPE_ICONS: Record<string, string> = {
  contact: "✉️",
  prayer: "🙏",
  testimony: "✨",
  donation: "💝",
  event: "📅",
  member: "👤",
};

function playBellSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(880, 0, 0.35);
    playTone(660, 0.12, 0.45);
  } catch {
    // Audio not available
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const prevTotalRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async (playSound = false) => {
    try {
      const [sum, list] = await Promise.all([
        api.admin.getNotificationSummary(),
        api.admin.getNotifications(),
      ]);
      if (playSound && prevTotalRef.current !== null && sum.total > prevTotalRef.current) {
        playBellSound();
      }
      prevTotalRef.current = sum.total;
      setSummary(sum);
      setItems(list);
    } catch {
      // ignore poll errors
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 20000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleOpen() {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  }

  async function handleItemClick(item: NotificationItem) {
    if (item.unread) {
      try {
        await api.admin.markNotificationRead(item.type, item.id);
        await refresh();
      } catch {
        // continue navigation
      }
    }
    setOpen(false);
    router.push(item.href);
  }

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      await api.admin.markAllNotificationsRead();
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  const total = summary?.total ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors"
        aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}
      >
        <svg className="h-6 w-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M14.857 17.082a23.848 23.848 0 005.454-1.031A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.031m-5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50">
            <div>
              <p className="font-semibold text-sm text-[#1e3a5f]">Notifications</p>
              {summary && (
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {summary.contact > 0 && `${summary.contact} messages `}
                  {summary.prayer > 0 && `${summary.prayer} prayers `}
                  {summary.testimony > 0 && `${summary.testimony} testimonies`}
                </p>
              )}
            </div>
            {total > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[10px] font-semibold text-[#1e3a5f] hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,20rem)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="p-6 text-center text-stone-400 text-sm">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-stone-400 text-sm">No new activity</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 flex gap-3 ${
                        item.unread ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[item.type] || "🔔"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1e3a5f] leading-snug">{item.label}</p>
                        {item.detail && (
                          <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">{item.detail}</p>
                        )}
                        <p className="text-[9px] text-stone-400 mt-1">{formatTime(item.time)}</p>
                      </div>
                      {item.unread && (
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-stone-100 bg-stone-50 flex gap-3 justify-center text-[10px]">
            <Link href="/admin/contact" onClick={() => setOpen(false)} className="text-[#1e3a5f] font-semibold hover:underline">
              Messages
            </Link>
            <Link href="/admin/prayer-requests" onClick={() => setOpen(false)} className="text-[#1e3a5f] font-semibold hover:underline">
              Prayers
            </Link>
            <Link href="/admin/testimonies" onClick={() => setOpen(false)} className="text-[#1e3a5f] font-semibold hover:underline">
              Testimonies
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
