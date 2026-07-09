import { Router } from "express";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth";
import {
  AuthController,
  SermonController,
  EventController,
  EventRegistrationController,
  DonationController,
  AnnouncementController,
  MemberController,
  ContactController,
  AdminController,
  GalleryController,
  PrayerRequestController,
  TestimonyController,
  MinistryController,
  LiveViewerController,
} from "../controllers";
import uploadRouter from "./upload";

const auth = new AuthController();
const sermon = new SermonController();
const event = new EventController();
const eventRegistration = new EventRegistrationController();
const donation = new DonationController();
const announcement = new AnnouncementController();
const member = new MemberController();
const contact = new ContactController();
const admin = new AdminController();
const gallery = new GalleryController();
const prayer = new PrayerRequestController();
const testimony = new TestimonyController();
const ministry = new MinistryController();
const liveViewer = new LiveViewerController();

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
router.post("/events/:id/register", optionalAuthenticate, eventRegistration.register.bind(eventRegistration));
router.delete("/events/:id/register", optionalAuthenticate, eventRegistration.cancel.bind(eventRegistration));
router.get("/events/:id/my-registration", optionalAuthenticate, eventRegistration.getMyRegistration.bind(eventRegistration));
router.get("/announcements", announcement.getAll.bind(announcement));
router.get("/gallery", gallery.getAll.bind(gallery));
router.post("/contact", contact.create.bind(contact));
router.post("/donations", donation.create.bind(donation));
router.post("/prayer-requests", prayer.create.bind(prayer));
router.post("/testimonies", testimony.create.bind(testimony));
router.get("/testimonies", testimony.getPublic.bind(testimony));
router.get("/ministries", ministry.getAll.bind(ministry));
router.get("/ministries/:id", ministry.getById.bind(ministry));

// Live viewer presence
router.post("/live/viewers/heartbeat", liveViewer.heartbeat.bind(liveViewer));
router.post("/live/viewers/leave", liveViewer.leave.bind(liveViewer));
router.get("/live/viewers/:sermonId", liveViewer.getCount.bind(liveViewer));

// Member self-service routes
router.get("/members/me/donations", authenticate, donation.getMyDonations.bind(donation));
router.get("/members/me/event-registrations", authenticate, eventRegistration.getMyRegistrations.bind(eventRegistration));

// Admin routes (ADMIN & PASTOR)
router.get("/admin/stats", authenticate, authorize("ADMIN", "PASTOR"), admin.getStats.bind(admin));
router.get("/admin/activity", authenticate, authorize("ADMIN", "PASTOR"), admin.getActivity.bind(admin));
router.get("/admin/notifications", authenticate, authorize("ADMIN", "PASTOR"), admin.getNotifications.bind(admin));
router.get("/admin/notifications/summary", authenticate, authorize("ADMIN", "PASTOR"), admin.getNotificationSummary.bind(admin));
router.patch("/admin/notifications/read-all", authenticate, authorize("ADMIN", "PASTOR"), admin.markAllNotificationsRead.bind(admin));
router.patch("/admin/notifications/:type/:id/read", authenticate, authorize("ADMIN", "PASTOR"), admin.markNotificationRead.bind(admin));
router.get("/admin/contact-messages", authenticate, authorize("ADMIN", "PASTOR"), contact.getAll.bind(contact));
router.patch("/admin/contact-messages/:id/read", authenticate, authorize("ADMIN", "PASTOR"), contact.markRead.bind(contact));
router.delete("/admin/contact-messages/:id", authenticate, authorize("ADMIN", "PASTOR"), contact.delete.bind(contact));
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
router.get("/admin/events/:id/registrations", authenticate, authorize("ADMIN", "PASTOR"), eventRegistration.getByEvent.bind(eventRegistration));
router.delete("/admin/event-registrations/:id", authenticate, authorize("ADMIN", "PASTOR"), eventRegistration.delete.bind(eventRegistration));
router.delete("/admin/announcements/:id", authenticate, authorize("ADMIN", "PASTOR"), announcement.delete.bind(announcement));
router.delete("/admin/gallery/:id", authenticate, authorize("ADMIN", "PASTOR"), gallery.delete.bind(gallery));
router.get("/admin/prayer-requests", authenticate, authorize("ADMIN", "PASTOR"), prayer.getAll.bind(prayer));
router.get("/admin/testimonies", authenticate, authorize("ADMIN", "PASTOR"), testimony.getAll.bind(testimony));
router.put("/admin/testimonies/:id/approve", authenticate, authorize("ADMIN", "PASTOR"), testimony.approve.bind(testimony));
router.delete("/admin/prayer-requests/:id", authenticate, authorize("ADMIN", "PASTOR"), prayer.delete.bind(prayer));
router.delete("/admin/testimonies/:id", authenticate, authorize("ADMIN", "PASTOR"), testimony.delete.bind(testimony));
router.post("/admin/ministries", authenticate, authorize("ADMIN", "PASTOR"), ministry.create.bind(ministry));
router.put("/admin/ministries/:id", authenticate, authorize("ADMIN", "PASTOR"), ministry.update.bind(ministry));
router.delete("/admin/ministries/:id", authenticate, authorize("ADMIN", "PASTOR"), ministry.delete.bind(ministry));


export default router;
