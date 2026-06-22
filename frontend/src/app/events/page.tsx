"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import EventCard from "@/components/EventCard";
import { upcomingEvents as staticEvents } from "@/lib/data";
import { api, isEventLive, isSameDay, parseLocalDate } from "@/lib/api";
import { Event } from "@/types";

function isEventToday(event: Event) {
  const now = new Date();
  return isSameDay(now, parseLocalDate(event.eventDate));
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch((err) => {
        console.error("Failed to load events, falling back to static:", err);
        setEvents(staticEvents);
      })
      .finally(() => setLoading(false));
  }, []);

  // Split: live now, today (not live window), and future
  const liveEvents   = events.filter(isEventLive);
  const todayEvents  = events.filter((e) => isEventToday(e) && !isEventLive(e));
  const otherEvents  = events.filter((e) => !isEventToday(e));

  const featuredEvent = events[0] || staticEvents[0];

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Stay connected with upcoming activities and fellowship opportunities"
      />

      {/* ── LIVE NOW BANNER ── */}
      {!loading && liveEvents.length > 0 && (
        <div
          className="sticky top-16 z-40 w-full"
          style={{ background: "hsl(0,72%,42%)" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <span className="text-white font-bold text-sm">
                🔴 HAPPENING NOW — {liveEvents[0].title}
              </span>
              <span className="text-white/70 text-xs hidden sm:inline">
                @ {liveEvents[0].location}
              </span>
            </div>
            <Link
              href={`/events/${liveEvents[0].id}`}
              className="shrink-0 px-4 py-1.5 rounded-full bg-white text-red-700 font-bold text-xs tracking-wide uppercase hover:bg-red-50 transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* ── TODAY banner (no live window) ── */}
      {!loading && liveEvents.length === 0 && todayEvents.length > 0 && (
        <div
          className="w-full"
          style={{ background: "hsl(41,74%,47%)" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">📅</span>
              <span className="text-white font-bold text-sm">
                Today — {todayEvents.map(e => e.title).join(", ")}
              </span>
            </div>
            <Link
              href={`/events/${todayEvents[0].id}`}
              className="shrink-0 px-4 py-1.5 rounded-full bg-white text-amber-700 font-bold text-xs uppercase hover:bg-amber-50 transition-colors"
            >
              Details →
            </Link>
          </div>
        </div>
      )}

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]" />
            </div>
          ) : (
            <>
              {/* ── Live Events Section ── */}
              {liveEvents.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                    </span>
                    <h2 className="font-serif text-xl font-bold text-red-700">Happening Right Now</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  <div className="border-t border-stone-200 mt-10 mb-10" />
                </div>
              )}

              {/* ── Today's Events Section ── */}
              {todayEvents.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">📅</span>
                    <h2 className="font-serif text-xl font-bold text-amber-700">Today&apos;s Events</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {todayEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                  <div className="border-t border-stone-200 mt-10 mb-10" />
                </div>
              )}

              {/* ── Featured Event ── */}
              {otherEvents.length > 0 && (
                <>
                  <div className="mb-12">
                    <h2 className="font-serif text-xl font-bold text-[#1e3a5f] mb-6">Featured Event</h2>
                    <EventCard event={otherEvents[0]} featured />
                  </div>

                  <h2 className="font-serif text-xl font-bold text-[#1e3a5f] mb-6">All Upcoming Events</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </>
              )}

              {events.length === 0 && (
                <div className="text-center py-10 text-stone-500 bg-white rounded-xl border border-stone-200">
                  No upcoming events scheduled. Check back soon!
                </div>
              )}
            </>
          )}

          {/* Registration CTA */}
          <div className="mt-16 bg-[#1e3a5f] rounded-2xl p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-white mb-3">
              Want to Register for an Event?
            </h3>
            <p className="text-blue-100 mb-6 max-w-lg mx-auto">
              Contact our church office or sign in to the member portal to register for upcoming events.
            </p>
            <a
              href="/members/login"
              className="inline-flex px-6 py-2.5 rounded-full bg-[#c9a227] text-white font-medium hover:bg-[#b8911f] transition-colors"
            >
              Member Login
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
