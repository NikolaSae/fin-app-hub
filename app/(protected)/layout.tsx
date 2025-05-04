// Path: app/(protected)/layout.tsx

import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";
// Zakomentarisemo ThemeToggle
import { ThemeToggle } from "@/components/theme-toggle";
import React from 'react'; // Uvezite React za Fragment


interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <React.Fragment>
        <div className="h-full w-full flex flex-col items-center bg-background">
          <div className="sticky top-0 z-10 w-full flex justify-center bg-card border-b border-border">
            <Navbar />
          </div>
          <div className="w-full flex flex-col gap-y-10 items-center justify-center bg-background">
            {children}
            <ThemeToggle />
          </div>
        </div>
      </React.Fragment>
    </SessionProvider>
  );
}