// Path: /app/(protected)/services/import/page.tsx

import { Metadata } from "next";
import { ImportForm } from "@/components/services/ImportForm";

export const metadata: Metadata = {
  title: "Import VAS Data | Management Dashboard",
  description: "Import VAS service usage data from a CSV file.",
};

export default function ImportServicesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import VAS Service Data</h1>
          <p className="text-gray-500">
            Upload a CSV file to import VAS service usage data.
          </p>
        </div>
      </div>
      <ImportForm />
    </div>
  );
}