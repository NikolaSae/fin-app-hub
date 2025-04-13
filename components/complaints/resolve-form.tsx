// components/complaints/resolve-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ResolveComplaintFormSchema, ResolveComplaintFormValues } from "@/schemas";
import { resolveComplaint } from "@/actions/complaints";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComplaintStatus } from "@prisma/client";

interface ResolveFormProps {
  complaintId: string;
}

export function ResolveForm({ complaintId }: ResolveFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ResolveComplaintFormValues>({
    resolver: zodResolver(ResolveComplaintFormSchema),
    defaultValues: {
      resolution: "",
      status: ComplaintStatus.RESOLVED,
    },
  });

  const onSubmit = async (values: ResolveComplaintFormValues) => {
    setIsPending(true);
    
    toast.promise(
      resolveComplaint(complaintId, values),
      {
        loading: "Procesiram rešenje reklamacije...",
        success: (response) => {
          if (response?.error) {
            throw new Error(response.error);
          }
          router.refresh();
          return "Reklamacija uspešno rešena";
        },
        error: (error) => error.message || "Došlo je do greške prilikom obrade",
        finally: () => setIsPending(false)
      }
    );
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