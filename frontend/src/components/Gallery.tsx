"use client";

import { useState } from "react";
import { GalleryImage } from "@/types";

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const handleDownload = async (src: string, alt: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = alt ? `${alt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : "download.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download photo:", err);
      // Fallback
      window.open(src, "_blank");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelected(image)}
            className="aspect-square rounded-2xl overflow-hidden bg-stone-100 relative group cursor-pointer border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Real Image */}
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay with Title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white font-serif text-sm font-bold text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {image.alt}
              </p>
              <div className="mx-auto mt-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <span className="sr-only">{image.alt}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-4 md:p-6 shadow-2xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors flex items-center justify-center font-bold z-10"
            >
              ✕
            </button>
            <div className="aspect-[4/3] md:aspect-[16/10] bg-stone-100 rounded-xl overflow-hidden mb-4">
              <img
                src={selected.src}
                alt={selected.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-[#1e3a5f] font-serif text-lg font-bold">{selected.alt}</p>
              <button
                onClick={() => handleDownload(selected.src, selected.alt)}
                className="px-5 py-2.5 rounded-full bg-[#1e3a5f] hover:bg-[#2a5082] text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📥</span> Download Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
