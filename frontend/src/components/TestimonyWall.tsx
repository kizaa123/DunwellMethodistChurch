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
     FULL-SCREEN / LIVE-SERVICE MODE
  ───────────────────────────────────────────── */
  if (fullscreen) {
    return (
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, hsl(212,51%,10%) 0%, hsl(212,51%,18%) 60%, hsl(41,60%,16%) 100%)" }}
      >
        {/* Glowing orb */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(41,74%,60%), transparent 70%)" }}
        />

        <div className="relative p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: "hsl(41,74%,60%)" }}>
            ✨ Live Testimonies
          </p>

          {/* Card */}
          <div
            key={t.id}
            className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
            style={{ animation: "fadeSlide 0.5s ease" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Full-width image when present */}
            {t.imageUrl && (
              <div className="relative w-full" style={{ maxHeight: "340px", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt={`${t.memberName}'s testimony`}
                  className="w-full object-cover"
                  style={{ maxHeight: "340px" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.75) 100%)" }}
                />
                {/* Member name overlaid on image */}
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-white/40"
                    style={{ background: "linear-gradient(135deg, hsl(41,74%,47%), hsl(41,74%,35%))" }}
                  >
                    {t.memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm drop-shadow">{t.memberName}</p>
                    <p className="text-white/60 text-[10px]">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Quote mark */}
              <div className="font-serif text-5xl leading-none mb-3" style={{ color: "hsl(41,74%,47%)", opacity: 0.6 }}>
                &ldquo;
              </div>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4 font-light">
                {t.testimony}
              </p>

              {/* Author (if no image) */}
              {!t.imageUrl && (
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(41,74%,47%), hsl(41,74%,35%))" }}
                  >
                    {t.memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.memberName}</p>
                    <p className="text-white/50 text-[10px]">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="ml-auto font-serif text-5xl leading-none text-white/30" style={{ marginTop: "-0.75rem" }}>
                    &rdquo;
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dots */}
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
                    background: i === active ? "hsl(41,74%,60%)" : "rgba(255,255,255,0.25)",
                  }}
                  aria-label={`Testimony ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
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
          className="relative mx-auto max-w-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            key={t.id}
            className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden flex gap-0"
            style={{ animation: "fadeSlide 0.5s ease" }}
          >
            {/* Small side thumbnail */}
            {t.imageUrl && (
              <div className="w-28 sm:w-36 shrink-0 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt={`${t.memberName}`}
                  className="w-full h-full object-cover"
                  style={{ minHeight: "100%", maxHeight: "220px" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.25) 100%)" }} />
              </div>
            )}

            {/* Text content */}
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
              <div>
                <div className="font-serif text-4xl leading-none mb-2" style={{ color: "hsl(41,74%,47%)", opacity: 0.7 }}>
                  &ldquo;
                </div>
                <p className="text-white/90 text-sm leading-relaxed line-clamp-4 font-light">
                  {t.testimony}
                </p>
              </div>
              <div className="flex items-center gap-2.5 mt-4">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(41,74%,47%), hsl(41,74%,35%))" }}
                >
                  {t.memberName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-xs truncate">{t.memberName}</p>
                  <p className="text-white/50 text-[10px]">
                    {new Date(t.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="ml-auto font-serif text-4xl leading-none text-white/30" style={{ marginTop: "-0.5rem" }}>
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
