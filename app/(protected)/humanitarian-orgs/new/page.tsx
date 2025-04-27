// /app/(protected)/humanitarian-orgs/new/page.tsx
import { Metadata } from "next";
// Uvozimo komponentu forme koju ćemo koristiti na ovoj stranici
// Ova komponenta će biti kreirana u sledećim koracima
import { HumanitarianOrgForm } from "@/components/humanitarian-orgs/HumanitarianOrgForm";

export const metadata: Metadata = {
  title: "Create New Humanitarian Organization | Management Dashboard",
  description: "Create a new humanitarian organization in the system",
};

// Server Komponenta za stranicu kreiranja nove humanitarne organizacije
// Ne mora biti async jer ne dohvata inicijalne podatke sa servera
export default function NewHumanitarianOrgPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Create New Humanitarian Organization
        </h1>
        <p className="text-muted-foreground">
          Add a new humanitarian organization to the system
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Renderujemo komponentu forme za kreiranje organizacije */}
        <HumanitarianOrgForm />
      </div>
    </div>
  );
}