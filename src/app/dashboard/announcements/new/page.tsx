import Link from "next/link";
import { requireAuthor } from "@/lib/auth-guard";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New announcement",
};

export default async function NewAnnouncementPage() {
  await requireAuthor();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Create announcement</h1>
        <p className="text-sm text-muted-foreground">New posts are saved as drafts until you publish them.</p>
      </div>
      <div className="max-w-3xl rounded-xl border border-border/70 bg-card/40 p-6 shadow-sm backdrop-blur">
        <AnnouncementForm />
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/dashboard/author" className="text-primary underline-offset-4 hover:underline">
            Back to author workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
