// Path: components/complaints/ComplaintForm.tsx
"use client";

import { useState, useEffect } from 'react';
// Removed useRouter as redirection logic moves to wrapper
// import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Complaint } from '@prisma/client';
// Ensure these imports are correct and schemas/complaint.ts is updated
import { ComplaintSchema, ComplaintFormData } from '@/schemas/complaint';
import { ServiceSelection } from './ServiceSelection';
// ProductSelection import remains commented out as per your request
// import { ProductSelection } from './ProductSelection';
import { FileUpload } from './FileUpload'; // Keep if you still use attachments
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// Removed direct toast import, wrapper handles toasts
// import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Removed direct action imports, wrapper handles actions
// import { createComplaint } from '@/actions/complaints/create';
// import { updateComplaint } from '@/actions/complaints/update';


interface ComplaintFormProps {
  complaint?: Complaint | null;
  // Removed onSubmitSuccess and onCancel, wrapper handles outcome
  // onSubmitSuccess?: (complaint: Complaint) => void;
  // onCancel?: () => void;
  providersData?: { id: string; name: string }[];
  isSubmitting?: boolean;
  // NEW: Add an onSubmit prop that takes form data
  onSubmit: (data: ComplaintFormData) => Promise<void>; // Or Promise<any> depending on wrapper's handleSubmit return
}

export function ComplaintForm({
  complaint,
  // Removed onSubmitSuccess and onCancel from props
  // onSubmitSuccess,
  // onCancel,
  providersData = [],
  isSubmitting = false, // Default to false if not provided
  onSubmit, // NEW: Accept onSubmit prop
}: ComplaintFormProps) {
  // Removed useRouter
  // const router = useRouter();

  // Removed local submitting state, controlled by parent via isSubmitting prop
  // const [isSubmittingLocally, setIsSubmittingLocally] = useState(false);
  // const actualIsSubmitting = parentIsSubmitting || isSubmittingLocally;
  const actualIsSubmitting = isSubmitting;


  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(ComplaintSchema), // Use the updated schema
    defaultValues: {
      title: complaint?.title || '',
      description: complaint?.description || '',
      priority: complaint?.priority || 3,
      serviceId: complaint?.serviceId || '',
      // productId removed from here as it's not in the form
      // productId: complaint?.productId || '',
      providerId: complaint?.providerId || '',
      // Use nullish coalescing for financialImpact default
      financialImpact: complaint?.financialImpact ?? 0,
    },
  });

  const watchedProviderId = form.watch('providerId');
  // watchedServiceId is no longer needed for product field visibility
  // const watchedServiceId = form.watch('serviceId');

  useEffect(() => {
    if (complaint) {
      form.reset({
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        serviceId: complaint.serviceId || '',
        // productId removed from reset
        // productId: complaint.productId || '',
        providerId: complaint.providerId || '',
        // Use nullish coalescing for default
        financialImpact: complaint.financialImpact ?? 0,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 3,
        serviceId: '',
        // productId removed from reset
        // productId: '',
        providerId: '',
        financialImpact: 0, // Default for new form
      });
    }
    // Removed watchedServiceId from dependencies
  }, [complaint, form]);


  // KORIGOVANO: Internal onSubmit now calls the onSubmit prop
  const handleFormSubmit = async (data: ComplaintFormData) => {
      // Call the onSubmit prop passed from the parent (wrapper)
      await onSubmit(data);
      // The parent (wrapper) is responsible for handling loading state, toasts, and redirection
  };


  const handleProviderChange = (providerId: string) => {
      form.setValue('providerId', providerId, { shouldValidate: true });
      form.setValue('serviceId', '', { shouldValidate: true });
      // productId logic removed
      // form.setValue('productId', '', { shouldValidate: true });
  };

  const handleServiceChange = (serviceId: string) => {
    form.setValue('serviceId', serviceId, { shouldValidate: true });
    // productId logic removed
    // form.setValue('productId', '', { shouldValidate: true });
  };


  return (
    // Adjusted Card width - you can change max-w-3xl to max-w-5xl or w-full
    <Card className="w-full max-w-3xl mx-auto"> {/* Added mx-auto for centering */}
      <CardHeader>
        <CardTitle>{complaint ? 'Edit Complaint' : 'Submit New Complaint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* KORIGOVANO: form onSubmit calls the new handleFormSubmit */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter complaint title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail"
                      className="min-h-[120px]"
                      {...field}
                      // Ensure value is always a string for Textarea
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      // Ensure value is string for Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Critical</SelectItem>
                        <SelectItem value="2">2 - High</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Low</SelectItem>
                        <SelectItem value="5">5 - Very Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financialImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Impact</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        // Ensure value is number or null/undefined for number input
                        value={field.value ?? ''}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? null : value); // Store as number or null
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={handleProviderChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providersData.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                      {providersData.length === 0 && (
                        <SelectItem value="" disabled>No providers available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
               )}
            />

            {/* Service Selection field is conditionally rendered based on watchedProviderId */}
            {watchedProviderId && (
                <FormField
                 control={form.control}
                 name="serviceId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Service</FormLabel>
                     <FormControl>
                       <ServiceSelection
                           providerId={watchedProviderId}
                           selectedServiceId={field.value}
                           onServiceSelect={(id) => handleServiceChange(id)}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            )}

            {/* Product FormField block is removed */}

            {/* File Upload is conditionally shown if not editing a complaint */}
            {!complaint && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <FileUpload /> {/* Ensure FileUpload component exists and works */}
              </div>
            )}

            <CardFooter className="flex justify-end space-x-2 px-0">
              {/* Removed Cancel button logic from form, can be added in wrapper if needed */}
              {/* {onCancel && (
                <Button variant="outline" type="button" onClick={onCancel} disabled={actualIsSubmitting}>
                  Cancel
                </Button>
              )} */}
              <Button type="submit" disabled={actualIsSubmitting}>
                {actualIsSubmitting ? 'Submitting...' : complaint ? 'Update Complaint' : 'Submit Complaint'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
