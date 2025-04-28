///components/services/ServiceDetails.tsx


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ServiceDetailsProps {
  service: {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ServiceDetails({ service }: ServiceDetailsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "VAS":
        return "bg-blue-100 text-blue-800";
      case "BULK":
        return "bg-purple-100 text-purple-800";
      case "HUMANITARIAN":
        return "bg-green-100 text-green-800";
      case "PARKING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Service Name</p>
            <p className="text-lg font-semibold">{service.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Service Type</p>
            <Badge variant="outline" className={getTypeColor(service.type)}>
              {service.type}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            {service.isActive ? (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <Check className="mr-1 h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <X className="mr-1 h-3 w-3" /> Inactive
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p>{formatDate(service.updatedAt)}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">Description</p>
          <p className="mt-1">{service.description || "No description provided."}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p>{formatDate(service.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}