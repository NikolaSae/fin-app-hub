// app/(protected)/complaints/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation";
import { toast } from "sonner";
import ComplaintsList from "@/components/complaints/complaints-list";
import { NewComplaintButton } from "@/components/complaints/new-complaint-button";
import { getAllComplaints, getComplaintsByUserId } from "@/data/complaint";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailProcessorWrapper } from "@/components/email-processor/email-processor-wrapper";

export default async function ComplaintsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?error=unauthorized");
  }
  let complaints;
  let pageTitle = "Moje reklamacije";
  let emptyMessage = "Niste podneli nijednu reklamaciju";
  
  try {
    if (session.user.role === "ADMIN") {
      complaints = await getAllComplaints();
      pageTitle = "Sve reklamacije";
      emptyMessage = "Nema reklamacija u sistemu";
    } else {
      complaints = await getComplaintsByUserId(session.user.id);
    }
  } catch (error) {
    console.error("Greška pri učitavanju reklamacija:", error);
    toast.error("Došlo je do greške pri učitavanju reklamacija");
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold text-destructive">
          Greška pri učitavanju podataka
        </h1>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-foreground text-2xl font-semibold">{pageTitle}</h1>
        <NewComplaintButton />
      </div>
      
      <Tabs defaultValue="complaints" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="complaints">Reklamacije</TabsTrigger>
          {session.user.role === "ADMIN" && (
            <TabsTrigger value="email-processor">Email Processor</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="complaints">
          <ComplaintsList 
            complaints={complaints || []} 
            showUserInfo={session.user.role === "ADMIN"}
            emptyMessage={emptyMessage}
          />
        </TabsContent>
        
        {session.user.role === "ADMIN" && (
          <TabsContent value="email-processor">
            <EmailProcessorWrapper />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}