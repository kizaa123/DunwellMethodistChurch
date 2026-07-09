"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GalleryImage } from "@/types";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState("");

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      const items = await api.getGallery();
      setImages(items);
    } catch (err) {
      console.error("Failed to load gallery items", err);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      // Upload file to server
      const { url } = await api.admin.uploadFile(base64Data, selectedFile.name);

      // Save item to DB with title
      const item = await api.admin.createGalleryItem({
        src: url,
        alt: imageTitle.trim() || selectedFile.name.split(".")[0],
      });

      setImages((prev) => [item, ...prev]);
      setUploadStatus("success");
      setSelectedFile(null);
      setPreviewUrl(null);
      setImageTitle("");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload image.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this photo?")) return;
    try {
      await api.admin.deleteGalleryItem(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete photo.");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">Gallery Management</h1>
      <p className="text-stone-500 mb-6 sm:mb-8 text-sm">Manage church photo gallery by uploading or deleting photos.</p>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 mb-6 sm:mb-8 w-full max-w-sm">
        <h2 className="font-semibold text-lg text-[#1e3a5f] mb-4">Upload Gallery Image</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadStatus === "uploading" && (
            <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium animate-pulse">
              Uploading and processing image...
            </div>
          )}
          {uploadStatus === "success" && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
              Image uploaded and saved successfully!
            </div>
          )}
          {uploadStatus === "error" && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wider">
              1. Choose Picture
            </label>
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 hover:border-[#1e3a5f] rounded-xl cursor-pointer transition-colors bg-stone-50/50">
                <svg className="h-6 w-6 text-stone-400 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-stone-500 font-semibold">Select image...</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploadStatus === "uploading"} />
              </label>
            ) : (
              <div className="relative border border-stone-200 rounded-xl overflow-hidden shadow-inner bg-stone-50 aspect-[16/10] w-full max-w-sm">
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 text-white text-sm flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="animate-slide-down">
              <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wider">
                2. Picture Title
              </label>
              <input
                type="text"
                required
                placeholder="Enter a descriptive title for this photo..."
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] text-sm text-stone-850"
              />
            </div>
          )}

          {previewUrl && (
            <button
              type="submit"
              disabled={uploadStatus === "uploading"}
              className="w-full py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#2a5082] text-white text-xs font-bold transition-colors cursor-pointer shadow disabled:opacity-60"
            >
              {uploadStatus === "uploading" ? "Uploading..." : "Upload Image to Gallery"}
            </button>
          )}
        </form>
      </div>

      <h2 className="font-semibold text-[#1e3a5f] mb-4">Current Gallery</h2>
      {images.length === 0 ? (
        <div className="text-stone-500 text-sm py-8">No photos in the gallery yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-[4/3] border border-stone-200 bg-stone-50">
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
