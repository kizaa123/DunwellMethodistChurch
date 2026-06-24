import Link from "next/link";
import Hero from "@/components/Hero";
import SermonCard from "@/components/SermonCard";
import EventCard from "@/components/EventCard";
import Gallery from "@/components/Gallery";
import QuoteCarousel from "@/components/QuoteCarousel";
import TestimonyWall from "@/components/TestimonyWall";
import {
  bibleVerse,
  featuredSermons as staticSermons,
  upcomingEvents as staticEvents,
  galleryImages,
  churchInfo,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let sermons = staticSermons;
  let events = staticEvents;
  let gallery = galleryImages;

  try {
    const resSermons = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/sermons`, { cache: "no-store" });
    if (resSermons.ok) {
      const data = await resSermons.json();
      if (data && data.length > 0) sermons = data;
    }
  } catch (e) {
    console.error("Failed to fetch sermons:", e);
  }

  try {
    const resEvents = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/events`, { cache: "no-store" });
    if (resEvents.ok) {
      const data = await resEvents.json();
      if (data && data.length > 0) events = data;
    }
  } catch (e) {
    console.error("Failed to fetch events:", e);
  }

  try {
    const resGallery = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/gallery`, { cache: "no-store" });
    if (resGallery.ok) {
      const data = await resGallery.json();
      if (data && data.length > 0) gallery = data;
    }
  } catch (e) {
    console.error("Failed to fetch gallery:", e);
  }


  let testimonies: Array<{ id: string; memberName: string; testimony: string; imageUrl?: string; createdAt: string }> = [];
  try {
    const resTestimonies = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/testimonies`, { cache: "no-store" });
    if (resTestimonies.ok) {
      const data = await resTestimonies.json();
      if (data && Array.isArray(data)) testimonies = data;
    }
  } catch (e) {
    console.error("Failed to fetch testimonies:", e);
  }

  const latestSermon = sermons[0];
  const upcomingEvents = events.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Church Introduction */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: "hsl(41,74%,47%)" }}
              >
                Who We Are
              </p>
              <h2
                className="font-serif text-3xl sm:text-4xl font-bold mb-6 leading-tight text-balance"
                style={{ color: "hsl(212,51%,24%)" }}
              >
                A Community of Faith &amp; Hope
              </h2>
              <div
                className="h-1 w-12 rounded-full mb-6"
                style={{ background: "linear-gradient(90deg, hsl(41,74%,47%), hsl(41,74%,60%))" }}
              />
              <p className="leading-relaxed mb-4" style={{ color: "hsl(24,5%,40%)" }}>
                At {churchInfo.name}, we believe in the transformative power of God&apos;s love.
                For over a century, our congregation has been a beacon of hope in our community,
                welcoming all who seek to grow in faith and serve others.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: "hsl(24,5%,40%)" }}>
                Whether you&apos;re exploring faith for the first time or looking for a church home,
                you&apos;ll find a warm, inclusive community ready to walk alongside you.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-semibold transition-all duration-150 hover:gap-3 text-[hsl(212,51%,24%)] hover:text-[hsl(41,74%,47%)]"
              >
                Learn more about us
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Visual card */}
            <div
              className="aspect-[4/3] rounded-3xl relative overflow-hidden shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(212,51%,18%) 0%, hsl(212,51%,28%) 50%, hsl(220,40%,24%) 100%)",
              }}
            >
              {/* Watermark image showing stained glass church interior, faded at the bottom */}
              <div
                className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
                  filter: "brightness(1.25) contrast(1.1)",
                }}
              />
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Glow orb */}
              <div
                className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-20"
                style={{ background: "hsl(41,74%,47%)" }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8 text-center">
                <div
                  className="text-5xl mb-6 animate-float"
                  style={{ animationDuration: "4s", filter: "drop-shadow(0 0 20px rgba(201,162,39,0.5))" }}
                >
                  ✝
                </div>
                <p className="font-serif text-xl italic opacity-90 leading-relaxed text-balance">
                  &ldquo;Open hearts, open minds, open doors&rdquo;
                </p>
                <p
                  className="mt-4 text-sm font-medium tracking-wider uppercase"
                  style={{ color: "hsl(41,74%,60%)" }}
                >
                  — Methodist Church
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Bible Verse */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(212,51%,18%) 0%, hsl(212,51%,26%) 50%, hsl(220,40%,22%) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Background image watermark showing open bible with light rays */}
        <div
          className="absolute inset-0 w-full h-full opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: "hsl(41,74%,47%)" }}
        />

        <QuoteCarousel />
      </section>

      {/* Latest Sermon */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "hsl(41,74%,47%)" }}
            >
              Latest Message
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "hsl(212,51%,24%)" }}
            >
              Recent Sermon
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="max-w-2xl mx-auto">
            <SermonCard sermon={latestSermon} />
          </div>
          <div className="text-center mt-10">
            <Link href="/sermons" className="btn-outline">
              View All Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24" style={{ background: "hsl(30,5%,97%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: "hsl(41,74%,47%)" }}
              >
                What&apos;s Happening
              </p>
              <h2
                className="font-serif text-3xl sm:text-4xl font-bold"
                style={{ color: "hsl(212,51%,24%)" }}
              >
                Upcoming Events
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm font-semibold transition-colors"
              style={{ color: "hsl(212,51%,24%)" }}
            >
              See full calendar →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="animate-slide-up">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: "hsl(41,74%,47%)" }}
            >
              Life at Dunwell
            </p>
            <h2
              className="font-serif text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "hsl(212,51%,24%)" }}
            >
              Photo Gallery
            </h2>
            <div className="divider-gold" />
          </div>
          <Gallery images={gallery} />
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(41,74%,44%) 0%, hsl(41,74%,52%) 50%, hsl(41,60%,40%) 100%)",
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: "white" }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "hsl(212,51%,24%)" }}
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-5 text-balance">
            Join Us This Sunday
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            Experience uplifting worship, meaningful fellowship, and a community that cares.
            We can&apos;t wait to meet you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 rounded-full bg-white font-semibold shadow-lg transition-all duration-150 hover:shadow-xl hover:-translate-y-0.5"
              style={{ color: "hsl(212,51%,24%)" }}
            >
              Get Directions
            </Link>
            <Link
              href="/donations"
              className="px-8 py-3 rounded-full border-2 border-white/50 text-white font-semibold hover:bg-white/15 hover:border-white/70 transition-all duration-150"
            >
              Support Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* Testimony Wall - live approved testimonies from members */}
      {testimonies.length > 0 && <TestimonyWall testimonies={testimonies} />}
    </>
  );
}
