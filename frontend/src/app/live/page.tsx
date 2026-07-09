"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isSermonLive } from "@/lib/api";
import { Sermon } from "@/types";
import { featuredSermons } from "@/lib/data";
import { useLiveViewers } from "@/hooks/useLiveViewers";
import LiveViewerBadge from "@/components/LiveViewerBadge";
import TestimonyWall from "@/components/TestimonyWall";
import type { Testimony } from "@/components/TestimonyWall";

export default function LivePage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);
  const [liveSermon, setLiveSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    setLoading(true);
    fetch(`${API}/sermons`)
      .then((r) => r.json())
      .then((data: Sermon[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setSermons(sorted);
          
          const live = sorted.find((s) => isSermonLive(s));
          setLiveSermon(live || null);
          
          if (live) {
            setActiveSermon(live);
          } else {
            setActiveSermon(sorted[0]);
          }
        } else {
          // Fallback to static sermons
          const sorted = [...featuredSermons].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setSermons(sorted);
          const live = sorted.find((s) => isSermonLive(s));
          setLiveSermon(live || null);
          if (live) {
            setActiveSermon(live);
          } else if (sorted.length > 0) {
            setActiveSermon(sorted[0]);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading sermons, using fallback:", err);
        const sorted = [...featuredSermons].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSermons(sorted);
        const live = sorted.find((s) => isSermonLive(s));
        setLiveSermon(live || null);
        if (live) {
          setActiveSermon(live);
        } else if (sorted.length > 0) {
          setActiveSermon(sorted[0]);
        }
      })
      .finally(() => setLoading(false));

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/testimonies`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTestimonies(data);
      })
      .catch(console.error);
  }, []);

  function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      try {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        videoId = urlParams.get("v") || "";
      } catch {
        // ignore
      }
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  }

  const getFormattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isWatchingLive =
    !!liveSermon && !!activeSermon && activeSermon.id === liveSermon.id;
  const viewerCount = useLiveViewers(liveSermon?.id, {
    track: !loading && isWatchingLive,
    poll: !loading && !!liveSermon,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b131e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227]" />
      </div>
    );
  }

  if (!activeSermon) {
    return (
      <div className="min-h-screen bg-[#0b131e] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl mb-4">⛪</p>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">No Content Available</h1>
        <p className="text-white/60 text-sm max-w-sm mb-6">
          There are no scheduled streams or recent sermon recordings at this time.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-white text-[#1e3a5f] font-semibold text-sm hover:bg-stone-100 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const youtubeEmbedUrl = activeSermon.videoUrl ? getYouTubeEmbedUrl(activeSermon.videoUrl) : null;
  const isCurrentlyLive = isWatchingLive;

  return (
    <div className="min-h-screen text-white bg-[#0b131e] pb-16">
      {/* Archive / switch banners only — no top bar when already watching live */}
      {!isCurrentlyLive && liveSermon ? (
        <div className="w-full bg-[#b8911f] text-white text-xs font-bold tracking-widest uppercase py-2.5 px-4 flex flex-wrap items-center justify-center gap-3 shadow-md text-center">
          <span>You are viewing a past service archive.</span>
          <button
            onClick={() => {
              setActiveSermon(liveSermon);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase transition-all duration-200 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            Switch to Live Service
          </button>
        </div>
      ) : !isCurrentlyLive ? (
        <div className="w-full bg-[#1b263b] text-white/90 text-xs font-bold tracking-widest uppercase py-2.5 px-4 flex items-center justify-center gap-2 shadow-md">
          Previous Broadcast — Playing Archive
        </div>
      ) : null}

      {/* Main Workspace Grid */}
      <div className="mx-auto max-w-[1440px] sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Main Video Stream Container (3/4 width on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative aspect-video w-full bg-black sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {isCurrentlyLive ? (
                <>
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md animate-pulse">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                      </span>
                      Live Now
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <LiveViewerBadge
                      count={viewerCount}
                      className="text-[11px] sm:text-xs bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 text-white"
                    />
                  </div>
                </>
              ) : (
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-[#1b263b]/90 text-white/90 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md border border-white/15">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e2c04e] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e2c04e]" />
                    </span>
                    Archive
                  </div>
                </div>
              )}

              {/* Video Player Loader */}
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={activeSermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : activeSermon.videoUrl && activeSermon.videoUrl !== "#" ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1b263b] to-[#0d1b2a] text-center p-6">
                  <div>
                    <p className="text-lg font-medium mb-4 text-white/90">This broadcast is hosted externally.</p>
                    <a
                      href={activeSermon.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                    >
                      Join Live Stream
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-[#1b263b] to-[#0d1b2a]">
                  {activeSermon.thumbnail && (
                    <img
                      src={activeSermon.thumbnail}
                      alt={activeSermon.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                  )}
                  <div className="relative text-center text-white/90 p-8 z-10">
                    <div className="h-16 w-16 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold mb-1">No stream link configured</p>
                    <p className="text-white/40 text-xs">Join us in person or watch our previous broadcasts</p>
                  </div>
                </div>
              )}
            </div>

            {/* Audio & Notes download options */}
            {((activeSermon.audioUrl && activeSermon.audioUrl !== "#") || (activeSermon.notesUrl && activeSermon.notesUrl !== "#")) && (
              <div className="mx-4 sm:mx-0 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
                {activeSermon.audioUrl && activeSermon.audioUrl !== "#" && (
                  <div className="flex-1">
                    <p className="text-[10px] text-white/40 font-medium mb-1 uppercase tracking-wider">Audio Message</p>
                    <audio src={activeSermon.audioUrl} controls className="w-full max-w-sm h-8" />
                  </div>
                )}
                {activeSermon.notesUrl && activeSermon.notesUrl !== "#" && (
                  <a
                    href={activeSermon.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    📄 Sermon Notes (PDF)
                  </a>
                )}
              </div>
            )}

            {/* Video metadata (Horizontal padding for mobile) */}
            <div className="px-4 sm:px-0 space-y-4">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-snug">
                  {activeSermon.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs sm:text-sm text-white/60">
                  <span className="font-medium text-white/80">by {activeSermon.speaker}</span>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span>{getFormattedDate(activeSermon.date)}</span>
                </div>
              </div>

              {/* Description Panel */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 shadow-md">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-[#c9a227]">About this Message</h3>
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {activeSermon.description || "No description provided for this sermon."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar: Testimonies + Recent Broadcasts */}
          <div className="lg:col-span-1 px-4 sm:px-0 space-y-5">
            {testimonies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="h-2 w-2 rounded-full bg-[#e2c04e] animate-pulse" />
                  <h2 className="font-serif text-sm font-bold text-white/90">Live Testimonies</h2>
                </div>
                <TestimonyWall testimonies={testimonies} fullscreen />
                <Link
                  href="/members/profile"
                  className="block text-center text-[10px] text-[#e2c04e]/70 hover:text-[#e2c04e] transition-colors"
                >
                  Share your testimony
                </Link>
              </div>
            )}

            <h2 className="font-serif text-lg font-bold border-b border-white/10 pb-2 flex items-center justify-between">
              <span>Recent Broadcasts</span>
              <span className="text-xs font-sans text-white/40 font-normal">{sermons.length} videos</span>
            </h2>

            {/* Scrollable feed list — stacked card style */}
            <div className="space-y-4 lg:max-h-[70vh] lg:overflow-y-auto pr-1 custom-scrollbar">
              {sermons.map((sermon) => {
                const isSelected = activeSermon.id === sermon.id;
                const isLiveItem = liveSermon && sermon.id === liveSermon.id;
                return (
                  <div
                    key={sermon.id}
                    onClick={() => {
                      setActiveSermon(sermon);
                      if (window.innerWidth < 1024) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={`rounded-xl cursor-pointer transition-all duration-200 group border overflow-hidden ${
                      isSelected
                        ? "bg-[#1e3a5f]/40 border-[#c9a227]/50 shadow-lg shadow-amber-900/10"
                        : "hover:bg-white/5 border-white/5 hover:border-white/15"
                    }`}
                  >
                    {/* Large Thumbnail */}
                    <div className="relative w-full aspect-video bg-[#0d1b2a] overflow-hidden">
                      {sermon.thumbnail ? (
                        <img
                          src={sermon.thumbnail}
                          alt={sermon.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1b263b] to-[#0d1b2a] flex items-center justify-center">
                          <span className="text-4xl opacity-40">⛪</span>
                        </div>
                      )}

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="h-12 w-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                          <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>

                      {isLiveItem && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase animate-pulse">
                          Live
                        </span>
                      )}

                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-[#c9a227] text-black text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                          Watching
                        </span>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="p-3 space-y-1">
                      <h4
                        className={`text-sm font-semibold leading-snug line-clamp-2 transition-colors ${
                          isSelected ? "text-[#e2c04e] font-bold" : "text-white group-hover:text-[#e2c04e]"
                        }`}
                      >
                        {sermon.title}
                      </h4>
                      <p className="text-xs text-white/50 truncate">{sermon.speaker}</p>
                      <p className="text-[10px] text-white/35">
                        {new Date(sermon.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
