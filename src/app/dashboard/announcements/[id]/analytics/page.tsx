import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAuthor } from "@/lib/auth-guard";
import { getAnnouncementAnalytics } from "@/actions/announcement-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = { params: { id: string } };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Announcement analytics" };
}

export default async function AnnouncementAnalyticsPage({ params }: Props) {
  const session = await requireAuthor();

  const ownership = await prisma.announcement.findUnique({
    where: { id: params.id },
    select: { id: true, authorId: true, title: true },
  });
  if (!ownership) notFound();
  if (ownership.authorId !== session.user.id) notFound();

  const result = await getAnnouncementAnalytics({ announcementId: params.id });
  if (!result.success || !result.data) notFound();

  const a = result.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{a.title}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Author-only</Badge>
          <Link
            href={`/dashboard/announcements/${params.id}`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View post
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Total reads</CardDescription>
            <CardTitle className="text-3xl">{a.totalReads}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Acknowledgments</CardDescription>
            <CardTitle className="text-3xl">{a.totalAcknowledgments}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Pending (employees)</CardDescription>
            <CardTitle className="text-3xl">{a.pendingAcknowledgments}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Acknowledgment rate</CardDescription>
            <CardTitle className="text-3xl">
              {a.acknowledgmentPercent != null ? `${a.acknowledgmentPercent}%` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {a.employeeCount} active employees in directory.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/50">
        <CardHeader>
          <CardTitle>Employees who have not acknowledged</CardTitle>
          <CardDescription>Only users with the EMPLOYEE role are counted toward pending totals.</CardDescription>
        </CardHeader>
        <CardContent>
          {a.pendingEmployees.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everyone has acknowledged — or acknowledgment was not required.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
              {a.pendingEmployees.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{u.name ?? u.email}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/author" className="text-primary underline-offset-4 hover:underline">
          Back to author workspace
        </Link>
      </p>
    </div>
  );
}
