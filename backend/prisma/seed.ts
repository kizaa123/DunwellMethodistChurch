import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const pastorPassword = await bcrypt.hash("pastor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dunwellmethodist.org" },
    update: {},
    create: {
      name: "Church Admin",
      email: "admin@dunwellmethodist.org",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "pastor@dunwellmethodist.org" },
    update: {},
    create: {
      name: "Rev. Dr. James Mitchell",
      email: "pastor@dunwellmethodist.org",
      password: pastorPassword,
      role: Role.PASTOR,
    },
  });

  // Sermons
  const sermonTitles = ["Walking in Faith", "The Power of Prayer"];
  for (const title of sermonTitles) {
    const existing = await prisma.sermon.findFirst({ where: { title } });
    if (!existing) {
      if (title === "Walking in Faith") {
        await prisma.sermon.create({
          data: {
            title,
            speaker: "Rev. Dr. James Mitchell",
            description: "Discover how to trust God through every season of life.",
            date: new Date("2026-06-15"),
          },
        });
      } else {
        await prisma.sermon.create({
          data: {
            title,
            speaker: "Rev. Sarah Williams",
            description: "Understanding the transformative power of consistent prayer.",
            date: new Date("2026-06-08"),
          },
        });
      }
    }
  }

  // Events
  const eventTitles = ["Summer Youth Camp", "Community Outreach Day"];
  for (const title of eventTitles) {
    const existing = await prisma.event.findFirst({ where: { title } });
    if (!existing) {
      if (title === "Summer Youth Camp") {
        await prisma.event.create({
          data: {
            title,
            description: "A week of fun, fellowship, and spiritual growth for youth ages 12-18.",
            location: "Camp Dunwell, Lakeview",
            eventDate: new Date("2026-07-15"),
          },
        });
      } else {
        await prisma.event.create({
          data: {
            title,
            description: "Join us as we serve our local community with food, clothing, and prayer.",
            location: "Church Grounds",
            eventDate: new Date("2026-07-22"),
          },
        });
      }
    }
  }

  // Announcement
  const announcementTitle = "Welcome to Dunwell Methodist Church";
  const existingAnn = await prisma.announcement.findFirst({ where: { title: announcementTitle } });
  if (!existingAnn) {
    await prisma.announcement.create({
      data: {
        title: announcementTitle,
        content: "We are delighted to welcome you to our church family. Join us every Sunday for worship!",
      },
    });
  }

  // Gallery
  const existingGallery = await prisma.galleryItem.findMany();
  if (existingGallery.length === 0) {
    const galleryItems = [
      { src: "/images/gallery-1.jpg", alt: "Sunday worship service" },
      { src: "/images/gallery-2.jpg", alt: "Community outreach" },
      { src: "/images/gallery-3.jpg", alt: "Youth ministry event" },
      { src: "/images/gallery-4.jpg", alt: "Baptism ceremony" },
      { src: "/images/gallery-5.jpg", alt: "Choir performance" },
      { src: "/images/gallery-6.jpg", alt: "Fellowship dinner" },
    ];
    for (const item of galleryItems) {
      await prisma.galleryItem.create({ data: item });
    }
    console.log("Gallery seeded.");
  }

  console.log("Seed completed. Admin user:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

