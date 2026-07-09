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
        <div className="grid gap-6">
          {testimonies.map((test) => (
            <div
              key={test.id}
              className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border overflow-hidden flex flex-col sm:flex-row transition-all duration-200 ${
                test.approved
                  ? "border-emerald-100 hover:border-emerald-300 hover:shadow-md"
                  : "border-stone-200 hover:border-stone-300 hover:shadow-md"
              }`}
            >
              {/* Image side column */}
              <div className="w-full sm:w-44 h-40 sm:h-auto relative shrink-0 bg-stone-50 border-b sm:border-b-0 sm:border-r border-stone-100 flex items-center justify-center">
                {test.imageUrl ? (
                  <img
                    src={test.imageUrl}
                    alt={test.memberName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-stone-300 text-5xl font-serif">👤</div>
                )}
              </div>

              {/* Content Column */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-base text-[#1e3a5f]">{test.memberName}</h3>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Submitted {new Date(test.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="self-start sm:self-auto">
                      {test.approved ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved &amp; Live
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative bg-stone-50/70 p-4 rounded-xl border border-stone-100 mb-4 min-h-[90px] flex items-center">
                    <span className="absolute top-1 left-2 text-2xl text-stone-200 font-serif leading-none">“</span>
                    <p className="text-xs text-stone-600 italic leading-relaxed pl-3 pr-2 whitespace-pre-line relative z-10">
                      {test.testimony}
                    </p>
                    <span className="absolute bottom-1 right-2 text-2xl text-stone-200 font-serif leading-none">”</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-stretch sm:justify-end pt-3 border-t border-stone-100">
                  {!test.approved && (
                    <button
                      onClick={() => handleApprove(test.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      ✓ Approve Testimony
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
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
