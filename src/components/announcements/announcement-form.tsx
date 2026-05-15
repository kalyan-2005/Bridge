"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AnnouncementCategory } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { announcementDraftUpsertSchema, type AnnouncementDraftUpsertInput } from "@/lib/validations/announcement";
import { CATEGORY_LABEL } from "@/lib/announcement-meta";
import { createAnnouncement, updateAnnouncementDraft } from "@/actions/announcement-actions";

const defaults: AnnouncementDraftUpsertInput = {
  title: "",
  body: "",
  category: AnnouncementCategory.COMPANY,
  pinned: false,
  requiresAcknowledgment: false,
};

export function AnnouncementForm({
  announcementId,
  initial,
}: {
  announcementId?: string;
  initial?: Partial<AnnouncementDraftUpsertInput>;
}) {
  const router = useRouter();
  const form = useForm<AnnouncementDraftUpsertInput>({
    resolver: zodResolver(announcementDraftUpsertSchema),
    defaultValues: { ...defaults, ...initial },
  });

  async function onSubmit(values: AnnouncementDraftUpsertInput) {
    if (announcementId) {
      const res = await updateAnnouncementDraft({ id: announcementId, data: values });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Draft saved");
      router.refresh();
      return;
    }
    const res = await createAnnouncement(values);
    if (!res.success || !res.data) {
      toast.error(res.success ? "Unexpected error" : res.error);
      return;
    }
    toast.success("Draft created");
    router.push(`/dashboard/announcements/${res.data.id}/edit`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Clear, human title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea rows={12} className="min-h-[200px] resize-y font-mono text-sm" placeholder="Write the announcement…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(AnnouncementCategory).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="pinned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                <div className="space-y-0.5">
                  <FormLabel>Pinned</FormLabel>
                  <p className="text-xs text-muted-foreground">Pinned items stay at the top of lists.</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="requiresAcknowledgment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                <div className="space-y-0.5">
                  <FormLabel>Requires acknowledgment</FormLabel>
                  <p className="text-xs text-muted-foreground">Employees must confirm they have read it.</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : announcementId ? (
            "Save draft"
          ) : (
            "Create draft"
          )}
        </Button>
      </form>
    </Form>
  );
}
