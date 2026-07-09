"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sermon } from "@/types";

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [form, setForm] = useState({
    title: "",
    speaker: "",
    description: "",
    videoUrl: "",
    date: "",
    thumbnail: "",
    isLive: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    try {
      const data = await api.getSermons();
      setSermons(data);
    } catch (err) {
      console.error("Failed to load sermons", err);
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
      setForm((prev) => ({ ...prev, thumbnail: url }));
      setImagePreview(url);
    } catch (err) {
      alert("Failed to upload thumbnail image");
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
        const updated = await api.admin.updateSermon(editingId, form);
        setSermons((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const newSermon = await api.admin.createSermon(form);
        setSermons((prev) => [newSermon, ...prev]);
      }
      setStatus("success");
      setForm({ title: "", speaker: "", description: "", videoUrl: "", date: "", thumbnail: "", isLive: false });
      setImagePreview("");
      setEditingId(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save sermon.");
    }
  }

  function handleEdit(s: Sermon) {
    setEditingId(s.id);
    const dateStr = s.date ? new Date(s.date).toISOString().split("T")[0] : "";
    setForm({
      title: s.title,
      speaker: s.speaker,
      description: s.description,
      videoUrl: s.videoUrl || "",
      date: dateStr,
      thumbnail: s.thumbnail || "",
      isLive: s.isLive ?? false,
    });
    setImagePreview(s.thumbnail || "");
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ title: "", speaker: "", description: "", videoUrl: "", date: "", thumbnail: "", isLive: false });
    setImagePreview("");
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this sermon?")) return;
    try {
      await api.admin.deleteSermon(id);
      setSermons((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete sermon.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">Sermons Management</h1>
      <p className="text-stone-500 mb-6 sm:mb-8 text-sm">Upload new sermons and manage existing library entries</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-stone-200">
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">
            {editingId ? "Edit Sermon" : "Upload New Sermon"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "success" && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                Sermon {editingId ? "updated" : "uploaded"} successfully!
              </div>
            )}
            {status === "error" && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{errorMessage}</div>
            )}

            {[
              { key: "title", label: "Title", type: "text" },
              { key: "speaker", label: "Speaker", type: "text" },
              { key: "videoUrl", label: "Video URL (YouTube link)", type: "url" },
              { key: "date", label: "Date", type: "date" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-stone-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required={field.key !== "videoUrl"}
                  value={form[field.key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Sermon Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1e3a5f]/10 file:text-[#1e3a5f] hover:file:bg-[#1e3a5f]/20 cursor-pointer"
              />
              {uploadingImage && <p className="text-[10px] text-blue-600 mt-1">Uploading image...</p>}
              {imagePreview && (
                <div className="mt-2 aspect-video w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                  <img src={imagePreview} alt="Sermon Thumbnail Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* isLive toggle */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-stone-200 bg-stone-50">
              <div>
                <p className="text-xs font-semibold text-stone-700">🔴 Mark as Live Now</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Shows live badge and enables the Live Stream page</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isLive}
                onClick={() => setForm((prev) => ({ ...prev, isLive: !prev.isLive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  form.isLive ? "bg-red-600" : "bg-stone-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.isLive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={status === "loading" || uploadingImage}
                className="flex-1 py-2.5 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#2a5082] transition-colors disabled:opacity-60 text-sm cursor-pointer"
              >
                {status === "loading" ? "Saving..." : editingId ? "Update Sermon" : "Upload Sermon"}
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
          <h2 className="font-serif text-lg font-bold text-[#1e3a5f] mb-4">Sermons Library</h2>
          {sermons.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-sm">No sermons uploaded yet.</div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {sermons.map((s) => (
                <div
                  key={s.id}
                  className={`py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center animate-fade-in ${
                    editingId === s.id ? "bg-stone-50 rounded-lg px-2 -mx-2" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start sm:items-center min-w-0 flex-1">
                    <div className="w-20 sm:w-16 aspect-video rounded overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center relative">
                      {s.thumbnail ? (
                        <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-stone-400">No Image</span>
                      )}
                      {s.isLive && (
                        <span className="absolute top-0.5 left-0.5 flex items-center gap-0.5 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                          <span className="h-1 w-1 rounded-full bg-white animate-ping inline-block" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#1e3a5f] break-words">{s.title}</p>
                        {s.isLive && (
                          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        by {s.speaker} · {new Date(s.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleEdit(s)}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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
