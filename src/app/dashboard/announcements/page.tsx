import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AnnouncementCategory, Role } from "@prisma/client";
import { Pin, CheckCircle2, Circle, Eye } from "lucide-react";
import { requireSession } from "@/lib/auth-guard";
import { fetchAnnouncementsPage, type AnnouncementListSort } from "@/lib/announcements-list";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/data-table/pagination";
import { AnnouncementListFilters } from "@/components/announcements/announcement-list-filters";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/announcement-meta";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Announcements",
};

const PAGE_SIZE = 12;
const SORT_VALUES: AnnouncementListSort[] = ["newest", "oldest", "titleAsc", "titleDesc"];

function parseListSearchParams(raw: Record<string, string | string[] | undefined>) {
  const get = (k: string) => {
    const v = raw[k];
    return typeof v === "string" ? v : undefined;
  };

  const pageRaw = Number(get("page") ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const q = get("q") ?? "";
  const body = get("body") === "1";
  const archivedOnly = get("archived") === "1";
  const unreadOnly = get("unread") === "1";
  const unacknowledgedOnly = get("unacked") === "1";

  const sortRaw = get("sort") ?? "newest";
  const sort = SORT_VALUES.includes(sortRaw as AnnouncementListSort) ? (sortRaw as AnnouncementListSort) : "newest";

  const catRaw = get("category");
  const category =
    catRaw && (Object.values(AnnouncementCategory) as string[]).includes(catRaw)
      ? (catRaw as AnnouncementCategory)
      : undefined;

  const ra = get("requiresAck");
  const requiresAcknowledgment = ra === "true" ? true : ra === "false" ? false : undefined;

  return {
    page,
    q,
    body,
    archivedOnly,
    unreadOnly,
    unacknowledgedOnly,
    sort,
    category,
    requiresAcknowledgment,
  };
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await requireSession();
  const sp = parseListSearchParams(searchParams);

  const { total, totalPages, rows } = await fetchAnnouncementsPage({
    userId: session.user.id,
    role: session.user.role as Role,
    page: sp.page,
    pageSize: PAGE_SIZE,
    search: sp.q,
    searchBody: sp.body,
    category: sp.category,
    requiresAcknowledgment: sp.requiresAcknowledgment,
    unreadOnly: sp.unreadOnly,
    unacknowledgedOnly: sp.unacknowledgedOnly,
    archivedOnly: sp.archivedOnly,
    sort: sp.sort,
  });

  const paginationParams: Record<string, string | undefined> = {
    q: sp.q || undefined,
    body: sp.body ? "1" : undefined,
    category: sp.category,
    requiresAck:
      sp.requiresAcknowledgment === true ? "true" : sp.requiresAcknowledgment === false ? "false" : undefined,
    archived: sp.archivedOnly ? "1" : undefined,
    unread: sp.unreadOnly ? "1" : undefined,
    unacked: sp.unacknowledgedOnly ? "1" : undefined,
    sort: sp.sort === "newest" ? undefined : sp.sort,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Announcements</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Pinned items appear first. Use filters to narrow unread items, acknowledgments, or archived history.
          </p>
        </div>
        {session.user.role === Role.AUTHOR ? (
          <Button asChild>
            <Link href="/dashboard/announcements/new">New announcement</Link>
          </Button>
        ) : null}
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <AnnouncementListFilters />
      </Suspense>

      <div className="rounded-xl border border-border/70 bg-card/30 shadow-sm backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Author</TableHead>
              <TableHead className="hidden sm:table-cell">Published</TableHead>
              <TableHead className="text-center">Flags</TableHead>
              <TableHead className="text-center">Read</TableHead>
              <TableHead className="text-center">Ack</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No announcements match your filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isRead = row.readAt != null;
                const isAcked = row.acknowledgedAt != null;
                const needsAck = row.requiresAcknowledgment && row.status === "PUBLISHED";
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Link href={`/dashboard/announcements/${row.id}`} className="font-medium text-primary hover:underline">
                          {row.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 md:hidden">
                          <Badge variant="outline">{CATEGORY_LABEL[row.category]}</Badge>
                          <Badge variant="secondary">{STATUS_LABEL[row.status]}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{CATEGORY_LABEL[row.category]}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {row.author.name ?? row.author.email}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {row.pinned ? (
                          <span title="Pinned">
                            <Pin className="h-4 w-4 text-amber-500" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">·</span>
                        )}
                        {row.requiresAcknowledgment ? (
                          <span title="Requires acknowledgment" className="text-xs font-medium text-primary">
                            ACK
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.status === "DRAFT" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : isRead ? (
                        <Eye className="mx-auto h-4 w-4 text-emerald-600" aria-label="Read" />
                      ) : (
                        <Circle className="mx-auto h-4 w-4 text-muted-foreground/50" aria-label="Unread" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {!needsAck ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : isAcked ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" aria-label="Acknowledged" />
                      ) : (
                        <Circle className="mx-auto h-4 w-4 text-amber-500/80" aria-label="Pending" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="border-t border-border/60 px-4 py-2">
          <TablePagination
            pathname="/dashboard/announcements"
            page={sp.page}
            totalPages={totalPages}
            params={paginationParams}
          />
          <p className="pt-2 text-center text-xs text-muted-foreground">{total} total</p>
        </div>
      </div>
    </div>
  );
}
