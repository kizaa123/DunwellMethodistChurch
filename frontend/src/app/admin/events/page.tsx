"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Event } from "@/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      const { url } = await api.admin.uploadFile(base64Data, file.name);
      setForm((prev) => ({ ...prev, image: url }));
      setImagePreview(url);
    } catch (err) {
      alert("Failed to upload event image");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      if (editingId) {
        const updated = await api.admin.updateEvent(editingId, form);
        setEvents((prev) =>
          prev
            .map((ev) => (ev.id === editingId ? updated : ev))
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        );
      } else {
        const newEvent = await api.admin.createEvent(form);
        setEvents((prev) =>
          [...prev, newEvent].sort(
            (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          )
        );
      }
      setStatus("success");
      setForm({ title: "", description: "", location: "", eventDate: "", image: "" });
      setImagePreview("");
      setEditingId(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save event.");
    }
  }

  function handleEdit(ev: Event) {
    setEditingId(ev.id);
    const dateStr = ev.eventDate ? new Date(ev.eventDate).toISOString().split("T")[0] : "";
    setForm({
      title: ev.title,
      description: ev.description,
      location: ev.location,
      eventDate: dateStr,
      image: ev.image || "",
    });
    setImagePreview(ev.image || "");
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ title: "", description: "", location: "", eventDate: "", image: "" });
    setImagePreview("");
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.admin.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-2">Events Management</h1>
      <p className="text-stone-500 mb-8">Schedule new church events and manage existing listings</p>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">
            {editingId ? "Edit Event" : "Create New Event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "success" && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                Event {editingId ? "updated" : "created"} successfully!
              </div>
            )}
            {status === "error" && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{errorMessage}</div>
            )}

            {[
              { key: "title", label: "Event Title", type: "text" },
              { key: "location", label: "Location", type: "text" },
              { key: "eventDate", label: "Event Date", type: "date" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Event Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1e3a5f]/10 file:text-[#1e3a5f] hover:file:bg-[#1e3a5f]/20 cursor-pointer"
              />
              {uploadingImage && <p className="text-[10px] text-blue-600 mt-1">Uploading image...</p>}
              {imagePreview && (
                <div className="mt-2 aspect-[16/9] w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#1e3a5f]/30 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={status === "loading" || uploadingImage}
                className="flex-1 py-2.5 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors disabled:opacity-60 text-sm cursor-pointer"
              >
                {status === "loading" ? "Saving..." : editingId ? "Update Event" : "Create Event"}
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

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">Scheduled Events</h2>
          {events.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">No events scheduled.</div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`py-4 flex justify-between items-center gap-4 animate-fade-in ${
                    editingId === ev.id ? "bg-stone-50 rounded-lg px-2 -mx-2" : ""
                  }`}
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-16 aspect-video rounded overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-stone-400">No Image</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1e3a5f] truncate">{ev.title}</p>
                      <p className="text-xs text-stone-500">
                        {new Date(ev.eventDate).toLocaleDateString()} · {ev.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(ev)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
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
