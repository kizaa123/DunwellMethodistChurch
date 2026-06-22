"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PrayerRequest {
  id: string;
  memberName: string;
  email: string;
  request: string;
  createdAt: string;
}

export default function AdminPrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  function fetchRequests() {
    setLoading(true);
    api.admin.getPrayerRequests()
      .then((data) => {
        setRequests(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch prayer requests.");
      })
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this prayer request?")) return;
    try {
      await api.admin.deletePrayerRequest(id);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete prayer request");
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-1">Prayer Requests</h1>
          <p className="text-xs text-stone-500">Confidential prayer submissions from church members</p>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
        >
          🔄 Refresh List
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
          <span className="text-4xl mb-3 block">🙏</span>
          <p className="text-sm font-semibold">No prayer requests at this time</p>
          <p className="text-xs text-stone-400 mt-1">When members submit requests in their portal, they will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-[#1e3a5f]">{req.memberName}</span>
                  <span className="text-xs text-stone-400">({req.email})</span>
                  <span className="text-[10px] text-stone-400 ml-auto md:ml-2">
                    Submitted {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed italic bg-stone-50 p-4 rounded-xl border border-stone-100">
                  &ldquo;{req.request}&rdquo;
                </p>
              </div>

              <div className="self-end md:self-center shrink-0">
                <button
                  onClick={() => handleDelete(req.id)}
                  className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Delete Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
