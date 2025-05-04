// /components/auth/client-side-user-button.tsx
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const DynamicUserButton = dynamic(() => import('./user-button').then((mod) => mod.UserButton), {
  ssr: false,
  loading: () => <Skeleton className="w-8 h-8 rounded-full" />,
});

export function ClientSideUserButton() {
  return <DynamicUserButton />;
}