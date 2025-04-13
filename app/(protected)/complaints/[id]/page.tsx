// app/(protected)/complaints/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getComplaintById } from "@/data/complaint";
import { ComplaintDetails } from "@/components/complaints/complaint-details";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ComplaintPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // 1. Provera sesije na početku
    const session = await auth();
    console.log("session:", session.user);
    const user = session?.user;
    
    if (!user) {
      console.warn("Nema sesije - preusmeravanje na login");
      redirect("/auth/login");
    }

    // 2. Validacija ID-a
    const { id } = await  params;
    if (!id || typeof id !== "string") {
      console.warn("Nevalidan ID reklamacije");
      notFound();
    }

    // 3. Dobijanje podataka
    const complaint = await getComplaintById(id);
    if (!complaint) {
      console.warn("Reklamacija nije pronađena");
      notFound();
    }

    // 4. Provera autorizacije
    const isAuthorized =
      session.user.role === "ADMIN" ||
      String(complaint.userId) === String(session.user.id) || // Eksplicitna konverzija
      String(complaint.assignedToId) === String(session.user.id);

    if (!isAuthorized) {
      console.warn(`Neovlašćen pristup od korisnika ${user.id}`);
      redirect("/complaints");
    }

    // 5. Renderovanje
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
    console.error("Greška u ComplaintPage:", error);
    redirect("/auth/login?error=server_error");
  }
}