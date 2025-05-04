// /app/(protected)/_components/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientSideUserButton } from "@/components/auth/client-side-user-button";


export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="w-full flex items-center justify-between p-4 shadow-sm">
      <div className="flex gap-x-2 overflow-x-auto pb-2">
        <Button
          variant={pathname.startsWith("/admin") ? "default" : "outline"}
          asChild
        >
          <Link href="/admin">Admin</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/analytics") ? "default" : "outline"}
          asChild
        >
          <Link href="/analytics">Analytics</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/client") ? "default" : "outline"}
          asChild
        >
          <Link href="/client">Clients</Link>
        </Button>
        <Button
          variant={pathname.startsWith("/complaints") ? "default" : "outline"}
          asChild
        >
          <Link href="/complaints">Reklamacije</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/contracts") ? "default" : "outline"}
          asChild
        >
          <Link href="/contracts">Contracts</Link>
        </Button>
        <Button variant={pathname.startsWith("/humanitarian-orgs") ? "default" : "outline"} asChild>
          <Link href="/humanitarian-orgs">HO panel</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/notifications") ? "default" : "outline"}
          asChild
        >
          <Link href="/notifications">Notifications</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/products") ? "default" : "outline"}
          asChild
        >
          <Link href="/products">Products</Link>
        </Button>
        <Button variant={pathname.startsWith("/providers") ? "default" : "outline"} asChild>
          <Link href="/providers">Provajderi</Link>
        </Button>
         <Button
          variant={pathname.startsWith("/reports") ? "default" : "outline"}
          asChild
        >
          <Link href="/reports">Reports</Link>
        </Button>
        <Button
          variant={pathname.startsWith("/services") ? "default" : "outline"}
          asChild
        >
          <Link href="/services">Servisi</Link>
        </Button>
        <Button
          variant={pathname.startsWith("/settings") ? "default" : "outline"}
          asChild
        >
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
      <ClientSideUserButton />
    </nav>
  );
};