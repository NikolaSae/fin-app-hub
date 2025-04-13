// app/(protected)/organizations/[id]/edit/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/organizations/OrganizationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { HumanitarnaOrganizacija } from "@prisma/client";

export default function EditOrganizationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [organization, setOrganization] = useState<HumanitarnaOrganizacija | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        // Await the params.id if necessary, depending on your Next.js version
        const { id } = await params;

        const response = await fetch(`/api/organizations/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch organization");
        }
        
        const data = await response.json();
        setOrganization(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Greška pri učitavanju podataka o organizaciji");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [params]); // Re-fetch when params change

  async function handleSubmit(data: HumanitarnaOrganizacija) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Greška pri ažuriranju organizacije");
      }

      toast.success("Humanitarna organizacija je uspešno ažurirana");
      router.push(`/organizations/${params.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Učitavanje...</span>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>{error || "Organizacija nije pronađena"}</p>
          <Link href="/organizations">
            <Button variant="outline" className="mt-4">
              Povratak na listu organizacija
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/organizations/${params.id}`}>
          <Button variant="ghost" className="p-0 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nazad na detalje organizacije
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Izmena organizacije</h1>
        <p className="text-muted-foreground">
          Ažurirajte podatke o humanitarnoj organizaciji "{organization.naziv}"
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <OrganizationForm 
          organization={organization} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}