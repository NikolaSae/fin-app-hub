// components/operators/OperatorForm.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { operatorSchema, type OperatorFormValues } from "@/schemas/operator";
import { createOperator, updateOperator } from "@/actions/operators";
import { Operator } from "@prisma/client";

interface OperatorFormProps {
  operator?: Operator;
}

export function OperatorForm({ operator }: OperatorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we're editing or creating
  const isEditing = !!operator;

  // Initialize form with existing operator data or defaults
  const form = useForm<OperatorFormValues>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      name: operator?.name || "",
      code: operator?.code || "",
      description: operator?.description || "",
      logoUrl: operator?.logoUrl || "",
      website: operator?.website || "",
      contactEmail: operator?.contactEmail || "",
      contactPhone: operator?.contactPhone || "",
      active: operator?.active ?? true,
    },
  });

  async function onSubmit(data: OperatorFormValues) {
    try {
      setIsLoading(true);
      
      if (isEditing && operator) {
        // Update existing operator
        await updateOperator(operator.id, data);
        toast.success("Operator updated successfully");
        router.push(`/operators/${operator.id}`);
      } else {
        // Create new operator
        const newOperator = await createOperator(data);
        toast.success("Operator created successfully");
        router.push(`/operators/${newOperator.id}`);
      }
    } catch (error) {
      console.error("Error saving operator:", error);
      toast.error("Failed to save operator. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter operator name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter unique code" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for the operator
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter operator description"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive operators won't be available for new contracts
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isEditing && operator) {
                    router.push(`/operators/${operator.id}`);
                  } else {
                    router.push("/operators");
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Operator" : "Create Operator"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}