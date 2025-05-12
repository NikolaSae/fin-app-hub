// Path: /app/(protected)/_components/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientSideUserButton } from "@/components/auth/client-side-user-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();

  // Funkcija za proveru da li je link aktivan
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="w-full flex items-center justify-between p-4 shadow-sm">
      {/* Kontejner za navigacione linkove */}
      <div className="flex gap-x-2 overflow-x-auto pb-2">
        {/* Link: Humanitarci */}
        <Button
          variant={isActive("/humanitarian-orgs") ? "default" : "outline"}
          asChild
        >
          <Link href="/humanitarian-orgs">Humanitarci</Link>
        </Button>

        {/* Link: Provajderi */}
        <Button
          variant={isActive("/providers") ? "default" : "outline"}
          asChild
        >
          <Link href="/providers">Provajderi</Link>
        </Button>

        {/* Link: Parking */}
        <Button
          variant={isActive("/parking") ? "default" : "outline"}
          asChild
        >
          <Link href="/parking">Parking</Link>
        </Button>

        {/* Reklamacije dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button 
              type="button" 
              variant={isActive("/complaints") || isActive("/admin/complaints") ? "default" : "outline"}
            >
              Reklamacije <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/complaints">Sve reklamacije</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/complaints">Admin panel</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Link: Ugovori */}
        <Button
          variant={isActive("/contracts") ? "default" : "outline"}
          asChild
        >
          <Link href="/contracts">Ugovori</Link>
        </Button>

        {/* Link: Servisi */}
        <Button
          variant={isActive("/services") ? "default" : "outline"}
          asChild
        >
          <Link href="/services">Servisi</Link>
        </Button>

        {/* Analytics dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button 
              type="button" 
              variant={isActive("/analytics") ? "default" : "outline"}
            >
              Analytics <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/analytics">Pregled</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/analytics/reports">Izveštaji</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Link: Reports */}
        <Button
          variant={isActive("/reports") ? "default" : "outline"}
          asChild
        >
          <Link href="/reports">Reports</Link>
        </Button>
      </div>

      {/* User Button */}
      <ClientSideUserButton />
    </nav>
  );
};