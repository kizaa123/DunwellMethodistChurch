"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import TestimonyWall from "@/components/TestimonyWall";
import type { Testimony } from "@/components/TestimonyWall";
import { api } from "@/lib/api";
import { Sermon } from "@/types";
import { featuredSermons } from "@/lib/data";

export default function SermonDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);

  useEffect(() => {
    if (!id) return;
    // Fetch sermon
    api.getSermon(id)
      .then(setSermon)
      .catch((err) => {
        console.error("Failed to fetch sermon, trying static search:", err);
        const staticSermon = featuredSermons.find((s) => s.id === id);
        if (staticSermon) {
          setSermon(staticSermon);
        } else {
          setError("Sermon not found");
        }
      })
      .finally(() => setLoading(false));

    // Fetch approved testimonies for live screen display
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/testimonies`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTestimonies(data); })
      .catch(console.error);
  }, [id]);

  function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      try {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        videoId = urlParams.get("v") || "";
      } catch {
        // ignore parsing failures
      }
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">Oops!</h2>
          <p className="text-stone-600 mb-8">{error || "Sermon details could not be loaded."}</p>
          <Link
            href="/sermons"
            className="px-6 py-2.5 rounded-full bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors"
          >
            Back to Sermons
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(sermon.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Auto-detect LIVE: same logic as SermonCard
  const now = new Date();
  const sermonTime = new Date(sermon.date);
  const diffHours = (now.getTime() - sermonTime.getTime()) / (1000 * 60 * 60);
  const isLive = sermon.isLive || (diffHours >= -1 && diffHours <= 3);

  const youtubeEmbedUrl = sermon.videoUrl ? getYouTubeEmbedUrl(sermon.videoUrl) : null;

  /* ─── LIVE SERVICE SCREEN ─── */
  if (isLive) {
    return (
      <>
        {/* Live Service Banner */}
        <div
          className="w-full py-2 text-center text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
          style={{ background: "hsl(0,72%,42%)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Live Service — {formattedDate}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
        </div>

        <div
          className="min-h-screen"
          style={{ background: "linear-gradient(180deg, hsl(212,51%,8%) 0%, hsl(212,51%,14%) 100%)" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Back link */}
            <div className="mb-4">
              <Link
                href="/sermons"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
              >
                ← Back to Sermons
              </Link>
            </div>

            {/* Title row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                Live Now
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">{sermon.title}</h1>
              <span className="text-white/40 text-sm ml-auto hidden sm:block">by {sermon.speaker}</span>
            </div>

            {/* Main grid: Video + Sidebar */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* ── Video Player (2/3 width) ── */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  {youtubeEmbedUrl ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={youtubeEmbedUrl}
                        title={sermon.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : sermon.videoUrl && sermon.videoUrl !== "#" ? (
                    <div className="aspect-video w-full bg-[#1e3a5f] flex items-center justify-center text-white p-8 text-center">
                      <div>
                        <p className="text-lg font-medium mb-4">Video stream is hosted externally.</p>
                        <a
                          href={sermon.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex px-6 py-3 rounded-full bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
                        >
                          ▶ Join Live Stream
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex items-center justify-center relative"
                      style={{ background: "linear-gradient(135deg, hsl(212,51%,16%) 0%, hsl(212,51%,24%) 100%)" }}
                    >
                      {/* Thumbnail behind the placeholder */}
                      {sermon.thumbnail && (
                        <img
                          src={sermon.thumbnail}
                          alt={sermon.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-20"
                        />
                      )}
                      <div className="relative text-center text-white p-8 z-10">
                        <div className="h-20 w-20 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
                          <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-white/60 text-sm mb-2">Live stream link not configured</p>
                        <p className="text-white/40 text-xs">Join us in person or check back soon</p>
                      </div>
                    </div>
                  )}

                  {/* Audio / Notes bar */}
                  {(sermon.audioUrl || sermon.notesUrl) && (
                    <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {sermon.audioUrl && sermon.audioUrl !== "#" && (
                        <div className="flex-1">
                          <p className="text-[10px] text-white/40 font-medium mb-1 uppercase tracking-wider">Audio</p>
                          <audio src={sermon.audioUrl} controls className="w-full max-w-xs h-8" />
                        </div>
                      )}
                      {sermon.notesUrl && sermon.notesUrl !== "#" && (
                        <a
                          href={sermon.notesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-xs font-medium transition-all"
                        >
                          📄 Sermon Notes (PDF)
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Sermon description */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="font-serif text-lg font-bold text-white mb-3">About this Message</h2>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{sermon.description}</p>
                </div>
              </div>

              {/* ── Sidebar: Testimonies (1/3 width) ── */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"
                  />
                  <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                    Live Testimonies
                  </h3>
                </div>

                {testimonies.length > 0 ? (
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <TestimonyWall testimonies={testimonies} fullscreen />
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <p className="text-4xl mb-3">✨</p>
                    <p className="text-white/50 text-sm">No testimonies yet.</p>
                    <p className="text-white/30 text-xs mt-1">Approved testimonies will appear here during the live service.</p>
                  </div>
                )}

                {/* Quick join link */}
                <Link
                  href="/members/profile"
                  className="block text-center text-xs text-amber-400/70 hover:text-amber-400 transition-colors mt-2"
                >
                  Share your testimony →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── NORMAL SERMON DETAIL ─── */
  return (
    <>
      <PageHeader
        title={sermon.title}
        subtitle={`by ${sermon.speaker}`}
      />

      <section className="py-12 bg-stone-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/sermons"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
            >
              ← Back to Sermons
            </Link>
          </div>

          {/* Media Player Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 mb-8">
            {youtubeEmbedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={youtubeEmbedUrl}
                  title={sermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : sermon.videoUrl && sermon.videoUrl !== "#" ? (
              <div className="aspect-video w-full bg-[#1e3a5f] flex items-center justify-center text-white p-8 text-center">
                <div>
                  <p className="text-lg font-medium mb-4">Video recording is hosted externally.</p>
                  <a
                    href={sermon.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-6 py-3 rounded-full bg-[#c9a227] text-white hover:bg-[#b8911f] font-medium transition-colors"
                  >
                    Watch Video on YouTube/Vimeo
                  </a>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-br from-[#1e3a5f] to-[#2a5082] flex items-center justify-center relative">
                <div className="text-center text-white p-8">
                  <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <svg className="h-8 w-8 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p className="text-white/80 text-sm">No video recording currently available for this sermon</p>
                </div>
              </div>
            )}

            {/* Audio / Notes block */}
            {(sermon.audioUrl || sermon.notesUrl) && (
              <div className="p-6 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {sermon.audioUrl && sermon.audioUrl !== "#" ? (
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 font-medium mb-2">Listen to Audio Podcast</p>
                    <audio src={sermon.audioUrl} controls className="w-full max-w-md h-10" />
                  </div>
                ) : (
                  <div className="text-sm text-stone-400">No audio recording available</div>
                )}

                {sermon.notesUrl && sermon.notesUrl !== "#" && (
                  <div className="shrink-0">
                    <a
                      href={sermon.notesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 bg-white text-stone-700 hover:border-[#1e3a5f] hover:text-[#1e3a5f] font-medium text-sm transition-all hover:shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Sermon Notes (PDF)
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details Content Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold uppercase tracking-wider">
                Sunday Message
              </span>
              <span className="text-stone-300">|</span>
              <p className="text-sm text-stone-500 font-medium">{formattedDate}</p>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">About this Message</h2>
            <p className="text-stone-600 leading-relaxed whitespace-pre-line">{sermon.description}</p>
          </div>
        </div>
      </section>
    </>
  );
}
