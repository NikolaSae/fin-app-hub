// components/complaints/resolve-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { ResolveComplaintFormSchema, ResolveComplaintFormValues } from "@/schemas";
import { resolveComplaint } from "@/actions/complaints";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ComplaintStatus } from "@prisma/client";

interface ResolveFormProps {
  complaintId: string;
}

export function ResolveForm({ complaintId }: ResolveFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ResolveComplaintFormValues>({
    resolver: zodResolver(ResolveComplaintFormSchema),
    defaultValues: {
      resolution: "",
      status: ComplaintStatus.RESOLVED,
    },
  });

  const onSubmit = async (values: ResolveComplaintFormValues) => {
    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);

    try {
      const response = await resolveComplaint(complaintId, values);

      if (response.error) {
        setError(response.error);
      }

      if (response.success) {
        setSuccess(response.success);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setError("Došlo je do greške prilikom rešavanja reklamacije.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rešenje reklamacije</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status reklamacije</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ComplaintStatus.RESOLVED}>Prihvaćena / Rešena</SelectItem>
                      <SelectItem value={ComplaintStatus.REJECTED}>Odbijena</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rešenje</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Opišite kako je rešen problem ili zašto je reklamacija odbijena..."
                      rows={4}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormError message={error} />
            <FormSuccess message={success} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isPending}
        >
          Odustani
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
        >
          Potvrdi rešenje
        </Button>
      </CardFooter>
    </Card>
  );
}