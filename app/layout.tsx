// Path: app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import React from 'react';

import "./globals.css";

// *** Import Sonner Toaster Component ***
// Proverite da li je putanja ispravna za vaš projekat
// Ako koristite shadcn/ui verziju sonner-a:
import { Toaster } from "@/components/ui/sonner";
// Ako koristite direktno sonner biblioteku:
// import { Toaster } from "sonner";



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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary`}
      >
           {children}
        <Toaster />
      </body>
    </html>
  );
}
