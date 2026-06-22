import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const galleries = await prisma.galleryItem.findMany();
  for (const g of galleries) {
    if (g.src.startsWith("http://localhost:5000/uploads/")) {
      const newSrc = g.src.replace("http://localhost:5000/uploads/", "/uploads/");
      await prisma.galleryItem.update({
        where: { id: g.id },
        data: { src: newSrc },
      });
      console.log(`Updated gallery ${g.id}`);
    }
  }

  const sermons = await prisma.sermon.findMany();
  for (const s of sermons) {
    if (s.thumbnail?.startsWith("http://localhost:5000/uploads/")) {
      const newSrc = s.thumbnail.replace("http://localhost:5000/uploads/", "/uploads/");
      await prisma.sermon.update({
        where: { id: s.id },
        data: { thumbnail: newSrc },
      });
      console.log(`Updated sermon ${s.id}`);
    }
  }

  const events = await prisma.event.findMany();
  for (const e of events) {
    if (e.image?.startsWith("http://localhost:5000/uploads/")) {
      const newSrc = e.image.replace("http://localhost:5000/uploads/", "/uploads/");
      await prisma.event.update({
        where: { id: e.id },
        data: { image: newSrc },
      });
      console.log(`Updated event ${e.id}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
