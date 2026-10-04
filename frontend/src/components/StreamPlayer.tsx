import { resolveStreamMedia } from "@/lib/streamEmbed";

type StreamPlayerProps = {
  url?: string | null;
  title: string;
  className?: string;
};

export default function StreamPlayer({ url, title, className }: StreamPlayerProps) {
  const media = resolveStreamMedia(url);
  const frameClass = className || "absolute inset-0 w-full h-full border-0";

  if (!media) {
    const hasLink = !!url && url !== "#";
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1b263b] to-[#0d1b2a] text-center p-6">
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-white/90 mb-1">
            {hasLink ? "This link cannot play on the page" : "No stream link configured"}
          </p>
          <p className="text-white/45 text-xs leading-relaxed">
            {hasLink
              ? "Use a YouTube or Facebook video or live link so the service plays here instead of opening another app."
              : "Add a YouTube or Facebook video or live link in the admin panel. It will play here on the website."}
          </p>
        </div>
      </div>
    );
  }

  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        controls
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full bg-black"
      />
    );
  }

  return (
    <iframe
      src={media.src}
      title={title}
      allow={media.allow}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className={frameClass}
    />
  );
}
