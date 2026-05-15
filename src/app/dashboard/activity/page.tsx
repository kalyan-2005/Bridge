import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ActivityPage() {
  const session = await requireSession();

  const logs = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-2 text-sm text-muted-foreground">A lightweight audit trail for user-visible actions.</p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40">
          <CardHeader>
            <CardTitle>No activity yet</CardTitle>
            <CardDescription>As you use the platform, events will appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{log.action}</p>
                    {log.resource ? <Badge variant="outline">{log.resource}</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
                      log.createdAt,
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
