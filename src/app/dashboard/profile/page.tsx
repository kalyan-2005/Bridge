import { requireSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.trim() || "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, role: true, provider: true, createdAt: true },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Identity details tied to your authenticated session.</p>
      </div>

      <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-1 ring-border/70">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">{user.name ?? "Member"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant="outline">{user.provider ?? "unknown"}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <ProfileForm defaultName={user.name ?? ""} />
          <p className="mt-4 text-xs text-muted-foreground">Member since {user.createdAt.toDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
