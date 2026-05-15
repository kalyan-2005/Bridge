import { DM_Sans, Syne } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { auth } from "@/auth";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PalTech Forge — Hackathon Starter",
    template: "%s | PalTech Forge",
  },
  description:
    "Enterprise-grade hackathon starter with auth, RBAC, dashboards, and modular business scaffolding.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} min-h-dvh font-sans`}>
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
