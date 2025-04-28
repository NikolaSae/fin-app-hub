// /components/services/ServiceForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Uvozimo AŽURIRANU Zod šemu i tip za podatke servisa
import { serviceSchema, ServiceFormData } from '@/schemas/service'; // serviceSchema sada ima 'type'
// Uvozimo AŽURIRANE Server Akcije za kreiranje i ažuriranje servisa
import { createService } from '@/actions/services/create'; // Pretpostavljamo da postoji i treba ažuriranje
import { updateService } from '@/actions/services/update'; // Pretpostavljamo da postoji i treba ažuriranje
// Uvozimo tip za Servis sa detaljima (ako je potreban za initialData)
import { ServiceWithDetails } from '@/lib/types/service-types';
// Uvozimo ServiceType enum iz Prisma klijenta za Select opcije
import { ServiceType } from '@prisma/client';


// Uvozimo UI komponente iz Shadcn UI
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Za izbor tipa
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';


interface ServiceFormProps {
    // Ako se forma koristi za izmenu, prosleđuju se inicijalni podaci i ID
    initialData?: ServiceWithDetails | null;
    serviceId?: string;
}

/**
 * Reusable form component for creating or editing a service.
 * Uses react-hook-form and zod for validation.
 * Calls createService or updateService server actions.
 * Usklađen sa Service modelom u schema.prisma i ažuriranom serviceSchema.
 */
export function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
    const router = useRouter();
    const { toast } = useToast();

    // Definisanje forme sa zodResolver-om i AŽURIRANOM šemom
    const form = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema), // Koristimo ažuriranu serviceSchema
        defaultValues: {
            // Postavljamo podrazumevane vrednosti
            name: initialData?.name || '',
            type: initialData?.type || undefined, // Polje je sada 'type', može biti undefined inicijalno
            description: initialData?.description || '',
            isActive: initialData?.isActive ?? true, // Podrazumevano true
            // Polja vasParameters, unitOfMeasure, parkingZone, notes - UKLONJENA jer NISU na Service modelu u schema.prisma
        },
    });

     // Resetovanje forme kada se initialData promeni (npr. pri navigaciji između edit stranica)
     useEffect(() => {
         if (initialData) {
              form.reset({
                   name: initialData.name || '',
                   type: initialData.type || undefined,
                   description: initialData.description || '',
                   isActive: initialData.isActive ?? true,
              });
         } else {
             // Reset na prazne vrednosti ako nema initialData (za new formu)
             form.reset({
                 name: '',
                 type: undefined,
                 description: '',
                 isActive: true,
             });
         }
     }, [initialData, form]); // Dodajemo 'form' kao zavisnost

    // State za praćenje statusa slanja forme
    const [isLoading, setIsLoading] = useState(false);

    // Rukovalac slanja forme
    const onSubmit = async (values: ProductFormData) => { // BITNO: OBAVEZNO KORISTITI ServiceFormData ovde, ne ProductFormData!
         // Ispravka tipa:
         const serviceValues = values as ServiceFormData;

        setIsLoading(true);
        let result;

        if (serviceId) {
            // Forma za izmenu: pozivamo updateService Server Akciju
             // Action updateService je ažurirana i očekuje ID i values
            result = await updateService(serviceId, serviceValues);
        } else {
            // Forma za kreiranje: pozivamo createService Server Akciju
             // Action createService je ažurirana i očekuje values
            result = await createService(serviceValues);
        }

        setIsLoading(false);

        // Prikazivanje toast notifikacije
        if (result?.success) {
            toast({
                title: 'Success!',
                description: result.success,
            });
            // Preusmeravanje nakon uspeha (npr. na stranicu liste ili detalja)
            router.push(`/services/${serviceValues.type}/${result.id || serviceId}`); // Možda navigacija zavisi od tipa? Ili samo na listu?
            // Primer navigacije na listu svih servisa:
             router.push(`/services`);
            router.refresh(); // Osvežavanje rute
        } else if (result?.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
            // Opciono: prikaži detalje greške iz Zod validacije ako ih akcija vrati
            if (result.details) {
                console.error('Validation details:', result.details);
                // Možete setovati greške na form fields koristeći form.setError
            }
        }
    };


    return (
        <Card>
             <CardHeader>
                 {/* Naslov zavisi da li se radi o kreiranju ili izmeni */}
                 <CardTitle>{serviceId ? 'Edit Service' : 'Create Service'}</CardTitle>
                 <p className="text-sm text-muted-foreground">
                     {serviceId ? `Edit details for service ID: ${serviceId}` : 'Fill in the details for a new service.'}
                 </p>
             </CardHeader>
             <CardContent>
                {/* Omotajte formu Shadcn Form kontextom */}
                <Form {...form}>
                    {/* Definisanje HTML forme */}
                    {/* U onSubmit rukovaocu koristimo form.handleSubmit(onSubmit) */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Polje: Name */}
                        <FormField
                            control={form.control}
                            name="name" // Usklađeno sa serviceSchema
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Service Name" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Polje: Type (Select za ServiceType enum) */}
                         <FormField
                             control={form.control}
                             name="type" // Usklađeno sa serviceSchema, polje je 'type'
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Service Type</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !!serviceId}> {/* Onemogućite promenu tipa na edit formi */}
                                         <FormControl>
                                             <SelectTrigger>
                                                 <SelectValue placeholder="Select service type" />
                                             </SelectTrigger>
                                         </FormControl>
                                         <SelectContent>
                                              {/* Mapiramo vrednosti iz ServiceType enum-a */}
                                             {Object.values(ServiceType).map(type => (
                                                 <SelectItem key={type} value={type}>
                                                      {/* Prikaz za ServiceType */}
                                                     {type.replace(/_/g, ' ')} {/* Npr. "VAS" -> "VAS", "HUMANITARIAN" -> "HUMANITARIAN" */}
                                                 </SelectItem>
                                             ))}
                                         </SelectContent>
                                     </Select>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />


                        {/* Polje: Description (Textarea) */}
                        <FormField
                            control={form.control}
                            name="description" // Usklađeno sa serviceSchema
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Service description..."
                                            {...field}
                                            disabled={isLoading}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Polje: isActive (Checkbox) */}
                        <FormField
                            control={form.control}
                            name="isActive" // Usklađeno sa serviceSchema
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Is Active
                                        </FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Polja price, vasParameters, unitOfMeasure, parkingZone, notes su UKLONJENA
                         jer NISU na Service modelu u schema.prisma.
                         Ako ova polja treba da se unose za specifične tipove servisa, treba ih
                         rukovati u formi koja je specifična za taj tip (npr. VasServiceForm)
                         ili dodati u schema.prisma Service model. */}


                        {/* Dugme za slanje forme */}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (serviceId ? 'Saving...' : 'Creating...') : (serviceId ? 'Save Changes' : 'Create Service')}
                        </Button>

                    </form>
                </Form>
             </CardContent>
             {/* Opciono: CardFooter */}
              {/* <CardFooter>
                  <p className="text-xs text-muted-foreground">Last updated: {initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleString() : 'N/A'}</p>
             </CardFooter> */}
        </Card>
    );
}