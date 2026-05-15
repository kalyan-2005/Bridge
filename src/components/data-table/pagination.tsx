import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildHref(pathname: string, nextPage: number, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) sp.set(key, value);
  });
  sp.set("page", String(nextPage));
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : `${pathname}?page=${nextPage}`;
}

export function TablePagination({
  pathname,
  page,
  totalPages,
  params,
  windowSize = 5,
}: {
  pathname: string;
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
  windowSize?: number;
}) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(pathname, prev, params)}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        <div className="flex flex-wrap items-center gap-1">
          {pages.map((p) => (
            <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="min-w-9 px-2" asChild>
              <Link href={buildHref(pathname, p, params)}>{p}</Link>
            </Button>
          ))}
        </div>
        {page < totalPages ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(pathname, next, params)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
