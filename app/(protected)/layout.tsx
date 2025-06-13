// app/(protected)/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/contexts/theme-context";
import Script from "next/script";
import { themeScript } from "@/utils/theme-script";
import React from 'react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
    <html lang="sr">
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider session={session}>
            <div className="min-h-screen flex flex-col">
              <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
                <Navbar />
              </div>
              
              <main className="flex-1 p-4">
                {children}
              </main>
              
              <footer className="border-t border-border p-4">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </footer>
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}