import { prisma } from "./db";

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Ashutosh",
      email: "ashutosh@gmail.com",
      password: "1234",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Rohan",
      email: "rohan@gmail.com",
      password: "1234",
    },
  });

  // Create events
  const event1 = await prisma.event.create({
    data: {
      name: "Chess Competition",
      location: "Mumbai",
      startTime: new Date("2025-07-01T10:00:00.000Z"),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: "Coders Meetup",
      location: "Delhi",
      startTime: new Date("2025-07-07T10:00:00.000Z"),
    },
  });

  await prisma.user.update({
    where: { id: user1.id },
    data: {
      events: {
        connect: [{ id: event1.id }, { id: event2.id }],
      },
    },
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: {
      events: {
        connect: [{ id: event2.id }],
      },
    },
  });
}

main()
  .then(() => {
    console.log("🌱 Seeded successfully");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
