export type StreamMedia =
  | { kind: "iframe"; src: string; allow: string }
  | { kind: "video"; src: string };

const YOUTUBE_ID = /^[\w-]{11}$/;

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";

function asUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

function hostOf(url: URL): string {
  return url.hostname.replace(/^(www|m|web|mbasic)\./, "").toLowerCase();
}

function youtubeEmbed(raw: string): string | null {
  const url = asUrl(raw);
  if (!url) return null;
  const host = hostOf(url);

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] || "";
    return YOUTUBE_ID.test(id) ? embedYoutubeId(id) : null;
  }

  if (host !== "youtube.com" && host !== "youtube-nocookie.com" && host !== "music.youtube.com") {
    return null;
  }

  const watchId = url.searchParams.get("v") || "";
  if (YOUTUBE_ID.test(watchId)) return embedYoutubeId(watchId);

  const parts = url.pathname.split("/").filter(Boolean);
  const markers = ["embed", "live", "shorts", "v"];
  for (let i = 0; i < parts.length - 1; i++) {
    if (markers.includes(parts[i]) && YOUTUBE_ID.test(parts[i + 1])) {
      return embedYoutubeId(parts[i + 1]);
    }
  }

  const channelIndex = parts.indexOf("channel");
  if (channelIndex >= 0 && parts.includes("live") && parts[channelIndex + 1]) {
    const channelId = parts[channelIndex + 1];
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${encodeURIComponent(channelId)}&autoplay=1&playsinline=1&rel=0`;
  }

  return null;
}

function embedYoutubeId(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
}

function facebookEmbed(raw: string): string | null {
  const url = asUrl(raw);
  if (!url) return null;
  const host = hostOf(url);
  const isFacebook = host === "facebook.com" || host === "fb.com" || host === "fb.watch" || host.endsWith(".facebook.com");
  if (!isFacebook) return null;

  const path = url.pathname.toLowerCase();
  const looksLikeVideo =
    host === "fb.watch" ||
    /\/(videos|live|watch|reel|reels|video)(\/|$)/.test(path) ||
    url.searchParams.has("v") ||
    url.searchParams.has("video_id");
  if (!looksLikeVideo) return null;

  const normalized = raw
    .trim()
    .replace(/https?:\/\/(m|web|mbasic)\.facebook\.com/i, "https://www.facebook.com");
  const href = encodeURIComponent(normalized);
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true&width=1280&height=720`;
}

function vimeoEmbed(raw: string): string | null {
  const url = asUrl(raw);
  if (!url || hostOf(url) !== "vimeo.com") return null;
  const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
  return id ? `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1` : null;
}

function directVideo(raw: string): string | null {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(raw.trim()) ? raw.trim() : null;
}

export function resolveStreamMedia(raw?: string | null): StreamMedia | null {
  if (!raw || raw.trim() === "" || raw.trim() === "#") return null;
  const url = raw.trim();

  const youtube = youtubeEmbed(url);
  if (youtube) return { kind: "iframe", src: youtube, allow: IFRAME_ALLOW };

  const facebook = facebookEmbed(url);
  if (facebook) return { kind: "iframe", src: facebook, allow: IFRAME_ALLOW };

  const vimeo = vimeoEmbed(url);
  if (vimeo) return { kind: "iframe", src: vimeo, allow: IFRAME_ALLOW };

  const file = directVideo(url);
  if (file) return { kind: "video", src: file };

  return null;
}
