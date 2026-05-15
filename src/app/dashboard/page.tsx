import Link from "next/link";
import { AnnouncementStatus, Role } from "@prisma/client";
import { ArrowUpRight, Bell, Megaphone, Pin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardHomePage() {
  const session = await requireSession();
  const uid = session.user.id;

  const publishedWhere = { status: AnnouncementStatus.PUBLISHED };

  const [unreadCount, pendingAckCount, recent, pinned, draftCount, publishedCount, archivedCount] =
    await Promise.all([
      prisma.announcement.count({
        where: {
          ...publishedWhere,
          reads: { none: { userId: uid } },
        },
      }),
      prisma.announcement.count({
        where: {
          ...publishedWhere,
          requiresAcknowledgment: true,
          acknowledgments: { none: { userId: uid } },
        },
      }),
      prisma.announcement.findMany({
        where: publishedWhere,
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, category: true, publishedAt: true },
      }),
      prisma.announcement.findMany({
        where: { ...publishedWhere, pinned: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, publishedAt: true },
      }),
      session.user.role === Role.AUTHOR
        ? prisma.announcement.count({
            where: { authorId: uid, status: AnnouncementStatus.DRAFT },
          })
        : Promise.resolve(0),
      session.user.role === Role.AUTHOR
        ? prisma.announcement.count({
            where: { authorId: uid, status: AnnouncementStatus.PUBLISHED },
          })
        : Promise.resolve(0),
      session.user.role === Role.AUTHOR
        ? prisma.announcement.count({
            where: { authorId: uid, status: AnnouncementStatus.ARCHIVED },
          })
        : Promise.resolve(0),
    ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <Megaphone className="h-3.5 w-3.5 text-primary" />
          Internal announcements
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Hello, {session.user.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Read what matters, acknowledge when asked, and keep signal high across the org.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" />
              Unread (published)
            </CardTitle>
            <CardDescription>Items you have not opened yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tabular-nums">{unreadCount}</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/announcements?unread=1">View</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-primary" />
              Pending acknowledgments
            </CardTitle>
            <CardDescription>Published posts that still need your acknowledgment.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tabular-nums">{pendingAckCount}</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/announcements?unacked=1">View</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Pinned</CardTitle>
              <CardDescription>Leadership highlights stay visible here.</CardDescription>
            </div>
            <Pin className="h-4 w-4 shrink-0 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {pinned.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pinned announcements right now.</p>
            ) : (
              <ul className="space-y-2">
                {pinned.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/announcements/${p.id}`}
                      className="flex items-start justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm transition hover:border-border/80 hover:bg-muted/40"
                    >
                      <span className="font-medium leading-snug">{p.title}</span>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Recently published</CardTitle>
            <CardDescription>Newest items across the company feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published announcements yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-2 text-sm">
                    <Link href={`/dashboard/announcements/${p.id}`} className="font-medium leading-snug hover:underline">
                      {p.title}
                    </Link>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                      {p.category}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/announcements">Browse all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {session.user.role === Role.AUTHOR ? (
        <Card className="border-primary/20 bg-gradient-to-br from-card/80 via-card/60 to-primary/5 shadow-sm backdrop-blur">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Author overview</CardTitle>
              <CardDescription>
                Drafts: <span className="font-medium text-foreground">{draftCount}</span> · Published:{" "}
                <span className="font-medium text-foreground">{publishedCount}</span> · Archived:{" "}
                <span className="font-medium text-foreground">{archivedCount}</span>
              </CardDescription>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href="/dashboard/author">
                Open workspace
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
