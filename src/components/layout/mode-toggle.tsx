"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="border-sidebar-border bg-transparent" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const next = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-white/5 lg:border-border lg:text-foreground"
      aria-label="Toggle theme"
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
