// components/complaints/complaint-details.tsx
"use client";

import { Complaint, User, Product, ComplaintStatus, ComplaintHistory, ComplaintComment, Attachment } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { ResolveForm } from "./resolve-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUser } from "@/hooks/use-current-user";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package, 
  Calendar, 
  MessageSquare, 
  FileBadge, 
  CreditCard,
  Headphones,
  Truck,
  HelpCircle
} from "lucide-react";

interface ComplaintDetailsProps {
  complaint: Complaint & {
    user: User;
    product?: Product | null;
    assignedTo?: User | null;
    resolvedBy?: User | null;
    history: Array<ComplaintHistory & {
      user: User;
    }>;
    comments: Array<ComplaintComment & {
      user: User;
    }>;
    attachments: Attachment[];
  };
}

const statusMap = {
  [ComplaintStatus.PENDING]: { 
    label: "Na čekanju", 
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    icon: <Clock className="h-5 w-5 text-yellow-600" /> 
  },
  [ComplaintStatus.IN_PROGRESS]: { 
    label: "U obradi", 
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: <AlertCircle className="h-5 w-5 text-blue-600" />
  },
  [ComplaintStatus.RESOLVED]: { 
    label: "Rešeno", 
    color: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />
  },
  [ComplaintStatus.REJECTED]: { 
    label: "Odbijeno", 
    color: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: <XCircle className="h-5 w-5 text-red-600" />
  },
  [ComplaintStatus.CLOSED]: { 
    label: "Zatvoreno", 
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: <XCircle className="h-5 w-5 text-gray-600" />
  },
};

const typeIconMap = {
  PRODUCT_DEFECT: <Package className="h-5 w-5" />,
  SERVICE_ISSUE: <Headphones className="h-5 w-5" />,
  DELIVERY_PROBLEM: <Truck className="h-5 w-5" />,
  BILLING_ISSUE: <CreditCard className="h-5 w-5" />,
  OTHER: <HelpCircle className="h-5 w-5" />
};

export function ComplaintDetails({ complaint }: ComplaintDetailsProps) {
  const role = useCurrentRole();
  const user = useCurrentUser();
  
  const status = statusMap[complaint.status];
  const isAdmin = role === "ADMIN";
  const isAssignedAgent = complaint.assignedToId === user?.id;
  const isComplaintOwner = complaint.userId === user?.id;
  
  const canResolve = (isAdmin || isAssignedAgent) && 
    (complaint.status === ComplaintStatus.IN_PROGRESS || complaint.status === ComplaintStatus.PENDING);
  
  const canComment = isAdmin || isAssignedAgent || isComplaintOwner;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
              <Badge variant="outline" className="ml-2">
                {typeIconMap[complaint.type]} 
                <span className="ml-1">{complaint.type.replace("_", " ")}</span>
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={16} className="mr-1" />
              {formatDate(complaint.createdAt)}
            </div>
          </div>
          <CardTitle className="text-2xl mt-2">{complaint.title}</CardTitle>
          {complaint.product && (
            <CardDescription>
              Proizvod: <span className="font-medium">{complaint.product.name}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line">{complaint.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-1">Podnosilac:</span>
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={complaint.user.image || undefined} />
                  <AvatarFallback>{complaint.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{complaint.user.name || complaint.user.email}</span>
              </div>
              
              {complaint.assignedTo && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-1">Obrađuje:</span>
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={complaint.assignedTo.image || undefined} />
                    <AvatarFallback>{complaint.assignedTo.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{complaint.assignedTo.name || complaint.assignedTo.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {complaint.resolution && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              {complaint.status === ComplaintStatus.RESOLVED ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              Rešenje reklamacije
            </CardTitle>
            {complaint.resolvedAt && (
              <CardDescription>
                Rešeno: {formatDate(complaint.resolvedAt)}
                {complaint.resolvedBy && (
                  <span> od strane {complaint.resolvedBy.name || complaint.resolvedBy.email}</span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line">{complaint.resolution}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {canResolve && !complaint.resolution && (
        <ResolveForm complaintId={complaint.id} />
      )}
      
      {complaint.attachments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileBadge className="h-5 w-5 mr-2" />
              Prilozi ({complaint.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {complaint.attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                  <span>{attachment.fileName}</span>
                  <Badge variant="outline">
                    {(attachment.fileSize / 1024).toFixed(2)} KB
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Komentari ({complaint.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complaint.comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Još uvek nema komentara
            </p>
          ) : (
            complaint.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback>{comment.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {comment.user.name || comment.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          
          {canComment && complaint.status !== ComplaintStatus.CLOSED && (
            <CommentForm complaintId={complaint.id} />
          )}
        </CardContent>
      </Card>
      
      {complaint.history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Istorija promene statusa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l">
              {complaint.history.map((item, index) => (
                <div key={item.id} className={`pb-4 ${index !== complaint.history.length - 1 ? "" : ""}`}>
                  <div className="absolute left-0 w-2 h-2 -translate-x-1/2 rounded-full bg-primary mt-1.5"></div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">
                      {item.description || `Status promenjen na ${item.newStatus}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Promenio: {item.user.name || item.user.email}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}