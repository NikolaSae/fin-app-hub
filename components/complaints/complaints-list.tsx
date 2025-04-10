import { Complaint, User, Product } from "@prisma/client";
import { ComplaintCard } from "./complaint-card";

interface ComplaintsListProps {
  complaints: Array<Complaint & {
    user?: User;
    product?: Product | null;
    assignedTo?: User | null;
    closedBy?: User | null; // Added this field to support displaying who closed the complaint
  }>;
  showUserInfo?: boolean;
  emptyMessage?: string;
  userRole?: "ADMIN" | "USER"; // Prop for determining user's role
  onAssignClick?: (complaintId: string) => void; // Callback for reassigning complaints
}

export default function ComplaintsList({ 
  complaints, 
  showUserInfo = false,
  emptyMessage = "Nema pronađenih reklamacija",
  userRole = "USER", // Default to "USER"
  onAssignClick, // Optional callback
}: ComplaintsListProps) {
  if (complaints.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint.id}
          complaint={complaint}
          showUserInfo={showUserInfo}
          userRole={userRole}
          onAssignClick={onAssignClick} // Pass assign logic
        />
      ))}
    </div>
  );
}
