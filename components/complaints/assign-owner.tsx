// app/components/complaints/assign-owner.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Или ваша toast библиотека

interface AssignOwnerProps {
  complaintId: string;
}

export function AssignOwner({ complaintId }: AssignOwnerProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error("Nije moguće učitati korisnike");
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.warning("Molimo odaberite korisnika");
      return;
    }

    toast.promise(
      fetch(`/api/complaints/${complaintId}/assign`, {
        method: "POST",
        body: JSON.stringify({ assignedToId: selectedUserId }),
        headers: { "Content-Type": "application/json" },
      }),
      {
        loading: "Dodeljujem reklamaciju...",
        success: async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Došlo je do greške");
          }
          return "Reklamacija uspešno dodeljena";
        },
        error: (error) => error.message || "Došlo je do greške prilikom obrade",
      }
    );
  };

   return (
    <div className="flex gap-2">
      <Select onValueChange={(value) => setSelectedUserId(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Odaberite korisnika" />
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
        disabled={!selectedUserId}
      >
        Dodeli
      </Button>
    </div>
  );
}