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
  private eventInclude = {
    _count: { select: { registrations: true } },
  };

  private formatEvent(event: {
    id: string;
    title: string;
    description: string;
    location: string;
    eventDate: Date;
    image: string | null;
    liveUrl: string | null;
    requiresRegistration: boolean;
    _count?: { registrations: number };
  }) {
    return {
      ...event,
      registrationCount: event._count?.registrations ?? 0,
    };
  }

  async getAll() {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
      include: this.eventInclude,
    });
    return events.map((e) => this.formatEvent(e));
  }

  async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: this.eventInclude,
    });
    if (!event) throw new Error("Event not found");
    return this.formatEvent(event);
  }

  async create(data: {
    title: string;
    description: string;
    location: string;
    eventDate: string;
    image?: string;
    requiresRegistration?: boolean;
  }) {
    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
        requiresRegistration: data.requiresRegistration ?? false,
      },
      include: this.eventInclude,
    });
    return this.formatEvent(event);
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    location?: string;
    eventDate?: string;
    image?: string;
    requiresRegistration?: boolean;
  }) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.eventDate && { eventDate: new Date(data.eventDate) }),
      },
      include: this.eventInclude,
    });
    return this.formatEvent(updated);
  }

  async delete(id: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error("Event not found");
    return prisma.event.delete({ where: { id } });
  }
}

export class EventRegistrationService {
  async register(
    eventId: string,
    data: { name: string; email: string; guests?: number; notes?: string },
    userId?: string
  ) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");

    const email = data.email.trim().toLowerCase();
    const guests = Math.min(Math.max(Number(data.guests) || 1, 1), 20);

    let memberId: string | undefined;
    if (userId) {
      const member = await prisma.member.findUnique({ where: { userId } });
      if (member) memberId = member.id;
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email } },
    });
    if (existing) {
      throw new Error("You are already registered for this event");
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId,
        name: data.name.trim(),
        email,
        guests,
        notes: data.notes?.trim() || null,
      },
      include: { event: { select: { title: true, eventDate: true } } },
    });

    return {
      id: registration.id,
      eventId: registration.eventId,
      name: registration.name,
      email: registration.email,
      guests: registration.guests,
      notes: registration.notes,
      createdAt: registration.createdAt.toISOString(),
      eventTitle: registration.event.title,
    };
  }

  async cancel(eventId: string, email: string, userId?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email: normalizedEmail } },
    });
    if (!registration) throw new Error("Registration not found");

    if (userId) {
      const member = await prisma.member.findUnique({ where: { userId } });
      const isOwner =
        registration.email === normalizedEmail ||
        (member && registration.memberId === member.id);
      if (!isOwner) throw new Error("Not authorized to cancel this registration");
    }

    await prisma.eventRegistration.delete({ where: { id: registration.id } });
    return { message: "Registration cancelled" };
  }

  async getMyRegistration(eventId: string, email: string) {
    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email: email.trim().toLowerCase() } },
    });
    if (!registration) return null;
    return {
      id: registration.id,
      eventId: registration.eventId,
      name: registration.name,
      email: registration.email,
      guests: registration.guests,
      notes: registration.notes,
      createdAt: registration.createdAt.toISOString(),
    };
  }

  async getByUserId(userId: string) {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) return [];

    const registrations = await prisma.eventRegistration.findMany({
      where: { memberId: member.id },
      include: { event: true },
      orderBy: { event: { eventDate: "asc" } },
    });

    return registrations.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      name: r.name,
      email: r.email,
      guests: r.guests,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      event: {
        id: r.event.id,
        title: r.event.title,
        location: r.event.location,
        eventDate: r.event.eventDate.toISOString(),
        image: r.event.image,
      },
    }));
  }

  async getByEventId(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    const totalGuests = registrations.reduce((sum, r) => sum + r.guests, 0);

    return {
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate.toISOString(),
        requiresRegistration: event.requiresRegistration,
      },
      registrationCount: registrations.length,
      totalGuests,
      registrations: registrations.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        guests: r.guests,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  async getRegistrationCounts() {
    const events = await prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      include: {
        _count: { select: { registrations: true } },
        registrations: { select: { guests: true } },
      },
      orderBy: { eventDate: "asc" },
    });

    return events.map((e) => ({
      eventId: e.id,
      title: e.title,
      registrationCount: e._count.registrations,
      totalGuests: e.registrations.reduce((sum, r) => sum + r.guests, 0),
    }));
  }

  async delete(id: string) {
    const registration = await prisma.eventRegistration.findUnique({ where: { id } });
    if (!registration) throw new Error("Registration not found");
    return prisma.eventRegistration.delete({ where: { id } });
  }
}

