"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/user-button";

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm">
      <div className="flex gap-x-2">
        <Button
          variant={pathname === "/complaints" ? "default" : "outline"}
          asChild
        >
          <Link href="/complaints">Reklamacije</Link>
        </Button>
        <Button
          variant={pathname === "/complaints/admin" ? "default" : "outline"}
          asChild
        >
          <Link href="/complaints/admin">Upravljanje reklamacijama</Link>
        </Button>
        <Button variant={pathname === "/admin" ? "default" : "outline"} asChild>
          <Link href="/admin">Admin</Link>
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
