// /components/complaints/ComplaintForm.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Complaint, ComplaintStatus } from '@prisma/client';
import { complaintSchema } from '@/schemas/complaint';
import { ServiceSelection } from './ServiceSelection';
import { ProductSelection } from './ProductSelection';
import { FileUpload } from './FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createComplaint } from '@/actions/complaints/create';
import { updateComplaint } from '@/actions/complaints/update';

interface ComplaintFormProps {
  complaint?: Complaint | null;
  onSubmitSuccess?: (complaint: Complaint) => void;
  onCancel?: () => void;
}

export function ComplaintForm({ complaint, onSubmitSuccess, onCancel }: ComplaintFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(complaint?.serviceId || null);
  
  const form = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: complaint?.title || '',
      description: complaint?.description || '',
      priority: complaint?.priority || 3,
      serviceId: complaint?.serviceId || '',
      productId: complaint?.productId || '',
      providerId: complaint?.providerId || '',
      financialImpact: complaint?.financialImpact || 0,
    },
  });

  // Reset form when complaint changes
  useEffect(() => {
    if (complaint) {
      form.reset({
        title: complaint.title,
        description: complaint.description,
        priority: complaint.priority,
        serviceId: complaint.serviceId || '',
        productId: complaint.productId || '',
        providerId: complaint.providerId || '',
        financialImpact: complaint.financialImpact || 0,
      });
      setSelectedServiceId(complaint.serviceId || null);
    }
  }, [complaint, form]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      let result;
      if (complaint) {
        result = await updateComplaint({
          id: complaint.id,
          ...data,
        });
      } else {
        result = await createComplaint(data);
      }
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: complaint ? 'Complaint updated successfully' : 'Complaint created successfully',
        });
        
        if (onSubmitSuccess) {
          onSubmitSuccess(result.complaint);
        } else if (result.complaint?.id) {
          // Instead of letting the server handle redirection,
          // navigate programmatically on the client side
          router.push(`/complaints/${result.complaint.id}`);
        }
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      // Check if it's a redirection error
      if (error.message === 'NEXT_REDIRECT' && error.digest) {
        const redirectParts = error.digest.split(';');
        if (redirectParts.length >= 3) {
          const redirectUrl = redirectParts[2];
          // Handle the redirection on the client side
          router.push(redirectUrl);
          return;
        }
      }
      
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    form.setValue('serviceId', serviceId);
    // Reset product when service changes
    form.setValue('productId', '');
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{complaint ? 'Edit Complaint' : 'Submit New Complaint'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      defaultValue={field.value.toString()}
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <ServiceSelection 
                      selectedServiceId={field.value} 
                      onServiceSelect={(id) => handleServiceChange(id)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedServiceId && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <ProductSelection 
                        serviceId={selectedServiceId} 
                        selectedProductId={field.value}
                        onProductSelect={(id) => field.onChange(id)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Provider options would be loaded dynamically */}
                      {/* This would typically use data fetched from an API */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!complaint && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <FileUpload />
              </div>
            )}

            <CardFooter className="flex justify-end space-x-2 px-0">
              {onCancel && (
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : complaint ? 'Update Complaint' : 'Submit Complaint'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}