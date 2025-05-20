// Path: components/complaints/ComplaintFormWrapper.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { createComplaint } from "@/actions/complaints/create";
import { ComplaintFormData } from "@/schemas/complaint";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type getProviders } from "@/actions/complaints/providers";

// Add these types to match the updated props
interface ComplaintFormWrapperProps {
    providersData: Awaited<ReturnType<typeof getProviders>>;
    humanitarianOrgsData: { id: string; name: string }[]; // Add this prop for humanitarian orgs
    parkingServicesData: { id: string; name: string }[]; // Add this prop for parking services
    // If this wrapper is also used for editing, you would add:
    // complaint?: Complaint | null;
    onCancel?: () => void;
}

export function ComplaintFormWrapper({ 
    providersData,
    humanitarianOrgsData, // Receive humanitarian orgs data
    parkingServicesData, // Receive parking services data
    onCancel 
}: ComplaintFormWrapperProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleFormSubmit = async (data: ComplaintFormData) => {
        startTransition(async () => {
            const result = await createComplaint(data);

            console.log("Result from createComplaint action:", result);

            if (result?.error) {
                toast.error(result.error || "Failed to create complaint");
            } else if (result?.complaint?.id) {
                toast.success("Complaint created successfully");
                console.log(`Complaint created with ID: ${result.complaint.id}. Attempting redirection...`);
                router.push(`/complaints/${result.complaint.id}`);
            } else {
                toast.info("Complaint submission finished, but no specific result was returned.");
            }
        });
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <div className="space-y-6 container mx-auto py-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="p-0 h-auto"
                    disabled={isPending}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold">Create New Complaint</h1>
            </div>
            <ComplaintForm
                onSubmit={handleFormSubmit}
                isSubmitting={isPending}
                providersData={providersData}
                humanitarianOrgsData={humanitarianOrgsData} // Pass humanitarian orgs data
                parkingServicesData={parkingServicesData} // Pass parking services data
                onCancel={handleCancel}
            />
        </div>
    );
}