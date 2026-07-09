"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const SESSION_KEY = "live-viewer-session";
const HEARTBEAT_MS = 15_000;
const POLL_MS = 10_000;

function getViewerSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function sendLeaveBeacon(sermonId: string, sessionId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const payload = JSON.stringify({ sermonId, sessionId });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      `${API_URL}/live/viewers/leave`,
      new Blob([payload], { type: "application/json" })
    );
    return;
  }
  fetch(`${API_URL}/live/viewers/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function useLiveViewers(
  sermonId: string | null | undefined,
  options: { track?: boolean; poll?: boolean } | boolean
) {
  const track = typeof options === "boolean" ? options : (options.track ?? false);
  const poll = typeof options === "boolean" ? options : (options.poll ?? track);

  const [viewerCount, setViewerCount] = useState(0);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!sermonId || (!track && !poll)) {
      setViewerCount(0);
      return;
    }

    sessionIdRef.current = getViewerSessionId();
    const sessionId = sessionIdRef.current;

    async function heartbeat() {
      if (!track) return;
      try {
        const { count } = await api.liveViewerHeartbeat(sermonId!, sessionId);
        setViewerCount(count);
      } catch {
        // ignore — viewer count is non-critical
      }
    }

    async function pollCount() {
      try {
        const { count } = await api.getLiveViewerCount(sermonId!);
        setViewerCount(count);
      } catch {
        // ignore
      }
    }

    if (track) heartbeat();
    if (poll) pollCount();

    const heartbeatTimer = track ? setInterval(heartbeat, HEARTBEAT_MS) : undefined;
    const pollTimer = poll ? setInterval(pollCount, POLL_MS) : undefined;

    const handleLeave = () => {
      if (track) sendLeaveBeacon(sermonId!, sessionId);
    };
    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener("pagehide", handleLeave);

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener("beforeunload", handleLeave);
      window.removeEventListener("pagehide", handleLeave);
      if (track) {
        api.liveViewerLeave(sermonId!, sessionId).catch(() => {});
      }
    };
  }, [sermonId, track, poll]);

  return viewerCount;
}
