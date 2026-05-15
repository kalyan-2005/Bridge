import { z } from "zod";
import { AnnouncementCategory } from "@prisma/client";

const nonEmpty = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((s) => s.trim().length > 0, { message: "Cannot be only whitespace" });

export const announcementCategorySchema = z.nativeEnum(AnnouncementCategory);

export const announcementDraftUpsertSchema = z.object({
  title: nonEmpty("Title is required"),
  body: nonEmpty("Body is required"),
  category: announcementCategorySchema,
  pinned: z.boolean(),
  requiresAcknowledgment: z.boolean(),
});

export type AnnouncementDraftUpsertInput = z.infer<typeof announcementDraftUpsertSchema>;
