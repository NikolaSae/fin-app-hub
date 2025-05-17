//app/(protected)/parking-services/[id]/edit/page.tsx

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getParkingServiceById } from "@/actions/parking-services/getParkingServiceById";
import { update } from "@/actions/parking-services/update";
import ParkingServiceForm from "@/components/parking-services/ParkingServiceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { UpdateParkingServiceParams } from "@/lib/types/parking-service-types"; // Import the type

export const metadata: Metadata = {
  title: "Edit Parking Service | Contract Management System",
  description: "Edit parking service details in the contract management system",
};

export default async function EditParkingServicePage({
  params,
}: {
  params: { id: string };
}) {
  // Await params before accessing its properties
  const { id } = await params;

  // Fetch the parking service using the awaited id
  const parkingServiceResult = await getParkingServiceById(id);

  // Check if the fetch was successful and data exists
  if (!parkingServiceResult.success || !parkingServiceResult.data) {
    // If not found or error, call notFound()
    notFound();
  }

  // Extract the parking service data
  const parkingService = parkingServiceResult.data;

  // Server action to update the parking service
  async function updateParkingServiceAction(formData: FormData) {
    "use server";

    const rawData = Object.fromEntries(formData.entries());

    // Process boolean fields and ensure ID is included using the awaited id
    const data: UpdateParkingServiceParams = {
      ...rawData,
      id: id, // Use the awaited id
      isActive: rawData.isActive === "on" || rawData.isActive === "true",
    } as UpdateParkingServiceParams; // Type assertion to match expected type

    try {
      // Call the update action with the data including the awaited id
      const result = await update(data);

      // Redirect to the parking service details page if successful
      if (result.success) {
        // Use the awaited id in the redirect path
        redirect(`/parking-services/${id}`);
      }

      // Return the result for client-side handling (e.g., displaying errors)
      return result;
    } catch (error) {
      console.error("Error updating parking service:", error);
      // Return a consistent error structure
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update parking service. Please try again."
      };
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={`Edit ${parkingService.name}`}
        description="Update parking service details"
        backLink={{
          // Use the awaited id in the backLink href
          href: `/parking-services/${id}`,
          label: "Back to Service Details",
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Parking Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ParkingServiceForm
            // Pass the server action function
            action={updateParkingServiceAction}
            // Pass the fetched initial data
            initialData={parkingService}
            // Indicate that the form is for editing
            isEditing={true}
            submitLabel="Update Parking Service"
          />
        </CardContent>
      </Card>
    </div>
  );
}
