// app/(protected)/organizations/new/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationForm } from "@/components/organizations/OrganizationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: any) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Greška pri kreiranju organizacije");
      }

      toast.success("Humanitarna organizacija je uspešno kreirana");
      router.push("/organizations");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="ghost" className="p-0 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nazad na listu organizacija
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Nova humanitarna organizacija</h1>
        <p className="text-muted-foreground">
          Unesite podatke o novoj humanitarnoj organizaciji
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <OrganizationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}