import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  AuthController,
  SermonController,
  EventController,
  DonationController,
  AnnouncementController,
  MemberController,
  ContactController,
  AdminController,
  GalleryController,
  PrayerRequestController,
  TestimonyController,
} from "../controllers";
import uploadRouter from "./upload";

const auth = new AuthController();
const sermon = new SermonController();
const event = new EventController();
const donation = new DonationController();
const announcement = new AnnouncementController();
const member = new MemberController();
const contact = new ContactController();
const admin = new AdminController();
const gallery = new GalleryController();
const prayer = new PrayerRequestController();
const testimony = new TestimonyController();

const router = Router();

// Mount upload router
router.use(uploadRouter);

// Auth
router.post("/auth/register", auth.register.bind(auth));
router.post("/auth/login", auth.login.bind(auth));

// Public routes
router.get("/sermons", sermon.getAll.bind(sermon));
router.get("/sermons/:id", sermon.getById.bind(sermon));
router.get("/events", event.getAll.bind(event));
router.get("/events/:id", event.getById.bind(event));
router.get("/announcements", announcement.getAll.bind(announcement));
router.get("/gallery", gallery.getAll.bind(gallery));
router.post("/contact", contact.create.bind(contact));
router.post("/donations", donation.create.bind(donation));
router.post("/prayer-requests", prayer.create.bind(prayer));
router.post("/testimonies", testimony.create.bind(testimony));
router.get("/testimonies", testimony.getPublic.bind(testimony));

// Admin routes (ADMIN & PASTOR)
router.get("/admin/stats", authenticate, authorize("ADMIN", "PASTOR"), admin.getStats.bind(admin));
router.get("/admin/members", authenticate, authorize("ADMIN", "PASTOR"), member.getAll.bind(member));
router.get("/admin/donations", authenticate, authorize("ADMIN", "PASTOR"), donation.getAll.bind(donation));
router.post("/admin/sermons", authenticate, authorize("ADMIN", "PASTOR"), sermon.create.bind(sermon));
router.post("/admin/events", authenticate, authorize("ADMIN", "PASTOR"), event.create.bind(event));
router.post("/admin/announcements", authenticate, authorize("ADMIN", "PASTOR"), announcement.create.bind(announcement));
router.post("/admin/gallery", authenticate, authorize("ADMIN", "PASTOR"), gallery.create.bind(gallery));
router.put("/admin/sermons/:id", authenticate, authorize("ADMIN", "PASTOR"), sermon.update.bind(sermon));
router.put("/admin/events/:id", authenticate, authorize("ADMIN", "PASTOR"), event.update.bind(event));
router.put("/admin/announcements/:id", authenticate, authorize("ADMIN", "PASTOR"), announcement.update.bind(announcement));
router.delete("/admin/sermons/:id", authenticate, authorize("ADMIN", "PASTOR"), sermon.delete.bind(sermon));
router.delete("/admin/events/:id", authenticate, authorize("ADMIN", "PASTOR"), event.delete.bind(event));
router.delete("/admin/announcements/:id", authenticate, authorize("ADMIN", "PASTOR"), announcement.delete.bind(announcement));
router.delete("/admin/gallery/:id", authenticate, authorize("ADMIN", "PASTOR"), gallery.delete.bind(gallery));
router.get("/admin/prayer-requests", authenticate, authorize("ADMIN", "PASTOR"), prayer.getAll.bind(prayer));
router.get("/admin/testimonies", authenticate, authorize("ADMIN", "PASTOR"), testimony.getAll.bind(testimony));
router.put("/admin/testimonies/:id/approve", authenticate, authorize("ADMIN", "PASTOR"), testimony.approve.bind(testimony));
router.delete("/admin/prayer-requests/:id", authenticate, authorize("ADMIN", "PASTOR"), prayer.delete.bind(prayer));
router.delete("/admin/testimonies/:id", authenticate, authorize("ADMIN", "PASTOR"), testimony.delete.bind(testimony));

export default router;
