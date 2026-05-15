"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(2).max(80),
});

type Values = z.infer<typeof schema>;

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { update } = useSession();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName },
  });

  async function onSubmit(values: Values) {
    const res = await updateProfile(values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Profile updated");
    await update({ user: { name: values.name } });
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save changes
        </Button>
      </form>
    </Form>
  );
}
