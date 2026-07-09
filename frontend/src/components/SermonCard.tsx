"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sermon } from "@/types";
import { isSermonLive } from "@/lib/api";

interface SermonCardProps {
  sermon: Sermon;
}

export default function SermonCard({ sermon }: SermonCardProps) {
  const [isLive, setIsLive] = useState(() => isSermonLive(sermon));

  // Re-evaluate every 30 seconds — card flips to LIVE the moment date is reached
  useEffect(() => {
    const tick = () => setIsLive(isSermonLive(sermon));
    tick(); // immediate check on mount
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [sermon]);

  const formattedDate = new Date(sermon.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const sermonHref = `/sermons/${sermon.id}`;

  return (
    <article className="card card-elevated overflow-hidden flex flex-col h-full group">
      {/* Thumbnail */}
      <Link
        href={sermonHref}
        className="block relative aspect-video overflow-hidden bg-stone-100"
      >
        {sermon.thumbnail ? (
          <img
            src={sermon.thumbnail}
            alt={sermon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(212,51%,20%) 0%, hsl(212,51%,30%) 50%, hsl(220,40%,26%) 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>
        )}

        {/* ── LIVE INDICATOR BADGE ── */}
        {isLive && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            LIVE NOW
          </div>
        )}

        {/* Shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center border-2 border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:border-white/60"
            style={{ background: isLive ? "rgba(185,28,28,0.5)" : "rgba(30,58,95,0.4)", backdropFilter: "blur(4px)" }}
          >
            <svg className="h-6 w-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date row + live pill */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#c9a227" }}
            >
              {formattedDate}
            </p>
            {isLive && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping inline-block" />
                Live
              </span>
            )}
          </div>

          <Link href={sermonHref}>
            <h3
              className="font-serif text-lg font-semibold mb-1 leading-snug transition-colors duration-150 group-hover:underline"
              style={{ color: "hsl(212,51%,24%)" }}
            >
              {sermon.title}
            </h3>
          </Link>
          <p className="text-sm mb-3" style={{ color: "hsl(24,5%,50%)" }}>
            by <span className="font-medium" style={{ color: "hsl(24,5%,35%)" }}>{sermon.speaker}</span>
          </p>
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: "hsl(24,5%,40%)" }}>
            {sermon.description}
          </p>
        </div>

        <div
          className="flex flex-wrap gap-2 pt-3 border-t"
          style={{ borderColor: "hsl(30,5%,91%)" }}
        >
          <Link
            href={sermonHref}
            className="text-xs px-3 py-1.5 rounded-full font-semibold text-white transition-all duration-150 hover:opacity-90 hover:shadow-sm flex items-center gap-1"
            style={{ background: isLive ? "hsl(0,72%,42%)" : "hsl(212,51%,24%)" }}
          >
            {isLive ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
                Join Live
              </>
            ) : "Watch Video"}
          </Link>
          {sermon.audioUrl && (
            <Link
              href={`/sermons/${sermon.id}`}
              className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-150 hover:shadow-sm"
              style={{ border: "1px solid hsl(30,5%,80%)", color: "hsl(24,5%,38%)" }}
            >
              🎧 Listen
            </Link>
          )}
          {sermon.notesUrl && (
            <Link
              href={`/sermons/${sermon.id}`}
              className="text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-150 hover:shadow-sm"
              style={{ border: "1px solid hsl(30,5%,80%)", color: "hsl(24,5%,38%)" }}
            >
              📄 Notes
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
