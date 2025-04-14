// app/components/ComplaintBadge.tsx

"use client";

import { Complaint } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComplaintBadgeProps {
  complaints: Complaint[];
}

export const ComplaintBadge: React.FC<ComplaintBadgeProps> = ({ complaints }) => {
  if (complaints.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="destructive">
          {complaints.length} reklamacija
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="max-w-md">
        <ul className="space-y-1 text-sm">
          {complaints.map((c, idx) => (
            <li key={idx}>
              <strong>{c.title || `Reklamacija ${idx + 1}`}:</strong> {c.description}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
