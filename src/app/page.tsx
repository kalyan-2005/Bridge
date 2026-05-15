import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_-10%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(700px_circle_at_90%_0%,hsl(var(--accent)/0.35),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-[length:48px_48px] opacity-[0.35] dark:opacity-[0.2]" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">Notify Bridge</p>
            <p className="text-xs text-muted-foreground">Internal Announcments and communication platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Start building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Auth.js · Prisma · RBAC · Modular workspaces
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-6xl">
            Ship a credible product in hours — not a fragile demo.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            Opinionated architecture for rapid iteration: secure authentication, role-aware routing, admin
            operations, user dashboards, and placeholder business modules you can swap for real domain logic
            tomorrow.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/register">Create account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have access</Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Security-first auth",
              body: "JWT sessions, Google OAuth, bcrypt credentials, middleware enforcement, suspended-user handling.",
              icon: ShieldCheck,
            },
            {
              title: "Operational dashboards",
              body: "Admin tooling for users and logs. User home for profile, notifications, and activity.",
              icon: Layers,
            },
            {
              title: "Composable modules",
              body: "Projects, tasks, teams, and more — routed and designed so you can map them to the brief fast.",
              icon: Sparkles,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 ring-1 ring-primary/15 transition group-hover:bg-primary/15">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
