// app/(protected)/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      {/* Ensure the root container is properly styled */}
      <div className="h-full w-full flex flex-col items-center">
        {/* Sticky and centered Navbar */}
        <div className="sticky top-0 z-10 w-full flex justify-center bg-white border-b">
          <Navbar />
        </div>
        {/* Content Section */}
        <div className="w-full flex flex-col gap-y-10 items-center justify-center">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}