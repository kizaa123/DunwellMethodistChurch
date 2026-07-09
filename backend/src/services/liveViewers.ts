const STALE_MS = 30_000;

/** sermonId -> sessionId -> last heartbeat timestamp */
const rooms = new Map<string, Map<string, number>>();

function pruneRoom(sermonId: string) {
  const room = rooms.get(sermonId);
  if (!room) return;

  const now = Date.now();
  for (const [sessionId, lastSeen] of room.entries()) {
    if (now - lastSeen > STALE_MS) {
      room.delete(sessionId);
    }
  }

  if (room.size === 0) {
    rooms.delete(sermonId);
  }
}

export function recordHeartbeat(sermonId: string, sessionId: string): number {
  if (!rooms.has(sermonId)) {
    rooms.set(sermonId, new Map());
  }
  rooms.get(sermonId)!.set(sessionId, Date.now());
  pruneRoom(sermonId);
  return getActiveViewerCount(sermonId);
}

export function removeViewer(sermonId: string, sessionId: string): number {
  const room = rooms.get(sermonId);
  if (room) {
    room.delete(sessionId);
    if (room.size === 0) {
      rooms.delete(sermonId);
    }
  }
  return getActiveViewerCount(sermonId);
}

export function getActiveViewerCount(sermonId: string): number {
  pruneRoom(sermonId);
  return rooms.get(sermonId)?.size ?? 0;
}
