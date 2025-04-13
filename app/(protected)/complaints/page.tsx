// app/(protected)/complaints/page.tsx - Objedinjena stranica za reklamacije
import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { getAllComplaints, getComplaintsByUserId } from "@/data/complaint";
import ComplaintsList from "@/components/complaints/complaints-list";
import { NewComplaintButton } from "@/components/complaints/new-complaint-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailProcessorWrapper } from "@/components/email-processor/email-processor-wrapper";
import { toast } from "sonner";

export default async function ComplaintsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login?error=unauthorized");
  }

  const isAdmin = session.user.role === "ADMIN";
  let complaints = [];
  
  try {
    if (isAdmin) {
      complaints = await getAllComplaints();
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

  // Za administratorski prikaz, filtriraj reklamacije po statusu
  const pendingComplaints = complaints.filter(c => c.status === "PENDING");
  const inProgressComplaints = complaints.filter(c => c.status === "IN_PROGRESS");
  const resolvedComplaints = complaints.filter(c => c.status === "RESOLVED" || c.status === "REJECTED");

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-foreground text-2xl font-semibold">
          {isAdmin ? "Upravljanje reklamacijama" : "Moje reklamacije"}
        </h1>
        <NewComplaintButton />
      </div>
      
      <Tabs defaultValue="complaints" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="complaints">Reklamacije</TabsTrigger>
          {isAdmin && <TabsTrigger value="email-processor">Email Processor</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="complaints">
          {isAdmin ? (
            // Admin prikaz reklamacija sa statusima
            <div className="space-y-6">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">
                    Na čekanju ({pendingComplaints.length})
                  </TabsTrigger>
                  <TabsTrigger value="inProgress">
                    U obradi ({inProgressComplaints.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    Rešene ({resolvedComplaints.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    Sve ({complaints.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <ComplaintsList 
                    complaints={pendingComplaints} 
                    showUserInfo={true}
                    emptyMessage="Nema reklamacija koje čekaju na obradu"
                  />
                </TabsContent>
                
                <TabsContent value="inProgress">
                  <ComplaintsList 
                    complaints={inProgressComplaints} 
                    showUserInfo={true}
                    emptyMessage="Nema reklamacija koje su u obradi"
                  />
                </TabsContent>
                
                <TabsContent value="resolved">
                  <ComplaintsList 
                    complaints={resolvedComplaints} 
                    showUserInfo={true}
                    emptyMessage="Nema rešenih reklamacija"
                  />
                </TabsContent>
                
                <TabsContent value="all">
                  <ComplaintsList 
                    complaints={complaints} 
                    showUserInfo={true}
                    emptyMessage="Nema reklamacija u sistemu"
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            // Korisnički prikaz reklamacija
            <ComplaintsList 
              complaints={complaints} 
              showUserInfo={false}
              emptyMessage="Niste podneli nijednu reklamaciju"
            />
          )}
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="email-processor">
            <EmailProcessorWrapper />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}