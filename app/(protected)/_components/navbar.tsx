"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="w-[600px] flex items-center justify-between p-4 shadow-sm">
      <div className="flex gap-x-2">
        <Button
          variant={pathname === "/complaints" ? "default" : "outline"}
          asChild
        >
          <Link href="/complaints">Reklamacije</Link>
        </Button>
        <Button
          variant={pathname === "/services" ? "default" : "outline"}
          asChild
        >
          <Link href="/services">Servisi</Link>

        </Button>
        <Button variant={pathname === "/organizations" ? "default" : "outline"} asChild>
          <Link href="/organizations">HO panel</Link>
        </Button>

        <Button variant={pathname === "/providers" ? "default" : "outline"} asChild>
          <Link href="/providers">Provajderi</Link>
        </Button>

        <Button
          variant={pathname === "/settings" ? "default" : "outline"}
          asChild
        >
          <Link href="/settings">Settings</Link>
        </Button>
      </div>

      <UserButton />
    </nav>
  );
};
