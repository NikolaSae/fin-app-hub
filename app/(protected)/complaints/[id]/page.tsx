// app/(protected)/complaints/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth"
import { getComplaintById } from "@/data/complaint";
import { ComplaintDetails } from "@/components/complaints/complaint-details";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ComplaintPage(props: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await props.params;

  const session = await auth();
  if (!session || !session.user) {
    console.warn("No session or user found. Redirecting to login...");
    redirect("/auth/login");
  }

  console.log("Fetching complaint by ID:", id);
  const complaint = await getComplaintById(id);

  if (!complaint) {
    console.warn("Complaint not found for ID:", id);
    notFound();
  }

  if (
    session.user.role !== "ADMIN" &&
    complaint.userId !== session.user.id &&
    complaint.assignedToId !== session.user.id
  ) {
    console.warn("User is not authorized to view this complaint:", session.user.id);
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
  console.error("Error in ComplaintPage:", error);
  notFound(); // Redirect or show a 404 page
}
}
