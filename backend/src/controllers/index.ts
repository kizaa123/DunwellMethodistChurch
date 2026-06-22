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
} from "../services";

const authService = new AuthService();
const sermonService = new SermonService();
const eventService = new EventService();
const donationService = new DonationService();
const announcementService = new AnnouncementService();
const memberService = new MemberService();
const contactService = new ContactService();
const adminService = new AdminService();
const galleryService = new GalleryService();
const prayerRequestService = new PrayerRequestService();
const testimonyService = new TestimonyService();

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

export class DonationController {
  async create(req: AuthRequest, res: Response) {
    const { amount, paymentMethod } = req.body;
    const donation = await donationService.create(amount, paymentMethod, req.user?.id);
    res.status(201).json(donation);
  }

  async getAll(_req: AuthRequest, res: Response) {
    const donations = await donationService.getAll();
    res.json(donations);
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
    await contactService.create(req.body);
    res.status(201).json({ message: "Message sent successfully" });
  }
}

export class AdminController {
  async getStats(_req: AuthRequest, res: Response) {
    const stats = await adminService.getStats();
    res.json(stats);
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
