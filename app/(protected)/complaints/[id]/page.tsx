// app/(protected)/complaints/[id]/page.tsx - Stranica za detalje reklamacije
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth"
import { getComplaintById } from "@/data/complaint";
import { ComplaintDetails } from "@/components/complaints/complaint-details";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ComplaintPageProps {
  params: {
    id: string;
  };
}

export default async function ComplaintPage({ params }: ComplaintPageProps) {
  try {
    const sessionPromise = auth(); // Start fetching session as a promise
    const complaintPromise = getComplaintById(params.id); // Fetch complaint as a promise

    const [session, complaint] = await Promise.all([sessionPromise, complaintPromise]);

    // Handle session validation
    if (!session || !session.user) {
      redirect("/auth/login");
    }

    // Handle case when complaint is not found
    if (!complaint) {
      notFound();
    }

    // Provera dozvola - samo admin, vlasnik reklamacije ili zaduženi agent mogu videti detalje
    if (
      session.user.role !== "ADMIN" &&
      complaint.userId !== session.user.id &&
      complaint.assignedToId !== session.user.id
    ) {
      redirect("/complaints");
    }

  return (
    <div className="container mx-auto py-6">
      <Button asChild variant="ghost" className="mb-6" size="sm">
        <Link href="/complaints">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Nazad na listu reklamacija
        </Link>
      </Button>
      
      <ComplaintDetails complaint={complaint} />
    </div>
  );
} catch (error) {
    console.error("Error fetching complaint or session:", error);
    notFound(); // Handle errors gracefully by redirecting to a 404 page
  }
}