"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight">This view failed to load</h2>
      <p className="text-sm text-muted-foreground">Try again. If you changed environment variables, restart the dev server.</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => reset()}>Retry</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
