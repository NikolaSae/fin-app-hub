//components/parking-services/ParkingServiceList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParkingServiceItem } from "@/lib/types/parking-service-types";
import { formatDate } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteService } from "@/actions/parking-services/delete"; // Corrected import name
import { toast } from "sonner";

interface ParkingServiceListProps {
  parkingServices: ParkingServiceItem[];
}

export default function ParkingServiceList({ parkingServices }: ParkingServiceListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const result = await deleteService(deleteId); // Corrected function call

      if(result.success){
        toast.success(result.message || "Parking service deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete parking service");
      }

    } catch (error) {
      toast.error("An unexpected error occurred during deletion.");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parkingServices.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No parking services found
              </TableCell>
            </TableRow>
          )}

          {parkingServices.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>
                {service.contactName}
                {service.email && <div className="text-xs text-muted-foreground">{service.email}</div>}
                {service.phone && <div className="text-xs text-muted-foreground">{service.phone}</div>}
              </TableCell>
              <TableCell>{service.address || "-"}</TableCell>
              <TableCell>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(service.createdAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  onClick={() => router.push(`/parking-services/${service.id}`)}
                  size="icon"
                  variant="ghost"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push(`/parking-services/${service.id}/edit`)}
                  size="icon"
                  variant="ghost"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the parking service
                        and remove associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}