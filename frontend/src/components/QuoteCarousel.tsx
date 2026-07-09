"use client";

import { useState, useEffect } from "react";

const quotes = [
  {
    text: "Do all the good you can, by all the means you can, in all the ways you can, in all the places you can, at all the times you can, to all the people you can, as long as ever you can.",
    author: "John Wesley",
  },
  {
    text: "The best of all is, God is with us.",
    author: "John Wesley (Last Words)",
  },
  {
    text: "For where two or three are gathered together in my name, there am I in the midst of them.",
    author: "Matthew 18:20",
  },
  {
    text: "Though we cannot think alike in all things, may we not love alike?",
    author: "John Wesley",
  },
  {
    text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    author: "Galatians 5:22-23",
  },
  {
    text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.",
    author: "Galatians 2:20",
  },
];

export default function QuoteCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center min-h-[180px] flex flex-col justify-center">
      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-6 mx-auto transition-transform duration-500 hover:rotate-12"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <svg className="h-5 w-5" style={{ color: "#e2c04e" }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5 10h-2v5h2v-5zm6 0h-2v5h2v-5zm8.5 7H2v2h19v-2zm-2.5-7h-2v5h2v-5zM11.5 1L2 6v2h19V6l-9.5-5z" />
        </svg>
      </div>

      {/* Quote display with fade transition */}
      <div className="relative h-full flex flex-col justify-center">
        {quotes.map((quote, i) => (
          <div
            key={i}
            className="transition-all duration-1000 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              visibility: i === current ? "visible" : "hidden",
              position: i === current ? "relative" : "absolute",
              left: 0,
              right: 0,
              top: 0,
              transform: i === current ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <blockquote className="font-serif text-lg sm:text-xl text-white/95 leading-relaxed italic mb-5 text-balance px-4 sm:px-8">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <div
              className="h-px w-12 mx-auto mb-3"
              style={{ background: "#c9a227" }}
            />
            <cite
              className="font-medium not-italic tracking-wider text-xs uppercase"
              style={{ color: "#e2c04e" }}
            >
              — {quote.author}
            </cite>
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-8">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="w-2.5 h-1 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === current ? "16px" : "6px",
              background: i === current ? "#dcc04a" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
