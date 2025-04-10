"use client";

import { Button } from "@/components/ui/button";

interface AssignComplaintButtonProps {
  complaintId: string;
  onAssignClick: (complaintId: string) => void;
}

export default function AssignComplaintButton({
  complaintId,
  onAssignClick,
}: AssignComplaintButtonProps) {
  const handleClick = () => {
    // Trigger the assign click callback with the complaint ID
    onAssignClick(complaintId);
  };

  return (
    <Button size="sm" variant="secondary" onClick={handleClick}>
      Dodeli drugom korisniku
    </Button>
  );
}

