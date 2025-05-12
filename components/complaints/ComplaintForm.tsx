// Path: components/complaints/ComplaintForm.tsx


// components/complaints/ComplaintForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Complaint } from '@prisma/client';
import { ComplaintSchema, ComplaintFormData } from '@/schemas/complaint';
import { ServiceSelection } from './ServiceSelection';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ComplaintFormProps {
  complaint?: Complaint | null;
  providersData?: { id: string; name: string }[];
  isSubmitting?: boolean;
  onSubmit: (data: ComplaintFormData) => Promise<void>;
}

export function ComplaintForm({
  complaint,
  providersData = [],
  isSubmitting = false,
  onSubmit,
}: ComplaintFormProps) {
  const actualIsSubmitting = isSubmitting;

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(ComplaintSchema),
    defaultValues: {
      title: complaint?.title || '',
      description: complaint?.description || '',
      priority: complaint?.priority || 3,
      serviceId: complaint?.serviceId || '',
      providerId: complaint?.providerId || '',
      financialImpact: complaint?.financialImpact ?? 0,
    },
  });

  const watchedProviderId = form.watch('providerId');

  useEffect(() => {
    if (complaint) {
      form.reset({
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        serviceId: complaint.serviceId || '',
        providerId: complaint.providerId || '',
        financialImpact: complaint.financialImpact ?? 0,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 3,
        serviceId: '',
        providerId: '',
        financialImpact: 0,
      });
    }
  }, [complaint, form]);

  const handleFormSubmit = async (data: ComplaintFormData) => {
    await onSubmit(data);
  };

  const handleProviderChange = (providerId: string) => {
    form.setValue('providerId', providerId, { shouldValidate: true });
    form.setValue('serviceId', '', { shouldValidate: true });
  };

  const handleServiceChange = (serviceId: string) => {
    form.setValue('serviceId', serviceId, { shouldValidate: true });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{complaint ? 'Edit Complaint' : 'Submit New Complaint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
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
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? null : value);
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
                      {/* FIX: Use a non-empty string value for the "No providers" option */}
                      {providersData.length === 0 && (
                        <SelectItem value="no-providers" disabled>No providers available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {!complaint && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <FileUpload />
              </div>
            )}

            <CardFooter className="flex justify-end space-x-2 px-0">
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