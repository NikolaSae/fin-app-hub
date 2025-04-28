// /app/(protected)/services/page.tsx

import { Metadata } from "next";
import Link from "next/link";
// Uvozimo AŽURIRANU ServiceList komponentu
import { ServiceList } from "@/components/services/ServiceList"; // Ova komponenta je ažurirana
// Uvozimo UI komponente iz Shadcn UI
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react"; // Ikona

export const metadata: Metadata = {
  title: "Services List | Management Dashboard",
  description: "View and manage all services.",
};

// Stranica za prikaz liste svih servisa
// Ovo je Server Komponenta koja renderuje ServiceList komponentu (Client Component)
export default function ServicesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-gray-500">
            Manage your organization's services (VAS, Bulk, Humanitarian, Parking).
          </p>
        </div>
        <div className="flex items-center gap-2">
             {/* Dugme/Link za import stranicu */}
             <Button variant="outline" asChild>
                <Link href="/services/import">
                     Import Services
                </Link>
             </Button>
            {/* Dugme/Link za stranicu za kreiranje novog servisa */}
             {/* NAPOMENA: Stranica /services/new nije bila na vašem spisku napravljenih. Pretpostavljamo da postoji. */}
             <Button asChild>
                <Link href="/services/new"> {/* Link ka stranici za kreiranje */}
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Service
                </Link>
             </Button>
        </div>
      </div>

      {/* Renderujemo AŽURIRANU ServiceList komponentu */}
      {/* ServiceList unutar sebe dohvata podatke, rukuje filterima i paginacijom */}
      <ServiceList />

    </div>
  );
}