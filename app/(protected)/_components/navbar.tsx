// Path: /app/(protected)/_components/navbar.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ClientSideUserButton } from "@/components/auth/client-side-user-button";

// Definicija ListItem komponente (nepromenjena, već je ispravna)
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Navbar = () => {
  const pathname = usePathname();
  const isActivePath = (href: string) => pathname.startsWith(href);
  const isTriggerActive = (paths: string[]) => paths.some(p => isActivePath(p));

  const reklamacijePaths = ["/complaints", "/admin/complaints"];
  const analyticsPaths = ["/analytics", "/analytics/reports"];

  return (
    <nav className="w-full flex items-center justify-between p-4 shadow-sm">
      <div className="flex-grow overflow-x-auto pb-2">
        <NavigationMenu>
          <NavigationMenuList>
            {/* Link: Humanitarci */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/humanitarian-orgs"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/humanitarian-orgs") && "bg-accent text-accent-foreground")}
                >
                  Humanitarci
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Link: Provajderi */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/providers"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/providers") && "bg-accent text-accent-foreground")}
                >
                  Provajderi
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Link: Operateri - DODATO */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/operators"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/operators") && "bg-accent text-accent-foreground")}
                >
                  Operateri
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Link: Bulk Servisi - DODATO */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/bulk-services"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/bulk-services") && "bg-accent text-accent-foreground")}
                >
                  Bulk Servisi
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Link: Parking */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/parking-services"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/parking-services") && "bg-accent text-accent-foreground")}
                >
                  Parking
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Reklamacije dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(isTriggerActive(reklamacijePaths) && "bg-accent text-accent-foreground")}>
                Reklamacije
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-2 md:w-[200px] lg:w-[230px]">
                  <ListItem href="/complaints" title="Sve reklamacije" />
                  <ListItem href="/admin/complaints" title="Admin panel" />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Link: Ugovori */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/contracts"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/contracts") && "bg-accent text-accent-foreground")}
                >
                  Ugovori
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Link: Servisi */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/services"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/services") && "bg-accent text-accent-foreground")}
                >
                  Servisi
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Analytics dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(isTriggerActive(analyticsPaths) && "bg-accent text-accent-foreground")}>
                Analytics
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 p-2 md:w-[200px] lg:w-[230px]">
                  <ListItem href="/analytics" title="Pregled" />
                  <ListItem href="/analytics/reports" title="Izveštaji" />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Link: Reports */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/reports"
                  className={cn(navigationMenuTriggerStyle(), isActivePath("/reports") && "bg-accent text-accent-foreground")}
                >
                  Reports
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="ml-auto flex-shrink-0">
        <ClientSideUserButton />
      </div>
    </nav>
  );
};