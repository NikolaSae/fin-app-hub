// app/components/complaints/assign-owner.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface AssignOwnerProps {
  complaintId: string;
  users: Array<{ id: string; name: string; role?: string }>;
  onAssignmentSuccess: () => void;
  onError: (message: string) => void;
}

export function AssignOwner({ 
  complaintId, 
  users, 
  onAssignmentSuccess, 
  onError 
}: AssignOwnerProps) {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAssign = async () => {
    if (!selectedUserId || !session?.user) return;
    
    try {
      setIsLoading(true);
      toast.loading("Dodeljujem reklamaciju...");
      
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          assignedToId: selectedUserId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Greška pri dodeljivanju");
      }
      
      toast.success("Uspešno dodeljeno!");
      onAssignmentSuccess(); // Poziv funkcije za osvežavanje podataka
      setSelectedUserId(""); // Reset selektovanog korisnika
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Neočekivana greška";
      onError(errorMessage);
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };
  
  if (session?.user?.role !== "ADMIN") return null;
  
  return (
    <div className="flex gap-2">
      <Select 
        value={selectedUserId} 
        onValueChange={setSelectedUserId}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Odaberite agenta" />
        </SelectTrigger>
        <SelectContent>
          {users.length === 0 ? (
            <SelectItem value="no-agents" disabled>
              Nema dostupnih agenata
            </SelectItem>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleAssign}
        disabled={!selectedUserId || isLoading}
      >
        {isLoading ? "Obrada..." : "Dodeli"}
      </Button>
    </div>
  );
}