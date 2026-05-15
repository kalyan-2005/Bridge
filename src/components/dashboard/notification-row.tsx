"use client";

import type { Notification } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/actions/profile-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationRow({ notification }: { notification: Notification }) {
  const router = useRouter();
  const unread = !notification.readAt;

  async function markRead() {
    const res = await markNotificationRead({ notificationId: notification.id });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Marked as read");
    router.refresh();
  }

  const stamp = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    notification.createdAt,
  );

  return (
    <Card className="border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{notification.title}</p>
            <Badge variant={unread ? "default" : "secondary"}>{unread ? "Unread" : "Read"}</Badge>
            <Badge variant="outline">{notification.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{notification.body}</p>
          <p className="text-xs text-muted-foreground">{stamp}</p>
        </div>
        {unread ? (
          <Button size="sm" variant="secondary" onClick={markRead}>
            Mark read
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
