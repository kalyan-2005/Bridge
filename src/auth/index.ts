import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID?.length) && Boolean(process.env.AUTH_GOOGLE_SECRET?.length);

const providers: NextAuthConfig["providers"] = [
  ...(googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : []),
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.password) return null;
      if (user.isSuspended) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        isSuspended: user.isSuspended,
        provider: user.provider ?? "credentials",
      };
    },
  }),
];

export const authConfig = {
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, isSuspended: true },
        });
        if (existing?.isSuspended) return "/login?suspended=1";
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "EMPLOYEE";
        token.isSuspended = Boolean((user as { isSuspended?: boolean }).isSuspended);
        token.provider = (user as { provider?: string }).provider ?? "credentials";
      }
      if (trigger === "update" && session) {
        const next = session as { user?: { name?: string }; name?: string };
        const nextName = next.user?.name ?? next.name;
        if (typeof nextName === "string" && nextName.length > 0) {
          token.name = nextName;
        }
      }
      if (token.id) {
        const now = Date.now();
        const lastChecked = typeof token.dbCheckedAt === "number" ? token.dbCheckedAt : 0;
        if (now - lastChecked > 60_000) {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, isSuspended: true, name: true, image: true },
          });
          if (fresh) {
            token.role = fresh.role;
            token.isSuspended = fresh.isSuspended;
            token.name = fresh.name ?? token.name;
            token.picture = fresh.image ?? token.picture;
          }
          token.dbCheckedAt = now;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.isSuspended = Boolean(token.isSuspended);
        session.user.provider = (token.provider as string) ?? "credentials";
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: "google",
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "USER_CREATED",
          resource: "auth",
          metadata: { via: "google" },
        },
      });
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
