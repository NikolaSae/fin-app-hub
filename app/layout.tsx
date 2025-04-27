// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { ToasterProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fin-app-Hub",
  description:
    "Finansijski izvestaji, vas servisi, reklamacije, parking i jos mnogo toga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"><body
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary`}
      >
        <ToasterProvider>
          {children}
          <Toaster />
        </ToasterProvider>
      </body></html>
  );
}
