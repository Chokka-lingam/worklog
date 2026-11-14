import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "WorkLog",
    template: "%s | WorkLog",
  },
  description: "Personal work management and performance tracking platform",
  applicationName: "WorkLog",
  authors: [{ name: "WorkLog" }],
  keywords: ["worklog", "task management", "productivity", "dashboard"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "WorkLog",
    description: "Personal work management and performance tracking platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkLog",
    description: "Personal work management and performance tracking platform",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900"
      >
        {children}
      </body>
    </html>
  );
}
