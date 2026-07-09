import { Event, Ministry, Sermon } from "@/types";

export const churchInfo = {
  name: "Dunwell Methodist Church",
  tagline: "Growing in Faith, Serving in Love",
  address: "Dunwell Methodist Church, Apewosika, Cape Coast",
  phone: "(555) 123-4567",
  email: "info@dunwellmethodist.org",
  serviceTimes: [
    { day: "Sunday", time: "9:00 AM & 11:00 AM", type: "Worship Service" },
    { day: "Wednesday", time: "7:00 PM", type: "Bible Study & Prayer" },
  ],
  social: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
  },
};

export const bibleVerse = {
  text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  reference: "Jeremiah 29:11",
};

export const featuredSermons: Sermon[] = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Rev. Dr. James Mitchell",
    description:
      "Discover how to trust God through every season of life and walk boldly in faith.",
    date: "2026-06-15",
    videoUrl: "#",
    thumbnail: "/images/sermon-1.jpg",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Rev. Sarah Williams",
    description:
      "Understanding the transformative power of consistent, heartfelt prayer in our daily lives.",
    date: "2026-06-08",
    videoUrl: "#",
    thumbnail: "/images/sermon-2.jpg",
  },
  {
    id: "3",
    title: "Love Your Neighbor",
    speaker: "Rev. Dr. James Mitchell",
    description:
      "Jesus calls us to love our neighbors as ourselves. What does that look like today?",
    date: "2026-06-01",
    videoUrl: "#",
    thumbnail: "/images/sermon-3.jpg",
  },
];

export const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Summer Youth Camp",
    description:
      "A week of fun, fellowship, and spiritual growth for youth ages 12-18.",
    location: "Camp Grace, Lakeview",
    eventDate: "2026-07-15",
    image: "/images/event-youth.jpg",
  },
  {
    id: "2",
    title: "Community Outreach Day",
    description:
      "Join us as we serve our local community with food, clothing, and prayer.",
    location: "Church Grounds",
    eventDate: "2026-07-22",
    image: "/images/event-outreach.jpg",
  },
  {
    id: "3",
    title: "Women's Fellowship Breakfast",
    description:
      "An morning of worship, testimony, and fellowship for all women.",
    location: "Fellowship Hall",
    eventDate: "2026-07-08",
    image: "/images/event-women.jpg",
  },
];

export const ministries: Ministry[] = [
  {
    id: "1",
    name: "Youth Ministry",
    description:
      "Empowering the next generation to know Christ and make Him known through dynamic programs, mentorship, and community.",
    leader: "Pastor Michael Chen",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  },
  {
    id: "2",
    name: "Women's Ministry",
    description:
      "Building sisterhood through Bible study, prayer groups, and fellowship events that strengthen faith and friendships.",
    leader: "Deaconess Mary Johnson",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80",
  },
  {
    id: "3",
    name: "Men's Ministry",
    description:
      "Equipping men to be spiritual leaders in their homes, workplaces, and communities through accountability and service.",
    leader: "Brother David Thompson",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
  },
  {
    id: "4",
    name: "Children's Ministry",
    description:
      "Creating a safe, fun environment where children learn about God's love through age-appropriate teaching and activities.",
    leader: "Sister Rachel Adams",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
  },
];

export const leadership = [
  {
    name: "Rev. Dr. James Mitchell",
    role: "Senior Pastor",
    bio: "Serving Dunwell Methodist Church for over 15 years with a heart for community transformation.",
    image: "/images/leader-1.jpg",
  },
  {
    name: "Rev. Sarah Williams",
    role: "Associate Pastor",
    bio: "Passionate about youth development and women's empowerment in the church.",
    image: "/images/leader-2.jpg",
  },
  {
    name: "Deaconess Mary Johnson",
    role: "Church Administrator",
    bio: "Overseeing church operations and coordinating ministry activities.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
  },
  {
    name: "Brother David Thompson",
    role: "Head Usher & Men's Leader",
    bio: "Leading the usher board and men's fellowship with dedication and joy.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
];

export const galleryImages = [
  { id: "1", src: "/images/gallery-1.jpg", alt: "Sunday worship service" },
  { id: "2", src: "/images/gallery-2.jpg", alt: "Community outreach" },
  { id: "3", src: "/images/gallery-3.jpg", alt: "Youth ministry event" },
  { id: "4", src: "/images/gallery-4.jpg", alt: "Baptism ceremony" },
  { id: "5", src: "/images/gallery-5.jpg", alt: "Choir performance" },
  { id: "6", src: "/images/gallery-6.jpg", alt: "Fellowship dinner" },
];
