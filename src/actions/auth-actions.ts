"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { actionError, actionSuccess, type ActionResult } from "@/lib/errors";

export async function registerUser(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return actionError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: passwordHash,
      role: Role.EMPLOYEE,
      provider: "credentials",
    },
    select: { id: true, email: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "REGISTER",
      resource: "auth",
      metadata: { email: user.email },
    },
  });

  await prisma.auditTrail.create({
    data: {
      actorId: user.id,
      entityType: "User",
      entityId: user.id,
      action: "REGISTER",
      diff: { email: user.email },
    },
  });

  return actionSuccess({ email: user.email });
}
