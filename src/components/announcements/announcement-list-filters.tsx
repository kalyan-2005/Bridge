"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnnouncementCategory } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LABEL, SORT_OPTIONS } from "@/lib/announcement-meta";

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchParams.toString());
      mutate(sp);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { push, searchParams };
}

export function AnnouncementListFilters() {
  const { push, searchParams } = useQueryUpdater();

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const category = searchParams.get("category") ?? "";
  const requiresAck = searchParams.get("requiresAck") ?? "";
  const archived = searchParams.get("archived") === "1";
  const unread = searchParams.get("unread") === "1";
  const unacked = searchParams.get("unacked") === "1";
  const body = searchParams.get("body") === "1";

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-card/40 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="q">Search title</Label>
          <div className="flex gap-2">
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value;
                  push((sp) => {
                    sp.delete("q");
                    if (v.trim()) sp.set("q", v.trim());
                    sp.set("page", "1");
                  });
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const el = document.getElementById("q") as HTMLInputElement | null;
                const v = el?.value ?? "";
                push((sp) => {
                  sp.delete("q");
                  if (v.trim()) sp.set("q", v.trim());
                  sp.set("page", "1");
                });
              }}
            >
              Search
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sort</Label>
          <Select
            value={sort}
            onValueChange={(value) => {
              push((sp) => {
                sp.set("sort", value);
                sp.set("page", "1");
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category || "all"}
            onValueChange={(value) => {
              push((sp) => {
                if (value === "all") sp.delete("category");
                else sp.set("category", value);
                sp.set("page", "1");
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.values(AnnouncementCategory).map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Requires acknowledgment</Label>
          <Select
            value={requiresAck === "" ? "any" : requiresAck}
            onValueChange={(value) => {
              push((sp) => {
                if (value === "any") sp.delete("requiresAck");
                else sp.set("requiresAck", value);
                sp.set("page", "1");
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Include body in search</p>
            <p className="text-xs text-muted-foreground">Slower on large datasets</p>
          </div>
          <Switch
            checked={body}
            onCheckedChange={(checked) => {
              push((sp) => {
                if (checked) sp.set("body", "1");
                else sp.delete("body");
                sp.set("page", "1");
              });
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Archived only</p>
            <p className="text-xs text-muted-foreground">Hidden from the default feed</p>
          </div>
          <Switch
            checked={archived}
            onCheckedChange={(checked) => {
              push((sp) => {
                if (checked) sp.set("archived", "1");
                else sp.delete("archived");
                sp.set("page", "1");
              });
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Unread only</p>
            <p className="text-xs text-muted-foreground">You have not opened the detail page yet</p>
          </div>
          <Switch
            checked={unread}
            onCheckedChange={(checked) => {
              push((sp) => {
                if (checked) sp.set("unread", "1");
                else sp.delete("unread");
                sp.set("page", "1");
              });
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Pending acknowledgment</p>
            <p className="text-xs text-muted-foreground">Published items you have not acknowledged</p>
          </div>
          <Switch
            checked={unacked}
            onCheckedChange={(checked) => {
              push((sp) => {
                if (checked) sp.set("unacked", "1");
                else sp.delete("unacked");
                sp.set("page", "1");
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
