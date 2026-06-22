"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Event } from "@/types";
import { isEventLive, parseLocalDate } from "@/lib/api";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function getStatus(event: Event): "live" | "today" | "upcoming" {
  if (isEventLive(event)) return "live";
  
  const now = new Date();
  const eventDate = parseLocalDate(event.eventDate);
  if (eventDate.getTime() > now.getTime()) {
    return "upcoming";
  }
  return "upcoming";
}

export default function EventCard({ event }: EventCardProps) {
  const [status, setStatus] = useState<"live" | "today" | "upcoming">(() => getStatus(event));

  // Re-check every 30 seconds — automatically flips to LIVE when date is reached
  useEffect(() => {
    const tick = () => setStatus(getStatus(event));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [event]);

  const dateObj = parseLocalDate(event.eventDate);
  const day     = dateObj.getDate();
  const month   = MONTH_ABBR[dateObj.getMonth()];
  const year    = dateObj.getFullYear();
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  const imageUrl = event.image || "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80";

  const isLive  = status === "live";
  const isToday = status === "today" || isLive;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Event Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Date badge */}
        <div className="absolute top-4 left-4 z-10 bg-[#1e3a5f]/90 backdrop-blur-md text-white rounded-xl px-3 py-1.5 flex flex-col items-center shadow-md font-sans border border-white/10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">{month}</span>
          <span className="text-xl font-bold leading-none mt-0.5">{day}</span>
          <span className="text-[9px] font-medium opacity-75 mt-0.5">{year}</span>
        </div>

        {/* ── LIVE INDICATOR BADGE ── */}
        {isLive && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            LIVE
          </div>
        )}

        {/* TODAY badge (not yet in live window) */}
        {!isLive && isToday && (
          <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
            📅 TODAY
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Weekday + live status */}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: isLive ? "hsl(0,72%,42%)" : "hsl(41,74%,44%)" }}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {weekday}
          {isLive && (
            <span className="ml-1 inline-flex items-center gap-1 font-bold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              Happening Now
            </span>
          )}
        </span>

        {/* Title */}
        <h3 className="font-serif text-base font-bold text-[#1e3a5f] leading-snug mb-2 group-hover:text-[hsl(212,51%,35%)] transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <svg className="h-3.5 w-3.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-stone-500 truncate">{event.location}</span>
          </div>

          <Link
            href={`/events/${event.id}`}
            className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full text-white transition-colors flex items-center gap-1.5 ${
              isLive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#1e3a5f] hover:bg-[hsl(212,51%,32%)]"
            }`}
          >
            {isLive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />}
            {isLive ? "Join Now" : "Details →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
