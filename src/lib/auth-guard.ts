import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.isSuspended) {
    redirect("/login?suspended=1");
  }
  return session;
}

export async function requireAuthor() {
  const session = await requireSession();
  if (session.user.role !== Role.AUTHOR) {
    redirect("/dashboard");
  }
  return session;
}
