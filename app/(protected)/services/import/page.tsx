// /app/(protected)/services/import/page.tsx

import { Metadata } from "next";
// Uvozimo AŽURIRANU ImportForm komponentu
import { ImportForm } from "@/components/services/ImportForm"; // Ova komponenta je ažurirana

export const metadata: Metadata = {
  title: "Import Services | Management Dashboard",
  description: "Import service data from a CSV file.",
};

// Stranica za import servisa
// Ovo je Server Komponenta koja renderuje ImportForm komponentu (Client Component)
export default function ImportServicesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Services</h1>
          <p className="text-gray-500">
            Upload a CSV file to add new services to the system.
          </p>
        </div>
         {/* Opciono: Link ili dugme za povratak na listu servisa */}
          {/* <Link href="/services">
              <Button variant="outline">Back to Services List</Button>
          </Link> */}
      </div>

      {/* Renderujemo AŽURIRANU ImportForm komponentu */}
      {/* Komponenta rukuje logikom importa klijentski */}
      <ImportForm />

    </div>
  );
}