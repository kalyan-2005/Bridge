"use client";

import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton({
  enabled,
  callbackUrl,
}: {
  enabled: boolean;
  callbackUrl?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-border/70 bg-card/40 shadow-sm backdrop-blur"
      disabled={!enabled}
      onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/dashboard" })}
    >
      <Chrome className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>
  );
}
