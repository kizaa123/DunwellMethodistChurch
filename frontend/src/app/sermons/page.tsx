"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SermonCard from "@/components/SermonCard";
import { featuredSermons } from "@/lib/data";
import { api, isSermonLive } from "@/lib/api";
import { Sermon } from "@/types";

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSermons()
      .then(setSermons)
      .catch((err) => {
        console.error("Failed to load sermons, falling back to static:", err);
        setSermons(featuredSermons);
      })
      .finally(() => setLoading(false));
  }, []);

  // Separate live vs regular
  const liveSermons  = sermons.filter(isSermonLive);
  const otherSermons = sermons.filter((s) => !isSermonLive(s));

  const filteredOthers = otherSermons.filter((sermon) => {
    if (activeTab === "All") return true;
    if (activeTab === "Video") return !!sermon.videoUrl && sermon.videoUrl !== "#";
    if (activeTab === "Audio") return !!sermon.audioUrl && sermon.audioUrl !== "#";
    if (activeTab === "Notes") return !!sermon.notesUrl && sermon.notesUrl !== "#";
    return true;
  });

  return (
    <>
      <PageHeader
        title="Sermons"
        subtitle="Watch, listen, and grow through our weekly messages"
      />

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Live sermon cards at top */}
          {!loading && liveSermons.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                </span>
                <h2 className="font-serif text-xl font-bold text-red-700">Happening Live Right Now</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveSermons.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
              <div className="border-t border-stone-200 mt-10 mb-10" />
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {["All", "Video", "Audio", "Notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f]" />
            </div>
          ) : filteredOthers.length === 0 ? (
            <div className="text-center py-20 text-stone-500">
              No sermons found for this category.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOthers.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
