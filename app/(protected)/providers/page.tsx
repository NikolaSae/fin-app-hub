// /app/(protected)/providers/page.tsx
 
import { Metadata } from "next";
 
import { ProviderList } from "@/components/providers/ProviderList";


export const metadata: Metadata = {
  title: "Providers | Management Dashboard",
  description: "View and manage all providers in the system",
};

export default function ProvidersPage() { // Uklonjeno async



  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
          <p className="text-gray-500">
            View and manage all providers in the system
          </p>
        </div>
        <div className="flex items-center gap-4">

          <a
            href="/providers/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Create Provider
          </a>
        </div>
      </div>

        <ProviderList /> // Više ne prosleđujemo prop providers

    </div>
  );
}