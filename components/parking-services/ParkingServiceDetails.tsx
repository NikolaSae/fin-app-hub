//components/parking-services/ParkingServiceDetails.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileEdit,
  Trash,
  AlertCircle,
} from "lucide-react";
import { ParkingServiceDetail } from "@/lib/types/parking-service-types";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteService } from "@/actions/parking-services/delete";
import { toast } from "sonner";
// Import the actual ParkingServiceContracts component if it's defined in a separate file
import ParkingServiceContracts from "@/components/parking-services/ParkingServiceContracts";


interface ParkingServiceDetailsProps {
  parkingService: ParkingServiceDetail;
}

export default function ParkingServiceDetails({
  parkingService,
}: ParkingServiceDetailsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteService(parkingService.id);

      if (result.success) {
        toast.success(result.message || "Parking service deleted successfully");
        router.push("/parking-services");
      } else {
        toast.error(result.error || "Failed to delete parking service");
      }

    } catch (error) {
      console.error("Error deleting parking service:", error);
      toast.error("An unexpected error occurred while deleting the parking service.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {parkingService.name}
            <Badge variant={parkingService.isActive ? "default" : "secondary"}>
              {parkingService.isActive ? "Active" : "Inactive"}
            </Badge>
          </h1>
          {parkingService.description && (
            <p className="mt-2 text-muted-foreground">{parkingService.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/parking-services/${parkingService.id}/edit`)}
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  parking service and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parkingService.contactName && (
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-28">Contact Person:</span>
                <span>{parkingService.contactName}</span>
              </div>
            )}
            {parkingService.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span>{parkingService.email}</span>
              </div>
            )}
            {parkingService.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span>{parkingService.phone}</span>
              </div>
            )}
            {parkingService.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <span>{parkingService.address}</span>
              </div>
            )}
            {!parkingService.contactName &&
             !parkingService.email &&
             !parkingService.phone &&
             !parkingService.address && (
              <div className="flex items-center text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2" />
                No contact information available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground mr-1">Created:</span>
                <span>{formatDate(parkingService.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground mr-1">Last Updated:</span>
                <span>{formatDate(parkingService.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Associated Contracts</CardTitle>
              <Link href={`/contracts/new?parkingServiceId=${parkingService.id}`}>
                <Button variant="outline" size="sm">
                  Add Contract
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div id="contracts-container">
               {/* Render the actual ParkingServiceContracts component here */}
               <ParkingServiceContracts parkingServiceId={parkingService.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Removed the ParkingServiceContractsPlaceholder component definition
