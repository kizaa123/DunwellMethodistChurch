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
            requiresRegistration: true,
          },
        });
      } else {
        await prisma.event.create({
          data: {
            title,
            description: "Join us as we serve our local community with food, clothing, and prayer.",
            location: "Church Grounds",
            eventDate: new Date("2026-07-22"),
            requiresRegistration: true,
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

  // Ministries
  const existingMinistries = await prisma.ministry.findMany();
  if (existingMinistries.length === 0) {
    const ministriesList = [
      {
        name: "Youth Ministry",
        description: "Empowering the next generation to know Christ and make Him known through dynamic programs, mentorship, and community.",
        leader: "Pastor Michael Chen",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
      },
      {
        name: "Women's Ministry",
        description: "Building sisterhood through Bible study, prayer groups, and fellowship events that strengthen faith and friendships.",
        leader: "Deaconess Mary Johnson",
        image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80",
      },
      {
        name: "Men's Ministry",
        description: "Equipping men to be spiritual leaders in their homes, workplaces, and communities through accountability and service.",
        leader: "Brother David Thompson",
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
      },
      {
        name: "Children's Ministry",
        description: "Creating a safe, fun environment where children learn about God's love through age-appropriate teaching and activities.",
        leader: "Sister Rachel Adams",
        image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
      },
    ];
    for (const m of ministriesList) {
      await prisma.ministry.create({ data: m });
    }
    console.log("Ministries seeded.");
  }

  console.log("Seed completed. Admin user:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

