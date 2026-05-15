import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <Suspense fallback={<div className="w-full max-w-md text-sm text-muted-foreground">Loading…</div>}>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}