export type UserRole = "ADMIN" | "PASTOR" | "MEMBER" | "VISITOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  description: string;
  videoUrl?: string;
  audioUrl?: string;
  notesUrl?: string;
  date: string;
  thumbnail?: string;
  isLive?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  image?: string;
  liveUrl?: string;
  requiresRegistration?: boolean;
  registrationCount?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  guests: number;
  notes?: string | null;
  createdAt: string;
  eventTitle?: string;
  event?: {
    id: string;
    title: string;
    location: string;
    eventDate: string;
    image?: string | null;
  };
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  image?: string;
}

export interface Donation {
  id: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  department?: string;
  user?: User;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}
