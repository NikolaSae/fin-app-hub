// app/(protected)/complaints/admin/page.tsx - Administratorska stranica za reklamacije
import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { getAllComplaints } from "@/data/complaint";
import ComplaintsList from "@/components/complaints/complaints-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ComplaintsAdminPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/complaints");
  }

  const complaints = await getAllComplaints();
  
  // Filtriranje reklamacija po statusu
  const pendingComplaints = complaints.filter(c => c.status === "PENDING");
  const inProgressComplaints = complaints.filter(c => c.status === "IN_PROGRESS");
  const resolvedComplaints = complaints.filter(c => c.status === "RESOLVED" || c.status === "REJECTED");

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Upravljanje reklamacijama</h1>
      
      <Tabs defaultValue="pending" className="mb-6">
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
  );
}