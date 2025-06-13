//components/parking-services/ParkingServiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ParkingService } from "@prisma/client";
import { create } from "@/actions/parking-services/create";
import { update } from "@/actions/parking-services/update";

interface ParkingServiceFormProps {
  initialData?: ParkingService & { additionalEmails?: string[] };
  isEditing?: boolean;
  submitLabel?: string;
}

export default function ParkingServiceForm({
  initialData,
  isEditing = false,
  submitLabel = isEditing ? "Update Parking Service" : "Create Parking Service"
}: ParkingServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createParkingServiceSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      additionalEmails: "",
      phone: "",
      address: "",
      description: "",
      isActive: true,
      ...initialData,
      additionalEmails: initialData?.additionalEmails?.join(", ") || ""
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        additionalEmails: initialData.additionalEmails?.join(", ") || ""
      });
    }
  }, [initialData, form]);

  const onSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      const additionalEmailsArray = formData.additionalEmails
        ? formData.additionalEmails.split(',').map((email: string) => email.trim()).filter(Boolean)
        : [];

      const serverData = {
        ...formData,
        additionalEmails: additionalEmailsArray
      };

      let result;
      if (isEditing && initialData?.id) {
        result = await update({ 
          ...serverData, 
          id: initialData.id 
        });
      } else {
        result = await create(serverData);
      }

      if (result?.success) {
        toast.success(
          isEditing 
            ? "Parking service updated successfully" 
            : "Parking service created successfully"
        );
        router.push(result.data?.id ? `/parking-services/${result.data.id}` : '/parking-services');
      } else {
        toast.error(result?.error || (isEditing 
          ? "Failed to update parking service" 
          : "Failed to create parking service"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
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
                  <Input placeholder="Enter contact person's name" {...field} value={field.value || ""} />
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
                <FormLabel>Primary Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter primary email"
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
            name="additionalEmails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Emails</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Separate multiple emails with commas
                </p>
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
            {isSubmitting ? "Processing..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}