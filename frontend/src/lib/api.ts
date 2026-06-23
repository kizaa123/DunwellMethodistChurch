const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: import("@/types").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    fetchApi<{ token: string; user: import("@/types").User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Sermons
  getSermons: () => fetchApi<import("@/types").Sermon[]>("/sermons"),
  getSermon: (id: string) =>
    fetchApi<import("@/types").Sermon>(`/sermons/${id}`),

  // Events
  getEvents: () => fetchApi<import("@/types").Event[]>("/events"),
  getEvent: (id: string) => fetchApi<import("@/types").Event>(`/events/${id}`),

  registerForEvent: (
    eventId: string,
    data: { name: string; email: string; guests?: number; notes?: string }
  ) =>
    fetchApi<import("@/types").EventRegistration>(`/events/${eventId}/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancelEventRegistration: (eventId: string, email?: string) =>
    fetchApi<{ message: string }>(`/events/${eventId}/register`, {
      method: "DELETE",
      body: JSON.stringify(email ? { email } : {}),
    }),

  getMyEventRegistration: (eventId: string, email?: string) => {
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    return fetchApi<import("@/types").EventRegistration | null>(
      `/events/${eventId}/my-registration${query}`
    );
  },

  getMyEventRegistrations: () =>
    fetchApi<import("@/types").EventRegistration[]>("/members/me/event-registrations"),

  // Donations
  createDonation: (data: { amount: number; paymentMethod: string }) =>
    fetchApi<import("@/types").Donation>("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Contact
  sendContact: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    fetchApi<{ message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Ministries
  getMinistries: () => fetchApi<import("@/types").Ministry[]>("/ministries"),
  getMinistry: (id: string) => fetchApi<import("@/types").Ministry>(`/ministries/${id}`),

  // Announcements
  getAnnouncements: () =>
    fetchApi<import("@/types").Announcement[]>("/announcements"),

  // Gallery
  getGallery: () => fetchApi<import("@/types").GalleryImage[]>("/gallery"),

  // Prayer Requests & Testimonies
  createPrayerRequest: (data: { memberName: string; email: string; request: string }) =>
    fetchApi<{ id: string }>("/prayer-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createTestimony: (data: { memberName: string; testimony: string; imageUrl?: string }) =>
    fetchApi<{ id: string }>("/testimonies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTestimonies: () => fetchApi<any[]>("/testimonies"),

  // Member self-service
  getMyDonations: () =>
    fetchApi<Array<{ id: string; amount: number; paymentMethod: string; date: string }>>(
      "/members/me/donations"
    ),

  // Admin
  admin: {
    getStats: () =>
      fetchApi<{
        members: number;
        sermons: number;
        events: number;
        donations: number;
        eventRegistrations: number;
      }>("/admin/stats"),

    getActivity: () =>
      fetchApi<Array<{ type: string; label: string; time: string }>>("/admin/activity"),

    uploadFile: (base64Data: string, filename: string) =>
      fetchApi<{ url: string }>("/upload", {
        method: "POST",
        body: JSON.stringify({ base64Data, filename }),
      }),

    createSermon: (data: Partial<import("@/types").Sermon>) =>
      fetchApi<import("@/types").Sermon>("/admin/sermons", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateSermon: (id: string, data: Partial<import("@/types").Sermon>) =>
      fetchApi<import("@/types").Sermon>(`/admin/sermons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    createEvent: (data: Partial<import("@/types").Event>) =>
      fetchApi<import("@/types").Event>("/admin/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateEvent: (id: string, data: Partial<import("@/types").Event>) =>
      fetchApi<import("@/types").Event>(`/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    createAnnouncement: (data: { title: string; content: string }) =>
      fetchApi<import("@/types").Announcement>("/admin/announcements", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateAnnouncement: (id: string, data: { title?: string; content?: string }) =>
      fetchApi<import("@/types").Announcement>(`/admin/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    createGalleryItem: (data: { src: string; alt: string }) =>
      fetchApi<import("@/types").GalleryImage>("/admin/gallery", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getMembers: () => fetchApi<import("@/types").Member[]>("/admin/members"),
    getDonations: () =>
      fetchApi<import("@/types").Donation[]>("/admin/donations"),
    deleteSermon: (id: string) =>
      fetchApi<{ message: string }>(`/admin/sermons/${id}`, { method: "DELETE" }),
    deleteEvent: (id: string) =>
      fetchApi<{ message: string }>(`/admin/events/${id}`, { method: "DELETE" }),

    getEventRegistrations: (eventId: string) =>
      fetchApi<{
        event: { id: string; title: string; eventDate: string; requiresRegistration: boolean };
        registrationCount: number;
        totalGuests: number;
        registrations: Array<{
          id: string;
          name: string;
          email: string;
          guests: number;
          notes?: string | null;
          createdAt: string;
        }>;
      }>(`/admin/events/${eventId}/registrations`),

    deleteEventRegistration: (id: string) =>
      fetchApi<{ message: string }>(`/admin/event-registrations/${id}`, { method: "DELETE" }),
    deleteAnnouncement: (id: string) =>
      fetchApi<{ message: string }>(`/admin/announcements/${id}`, { method: "DELETE" }),
    deleteGalleryItem: (id: string) =>
      fetchApi<{ message: string }>(`/admin/gallery/${id}`, { method: "DELETE" }),
    
    getPrayerRequests: () => fetchApi<any[]>("/admin/prayer-requests"),
    getTestimonies: () => fetchApi<any[]>("/admin/testimonies"),
    approveTestimony: (id: string) =>
      fetchApi<any>(`/admin/testimonies/${id}/approve`, { method: "PUT" }),
    deletePrayerRequest: (id: string) =>
      fetchApi<{ message: string }>(`/admin/prayer-requests/${id}`, { method: "DELETE" }),
    deleteTestimony: (id: string) =>
      fetchApi<{ message: string }>(`/admin/testimonies/${id}`, { method: "DELETE" }),

    createMinistry: (data: Partial<import("@/types").Ministry>) =>
      fetchApi<import("@/types").Ministry>("/admin/ministries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateMinistry: (id: string, data: Partial<import("@/types").Ministry>) =>
      fetchApi<import("@/types").Ministry>(`/admin/ministries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteMinistry: (id: string) =>
      fetchApi<{ message: string }>(`/admin/ministries/${id}`, { method: "DELETE" }),
  },
};


export function parseLocalDate(d: string | Date): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "string") {
    const datePart = d.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  return new Date(d);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSermonLive(sermon: { date: string; isLive?: boolean }): boolean {
  if (sermon.isLive) return true;
  const now = new Date();
  const sermonDate = parseLocalDate(sermon.date);
  return isSameDay(now, sermonDate);
}

export function isEventLive(event: { eventDate: string }): boolean {
  const now = new Date();
  const eventDate = parseLocalDate(event.eventDate);
  return isSameDay(now, eventDate);
}

