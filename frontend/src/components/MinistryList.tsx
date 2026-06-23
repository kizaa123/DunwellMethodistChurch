"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function MinistryList() {
  const router = useRouter();
  const [ministriesList, setMinistriesList] = useState<import("@/types").Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joinedMinistries, setJoinedMinistries] = useState<string[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      setIsMember(true);
      // Load joined ministries from localStorage
      const saved = localStorage.getItem("joined-ministries");
      if (saved) {
        setJoinedMinistries(JSON.parse(saved));
      }
    }

    // Fetch ministries from API
    api.getMinistries()
      .then(setMinistriesList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = (ministryId: string, ministryName: string) => {
    if (!isMember) {
      setSelectedMinistry(ministryName);
      setShowPrompt(true);
      return;
    }

    if (joinedMinistries.includes(ministryId)) {
      // Toggle off / leave ministry
      const updated = joinedMinistries.filter((id) => id !== ministryId);
      setJoinedMinistries(updated);
      localStorage.setItem("joined-ministries", JSON.stringify(updated));
    } else {
      // Join ministry
      const updated = [...joinedMinistries, ministryId];
      setJoinedMinistries(updated);
      localStorage.setItem("joined-ministries", JSON.stringify(updated));
    }
  };

  const handleRedirect = () => {
    setShowPrompt(false);
    router.push("/members/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-sm">Loading ministries...</p>
      </div>
    );
  }

  if (ministriesList.length === 0) {
    return (
      <div className="text-center py-20 text-stone-500">
        <p className="text-3xl mb-4">⛪</p>
        <p className="text-sm">No ministries available at this time. Check back later!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {ministriesList.map((ministry) => {
          const isJoined = joinedMinistries.includes(ministry.id);

          return (
            <article
              key={ministry.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md transition-shadow flex flex-col h-full animate-fade-in"
            >
              {/* Image */}
              <div className="aspect-[16/7] overflow-hidden bg-stone-100 relative group">
                {ministry.image ? (
                  <img
                    src={ministry.image}
                    alt={ministry.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/20 to-[#c9a227]/20 flex items-center justify-center font-serif text-3xl text-[#1e3a5f] font-bold">
                    {ministry.name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent opacity-60" />
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="font-serif text-xl font-bold text-[#1e3a5f] mb-1">
                  {ministry.name}
                </h2>
                <p className="text-xs text-[#c9a227] font-semibold tracking-wider uppercase mb-4">
                  Led by {ministry.leader}
                </p>
                <p className="text-stone-600 leading-relaxed text-sm mb-6 flex-grow">
                  {ministry.description}
                </p>

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(ministry.id, ministry.name)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    isJoined
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-[#1e3a5f] text-white hover:bg-[hsl(212,51%,24%)] hover:shadow-md"
                  }`}
                >
                  {isJoined ? "Joined Ministry ✓" : "Join Ministry"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Premium Prompt Modal for Non-members */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPrompt(false)}
          />
          {/* Card */}
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-stone-100 transform scale-100 transition-all duration-300 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1e3a5f] mb-2">Member Portal Required</h3>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              To join the <strong>{selectedMinistry}</strong>, you must register as a member of Dunwell Methodist Church. Let&apos;s redirect you to the Member Portal to get started!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrompt(false)}
                className="flex-1 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRedirect}
                className="flex-1 py-2.5 rounded-lg bg-[#c9a227] text-white text-xs font-semibold hover:bg-[#b8911f] transition-colors cursor-pointer"
              >
                Join Now (Login/Register)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

