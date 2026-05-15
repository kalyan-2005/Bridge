import Link from "next/link";
import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationRow } from "@/components/dashboard/notification-row";

export default async function NotificationsPage() {
  const session = await requireSession();

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">Operational signals for your workspace.</p>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40">
          <CardHeader>
            <CardTitle>You are all caught up</CardTitle>
            <CardDescription>No notifications yet — seed demo data or emit events from your domain actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Back to overview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
