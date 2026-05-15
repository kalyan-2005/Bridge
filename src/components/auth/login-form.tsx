


"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suspended = searchParams.get("suspended") === "1";
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: callbackUrl ?? "/dashboard",
    });

    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }

    router.push(callbackUrl ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <p className="inline-flex items-center rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
          Secure access
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue. JWT sessions keep you authenticated without fragile client state.
        </p>
      </div>

      {suspended ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          This account is suspended. Contact an administrator if you believe this is a mistake.
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
        <GoogleSignInButton enabled={googleEnabled} callbackUrl={callbackUrl} />
        {!googleEnabled ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Google sign-in is disabled until `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are configured.
          </p>
        ) : null}

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or email
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input autoComplete="email" inputMode="email" placeholder="you@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input autoComplete="current-password" type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}