"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionResult } from "@/lib/errors";

const profileSchema = z.object({
  name: z.string().min(2).max(80),
});

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorized");
  if (session.user.isSuspended) return actionError("Account suspended");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.errors[0]?.message ?? "Invalid input");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: "PROFILE_UPDATED",
      resource: "user",
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  return actionSuccess();
}

const notificationReadSchema = z.object({
  notificationId: z.string().cuid(),
});

export async function markNotificationRead(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorized");

  const parsed = notificationReadSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid input");

  await prisma.notification.updateMany({
    where: { id: parsed.data.notificationId, userId: session.user.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  return actionSuccess();
}
