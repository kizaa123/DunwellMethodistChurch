"use client";

import { useState, useEffect, useRef } from "react";

export interface Testimony {
  id: string;
  memberName: string;
  testimony: string;
  imageUrl?: string;
  createdAt: string;
}

interface Props {
  testimonies: Testimony[];
  /** fullscreen = live-service mode: big image, max-height card */
  fullscreen?: boolean;
}

export default function TestimonyWall({ testimonies, fullscreen = false }: Props) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (testimonies.length <= 1) return;
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonies.length);
    }, fullscreen ? 7000 : 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonies.length, isPaused, fullscreen]);

  if (testimonies.length === 0) return null;

  const t = testimonies[active];

  /* ─────────────────────────────────────────────
     LIVE MODE — compact wide card, small height
  ───────────────────────────────────────────── */
  if (fullscreen) {
    return (
      <div
        className="space-y-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          key={t.id}
          className="flex w-full h-[4.5rem] sm:h-[5rem] rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
          style={{ animation: "fadeSlide 0.4s ease" }}
        >
          {/* Small side image or avatar */}
          {t.imageUrl ? (
            <div className="w-16 sm:w-[4.5rem] shrink-0 h-full overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.imageUrl}
                alt={t.memberName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-14 sm:w-16 shrink-0 h-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, hsl(41,74%,47%), hsl(41,74%,35%))" }}
            >
              {t.memberName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Text flows beside image */}
          <div className="flex-1 min-w-0 px-2.5 sm:px-3 py-2 flex flex-col justify-center">
            <p className="text-[11px] sm:text-xs text-white/90 leading-snug line-clamp-2">
              {t.testimony}
            </p>
            <p className="text-[9px] sm:text-[10px] text-amber-400/80 font-medium truncate mt-1">
              {t.memberName}
            </p>
          </div>
        </div>

        {testimonies.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {testimonies.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 8000);
                }}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === active ? "1.25rem" : "0.35rem",
                  height: "0.35rem",
                  background: i === active ? "hsl(41,74%,60%)" : "rgba(255,255,255,0.25)",
                }}
                aria-label={`Testimony ${i + 1}`}
              />
            ))}
          </div>
        )}

        <style>{`
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateX(6px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     HOME PAGE MODE — compact cards, small thumbnail
  ───────────────────────────────────────────── */
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(212,51%,14%) 0%, hsl(212,51%,22%) 60%, hsl(41,60%,20%) 100%)" }}
    >
      {/* Decorative orb */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(41,74%,60%), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "hsl(41,74%,60%)" }}>
            ✨ Testimonies
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
            Lives Transformed by Grace
          </h2>
          <div className="h-0.5 w-12 mx-auto rounded-full" style={{ background: "hsl(41,74%,47%)" }} />
        </div>

        {/* Compact testimony card — side thumbnail + text */}
        <div
          className="relative mx-auto max-w-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            key={t.id}
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl overflow-hidden flex gap-0"
            style={{ animation: "fadeSlide 0.5s ease" }}
          >
            {/* Small side thumbnail */}
            {t.imageUrl && (
              <div className="w-24 sm:w-28 shrink-0 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt={`${t.memberName}`}
                  className="w-full h-full object-cover"
                  style={{ minHeight: "100%", maxHeight: "150px" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.25) 100%)" }} />
              </div>
            )}

            {/* Text content */}
            <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
              <div>
                <div className="font-serif text-3xl leading-none mb-1" style={{ color: "hsl(41,74%,47%)", opacity: 0.7 }}>
                  &ldquo;
                </div>
                <p className="text-white/90 text-xs sm:text-[13px] leading-relaxed line-clamp-3 font-light">
                  {t.testimony}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(41,74%,47%), hsl(41,74%,35%))" }}
                >
                  {t.memberName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-[11px] sm:text-xs truncate">{t.memberName}</p>
                  <p className="text-white/50 text-[9px]">
                    {new Date(t.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="ml-auto font-serif text-3xl leading-none text-white/30" style={{ marginTop: "-0.25rem" }}>
                  &rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          {testimonies.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              {testimonies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 8000); }}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === active ? "1.75rem" : "0.4rem",
                    height: "0.4rem",
                    background: i === active ? "hsl(41,74%,60%)" : "rgba(255,255,255,0.3)",
                  }}
                  aria-label={`View testimony ${i + 1}`}
                />
              ))}
            </div>
          )}

          <p className="text-center text-white/35 text-[10px] mt-2">
            {active + 1} of {testimonies.length}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
