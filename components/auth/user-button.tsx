// components/auth/user-button.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "@/components/auth/logout-button";
import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export const UserButton = () => {
  const user = useCurrentUser();
  const [imageError, setImageError] = useState(false);

  // Funkcija za dobijanje inicijala
  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage 
                src={user?.image || ""} 
                alt={user?.name || "User"}
                onError={() => setImageError(true)}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                {user?.name ? getUserInitials(user.name) : <FaUser className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          {user?.name && (
            <div className="px-2 py-1 text-sm text-gray-600 border-b">
              {user.name}
            </div>
          )}
          <LogoutButton>
            <DropdownMenuItem className="cursor-pointer">
              <ExitIcon className="h-4 w-4 mr-2" />
              Odjava
            </DropdownMenuItem>
          </LogoutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};