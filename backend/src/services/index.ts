import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../database/client";
import { Role } from "@prisma/client";

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: Role.MEMBER,
        member: { create: {} },
      },
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    };
  }

  private generateToken(id: string, email: string, role: Role) {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }
}

export class SermonService {
  async getAll() {
    return prisma.sermon.findMany({ orderBy: { date: "desc" } });
  }

  async getById(id: string) {
    const sermon = await prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new Error("Sermon not found");
    return sermon;
  }

  async create(data: {
    title: string;
    speaker: string;
    description: string;
    videoUrl?: string;
    audioUrl?: string;
    notesUrl?: string;
    thumbnail?: string;
    date?: string;
    isLive?: boolean;
  }) {
    return prisma.sermon.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async update(id: string, data: {
    title?: string;
    speaker?: string;
    description?: string;
    videoUrl?: string;
    audioUrl?: string;
    notesUrl?: string;
    thumbnail?: string;
    date?: string;
    isLive?: boolean;
  }) {
    const sermon = await prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new Error("Sermon not found");

    return prisma.sermon.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  }

  async delete(id: string) {
    const sermon = await prisma.sermon.findUnique({ where: { id } });
    if (!sermon) throw new Error("Sermon not found");
    return prisma.sermon.delete({ where: { id } });
  }
}

export class EventService {
  async getAll() {
    return prisma.event.findMany({ orderBy: { eventDate: "asc" } });
  }

  async getById(id: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");
    return event;
  }

  async create(data: {
    title: string;
    description: string;
    location: string;
    eventDate: string;
    image?: string;
  }) {
    return prisma.event.create({
      data: { ...data, eventDate: new Date(data.eventDate) },
    });
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    location?: string;
    eventDate?: string;
    image?: string;
  }) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");

    return prisma.event.update({
      where: { id },
      data: { ...data, ...(data.eventDate && { eventDate: new Date(data.eventDate) }) },
    });
  }

  async delete(id: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");
    return prisma.event.delete({ where: { id } });
  }
}

export class DonationService {
  async create(amount: number, paymentMethod: string, memberId?: string) {
    return prisma.donation.create({
      data: { amount, paymentMethod, memberId },
    });
  }

  async getAll() {
    return prisma.donation.findMany({ orderBy: { date: "desc" } });
  }
}

export class AnnouncementService {
  async getAll() {
    return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(title: string, content: string) {
    return prisma.announcement.create({ data: { title, content } });
  }

  async update(id: string, title?: string, content?: string) {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new Error("Announcement not found");

    return prisma.announcement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
  }

  async delete(id: string) {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new Error("Announcement not found");
    return prisma.announcement.delete({ where: { id } });
  }
}

export class MemberService {
  async getAll() {
    return prisma.member.findMany({ include: { user: true } });
  }
}

export class ContactService {
  async create(data: { name: string; email: string; subject: string; message: string }) {
    return prisma.contactMessage.create({ data });
  }
}

export class AdminService {
  async getStats() {
    const [members, sermons, events, donations] = await Promise.all([
      prisma.member.count(),
      prisma.sermon.count(),
      prisma.event.count({ where: { eventDate: { gte: new Date() } } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      members,
      sermons,
      events,
      donations: donations._sum.amount || 0,
    };
  }
}

export class GalleryService {
  async getAll() {
    return prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(data: { src: string; alt: string }) {
    return prisma.galleryItem.create({ data });
  }

  async delete(id: string) {
    const item = await prisma.galleryItem.findUnique({ where: { id } });
    if (!item) throw new Error("Gallery item not found");
    return prisma.galleryItem.delete({ where: { id } });
  }
}

export class PrayerRequestService {
  async getAll() {
    return prisma.prayerRequest.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(data: { memberName: string; email: string; request: string }) {
    return prisma.prayerRequest.create({ data });
  }

  async delete(id: string) {
    return prisma.prayerRequest.delete({ where: { id } });
  }
}

export class TestimonyService {
  async getAll(approvedOnly = false) {
    return prisma.testimony.findMany({
      where: approvedOnly ? { approved: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: { memberName: string; testimony: string; imageUrl?: string }) {
    return prisma.testimony.create({ data });
  }

  async approve(id: string) {
    return prisma.testimony.update({
      where: { id },
      data: { approved: true },
    });
  }

  async delete(id: string) {
    return prisma.testimony.delete({ where: { id } });
  }
}
