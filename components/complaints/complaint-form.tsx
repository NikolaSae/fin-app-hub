// components/complaints/complaint-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { ComplaintFormSchema, ComplaintFormValues } from "@/schemas";
import { createComplaint } from "@/actions/complaints";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintType, Priority } from "@prisma/client";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

interface Product {
  id: string;
  name: string;
}

interface ComplaintFormProps {
  products: Product[];
  users: Array<{ id: string; name: string }>;
}

export function ComplaintForm({ products }: ComplaintFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(ComplaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: ComplaintType.PRODUCT_DEFECT,
      priority: Priority.MEDIUM,
      productId: undefined,
      assignedToId: undefined,
    },
  });

  const onSubmit = async (values: ComplaintFormValues) => {
    setError(undefined);
    setSuccess(undefined);
    setIsPending(true);

    try {
      const response = await createComplaint(values);

      if (response.error) {
        setError(response.error);
      }

      if (response.success) {
        setSuccess(response.success);
        form.reset();
        setTimeout(() => {
          router.push(`/complaints/${response.complaintId}`);
        }, 1000);
      }
    } catch (err) {
      setError("Došlo je do greške prilikom slanja reklamacije.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nova reklamacija</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naslov reklamacije</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Kratak opis problema"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zaduženi korisnik</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite korisnika" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Izaberite korisnika koji je zadužen za ovu reklamaciju
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip reklamacije</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Izaberite tip reklamacije" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ComplaintType.PRODUCT_DEFECT}>Neispravan proizvod</SelectItem>
                        <SelectItem value={ComplaintType.SERVICE_ISSUE}>Problem sa uslugom</SelectItem>
                        <SelectItem value={ComplaintType.DELIVERY_PROBLEM}>Problem sa dostavom</SelectItem>
                        <SelectItem value={ComplaintType.BILLING_ISSUE}>Problem sa naplatom</SelectItem>
                        <SelectItem value={ComplaintType.OTHER}>Ostalo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritet</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Izaberite prioritet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Priority.LOW}>Nizak</SelectItem>
                        <SelectItem value={Priority.MEDIUM}>Srednji</SelectItem>
                        <SelectItem value={Priority.HIGH}>Visok</SelectItem>
                        <SelectItem value={Priority.CRITICAL}>Kritičan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {products.length > 0 && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proizvod / Usluga</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Izaberite proizvod ili uslugu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Izaberite proizvod ili uslugu na koju se odnosi reklamacija
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detaljni opis</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Detaljno opišite problem..."
                      rows={5}
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
      <CardFooter className="flex justify-between">
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
          Pošalji reklamaciju
        </Button>
      </CardFooter>
    </Card>
  );
}