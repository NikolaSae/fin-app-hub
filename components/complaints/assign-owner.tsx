// app/components/complaints/assign-owner.tsx
import { useEffect, useState } from "react";
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
  onAssignmentSuccess: () => void; // Dodato za refresh podataka
}

export function AssignOwner({ complaintId, onAssignmentSuccess }: AssignOwnerProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        });
        
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        setUsers(data.filter((user: any) => user.role === "AGENT")); // Filtriranje samo agenata
      } catch (error) {
        toast.error("Greška pri učitavanju korisnika");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [session]);

  const handleAssign = async () => {
    if (!selectedUserId || !session?.user) return;

    try {
      toast.loading("Dodeljujem reklamaciju...");
      
      const response = await fetch(`/api/complaints/${complaintId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ 
          assignedToId: selectedUserId,
          assignedById: session.user.id 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("Uspešno dodeljeno!");
      onAssignmentSuccess(); // Refresh parent komponente
      setSelectedUserId(""); // Reset selektovanog korisnika

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Neočekivana greška");
    } finally {
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
          <SelectValue placeholder={isLoading ? "Učitavam..." : "Odaberite agenta"} />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
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