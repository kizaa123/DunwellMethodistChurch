"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { api, isEventLive } from "@/lib/api";
import { Event, EventRegistration, User } from "@/types";
import { upcomingEvents } from "@/lib/data";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isLive, setIsLive] = useState(false);

  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", guests: "1", notes: "" });
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [rsvpError, setRsvpError] = useState("");
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  useEffect(() => {
    if (!id) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        setRsvpForm((prev) => ({
          ...prev,
          name: parsed.name,
          email: parsed.email,
        }));
      } catch {
        // ignore invalid stored user
      }
    }

    api.getEvent(id)
      .then((ev) => {
        setEvent(ev);
        setIsLive(isEventLive(ev));
      })
      .catch((err) => {
        console.error("Failed to fetch event, trying static search:", err);
        const staticEvent = upcomingEvents.find((e) => e.id === id);
        if (staticEvent) {
          setEvent(staticEvent);
          setIsLive(isEventLive(staticEvent));
        } else {
          setError("Event not found");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const email = user?.email || rsvpForm.email;
    if (!email) {
      setCheckingRegistration(false);
      return;
    }

    setCheckingRegistration(true);
    api
      .getMyEventRegistration(id, user ? undefined : email)
      .then(setRegistration)
      .catch(() => setRegistration(null))
      .finally(() => setCheckingRegistration(false));
  }, [id, user, rsvpForm.email]);

  useEffect(() => {
    if (!event) return;
    const tick = () => setIsLive(isEventLive(event));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [event]);

  async function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpStatus("loading");
    setRsvpError("");

    try {
      const result = await api.registerForEvent(id, {
        name: rsvpForm.name,
        email: rsvpForm.email,
        guests: Number(rsvpForm.guests),
        notes: rsvpForm.notes || undefined,
      });
      setRegistration(result);
      setRsvpStatus("success");
    } catch (err) {
      setRsvpStatus("error");
      setRsvpError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  async function handleCancel() {
    setRsvpStatus("loading");
    setRsvpError("");
    try {
      await api.cancelEventRegistration(id, registration?.email || rsvpForm.email);
      setRegistration(null);
      setRsvpStatus("idle");
    } catch (err) {
      setRsvpStatus("error");
      setRsvpError(err instanceof Error ? err.message : "Cancellation failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">Oops!</h2>
          <p className="text-stone-600 mb-8">{error || "Event details could not be loaded."}</p>
          <Link
            href="/events"
            className="px-6 py-2.5 rounded-full bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(event.eventDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const isRegistered = !!registration;

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

  const youtubeEmbedUrl = event.liveUrl ? getYouTubeEmbedUrl(event.liveUrl) : null;

  /* ─── LIVE EVENT SCREEN ─── */
  if (isLive && event.liveUrl) {
    return (
      <>
        {/* Live Event Banner */}
        <div
          className="w-full py-2 text-center text-white text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
          style={{ background: "hsl(0,72%,42%)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Live Event — {event.title}
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
                href="/events"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
              >
                ← Back to Events
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
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white">{event.title}</h1>
              <span className="text-white/40 text-sm ml-auto hidden sm:block">@ {event.location}</span>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-6">
              {youtubeEmbedUrl ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={event.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : event.liveUrl ? (
                <div className="aspect-video w-full bg-[#1e3a5f] flex items-center justify-center text-white p-8 text-center">
                  <div>
                    <p className="text-lg font-medium mb-4">Live stream is hosted externally.</p>
                    <a
                      href={event.liveUrl}
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
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                  )}
                  <div className="relative text-center text-white p-8 z-10">
                    <div className="h-20 w-20 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
                      <svg className="h-10 w-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm mb-2">Live stream link not configured</p>
                    <p className="text-white/40 text-xs">Join us in person or check back soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Event details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-serif text-lg font-bold text-white mb-3">About this Event</h2>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/60">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-white/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-white/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formattedDate} at {formattedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── NORMAL EVENT DETAIL ─── */
  return (
    <>
      <PageHeader title={event.title} subtitle={formattedDate} />

      <section className="py-12 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-[#1e3a5f] text-sm font-medium transition-colors"
            >
              ← Back to Events List
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                <div className="w-full aspect-[21/9] sm:aspect-[16/7] overflow-hidden bg-stone-100 border-b border-stone-100 relative">
                  <img
                    src={event.image || "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1200&q=80"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-6 border-b border-stone-100">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1e3a5f] shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Date & Time</p>
                        <p className="font-semibold text-[#1e3a5f] mt-0.5">{formattedDate}</p>
                        <p className="text-sm text-stone-600">at {formattedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#c9a227] shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Location</p>
                        <p className="font-semibold text-[#1e3a5f] mt-0.5">{event.location}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#1e3a5f] mb-4">About this Event</h3>
                  <p className="text-stone-600 leading-relaxed whitespace-pre-line">{event.description}</p>

                  {(event.registrationCount ?? 0) > 0 && (
                    <p className="mt-6 text-sm text-stone-500">
                      {event.registrationCount} {event.registrationCount === 1 ? "person has" : "people have"} registered so far.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              {checkingRegistration ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e3a5f] mx-auto" />
                </div>
              ) : isRegistered ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-center sticky top-24">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-2">You&apos;re Registered!</h3>
                  <p className="text-stone-600 text-sm mb-2">
                    Thank you for your RSVP. We have saved your spot and look forward to seeing you there!
                  </p>
                  <p className="text-xs text-stone-500 mb-6">
                    {registration?.guests} {registration?.guests === 1 ? "guest" : "guests"} · {registration?.name}
                  </p>
                  {rsvpError && (
                    <p className="text-red-600 text-xs mb-4">{rsvpError}</p>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={rsvpStatus === "loading"}
                    className="w-full py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {rsvpStatus === "loading" ? "Cancelling..." : "Cancel Registration"}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
                  <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-1">
                    {event.requiresRegistration ? "Register for Event" : "RSVP for Event"}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    {event.requiresRegistration
                      ? "Registration is required so we can prepare accordingly."
                      : "Let us know you're coming — registration is optional for this event."}
                  </p>

                  {!user && (
                    <p className="text-xs text-[#1e3a5f] bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
                      <Link href="/members/login" className="font-semibold hover:underline">
                        Sign in
                      </Link>{" "}
                      to register faster with your profile details.
                    </p>
                  )}

                  {rsvpError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs mb-4">{rsvpError}</div>
                  )}

                  <form onSubmit={handleRsvp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={rsvpForm.name}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={rsvpForm.email}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Number of Guests</label>
                      <select
                        value={rsvpForm.guests}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Person" : "People"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Special Notes (Optional)</label>
                      <textarea
                        rows={3}
                        value={rsvpForm.notes}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                        placeholder="Dietary requirements, accessibility assistance..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={rsvpStatus === "loading"}
                      className="w-full py-3 rounded-lg bg-[#c9a227] text-white font-medium hover:bg-[#b8911f] transition-colors disabled:opacity-60 text-sm cursor-pointer"
                    >
                      {rsvpStatus === "loading" ? "Registering..." : "Submit RSVP"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
