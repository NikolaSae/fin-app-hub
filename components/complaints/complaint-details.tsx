// components/complaints/complaint-details.tsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Complaint,
  User,
  Product,
  ComplaintStatus,
  ComplaintHistory,
  ComplaintComment,
  Attachment,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { ResolveForm } from "./resolve-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  HelpCircle,
} from "lucide-react";
import { AssignOwner } from "./assign-owner";
import { Loader2 } from "lucide-react";

interface ComplaintDetailsProps {
  complaint: Complaint & {
    user: User;
    product?: Product | null;
    assignedToId?: string | null;
    assignedTo?: User | null;
    resolvedBy?: User | null;
    history: Array<
      ComplaintHistory & {
        user: User;
      }
    >;
    comments: Array<
      ComplaintComment & {
        user: User;
      }
    >;
    attachments: Attachment[];
  };
}

const statusMap = {
  [ComplaintStatus.PENDING]: {
    label: "Na čekanju",
    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
  },
  [ComplaintStatus.IN_PROGRESS]: {
    label: "U obradi",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
  },
  [ComplaintStatus.RESOLVED]: {
    label: "Rešeno",
    color: "bg-green-100 text-green-800 hover:bg-green-100",
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
  },
  [ComplaintStatus.REJECTED]: {
    label: "Odbijeno",
    color: "bg-red-100 text-red-800 hover:bg-red-100",
    icon: <XCircle className="h-5 w-5 text-red-600" />,
  },
  [ComplaintStatus.CLOSED]: {
    label: "Zatvoreno",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    icon: <XCircle className="h-5 w-5 text-gray-600" />,
  },
};

const typeIconMap = {
  PRODUCT_DEFECT: <Package className="h-5 w-5" />,
  SERVICE_ISSUE: <Headphones className="h-5 w-5" />,
  DELIVERY_PROBLEM: <Truck className="h-5 w-5" />,
  BILLING_ISSUE: <CreditCard className="h-5 w-5" />,
  OTHER: <HelpCircle className="h-5 w-5" />,
};

export function ComplaintDetails({ complaint }: ComplaintDetailsProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [users, setUsers] = useState<Array<{ id: string; name: string; role?: string }>>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Prvo proveravamo status sesije
  if (sessionStatus === "loading") {
    return <Loader2 className="animate-spin mx-auto mt-8" />;
  }

  // Definisanje promenljivih nakon provere sesije
  const user = session?.user;
  const role = user?.role;
  const userId = user?.id;

  // Ispravna provera pristupa sa String konverzijom
  const hasAccess = !!user && (
    role === "ADMIN" ||
    String(complaint.userId) === String(userId) ||
    (complaint.assignedToId && String(complaint.assignedToId) === String(userId))
  );

  // Status i permisije
  const status = statusMap[complaint.status];
  const isAdmin = role === "ADMIN";
  const isAssignedAgent = Boolean(
    complaint.assignedToId && 
    String(complaint.assignedToId) === String(userId)
  );
  const canResolve = (isAdmin || isAssignedAgent) && !complaint.resolution;
  const canComment = hasAccess && complaint.status !== ComplaintStatus.CLOSED;

  // Funkcija za osvežavanje podataka o reklamaciji
  const refreshComplaintData = async () => {
    try {
      setIsRefreshing(true);
      // Ovde biste implementirali logiku za ponovno učitavanje podataka o reklamaciji
      // Na primer, možete emitovati event ili koristiti neki drugi mehanizam ažuriranja
      setIsRefreshing(false);
      // Ovde bi trebalo dodati kod za zaista osvežavanje podataka o reklamaciji
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Greška pri osvežavanju podataka";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsUsersLoading(true);
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        });
        
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        console.log("Učitani korisnici:", data); // Dodato za debugging
        
        // Ne filtriramo ovde jer API već treba da vrati samo agente
        setUsers(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nepoznata greška";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsUsersLoading(false);
      }
    };

    if (isAdmin && userId && session?.user) {
      fetchUsers();
    }
  }, [isAdmin, userId, session?.user]);

  if (!hasAccess) {
    return (
      <div className="p-4 text-center text-yellow-600 border rounded-lg bg-yellow-50 max-w-md mx-auto mt-8">
        <p className="font-medium">Nemate dozvolu za pristup</p>
        <p className="text-sm mt-2">
          Samo administrator, dodeljeni agent ili vlasnik reklamacije mogu pristupiti.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
              <Badge variant="outline" className="capitalize">
                {typeIconMap[complaint.type]}
                <span className="ml-1">
                  {complaint.type.toLowerCase().replace("_", " ")}
                </span>
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
              Proizvod:{" "}
              <span className="font-medium">{complaint.product.name}</span>
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
                  <AvatarFallback>
                    {complaint.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {complaint.user.name || complaint.user.email}
                </span>
              </div>

              {/* Dodata provera za assignedTo */}
              {complaint.assignedTo && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-1">Obrađuje:</span>
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={complaint.assignedTo.image || undefined} />
                    <AvatarFallback>
                      {complaint.assignedTo?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {complaint.assignedTo?.name}
                  </span>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="pt-4">
                {isUsersLoading ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Učitavam korisnike...
                  </div>
                ) : users.length > 0 ? (
                  <AssignOwner
                    complaintId={complaint.id}
                    users={users}
                    onAssignmentSuccess={() => {
                      toast.success("Uspešno dodeljeno!");
                      refreshComplaintData();
                    }}
                    onError={(message) => {
                      toast.error(message);
                      setError(message);
                    }}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Nema dostupnih agenata za dodelu
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    
    {/* Additional cards for resolution, attachments, comments, and history */}
    {complaint.resolution && (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            {complaint.status === status.RESOLVED ? (
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
    
    {canResolve && !complaint.resolution && <ResolveForm complaintId={complaint.id} />}
    
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
        
        {canComment && complaint.status !== status.CLOSED && <CommentForm complaintId={complaint.id} />}
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