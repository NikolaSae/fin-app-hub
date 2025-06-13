//app/(protected)/parking-services/[id]/edit/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getParkingServiceById } from "@/actions/parking-services/getParkingServiceById";
import ParkingServiceForm from "@/components/parking-services/ParkingServiceForm";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Edit Parking Service | Contract Management System",
  description: "Edit parking service in the contract management system",
};

export default async function EditParkingServicePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const parkingServiceResult = await getParkingServiceById(id);
  
  if (!parkingServiceResult.success || !parkingServiceResult.data) {
    notFound();
  }
  
  const parkingService = parkingServiceResult.data;

<<<<<<< HEAD
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

=======
>>>>>>> 1dec103f1654c65550e3704a1fb8da634bb9dc80
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Edit Parking Service"
        description={`Edit ${parkingService.name}`}
        backLink={{
          href: `/parking-services/${id}`,
          label: "Back to Service Details",
        }}
      />
<<<<<<< HEAD

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
=======
      
      <div className="max-w-2xl">
        <ParkingServiceForm 
          initialData={parkingService}
          isEditing={true}
        />
      </div>
>>>>>>> 1dec103f1654c65550e3704a1fb8da634bb9dc80
    </div>
  );
}