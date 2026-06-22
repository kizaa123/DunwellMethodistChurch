"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isSermonLive } from "@/lib/api";

export default function LivePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"searching" | "found" | "none">("searching");

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(`${API}/sermons`)
      .then((r) => r.json())
      .then((sermons: Array<{ id: string; date: string; isLive?: boolean }>) => {
        if (!Array.isArray(sermons)) { setStatus("none"); return; }

        // Find active live sermon
        const liveSermon = sermons.find((s) => isSermonLive(s));

        if (liveSermon) {
          router.replace(`/sermons/${liveSermon.id}`);
          setStatus("found");
        } else {
          setStatus("none");
        }
      })
      .catch(() => setStatus("none"));
  }, [router]);

  if (status === "searching" || status === "found") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, hsl(212,51%,8%) 0%, hsl(212,51%,14%) 100%)" }}
      >
        <div className="text-center space-y-4">
          {/* Pulsing live dot */}
          <div className="flex items-center justify-center">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40" />
              <span className="relative inline-flex h-10 w-10 rounded-full bg-red-600 items-center justify-center text-white text-lg font-bold">▶</span>
            </span>
          </div>
          <p className="text-white/80 text-sm font-medium">Finding Live Service...</p>
        </div>
      </div>
    );
  }

  // No live service found
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, hsl(212,51%,8%) 0%, hsl(212,51%,14%) 100%)" }}
    >
      <div className="text-center max-w-sm space-y-5">
        <div className="text-5xl mb-2">⛪</div>
        <h1 className="font-serif text-2xl font-bold text-white">No Live Service Right Now</h1>
        <p className="text-white/60 text-sm leading-relaxed">
          There is no sermon currently broadcasting. Check back during scheduled service times, or browse our past recordings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/sermons"
            className="px-6 py-2.5 rounded-full bg-white text-[#1e3a5f] font-semibold text-sm hover:bg-stone-100 transition-colors"
          >
            View Past Sermons
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
