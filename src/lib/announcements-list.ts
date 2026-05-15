import type { Prisma } from "@prisma/client";
import {
  AnnouncementCategory,
  AnnouncementStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AnnouncementListSort = "newest" | "oldest" | "titleAsc" | "titleDesc";

export type AnnouncementListFilters = {
  userId: string;
  role: Role;
  page: number;
  pageSize: number;
  search: string;
  searchBody: boolean;
  category?: AnnouncementCategory;
  requiresAcknowledgment?: boolean;
  unreadOnly: boolean;
  unacknowledgedOnly: boolean;
  archivedOnly: boolean;
  sort: AnnouncementListSort;
};

function buildWhere(f: AnnouncementListFilters): Prisma.AnnouncementWhereInput {
  const and: Prisma.AnnouncementWhereInput[] = [];

  if (f.archivedOnly) {
    and.push({ status: AnnouncementStatus.ARCHIVED });
  } else {
    and.push({
      OR: [
        { status: AnnouncementStatus.PUBLISHED },
        ...(f.role === Role.AUTHOR
          ? [{ status: AnnouncementStatus.DRAFT, authorId: f.userId } satisfies Prisma.AnnouncementWhereInput]
          : []),
      ],
    });
  }

  if (f.search.trim().length > 0) {
    const mode = "insensitive" as const;
    if (f.searchBody) {
      and.push({
        OR: [
          { title: { contains: f.search.trim(), mode } },
          { body: { contains: f.search.trim(), mode } },
        ],
      });
    } else {
      and.push({ title: { contains: f.search.trim(), mode } });
    }
  }

  if (f.category) {
    and.push({ category: f.category });
  }

  if (typeof f.requiresAcknowledgment === "boolean") {
    and.push({ requiresAcknowledgment: f.requiresAcknowledgment });
  }

  if (f.unreadOnly) {
    and.push({
      reads: { none: { userId: f.userId } },
    });
  }

  if (f.unacknowledgedOnly) {
    and.push({
      requiresAcknowledgment: true,
      status: AnnouncementStatus.PUBLISHED,
      acknowledgments: { none: { userId: f.userId } },
    });
  }

  return { AND: and };
}

function orderByFor(sort: AnnouncementListSort): Prisma.AnnouncementOrderByWithRelationInput[] {
  const pinnedFirst: Prisma.AnnouncementOrderByWithRelationInput = { pinned: "desc" };
  switch (sort) {
    case "oldest":
      return [pinnedFirst, { createdAt: "asc" }];
    case "titleAsc":
      return [pinnedFirst, { title: "asc" }];
    case "titleDesc":
      return [pinnedFirst, { title: "desc" }];
    case "newest":
    default:
      return [pinnedFirst, { createdAt: "desc" }];
  }
}

export async function fetchAnnouncementsPage(f: AnnouncementListFilters) {
  const where = buildWhere(f);
  const skip = (f.page - 1) * f.pageSize;

  const [total, rows] = await prisma.$transaction([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      orderBy: orderByFor(f.sort),
      skip,
      take: f.pageSize,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        pinned: true,
        requiresAcknowledgment: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        author: { select: { id: true, name: true, email: true } },
        reads: { where: { userId: f.userId }, select: { readAt: true }, take: 1 },
        acknowledgments: { where: { userId: f.userId }, select: { acknowledgedAt: true }, take: 1 },
      },
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / f.pageSize)),
    rows: rows.map((r) => {
      const { reads, acknowledgments, ...rest } = r;
      return {
        ...rest,
        readAt: reads[0]?.readAt ?? null,
        acknowledgedAt: acknowledgments[0]?.acknowledgedAt ?? null,
      };
    }),
  };
}
