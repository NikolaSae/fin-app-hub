// Path: components/complaints/ComplaintFormWrapper.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { createComplaint } from "@/actions/complaints/create"; // Ensure this path is correct
import { ComplaintFormData } from "@/schemas/complaint"; // Ensure this path is correct
import { toast } from "sonner"; // Assuming you are using sonner for toasts
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type getProviders } from "@/actions/complaints/providers"; // Ensure this path is correct

interface ComplaintFormWrapperProps {
    providersData: Awaited<ReturnType<typeof getProviders>>;
    // If this wrapper is also used for editing, you would add:
    // complaint?: Complaint | null;
}

export function ComplaintFormWrapper({ providersData }: ComplaintFormWrapperProps) {
    const router = useRouter();
    // useTransition provides the isPending state automatically
    const [isPending, startTransition] = useTransition();

    // This function is passed down to the ComplaintForm's onSubmit prop
    const handleFormSubmit = async (data: ComplaintFormData) => {
        // startTransition marks the state update (isPending) as a transition
        startTransition(async () => {
            // Call the server action to create the complaint
            const result = await createComplaint(data);

            // Log the result from the server action for debugging
            console.log("Result from createComplaint action:", result);

            if (result?.error) {
                // Display error toast if the action returned an error
                toast.error(result.error || "Failed to create complaint");
            } else if (result?.complaint?.id) {
                // Display success toast if the action returned a created complaint with an ID
                toast.success("Complaint created successfully");
                // Log before attempting redirection
                console.log(`Complaint created with ID: ${result.complaint.id}. Attempting redirection...`);
                // Redirect to the new complaint's detail page
                router.push(`/complaints/${result.complaint.id}`);
                // Alternatively, redirect to the complaints list:
                // router.push('/complaints');
            } else {
                 // Handle unexpected cases where there's no error but also no complaint ID
                 toast.info("Complaint submission finished, but no specific result was returned.");
            }
        });
    };

    const handleCancel = () => {
        // Logic for the cancel button
        router.back(); // Go back to the previous page
        // Or redirect to a specific page: router.push('/complaints');
    };

    return (
        <div className="space-y-6 container mx-auto py-8"> {/* Added container/py for spacing */}
            <div className="flex items-center gap-4">
                {/* Back button */}
                <Button
                    variant="ghost"
                    onClick={handleCancel} // Use handleCancel for the back button
                    className="p-0 h-auto"
                    disabled={isPending} // Disable while submitting
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold">Create New Complaint</h1>
            </div>
            {/* Render the ComplaintForm, passing necessary props */}
            <ComplaintForm
                // Pass the submission handler from the wrapper
                onSubmit={handleFormSubmit}
                // Pass the isPending state from useTransition for loading indication
                isSubmitting={isPending}
                // Pass provider data fetched on the server
                providersData={providersData}
                // If this wrapper is used for editing, pass the complaint prop:
                // complaint={complaint}
                // If you want a separate Cancel button in the form footer, pass handleCancel:
                 onCancel={handleCancel}
            />
        </div>
    );
}
