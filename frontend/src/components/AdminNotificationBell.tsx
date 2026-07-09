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
    const ring = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };
    ring(830, 0, 0.5, 0.35);
    ring(1245, 0.02, 0.45, 0.2);
    ring(622, 0.08, 0.55, 0.25);
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

function NotificationBellIcon({
  className,
  ringing,
  light,
}: {
  className?: string;
  ringing?: boolean;
  light?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/notification-bell.png"
      alt=""
      aria-hidden="true"
      className={`object-contain ${className ?? ""} ${ringing ? "animate-[bell-ring_0.9s_ease-in-out_infinite]" : ""} ${
        light ? "brightness-0 invert" : ""
      }`}
    />
  );
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
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
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
      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-6deg); }
          75% { transform: rotate(3deg); }
        }
      `}</style>

      <button
        type="button"
        onClick={handleOpen}
        className={`relative flex items-center justify-center h-11 w-11 rounded-xl border transition-all duration-200 ${
          total > 0
            ? "bg-gradient-to-br from-amber-50 to-amber-100/80 border-[#c9a227]/40 shadow-sm shadow-amber-200/50 hover:shadow-md"
            : "bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
        }`}
        aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}
      >
        <NotificationBellIcon className="h-7 w-7" ringing={total > 0 && !open} />
        {total > 0 && (
          <>
            <span className="absolute inset-0 rounded-xl ring-2 ring-[#c9a227]/30 animate-pulse pointer-events-none" />
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold shadow-md border-2 border-white">
              {total > 99 ? "99+" : total}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-gradient-to-r from-[#1e3a5f] to-[#2a5082] text-white">
            <div className="flex items-center gap-2">
              <NotificationBellIcon className="h-6 w-6 shrink-0" light />
              <div>
                <p className="font-semibold text-sm">Notifications</p>
                {summary && total > 0 && (
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {[
                      summary.contact > 0 && `${summary.contact} messages`,
                      summary.prayer > 0 && `${summary.prayer} prayers`,
                      summary.testimony > 0 && `${summary.testimony} testimonies`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
            {total > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[10px] font-semibold text-[#e8cc66] hover:text-white transition-colors disabled:opacity-50"
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
                        item.unread ? "bg-amber-50/50" : ""
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
