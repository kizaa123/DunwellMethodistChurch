"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { churchInfo } from "@/lib/data";

const slides = [
  {
    image: "/images/hero-1.jpg",
    headline: churchInfo.name,
    sub: churchInfo.tagline,
  },
  {
    image: "/images/hero-2.jpg",
    headline: "Growing in Faith",
    sub: "Join us every Sunday for uplifting worship and powerful messages.",
  },
  {
    image: "/images/hero-3.jpg",
    headline: "Serving in Love",
    sub: "Together we make a difference — in our community and beyond.",
  },
  {
    image: "/images/hero-4.jpg",
    headline: "Open Hearts. Open Doors.",
    sub: "A welcoming family for all who seek to know Christ.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isPaused, next]);

  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide backgrounds */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
        >
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,25,50,0.65) 0%, rgba(10,25,50,0.5) 50%, rgba(10,25,50,0.75) 100%)" }} />
        </div>
      ))}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center" style={{ zIndex: 2 }}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-white/90 text-sm font-medium tracking-wider uppercase"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(41, 74%, 57%)" }} />
          Welcome to our community
        </div>

        {/* Headline — transitions per slide */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight text-balance transition-all duration-700">
          {slides[current].headline}
        </h1>

        <div className="mx-auto mb-6 h-1 w-20 rounded-full" style={{ background: "linear-gradient(90deg, hsl(41,74%,47%), hsl(41,74%,60%))" }} />

        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed text-balance transition-all duration-700">
          {slides[current].sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/about" className="btn-gold hover-glow-gold shadow-lg">Plan Your Visit</Link>
          <Link
            href="/sermons"
            className="px-7 py-3 rounded-full border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          >
            Watch Sermons
          </Link>
        </div>

        {/* Service time cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {churchInfo.serviceTimes.map((service) => (
            <div
              key={service.day}
              className="rounded-2xl p-5 text-left"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <p className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "hsl(41, 74%, 65%)" }}>
                {service.day}
              </p>
              <p className="text-white font-bold text-lg leading-tight">{service.time}</p>
              <p className="text-blue-200 text-xs mt-1">{service.type}</p>
            </div>
          ))}
          <div className="rounded-2xl p-5 text-left"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <p className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "hsl(41, 74%, 65%)" }}>Location</p>
            <p className="text-white font-bold leading-tight">{churchInfo.address.split(",")[0]}</p>
            <p className="text-blue-200 text-xs mt-1">All are welcome</p>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", zIndex: 3 }}
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", zIndex: 3 }}
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 3 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === current ? "28px" : "8px",
              height: "8px",
              background: i === current ? "hsl(41,74%,57%)" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 flex flex-col items-center gap-1 opacity-50" style={{ zIndex: 3 }}>
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
