//components/parking-services/ParkingServiceForm.tsx


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Corrected import to use the schema that is actually exported and matches the form structure
import { createParkingServiceSchema } from "@/schemas/parking-service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ParkingServiceFormData } from "@/lib/types/parking-service-types";
// Imports for action functions - ensure these match the export names in your action files
import { create } from "@/actions/parking-services/create";
import { update } from "@/actions/parking-services/update";

interface ParkingServiceFormProps {
  initialData?: ParkingServiceFormData;
  isEditing?: boolean;
}

export default function ParkingServiceForm({
  initialData,
  isEditing = false
}: ParkingServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParkingServiceFormData>({
    // Use the correctly imported create schema for validation
    resolver: zodResolver(createParkingServiceSchema),
    defaultValues: initialData || {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: ParkingServiceFormData) => {
    try {
      setIsSubmitting(true);

      let result;
      if (isEditing && initialData?.id) {
        // Call the correctly imported update action
        // The update action expects the id along with the updated data
        result = await update({ id: initialData.id, ...data });
      } else {
        // Call the correctly imported create action
        // The create action expects the data for the new service
        result = await create(data);
      }

      if (result.success) {
         toast.success(isEditing ? "Parking service updated successfully" : "Parking service created successfully");
         // Redirect to the details page on success
         if (result.data?.id) {
            router.push(`/parking-services/${result.data.id}`);
         } else {
             // Fallback redirect if ID is not returned (shouldn't happen if action is correct)
             router.push('/parking-services');
         }
      } else {
         // Display error message from the action result
         toast.error(result.error || (isEditing ? "Failed to update parking service" : "Failed to create parking service"));
      }

      // router.refresh(); // router.push typically handles refresh for app router navigation

    } catch (error) {
      console.error("Error submitting form:", error);
      // Fallback toast for unexpected errors
      toast.error(isEditing
        ? "Failed to update parking service due to an unexpected error."
        : "Failed to create parking service due to an unexpected error."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter parking service name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact person's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter contact email"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact phone number"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter address"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter service description"
                    rows={4}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Set whether this parking service is currently active
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isEditing ? "Updating..." : "Creating..."
            ) : (
              isEditing ? "Update Parking Service" : "Create Parking Service"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
