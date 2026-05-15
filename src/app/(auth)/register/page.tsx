import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return <RegisterForm googleEnabled={googleEnabled} />;
}
