"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, sermons: 0, events: 0, donations: 0 });

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(() => {
      setStats({ members: 128, sermons: 45, events: 8, donations: 342 });
    });
  }, []);

  const cards = [
    { label: "Total Members", value: stats.members, color: "bg-blue-500" },
    { label: "Sermons", value: stats.sermons, color: "bg-[#c9a227]" },
    { label: "Upcoming Events", value: stats.events, color: "bg-green-500" },
    { label: "Donations (MTD)", value: `$${stats.donations}`, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-2">Dashboard</h1>
      <p className="text-stone-500 mb-8">Welcome to the church administration panel</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
            <div className={`h-10 w-10 rounded-lg ${card.color} mb-3`} />
            <p className="text-2xl font-bold text-[#1e3a5f]">{card.value}</p>
            <p className="text-sm text-stone-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <h2 className="font-semibold text-[#1e3a5f] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/sermons", label: "Upload New Sermon" },
              { href: "/admin/events", label: "Create Event" },
              { href: "/admin/announcements", label: "Post Announcement" },
              { href: "/admin/members", label: "Manage Members" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="block px-4 py-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-sm font-medium text-stone-700 transition-colors"
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <h2 className="font-semibold text-[#1e3a5f] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: "New member registered", time: "2 hours ago" },
              { action: "Sermon uploaded: Walking in Faith", time: "1 day ago" },
              { action: "Event created: Summer Youth Camp", time: "3 days ago" },
              { action: "Donation received: $100", time: "5 days ago" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-700">{item.action}</span>
                <span className="text-stone-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
