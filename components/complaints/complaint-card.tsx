// components/complaints/complaint-card.tsx
"use client";

import { Complaint, User, Product, ComplaintStatus } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ComplaintCardProps {
  complaint: Complaint & {
    user?: User;
    product?: Product | null;
    assignedTo?: string | null;
  };
  showUserInfo?: boolean;
}

const statusMap = {
  [ComplaintStatus.PENDING]: { label: "Na čekanju", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  [ComplaintStatus.IN_PROGRESS]: { label: "U obradi", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  [ComplaintStatus.RESOLVED]: { label: "Rešeno", color: "bg-green-100 text-green-800 hover:bg-green-100" },
  [ComplaintStatus.REJECTED]: { label: "Odbijeno", color: "bg-red-100 text-red-800 hover:bg-red-100" },
  [ComplaintStatus.CLOSED]: { label: "Zatvoreno", color: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
};

const priorityMap = {
  LOW: { label: "Nizak", color: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  MEDIUM: { label: "Srednji", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  HIGH: { label: "Visok", color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
  CRITICAL: { label: "Kritičan", color: "bg-red-100 text-red-800 hover:bg-red-100" },
};

const ComplaintStatusIcon = ({ status }: { status: ComplaintStatus }) => {
  switch(status) {
    case ComplaintStatus.PENDING:
      return <Clock size={16} className="text-yellow-600" />;
    case ComplaintStatus.IN_PROGRESS:
      return <AlertCircle size={16} className="text-blue-600" />;
    case ComplaintStatus.RESOLVED:
      return <CheckCircle size={16} className="text-green-600" />;
    case ComplaintStatus.REJECTED:
      return <XCircle size={16} className="text-red-600" />;
    case ComplaintStatus.CLOSED:
      return <XCircle size={16} className="text-gray-600" />;
    default:
      return null;
  }
};


 export function ComplaintCard({ complaint, showUserInfo = false }: ComplaintCardProps) {
 console.log('assignedToId:', complaint.assignedToId);
  const status = statusMap[complaint.status];
  const priority = priorityMap[complaint.priority];
  
  return (
    <Card className="
    w-full 
    mb-4 
    shadow-container 
    hover:shadow-hover 
    transition-shadow 
    duration-500
    before:content-[''] 
    before:absolute 
    before:inset-0 
    before:-z-10
  ">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{complaint.title}</CardTitle>
          <Badge className={status.color}>
            <ComplaintStatusIcon status={complaint.status} />
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <Calendar size={14} className="mr-1" />
          {formatDate(complaint.createdAt)}
          
          <Badge variant="outline" className={`ml-3 ${priority.color}`}>
            {priority.label}
          </Badge>
          
          {complaint.product && (
            <Badge variant="outline" className="ml-2">
              {complaint.product.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm line-clamp-2">
          {complaint.description}
        </p>
        
        {showUserInfo && complaint.user && (
          <div className="mt-2 text-xs text-muted-foreground">
            Podneo: <span className="font-medium">{complaint.user.name || complaint.user.email}</span>
          </div>
        )}
        
        {complaint.assignedTo?.name && (
          <div className="mt-1 text-xs text-muted-foreground">
            Zadužen: <span className="font-medium">{complaint.assignedTo.name || complaint.assignedTo.name}</span>
          </div>
        )}
        
        {complaint.assignedTo && (
          <div className="mt-1 text-xs text-muted-foreground">
            Zadužen: <span className="font-medium">{complaint.assignedTo.name || complaint.assignedTo.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" variant="outline">
          <Link href={`/complaints/${complaint.id}`}>
            Pregledaj detalje
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/complaints/${complaint.id}`}>
            Dodeli
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}