"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The app hit an unexpected error. You can retry, or return home if the problem persists.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
