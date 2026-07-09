import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  AuthService,
  SermonService,
  EventService,
  DonationService,
  AnnouncementService,
  MemberService,
  ContactService,
  AdminService,
  GalleryService,
  PrayerRequestService,
  TestimonyService,
  MinistryService,
  EventRegistrationService,
} from "../services";
import {
  recordHeartbeat,
  removeViewer,
  getActiveViewerCount,
} from "../services/liveViewers";

const authService = new AuthService();
const sermonService = new SermonService();
const eventService = new EventService();
const eventRegistrationService = new EventRegistrationService();
const donationService = new DonationService();
const announcementService = new AnnouncementService();
const memberService = new MemberService();
const contactService = new ContactService();
const adminService = new AdminService();
const galleryService = new GalleryService();
const prayerRequestService = new PrayerRequestService();
const testimonyService = new TestimonyService();
const ministryService = new MinistryService();

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Registration failed" });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err instanceof Error ? err.message : "Login failed" });
    }
  }
}

export class SermonController {
  async getAll(_req: AuthRequest, res: Response) {
    const sermons = await sermonService.getAll();
    res.json(sermons);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const sermon = await sermonService.getById(id);
      res.json(sermon);
    } catch {
      res.status(404).json({ message: "Sermon not found" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    const sermon = await sermonService.create(req.body);
    res.status(201).json(sermon);
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const sermon = await sermonService.update(id, req.body);
      res.json(sermon);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Update failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await sermonService.delete(id);
      res.json({ message: "Sermon deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class EventController {
  async getAll(_req: AuthRequest, res: Response) {
    const events = await eventService.getAll();
    res.json(events);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await eventService.getById(id);
      res.json(event);
    } catch {
      res.status(404).json({ message: "Event not found" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    const event = await eventService.create(req.body);
    res.status(201).json(event);
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const event = await eventService.update(id, req.body);
      res.json(event);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Update failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await eventService.delete(id);
      res.json({ message: "Event deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class EventRegistrationController {
  async register(req: AuthRequest, res: Response) {
    try {
      const eventId = req.params.id as string;
      const { name, email, guests, notes } = req.body;
      if (!name?.trim() || !email?.trim()) {
        res.status(400).json({ message: "Name and email are required" });
        return;
      }
      const result = await eventRegistrationService.register(
        eventId,
        { name, email, guests, notes },
        req.user?.id
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Registration failed" });
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      const eventId = req.params.id as string;
      const email = (req.body.email as string) || req.user?.email;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }
      const result = await eventRegistrationService.cancel(eventId, email, req.user?.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Cancellation failed" });
    }
  }

  async getMyRegistration(req: AuthRequest, res: Response) {
    try {
      const eventId = req.params.id as string;
      const email = (req.query.email as string) || req.user?.email;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }
      const registration = await eventRegistrationService.getMyRegistration(eventId, email);
      res.json(registration);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Failed to load registration" });
    }
  }

  async getMyRegistrations(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }
      const registrations = await eventRegistrationService.getByUserId(req.user.id);
      res.json(registrations);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load registrations" });
    }
  }

  async getByEvent(req: AuthRequest, res: Response) {
    try {
      const eventId = req.params.id as string;
      const data = await eventRegistrationService.getByEventId(eventId);
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Event not found" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await eventRegistrationService.delete(id);
      res.json({ message: "Registration removed" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class DonationController {
  async create(req: AuthRequest, res: Response) {
    const { amount, paymentMethod } = req.body;
    // Pass userId so service can resolve memberId
    const donation = await donationService.create(amount, paymentMethod, req.user?.id);
    res.status(201).json(donation);
  }

  async getAll(_req: AuthRequest, res: Response) {
    const donations = await donationService.getAll();
    res.json(donations);
  }

  async getMyDonations(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }
      const donations = await donationService.getByUserId(req.user.id);
      res.json(donations);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load donations" });
    }
  }
}

export class AnnouncementController {
  async getAll(_req: AuthRequest, res: Response) {
    const announcements = await announcementService.getAll();
    res.json(announcements);
  }

  async create(req: AuthRequest, res: Response) {
    const { title, content } = req.body;
    const announcement = await announcementService.create(title, content);
    res.status(201).json(announcement);
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { title, content } = req.body;
      const announcement = await announcementService.update(id, title, content);
      res.json(announcement);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Update failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await announcementService.delete(id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class MemberController {
  async getAll(_req: AuthRequest, res: Response) {
    const members = await memberService.getAll();
    res.json(members);
  }
}

export class ContactController {
  async create(req: AuthRequest, res: Response) {
    try {
      await contactService.create(req.body);
      res.status(201).json({ message: "Message sent successfully" });
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Failed to send message" });
    }
  }

  async getAll(_req: AuthRequest, res: Response) {
    try {
      const messages = await contactService.getAll();
      res.json(messages);
    } catch (err) {
      console.error("getAll contact messages:", err);
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load contact messages" });
    }
  }

  async markRead(req: AuthRequest, res: Response) {
    try {
      await contactService.markRead(req.params.id as string);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Failed to mark as read" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await contactService.delete(req.params.id as string);
      res.json({ message: "Message deleted" });
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Failed to delete message" });
    }
  }
}

export class AdminController {
  async getStats(_req: AuthRequest, res: Response) {
    const stats = await adminService.getStats();
    res.json(stats);
  }

  async getActivity(_req: AuthRequest, res: Response) {
    try {
      const feed = await adminService.getActivity();
      res.json(feed);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load activity" });
    }
  }

  async getNotifications(_req: AuthRequest, res: Response) {
    try {
      const items = await adminService.getNotifications();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load notifications" });
    }
  }

  async getNotificationSummary(_req: AuthRequest, res: Response) {
    try {
      const summary = await adminService.getNotificationSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to load summary" });
    }
  }

  async markNotificationRead(req: AuthRequest, res: Response) {
    try {
      const { type, id } = req.params;
      await adminService.markNotificationRead(type as string, id as string);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Failed to mark read" });
    }
  }

  async markAllNotificationsRead(_req: AuthRequest, res: Response) {
    try {
      await adminService.markAllNotificationsRead();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to mark all read" });
    }
  }
}

export class GalleryController {
  async getAll(_req: AuthRequest, res: Response) {
    const items = await galleryService.getAll();
    res.json(items);
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { src, alt } = req.body;
      const item = await galleryService.create({ src, alt });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Creation failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await galleryService.delete(id);
      res.json({ message: "Gallery item deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class PrayerRequestController {
  async getAll(_req: AuthRequest, res: Response) {
    const requests = await prayerRequestService.getAll();
    res.json(requests);
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { memberName, email, request } = req.body;
      const result = await prayerRequestService.create({ memberName, email, request });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Creation failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await prayerRequestService.delete(id);
      res.json({ message: "Prayer request deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class TestimonyController {
  // Public: returns only approved testimonies
  async getPublic(_req: AuthRequest, res: Response) {
    const testimonies = await testimonyService.getAll(true);
    res.json(testimonies);
  }

  // Admin: returns all testimonies
  async getAll(_req: AuthRequest, res: Response) {
    const testimonies = await testimonyService.getAll(false);
    res.json(testimonies);
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { memberName, testimony, imageUrl } = req.body;
      const result = await testimonyService.create({ memberName, testimony, imageUrl });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Creation failed" });
    }
  }

  async approve(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await testimonyService.approve(id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Approval failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await testimonyService.delete(id);
      res.json({ message: "Testimony deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class MinistryController {
  async getAll(_req: AuthRequest, res: Response) {
    const ministries = await ministryService.getAll();
    res.json(ministries);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const ministry = await ministryService.getById(id);
      res.json(ministry);
    } catch {
      res.status(404).json({ message: "Ministry not found" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const ministry = await ministryService.create(req.body);
      res.status(201).json(ministry);
    } catch (err) {
      res.status(400).json({ message: err instanceof Error ? err.message : "Creation failed" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const ministry = await ministryService.update(id, req.body);
      res.json(ministry);
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Update failed" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await ministryService.delete(id);
      res.json({ message: "Ministry deleted successfully" });
    } catch (err) {
      res.status(404).json({ message: err instanceof Error ? err.message : "Deletion failed" });
    }
  }
}

export class LiveViewerController {
  async heartbeat(req: AuthRequest, res: Response) {
    const { sermonId, sessionId } = req.body;
    if (!sermonId || !sessionId) {
      res.status(400).json({ message: "sermonId and sessionId are required" });
      return;
    }
    const count = recordHeartbeat(String(sermonId), String(sessionId));
    res.json({ count });
  }

  async leave(req: AuthRequest, res: Response) {
    const { sermonId, sessionId } = req.body;
    if (!sermonId || !sessionId) {
      res.status(400).json({ message: "sermonId and sessionId are required" });
      return;
    }
    const count = removeViewer(String(sermonId), String(sessionId));
    res.json({ count });
  }

  async getCount(req: AuthRequest, res: Response) {
    const sermonId = req.params.sermonId as string;
    res.json({ count: getActiveViewerCount(sermonId) });
  }
}

