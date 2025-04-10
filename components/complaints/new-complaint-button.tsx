// components/complaints/new-complaint-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function NewComplaintButton() {
  return (
    <Button asChild>
      <Link href="/complaints/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova reklamacija
      </Link>
    </Button>
  );
}