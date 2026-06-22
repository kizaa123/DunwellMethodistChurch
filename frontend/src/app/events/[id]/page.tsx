"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import { Event } from "@/types";
import { upcomingEvents } from "@/lib/data";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // RSVP Form State
  const [rsvpForm, setRsvpForm] = useState({ name: "", email: "", guests: "1", notes: "" });
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "loading" | "success">("idle");
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Check if user is already RSVP'd in localStorage
    const savedRSVP = localStorage.getItem(`rsvp-${id}`);
    if (savedRSVP) {
      setIsRegistered(true);
    }

    api.getEvent(id)
      .then(setEvent)
      .catch((err) => {
        console.error("Failed to fetch event, trying static search:", err);
        const staticEvent = upcomingEvents.find((e) => e.id === id);
        if (staticEvent) {
          setEvent(staticEvent);
        } else {
          setError("Event not found");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleRsvp(e: React.FormEvent) {
    e.preventDefault();
    setRsvpStatus("loading");
    
    // Simulate RSVP submission
    setTimeout(() => {
      localStorage.setItem(`rsvp-${id}`, JSON.stringify(rsvpForm));
      setIsRegistered(true);
      setRsvpStatus("success");
    }, 1000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]"></div>
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

  return (
    <>
      <PageHeader
        title={event.title}
        subtitle={formattedDate}
      />

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
            {/* Event Info Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
                {/* Event Image Banner */}
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
              </div>
            </div>
          </div>

            {/* RSVP Form Column */}
            <div>
              {isRegistered ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-center sticky top-24">
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-2">You&apos;re Registered!</h3>
                  <p className="text-stone-600 text-sm mb-6">
                    Thank you for your RSVP. We have saved your spot and look forward to seeing you there!
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem(`rsvp-${id}`);
                      setIsRegistered(false);
                      setRsvpStatus("idle");
                    }}
                    className="w-full py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 sticky top-24">
                  <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">RSVP for Event</h3>
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
                          <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
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