export class DonationService {
  async create(amount: number, paymentMethod: string, userId?: string) {
    // Resolve userId -> memberId
    let memberId: string | undefined;
    if (userId) {
      const member = await prisma.member.findUnique({ where: { userId } });
      if (member) memberId = member.id;
    }
    return prisma.donation.create({
      data: { amount, paymentMethod, memberId },
    });
  }

  async getAll() {
    return prisma.donation.findMany({
      orderBy: { date: "desc" },
      include: { member: { include: { user: true } } },
    });
  }

  async getByUserId(userId: string) {
    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) return [];
    return prisma.donation.findMany({
      where: { memberId: member.id },
      orderBy: { date: "desc" },
    });
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

  async getAll() {
    return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  }

  async markRead(id: string) {
    return prisma.contactMessage.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async delete(id: string) {
    return prisma.contactMessage.delete({ where: { id } });
  }
}

export class AdminService {
  async getStats() {
    const [members, sermons, events, donations, eventRegistrations] = await Promise.all([
      prisma.member.count(),
      prisma.sermon.count(),
      prisma.event.count({ where: { eventDate: { gte: new Date() } } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.eventRegistration.count({
        where: { event: { eventDate: { gte: new Date() } } },
      }),
    ]);

    return {
      members,
      sermons,
      events,
      donations: donations._sum.amount || 0,
      eventRegistrations,
    };
  }

  async getActivity() {
    const [recentDonations, recentMembers, recentSermons, recentPrayers, recentTestimonies, recentRegistrations, recentContacts] =
      await Promise.all([
        prisma.donation.findMany({
          take: 5,
          orderBy: { date: "desc" },
          include: { member: { include: { user: true } } },
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
        prisma.sermon.findMany({
          take: 5,
          orderBy: { date: "desc" },
          select: { id: true, title: true, speaker: true, date: true },
        }),
        prisma.prayerRequest.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, memberName: true, createdAt: true },
        }),
        prisma.testimony.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, memberName: true, approved: true, createdAt: true },
        }),
        prisma.eventRegistration.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { event: { select: { title: true } } },
        }),
        prisma.contactMessage.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, subject: true, createdAt: true },
        }),
      ]);

    // Merge into a unified activity feed sorted by time
    const feed: Array<{ type: string; label: string; time: string }> = [];

    for (const d of recentDonations) {
      feed.push({
        type: "donation",
        label: `Donation received: GHC ${d.amount.toFixed(2)} via ${d.paymentMethod}${
          d.member?.user?.name ? " from " + d.member.user.name : ""
        }`,
        time: d.date.toISOString(),
      });
    }
    for (const m of recentMembers) {
      feed.push({
        type: "member",
        label: `New member registered: ${m.name}`,
        time: m.createdAt.toISOString(),
      });
    }
    for (const s of recentSermons) {
      feed.push({
        type: "sermon",
        label: `Sermon uploaded: ${s.title} by ${s.speaker}`,
        time: s.date.toISOString(),
      });
    }
    for (const p of recentPrayers) {
      feed.push({
        type: "prayer",
        label: `Prayer request from ${p.memberName}`,
        time: p.createdAt.toISOString(),
      });
    }
    for (const t of recentTestimonies) {
      feed.push({
        type: "testimony",
        label: `Testimony shared by ${t.memberName}${t.approved ? " ✓ approved" : " (pending)"}`,
        time: t.createdAt.toISOString(),
      });
    }
    for (const r of recentRegistrations) {
      feed.push({
        type: "event",
        label: `${r.name} registered for ${r.event.title}`,
        time: r.createdAt.toISOString(),
      });
    }
    for (const c of recentContacts) {
      feed.push({
        type: "contact",
        label: `Guest message from ${c.name}: ${c.subject}`,
        time: c.createdAt.toISOString(),
      });
    }

    // Sort descending and return top 10
    return feed
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }

  async getNotifications() {
    const [
      contacts,
      prayers,
      pendingTestimonies,
      donations,
      registrations,
      recentMembers,
    ] = await Promise.all([
      prisma.contactMessage.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.prayerRequest.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.testimony.findMany({
        where: { approved: false, readAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.donation.findMany({
        where: { readAt: null },
        orderBy: { date: "desc" },
        take: 10,
        include: { member: { include: { user: true } } },
      }),
      prisma.eventRegistration.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { event: { select: { title: true } } },
      }),
      prisma.user.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          role: "MEMBER",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    type NotificationItem = {
      id: string;
      type: string;
      label: string;
      detail?: string;
      time: string;
      href: string;
      unread: boolean;
    };

    const items: NotificationItem[] = [];

    for (const c of contacts) {
      items.push({
        id: c.id,
        type: "contact",
        label: `Guest message from ${c.name}`,
        detail: c.subject,
        time: c.createdAt.toISOString(),
        href: "/admin/contact",
        unread: true,
      });
    }
    for (const p of prayers) {
      items.push({
        id: p.id,
        type: "prayer",
        label: `Prayer request from ${p.memberName}`,
        detail: p.request.slice(0, 80) + (p.request.length > 80 ? "…" : ""),
        time: p.createdAt.toISOString(),
        href: "/admin/prayer-requests",
        unread: true,
      });
    }
    for (const t of pendingTestimonies) {
      items.push({
        id: t.id,
        type: "testimony",
        label: `Testimony pending approval — ${t.memberName}`,
        detail: t.testimony.slice(0, 80) + (t.testimony.length > 80 ? "…" : ""),
        time: t.createdAt.toISOString(),
        href: "/admin/testimonies",
        unread: true,
      });
    }
    for (const d of donations) {
      items.push({
        id: d.id,
        type: "donation",
        label: `Donation: GHC ${d.amount.toFixed(2)}`,
        detail: d.member?.user?.name ? `From ${d.member.user.name}` : `Via ${d.paymentMethod}`,
        time: d.date.toISOString(),
        href: "/admin/donations",
        unread: true,
      });
    }
    for (const r of registrations) {
      items.push({
        id: r.id,
        type: "event",
        label: `${r.name} registered for ${r.event.title}`,
        detail: `${r.guests} guest${r.guests !== 1 ? "s" : ""}`,
        time: r.createdAt.toISOString(),
        href: "/admin/events",
        unread: true,
      });
    }
    for (const m of recentMembers) {
      items.push({
        id: m.id,
        type: "member",
        label: `New member: ${m.name}`,
        time: m.createdAt.toISOString(),
        href: "/admin/members",
        unread: false,
      });
    }

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 30);
  }

  async getNotificationSummary() {
    const [contact, prayer, testimony, donation, event] = await Promise.all([
      prisma.contactMessage.count({ where: { readAt: null } }),
      prisma.prayerRequest.count({ where: { readAt: null } }),
      prisma.testimony.count({ where: { approved: false, readAt: null } }),
      prisma.donation.count({ where: { readAt: null } }),
      prisma.eventRegistration.count({ where: { readAt: null } }),
    ]);

    const total = contact + prayer + testimony + donation + event;
    return { total, contact, prayer, testimony, donation, event };
  }

  async markNotificationRead(type: string, id: string) {
    const now = new Date();
    switch (type) {
      case "contact":
        await prisma.contactMessage.update({ where: { id }, data: { readAt: now } });
        break;
      case "prayer":
        await prisma.prayerRequest.update({ where: { id }, data: { readAt: now } });
        break;
      case "donation":
        await prisma.donation.update({ where: { id }, data: { readAt: now } });
        break;
      case "event":
        await prisma.eventRegistration.update({ where: { id }, data: { readAt: now } });
        break;
      case "testimony":
        await prisma.testimony.update({ where: { id }, data: { readAt: now } });
        break;
      default:
        throw new Error("Unknown notification type");
    }
    return { success: true };
  }

  async markAllNotificationsRead() {
    const now = new Date();
    await Promise.all([
      prisma.contactMessage.updateMany({ where: { readAt: null }, data: { readAt: now } }),
      prisma.prayerRequest.updateMany({ where: { readAt: null }, data: { readAt: now } }),
      prisma.donation.updateMany({ where: { readAt: null }, data: { readAt: now } }),
      prisma.eventRegistration.updateMany({ where: { readAt: null }, data: { readAt: now } }),
    ]);
    return { success: true };
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
      data: { approved: true, readAt: new Date() },
    });
  }

  async delete(id: string) {
    return prisma.testimony.delete({ where: { id } });
  }
}

export class MinistryService {
  async getAll() {
    return prisma.ministry.findMany({ orderBy: { name: "asc" } });
  }

  async getById(id: string) {
    const ministry = await prisma.ministry.findUnique({ where: { id } });
    if (!ministry) throw new Error("Ministry not found");
    return ministry;
  }

  async create(data: { name: string; description: string; leader: string; image?: string }) {
    return prisma.ministry.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string; leader?: string; image?: string }) {
    const ministry = await prisma.ministry.findUnique({ where: { id } });
    if (!ministry) throw new Error("Ministry not found");

    return prisma.ministry.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const ministry = await prisma.ministry.findUnique({ where: { id } });
    if (!ministry) throw new Error("Ministry not found");
    return prisma.ministry.delete({ where: { id } });
  }
}

