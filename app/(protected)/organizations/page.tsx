// app/(protected)/organizations/page.tsx

"use client";

import { useEffect, useState } from "react";
import { OrganizationsTable } from "@/components/organizations/OrganizationsTable";
import { HumanitarnaOrganizacija, OrganizationStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<(HumanitarnaOrganizacija & { status: OrganizationStatus })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Greška pri učitavanju humanitarnih organizacija");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Učitavanje...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Humanitarne organizacije</h1>
        <p className="text-muted-foreground">
          Pregled i upravljanje humanitarnim organizacijama
        </p>
      </div>

      <OrganizationsTable organizations={organizations} />
    </div>
  );
}