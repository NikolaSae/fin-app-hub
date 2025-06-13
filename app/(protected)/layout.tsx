// app/(protected)/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";
<<<<<<< HEAD

=======
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/contexts/theme-context";
import Script from "next/script";
import { themeScript } from "@/utils/theme-script";
>>>>>>> 1dec103f1654c65550e3704a1fb8da634bb9dc80
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 1dec103f1654c65550e3704a1fb8da634bb9dc80
  );
}
