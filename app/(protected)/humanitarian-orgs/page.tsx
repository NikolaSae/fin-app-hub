// /app/(protected)/humanitarian-orgs/page.tsx

import { Metadata } from "next";
// Uklanjamo import za Suspense jer ga ne koristimo
// import { Suspense } from "react";
// Uvozimo komponente koje ćemo koristiti na ovoj stranici
// Ove komponente će biti kreirane u sledećim koracima
import { HumanitarianOrgList } from "@/components/humanitarian-orgs/HumanitarianOrgList";


export const metadata: Metadata = {
  title: "Humanitarian Organizations | Management Dashboard",
  description: "View and manage all humanitarian organizations in the system",
};

// Server Komponenta za glavnu stranicu sa humanitarnim organizacijama
// Ne mora biti async ako ne dohvata podatke direktno (hook u komponenti liste to radi)
export default function HumanitarianOrgsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Humanitarian Organizations</h1>
          <p className="text-gray-500">
            View and manage all humanitarian organizations
          </p>
        </div>
        <div className="flex items-center gap-4">
          // Link ka stranici za kreiranje nove organizacije
          <a
            href="/humanitarian-orgs/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Create Organization
          </a>
        </div>
      </div>


        <HumanitarianOrgList />


    </div>
  );
}