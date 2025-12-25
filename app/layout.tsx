import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "./trpc/routers/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Provider } from "jotai";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "/logos/logo.svg",
  },
  title: {
    default: "Rheoma — Workflow Automation Platform",
    template: "%s | Rheoma",
  },
  description:
    "Rheoma is a modern workflow automation platform to build, execute, and orchestrate AI-powered workflows using nodes, events, and background processing.",
  applicationName: "Rheoma",
  authors: [{ name: "Shreyas Mohanty" }],
  keywords: [
    "workflow automation",
    "AI workflows",
    "node-based automation",
    "Inngest",
    "Next.js",
    "tRPC",
    "automation platform",
  ],
  creator: "Shreyas Mohanty",
  publisher: "Rheoma",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Rheoma — Workflow Automation Platform",
    description:
      "Design and run scalable AI-powered workflows with event-driven execution.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Rheoma",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rheoma — Workflow Automation Platform",
    description:
      "Build and orchestrate AI workflows using a node-based, event-driven system.",
  },
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return <Provider>{children}</Provider>;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCReactProvider>
          <NuqsAdapter>
            <Providers>{children}</Providers>
          </NuqsAdapter>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
