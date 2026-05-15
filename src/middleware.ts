

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.AUTH_SECRET;

const AUTHOR_ONLY_PREFIX = "/dashboard/author";
const ANNOUNCEMENTS_NEW = "/dashboard/announcements/new";

function isAuthorOnlyPath(pathname: string) {
  if (pathname === ANNOUNCEMENTS_NEW) return true;
  if (pathname.startsWith(AUTHOR_ONLY_PREFIX)) return true;
  const editMatch = /^\/dashboard\/announcements\/[^/]+\/edit$/.exec(pathname);
  if (editMatch) return true;
  const analyticsMatch = /^\/dashboard\/announcements\/[^/]+\/analytics$/.exec(pathname);
  if (analyticsMatch) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  if (!AUTH_SECRET) {
    console.error("Missing AUTH_SECRET");
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: AUTH_SECRET });

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!token && pathname.startsWith("/dashboard")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token?.isSuspended && !isAuthPage) {
    return NextResponse.redirect(new URL("/login?suspended=1", req.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/modules")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (token && isAuthorOnlyPath(pathname) && token.role !== "AUTHOR") {
    return NextResponse.redirect(new URL("/dashboard/announcements", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
