//components/ui/toast-wrapper.tsx

"use client"

import React from "react";
import { ToasterProvider } from "./use-toast";
import { Toaster } from "./toaster";

// Omotač koji kombinuje Provider i Toaster komponentu
export function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToasterProvider>
      {children}
      <Toaster />
    </ToasterProvider>
  );
}