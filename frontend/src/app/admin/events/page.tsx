"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Event } from "@/types";

type RegistrationRow = {
  id: string;
  name: string;
  email: string;
  guests: number;
  notes?: string | null;
  createdAt: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    image: "",
    liveUrl: "",
    requiresRegistration: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [registrationMeta, setRegistrationMeta] = useState({
    title: "",
    registrationCount: 0,
    totalGuests: 0,
  });
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

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
      setForm({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        image: "",
        liveUrl: "",
        requiresRegistration: false,
      });
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
      liveUrl: ev.liveUrl || "",
      requiresRegistration: ev.requiresRegistration ?? false,
    });
    setImagePreview(ev.image || "");
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      location: "",
      eventDate: "",
      image: "",
      liveUrl: "",
      requiresRegistration: false,
    });
    setImagePreview("");
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.admin.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      if (editingId === id) handleCancelEdit();
      if (viewingEventId === id) setViewingEventId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete event.");
    }
  }

  async function openRegistrations(eventId: string) {
    setViewingEventId(eventId);
    setLoadingRegistrations(true);
    try {
      const data = await api.admin.getEventRegistrations(eventId);
      setRegistrations(data.registrations);
      setRegistrationMeta({
        title: data.event.title,
        registrationCount: data.registrationCount,
        totalGuests: data.totalGuests,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load registrations.");
      setViewingEventId(null);
    } finally {
      setLoadingRegistrations(false);
    }
  }

  async function handleRemoveRegistration(registrationId: string) {
    if (!confirm("Remove this registration?")) return;
    try {
      await api.admin.deleteEventRegistration(registrationId);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
      setRegistrationMeta((prev) => ({
        ...prev,
        registrationCount: prev.registrationCount - 1,
        totalGuests: prev.totalGuests - (registrations.find((r) => r.id === registrationId)?.guests ?? 0),
      }));
      if (viewingEventId) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === viewingEventId
              ? { ...ev, registrationCount: Math.max(0, (ev.registrationCount ?? 0) - 1) }
              : ev
          )
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove registration.");
    }
  }

  function exportCsv() {
    if (registrations.length === 0) return;
    const headers = ["Name", "Email", "Guests", "Notes", "Registered At"];
    const rows = registrations.map((r) => [
      r.name,
      r.email,
      String(r.guests),
      r.notes || "",
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${registrationMeta.title.replace(/\s+/g, "-").toLowerCase()}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">Events Management</h1>
      <p className="text-stone-500 mb-6 sm:mb-8 text-sm">Schedule new church events and manage registrations</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-stone-200">
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
              { key: "liveUrl", label: "Live Stream URL (optional)", type: "text" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required={field.key !== "liveUrl"}
                  value={form[field.key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.key === "liveUrl" ? "e.g., https://youtube.com/live/..." : ""}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm"
                />
              </div>
            ))}

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition-colors">
              <input
                type="checkbox"
                checked={form.requiresRegistration}
                onChange={(e) => setForm({ ...form, requiresRegistration: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#1e3a5f] focus:ring-[#1e3a5f]/30"
              />
              <span>
                <span className="block text-xs font-semibold text-stone-700">Require registration</span>
                <span className="block text-[10px] text-stone-500 mt-0.5">
                  Enable for camps, outreach days, and events that need headcount planning.
                </span>
              </span>
            </label>

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

            <div className="flex flex-col sm:flex-row gap-2">
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
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">Scheduled Events</h2>
          {events.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">No events scheduled.</div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center animate-fade-in ${
                    editingId === ev.id ? "bg-stone-50 rounded-lg px-2 -mx-2" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start sm:items-center min-w-0 flex-1">
                    <div className="w-20 sm:w-16 aspect-video rounded overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-stone-400">No Image</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#1e3a5f] break-words">{ev.title}</p>
                        {ev.requiresRegistration && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            RSVP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {new Date(ev.eventDate).toLocaleDateString()} · {ev.location}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {(ev.registrationCount ?? 0) > 0
                          ? `${ev.registrationCount} registered`
                          : "No registrations yet"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:flex gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => openRegistrations(ev.id)}
                      className="px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View ({ev.registrationCount ?? 0})
                    </button>
                    <button
                      onClick={() => handleEdit(ev)}
                      className="px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
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

      {/* Registrations Modal */}
      {viewingEventId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-stone-200 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1e3a5f] break-words">
                  Registrations — {registrationMeta.title}
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  {registrationMeta.registrationCount} registrations · {registrationMeta.totalGuests} total guests
                </p>
              </div>
              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                {registrations.length > 0 && (
                  <button
                    onClick={exportCsv}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#2a5082] transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                )}
                <button
                  onClick={() => setViewingEventId(null)}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              {loadingRegistrations ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1e3a5f]" />
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-16 text-stone-500 text-sm">
                  No one has registered for this event yet.
                </div>
              ) : (
                <>
                  {/* Mobile card view */}
                  <div className="space-y-3 md:hidden">
                    {registrations.map((r) => (
                      <div key={r.id} className="rounded-xl border border-stone-200 p-4 bg-stone-50/50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-sm text-[#1e3a5f]">{r.name}</p>
                          <button
                            onClick={() => handleRemoveRegistration(r.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 break-all">{r.email}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-stone-600">
                          <span><strong>Guests:</strong> {r.guests}</span>
                          <span>
                            <strong>Registered:</strong>{" "}
                            {new Date(r.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.notes && (
                          <p className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-200">
                            <strong>Notes:</strong> {r.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
                          <th className="pb-3 pr-4 font-semibold">Name</th>
                          <th className="pb-3 pr-4 font-semibold">Email</th>
                          <th className="pb-3 pr-4 font-semibold">Guests</th>
                          <th className="pb-3 pr-4 font-semibold">Notes</th>
                          <th className="pb-3 pr-4 font-semibold">Registered</th>
                          <th className="pb-3 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {registrations.map((r) => (
                          <tr key={r.id} className="text-stone-700">
                            <td className="py-3 pr-4 font-medium">{r.name}</td>
                            <td className="py-3 pr-4 text-stone-500">{r.email}</td>
                            <td className="py-3 pr-4">{r.guests}</td>
                            <td className="py-3 pr-4 text-xs text-stone-500 max-w-[140px] truncate">
                              {r.notes || "—"}
                            </td>
                            <td className="py-3 pr-4 text-xs text-stone-400 whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleRemoveRegistration(r.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
