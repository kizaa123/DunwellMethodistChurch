"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Activity = { type: string; label: string; time: string };

const ICON_MAP: Record<string, { emoji: string; bg: string; text: string }> = {
  donation: { emoji: "💝", bg: "bg-amber-50", text: "text-amber-600" },
  member:   { emoji: "👤", bg: "bg-blue-50",  text: "text-blue-600"  },
  sermon:   { emoji: "🎙️", bg: "bg-purple-50", text: "text-purple-600" },
  prayer:   { emoji: "🙏", bg: "bg-green-50",  text: "text-green-600" },
  testimony:{ emoji: "✨", bg: "bg-rose-50",   text: "text-rose-600"  },
  event:    { emoji: "📅", bg: "bg-indigo-50", text: "text-indigo-600" },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1)  return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  <  7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, sermons: 0, events: 0, donations: 0, eventRegistrations: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(() => {
      setStats({ members: 128, sermons: 45, events: 8, donations: 342, eventRegistrations: 0 });
    });

    api.admin.getActivity()
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoadingActivity(false));
  }, []);

  const statCards = [
    {
      label: "Total Members",
      value: stats.members,
      icon: "👥",
      bg: "bg-blue-500",
      href: "/admin/members",
    },
    {
      label: "Sermons",
      value: stats.sermons,
      icon: "🎙️",
      bg: "bg-[#c9a227]",
      href: "/admin/sermons",
    },
    {
      label: "Upcoming Events",
      value: stats.events,
      sub: `${stats.eventRegistrations} RSVPs`,
      icon: "📅",
      bg: "bg-green-500",
      href: "/admin/events",
    },
    {
      label: "Total Donations",
      value: `GHS ${Number(stats.donations).toFixed(2)}`,
      icon: "💰",
      bg: "bg-purple-500",
      href: "/admin/donations",
    },
  ];

  const quickActions = [
    { href: "/admin/sermons",      label: "Upload New Sermon",   icon: "🎙️" },
    { href: "/admin/events",       label: "Create Event",        icon: "📅" },
    { href: "/admin/announcements",label: "Post Announcement",   icon: "📢" },
    { href: "/admin/gallery",      label: "Add Gallery Image",   icon: "🖼️" },
    { href: "/admin/members",      label: "Manage Members",      icon: "👥" },
    { href: "/admin/testimonies",  label: "Review Testimonies",  icon: "✨" },
    { href: "/admin/prayer-requests", label: "Prayer Requests",  icon: "🙏" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-1">Dashboard</h1>
      <p className="text-stone-500 mb-8 text-sm">
        Welcome to the Dunwell Methodist Church administration panel
      </p>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:shadow-md hover:-translate-y-0.5 transition-all group block"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
              <svg className="h-4 w-4 text-stone-300 group-hover:text-[#1e3a5f] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{card.value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{card.label}</p>
            {"sub" in card && card.sub && (
              <p className="text-[11px] text-stone-400 mt-0.5">{card.sub}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <h2 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <span className="text-base">⚡</span> Quick Actions
          </h2>
          <div className="space-y-1.5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50 hover:bg-[#1e3a5f] hover:text-white text-sm font-medium text-stone-700 transition-all group"
              >
                <span className="text-base">{action.icon}</span>
                {action.label}
                <svg className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1e3a5f] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live Activity Feed
            </h2>
            <button
              onClick={() => {
                setLoadingActivity(true);
                api.admin.getActivity()
                  .then(setActivity)
                  .catch(() => setActivity([]))
                  .finally(() => setLoadingActivity(false));
              }}
              className="text-xs text-stone-400 hover:text-[#1e3a5f] transition-colors font-medium"
            >
              ↺ Refresh
            </button>
          </div>

          {loadingActivity ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-2.5 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-stone-500 text-sm">No recent activity yet.</p>
              <p className="text-stone-400 text-xs mt-1">Activity will appear here as members interact with the system.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activity.map((item, i) => {
                const icon = ICON_MAP[item.type] ?? { emoji: "📌", bg: "bg-stone-50", text: "text-stone-500" };
                return (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors">
                    <div className={`h-8 w-8 rounded-lg ${icon.bg} flex items-center justify-center text-sm shrink-0 mt-0.5`}>
                      {icon.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700 leading-snug truncate">{item.label}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{relativeTime(item.time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
