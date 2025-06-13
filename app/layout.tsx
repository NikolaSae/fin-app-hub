// Path: app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import React from 'react';

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

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

/**
 * Pomoćna komponenta koja ubacuje inline skriptu u <head>.
 * Ova skripta se izvršava pre renderovanja React aplikacije i sprečava "bljesak" teme.
 */
const ThemeScript = () => {
  const script = `
    (function() {
      try {
        const theme = window.localStorage.getItem('theme');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        // Nema potrebe za 'else', jer je podrazumevana tema (bez klase) svetla.
      } catch (e) {
        // Ignorišemo greške ako localStorage nije dostupan.
      }
    })();
  `;
  // Koristimo dangerouslySetInnerHTML da bismo direktno ubacili skriptu
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // VAŽNO: suppressHydrationWarning sprečava React da se žali na
    // razliku između servera (bez 'dark' klase) i klijenta (sa 'dark' klasom).
    <html lang="sr" suppressHydrationWarning>
      <head>
        {/* Postavljamo skriptu ovde da se izvrši što pre */}
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
          {children}
        <Toaster />
      </body>
    </html>
  );
}