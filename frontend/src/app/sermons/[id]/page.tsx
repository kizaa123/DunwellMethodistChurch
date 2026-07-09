"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Sermon } from "@/types";
import { featuredSermons } from "@/lib/data";
import { isSermonLive } from "@/lib/api";

export default function SermonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
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
  }, [id]);

  useEffect(() => {
    if (!sermon || loading) return;
    if (isSermonLive(sermon)) {
      router.replace("/live");
    }
  }, [sermon, loading, router]);

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

  if (loading || (sermon && isSermonLive(sermon))) {
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

  const youtubeEmbedUrl = sermon.videoUrl ? getYouTubeEmbedUrl(sermon.videoUrl) : null;

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
              Back to Sermons
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
