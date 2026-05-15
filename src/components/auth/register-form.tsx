"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterInput) {
    const result = await registerUser(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Account created — signing you in…");
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: "/dashboard",
    });

    if (res?.error) {
      toast.message("Account created. Please sign in.");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <p className="inline-flex items-center rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
          Create access
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Join the workspace</h1>
        <p className="text-sm text-muted-foreground">
          Strong defaults: validated inputs, hashed passwords, and an audit trail hook for future compliance needs.
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
        <GoogleSignInButton enabled={googleEnabled} callbackUrl="/dashboard" />
        {!googleEnabled ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Google sign-in is disabled until `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are configured.
          </p>
        ) : null}

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or register
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Amina Rahman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input autoComplete="new-password" type="password" placeholder="Strong passphrase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
