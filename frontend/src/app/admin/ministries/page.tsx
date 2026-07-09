"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Ministry } from "@/types";

export default function AdminMinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [form, setForm] = useState({
    name: "",
    leader: "",
    description: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchMinistries();
  }, []);

  async function fetchMinistries() {
    try {
      const data = await api.getMinistries();
      setMinistries(data);
    } catch (err) {
      console.error("Failed to load ministries", err);
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
      alert("Failed to upload image");
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
        const updated = await api.admin.updateMinistry(editingId, form);
        setMinistries((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      } else {
        const newMinistry = await api.admin.createMinistry(form);
        setMinistries((prev) => [...prev, newMinistry]);
      }
      setStatus("success");
      setForm({ name: "", leader: "", description: "", image: "" });
      setImagePreview("");
      setEditingId(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to save ministry.");
    }
  }

  function handleEdit(m: Ministry) {
    setEditingId(m.id);
    setForm({
      name: m.name,
      leader: m.leader,
      description: m.description,
      image: m.image || "",
    });
    setImagePreview(m.image || "");
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ name: "", leader: "", description: "", image: "" });
    setImagePreview("");
    setStatus("idle");
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ministry? This action cannot be undone.")) return;
    try {
      await api.admin.deleteMinistry(id);
      setMinistries((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete ministry");
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">Ministries Management</h1>
        <p className="text-stone-500 text-sm">Create, edit, and delete church ministries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 items-start">
        {/* Form on left */}
        <div className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-base font-bold text-[#1e3a5f] pb-3 border-b border-stone-100">
            {editingId ? "Edit Ministry Details" : "Create New Ministry"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "success" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                ✓ Ministry saved successfully!
              </div>
            )}
            {status === "error" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
                ❌ {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                Ministry Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Youth Ministry"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                Leader / Coordinator Name
              </label>
              <input
                type="text"
                required
                value={form.leader}
                onChange={(e) => setForm((prev) => ({ ...prev, leader: e.target.value }))}
                placeholder="e.g. Pastor Michael Chen"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the ministry's mission and activities..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-50 file:text-[#1e3a5f] hover:file:bg-stone-100 cursor-pointer"
              />
              {uploadingImage && <p className="text-[10px] text-amber-600 mt-1 font-semibold">Uploading cover image...</p>}
              {imagePreview && (
                <div className="mt-3 border border-stone-200 rounded-lg overflow-hidden relative aspect-[16/7]">
                  <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, image: "" }));
                      setImagePreview("");
                    }}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={status === "loading" || uploadingImage}
                className="flex-1 py-2 bg-[#1e3a5f] hover:bg-[#2a5082] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {status === "loading" ? "Saving..." : editingId ? "Save Changes" : "Create Ministry"}
              </button>
            </div>
          </form>
        </div>

        {/* List on right */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif text-base font-bold text-[#1e3a5f] pb-3 border-b border-stone-100">
            Ministries List ({ministries.length})
          </h2>

          {ministries.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">No ministries found. Add one on the left.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ministries.map((m) => (
                <div
                  key={m.id}
                  className="border border-stone-150 rounded-2xl overflow-hidden bg-stone-50/30 flex flex-col justify-between"
                >
                  <div className="aspect-[16/7] bg-stone-100 border-b border-stone-150 overflow-hidden relative">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/10 to-[#c9a227]/10 flex items-center justify-center font-serif text-2xl text-[#1e3a5f] font-bold">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#1e3a5f] leading-snug">{m.name}</h3>
                      <p className="text-[10px] text-[#c9a227] font-semibold tracking-wide uppercase mt-0.5">
                        Leader: {m.leader}
                      </p>
                      <p className="text-stone-500 text-[11px] mt-2 line-clamp-3 leading-relaxed">
                        {m.description}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => handleEdit(m)}
                        className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}
