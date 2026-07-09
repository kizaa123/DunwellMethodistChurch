"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      if (editingId) {
        const updated = await api.admin.updateAnnouncement(editingId, form);
        setAnnouncements((prev) => prev.map(a => a.id === editingId ? updated : a));
        setStatus("success");
      } else {
        const newAnn = await api.admin.createAnnouncement(form);
        setAnnouncements((prev) => [newAnn, ...prev]);
        setStatus("success");
      }
      setForm({ title: "", content: "" });
      setEditingId(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save announcement.");
    }
  }

  function handleEdit(ann: Announcement) {
    setEditingId(ann.id);
    setForm({ title: ann.title, content: ann.content });
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ title: "", content: "" });
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.admin.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete announcement.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">Announcements Management</h1>
      <p className="text-stone-500 mb-6 sm:mb-8 text-sm">Post announcements and manage existing board entries for the congregation</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">
            {editingId ? "Edit Announcement" : "Post Announcement"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "success" && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                Announcement {editingId ? "updated" : "posted"}!
              </div>
            )}
            {status === "error" && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{errorMessage}</div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Content</label>
              <textarea
                required
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#1e3a5f]/30 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 py-2.5 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors disabled:opacity-60 text-sm cursor-pointer"
              >
                {status === "loading" ? "Saving..." : (editingId ? "Update" : "Post Announcement")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 px-4 rounded-lg bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">Announcement Board</h2>
          {announcements.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">No announcements posted yet.</div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {announcements.map((ann) => (
                <div key={ann.id} className={`py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start animate-fade-in ${editingId === ann.id ? "bg-stone-50 rounded-lg px-2 -mx-2" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#1e3a5f] break-words">{ann.title}</p>
                    <p className="text-xs text-stone-600 mt-1 whitespace-pre-line leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-stone-400 mt-2">Posted on {new Date(ann.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleEdit(ann)}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
