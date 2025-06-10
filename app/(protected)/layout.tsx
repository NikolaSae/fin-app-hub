// Path: app/(protected)/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";
import { ThemeToggle } from "@/components/theme-toggle";
import React from 'react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
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
        
        {/* Footer with Theme Toggle */}
        <div className="w-full flex justify-center p-4">
          <ThemeToggle />
        </div>
      </div>
    </SessionProvider>
  );
}