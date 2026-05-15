import Link from "next/link";
import { Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_-10%,hsl(var(--primary)/0.16),transparent_55%),radial-gradient(700px_circle_at_90%_0%,hsl(var(--accent)/0.35),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-[length:48px_48px] opacity-[0.35] dark:opacity-[0.2]" />
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-6xl grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between border-r border-border/60 bg-sidebar px-10 py-10 text-sidebar-foreground lg:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">PalTech Forge</p>
                <p className="text-xs text-sidebar-foreground/65">Hackathon-grade starter</p>
              </div>
            </Link>
            <div className="mt-12 max-w-md space-y-4">
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
                Authentication that feels premium — because first impressions matter.
              </h2>
              <p className="text-sm leading-relaxed text-sidebar-foreground/70">
                Built with Auth.js, Prisma, bcrypt, JWT sessions, and strict middleware gates. Swap mock modules for
                your real domain tomorrow without rewriting the platform spine.
              </p>
            </div>
          </div>
          <p className="text-xs text-sidebar-foreground/55">© {new Date().getFullYear()} PalTech Forge template</p>
        </aside>
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">{children}</div>
      </div>
    </div>
  );
}
