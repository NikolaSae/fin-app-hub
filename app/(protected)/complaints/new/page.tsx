// app/(protected)/complaints/new/page.tsx
"use client";

import { useState, useTransition } from "react"; // Uvezen useTransition
import { useRouter } from "next/navigation";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { createComplaint } from "@/actions/complaints/create";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// Proverite putanju za ComplaintFormData, trebalo bi da bude iz schemas/complaint ako koristite Zod shemu
import { ComplaintFormData } from "@/schemas/complaint"; // Pretpostavljena putanja
import { toast } from "sonner"; // Korišćen sonner toast

export default function NewComplaintPage() {
  const router = useRouter();
  // ISPRAVLJENO: Korišćen useTransition umesto lokalnog isSubmitting stanja
  const [isPending, startTransition] = useTransition();
  
  // onSubmit handler koji će biti prosleđen ComplaintForm komponenti
  const handleSubmit = async (data: ComplaintFormData) => {
    // Umotavamo poziv server akcije u startTransition
    startTransition(async () => {
      const result = await createComplaint(data);

      // Ovaj blok koda će se izvršiti SAMO ako server akcija VRATI grešku
      // (tj. ako ne pozove redirect()).
      if (result?.error) {
        toast.error(result.error || "Failed to create complaint");
        // Ako akcija vraća formErrors, možete ih ovde dodatno obraditi
        // if (result.formErrors) { /* ... */ }
      }
      // Nema potrebe za toast.success ili router.push ovde,
      // jer redirect() u server akciji rukuje navigacijom.
      // Ako akcija uspešno završi BEZ redirecta (što ne bi trebalo),
      // ovaj deo koda bi se izvršio, ali to je neočekivan scenario.
      // Možete dodati log ili upozorenje za takav slučaj ako želite.
    });
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Complaint</h1>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow">
        {/* Prosleđujemo isPending stanje formi */}
        <ComplaintForm 
          onSubmit={handleSubmit} 
          isSubmitting={isPending} // Korišćen isPending iz useTransition
        />
      </div>
    </div>
  );
}
