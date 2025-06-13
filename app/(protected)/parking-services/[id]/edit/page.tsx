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
  
  // Process additional emails
  const additionalEmails = rawData.additionalEmails
    ? (rawData.additionalEmails as string).split(',').map(email => email.trim()).filter(Boolean)
    : [];

  // ✅ Build clean data object without spreading rawData
  const data: UpdateParkingServiceParams = {
    id,
    name: rawData.name as string,
    contactName: rawData.contactName as string || undefined,
    email: rawData.email as string || undefined,
    phone: rawData.phone as string || undefined,
    address: rawData.address as string || undefined,
    description: rawData.description as string || undefined,
    isActive: rawData.isActive === "on" || rawData.isActive === "true",
    additionalEmails, // Clean array
  };

  try {
    const result = await update(data);
    if (result.success) {
      redirect(`/parking-services/${id}`);
    }
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update parking service"
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
            initialData={{
              ...parkingService,
              // Convert array to comma-separated string for form input
              additionalEmails: parkingService.additionalEmails?.join(", ") || ""
            }}
            // Indicate that the form is for editing
            isEditing={true}
            submitLabel="Update Parking Service"
          />
        </CardContent>
      </Card>
    </div>
  );
}
