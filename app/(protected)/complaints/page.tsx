// app/(protected)/complaints/page.tsx - Lista svih reklamacija
import { auth } from "@/auth"
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ComplaintsList from "@/components/complaints/complaints-list";
import { NewComplaintButton } from "@/components/complaints/new-complaint-button";
import { getAllComplaints, getComplaintsByUserId, getAssignedComplaints } from "@/data/complaint";

export default async function ComplaintsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Dohvati reklamacije na osnovu uloge korisnika
  let complaints;
  let pageTitle = "Moje reklamacije";
  let emptyMessage = "Niste podneli nijednu reklamaciju";
  
  if (session.user.role === "ADMIN") {
    // Administratori vide sve reklamacije
    complaints = await getAllComplaints();
    pageTitle = "Sve reklamacije";
    emptyMessage = "Nema reklamacija u sistemu";
  } else {
    // Običan korisnik vidi samo svoje reklamacije
    complaints = await getComplaintsByUserId(session.user.id);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        <NewComplaintButton />
      </div>
      
      <ComplaintsList 
        complaints={complaints} 
        showUserInfo={session.user.role === "ADMIN"}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}