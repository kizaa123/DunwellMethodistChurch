"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Testimony {
  id: string;
  memberName: string;
  testimony: string;
  imageUrl?: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminTestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTestimonies();
  }, []);

  function fetchTestimonies() {
    setLoading(true);
    api.admin.getTestimonies()
      .then((data) => {
        setTestimonies(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch testimonies.");
      })
      .finally(() => setLoading(false));
  }

  async function handleApprove(id: string) {
    try {
      await api.admin.approveTestimony(id);
      setTestimonies(
        testimonies.map((t) => (t.id === id ? { ...t, approved: true } : t))
      );
    } catch (err) {
      alert("Failed to approve testimony");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimony?")) return;
    try {
      await api.admin.deleteTestimony(id);
      setTestimonies(testimonies.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete testimony");
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1">Member Testimonies</h1>
          <p className="text-xs sm:text-sm text-stone-500">Manage and approve testimonies submitted by church members</p>
        </div>
        <button
          onClick={fetchTestimonies}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
        >
          🔄 Refresh List
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading testimonies...</div>
      ) : testimonies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <span className="text-4xl mb-3 block">✨</span>
          <p className="text-sm font-semibold">No testimonies shared yet</p>
          <p className="text-xs text-stone-400 mt-1">When members submit testimonies in their portal, they will show up here for approval.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {testimonies.map((test) => (
            <div
              key={test.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden flex gap-0 transition-all duration-200 max-w-full ${
                test.approved
                  ? "border-emerald-100 hover:border-emerald-300"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {/* Compact thumbnail */}
              <div className="w-16 sm:w-[4.5rem] shrink-0 bg-stone-50 border-r border-stone-100 flex items-center justify-center self-stretch">
                {test.imageUrl ? (
                  <img
                    src={test.imageUrl}
                    alt={test.memberName}
                    className="w-full h-full object-cover min-h-[5rem]"
                  />
                ) : (
                  <div className="text-stone-300 text-2xl font-serif py-3">👤</div>
                )}
              </div>

              {/* Content */}
              <div className="p-2.5 sm:p-3 flex-1 min-w-0 flex flex-col justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start gap-1.5 mb-1.5">
                    <h3 className="font-semibold text-xs text-[#1e3a5f] truncate max-w-[8rem]">{test.memberName}</h3>
                    {test.approved ? (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Live
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse shrink-0">
                        Pending
                      </span>
                    )}
                    <span className="text-[9px] text-stone-400 ml-auto shrink-0">
                      {new Date(test.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-600 italic leading-snug line-clamp-3 whitespace-pre-line bg-stone-50/70 p-2 rounded-lg border border-stone-100">
                    {test.testimony}
                  </p>
                </div>

                <div className="flex gap-1.5 justify-end pt-2 mt-1.5 border-t border-stone-100">
                  {!test.approved && (
                    <button
                      onClick={() => handleApprove(test.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 text-[10px] font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
