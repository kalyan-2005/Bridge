import { AnnouncementCategory, AnnouncementStatus } from "@prisma/client";

export const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  COMPANY: "Company",
  HR: "HR",
  ENGINEERING: "Engineering",
  IT: "IT",
  OPERATIONS: "Operations",
  EVENTS: "Events",
};

export const STATUS_LABEL: Record<AnnouncementStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "titleAsc", label: "Title A–Z" },
  { value: "titleDesc", label: "Title Z–A" },
] as const;
