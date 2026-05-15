import { requireSession } from "@/lib/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  await requireSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preference scaffolding — wire these switches to persisted user settings when you need them.
        </p>
      </div>

      <Card className="border-border/70 bg-card/60 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>Productivity</CardTitle>
          <CardDescription>Non-persistent UI toggles for now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <Label className="text-base">Compact tables</Label>
              <p className="text-sm text-muted-foreground">Tighter row density for dense operational screens.</p>
            </div>
            <Switch disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <Label className="text-base">Email summaries</Label>
              <p className="text-sm text-muted-foreground">Daily digest of activity across modules.</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
