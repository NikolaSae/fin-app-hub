// Path: app/(protected)/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider"; // Importujte novi ThemeProvider
import { ThemeCustomizer } from "@/components/theme-customizer"; // Vaša UI komponenta

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
    // Omotajte cijelu aplikaciju s ThemeProviderom
    <ThemeProvider>
      <SessionProvider session={session}>
        <div className="min-h-screen w-full flex flex-col bg-background">
          {/* Sticky Navbar */}
          <div className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
            <Navbar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer sa podešavanjima teme */}
          {/* Promenjeno: justify-end za pozicioniranje u desnom uglu */}
          <div className="w-full flex justify-end p-4">
            <ThemeCustomizer /> {/* Ovdje i dalje ostaje UI komponenta za prilagođavanje */}
          </div>
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
}
