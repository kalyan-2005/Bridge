import {
  AnnouncementCategory,
  AnnouncementStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const authorEmail = "author@starter.local";
  const employeeEmail = "employee@starter.local";
  const authorPassword = await bcrypt.hash("Author123!", 12);
  const employeePassword = await bcrypt.hash("Employee123!", 12);

  const author = await prisma.user.upsert({
    where: { email: authorEmail },
    update: {
      password: authorPassword,
      role: Role.AUTHOR,
      isSuspended: false,
    },
    create: {
      email: authorEmail,
      name: "Internal Author",
      password: authorPassword,
      role: Role.AUTHOR,
      provider: "credentials",
      emailVerified: new Date(),
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: employeeEmail },
    update: {
      password: employeePassword,
      role: Role.EMPLOYEE,
      isSuspended: false,
    },
    create: {
      email: employeeEmail,
      name: "Demo Employee",
      password: employeePassword,
      role: Role.EMPLOYEE,
      provider: "credentials",
      emailVerified: new Date(),
    },
    select: { id: true },
  });

  await prisma.notification.deleteMany({ where: { userId: employee.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: employee.id,
        title: "Welcome to the Announcement Portal",
        body: "Browse published posts from your team. Acknowledge items when your author requires it.",
        type: "onboarding",
      },
    ],
  });

  const existingAnnouncements = await prisma.announcement.count({
    where: { authorId: author.id },
  });

  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        title: "Q2 Town hall recording",
        body: "The recording is available on the internal drive. Please acknowledge once you have reviewed the key action items.",
        category: AnnouncementCategory.COMPANY,
        pinned: true,
        requiresAcknowledgment: true,
        status: AnnouncementStatus.PUBLISHED,
        authorId: author.id,
        publishedAt: new Date(),
      },
    });

    await prisma.announcement.create({
      data: {
        title: "Draft: IT maintenance window",
        body: "This draft is only visible to you until you publish it.",
        category: AnnouncementCategory.IT,
        pinned: false,
        requiresAcknowledgment: false,
        status: AnnouncementStatus.DRAFT,
        authorId: author.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: "Archived: Old holiday policy",
        body: "Superseded by the 2026 handbook. Kept for audit trail.",
        category: AnnouncementCategory.HR,
        pinned: false,
        requiresAcknowledgment: false,
        status: AnnouncementStatus.ARCHIVED,
        authorId: author.id,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

  }

  console.log("Seed complete. AUTHOR:", authorEmail, "| EMPLOYEE:", employeeEmail);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
