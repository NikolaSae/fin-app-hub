// /components/providers/ProviderForm.tsx
"use client";

import { useState, useEffect } from "react"; // Import useEffect for potential form reset
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form"; // Import Controller
import { zodResolver } from "@hookform/resolvers/zod";

// Uvozimo stvarne server akcije za provajdere
import { createProvider } from "@/actions/providers/create"; // Should be exported now
import { updateProvider } from "@/actions/providers/update"; // Should be exported now

// Uvozimo stvarnu Zod šemu i TypeScript tipove za provajdere
import { providerSchema, ProviderFormData } from "@/schemas/provider";


// Uvozimo UI komponente iz Shadcn UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"; // Import Form components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; // Use Card structure
import { useToast } from "@/components/toast/toast-context"; // For notifications


interface ProviderFormProps {
    // Opcioni prop za editovanje (postojeći podaci provajdera)
    // Koristimo tip sa servera koji uključuje ID i datume
    provider?: {
        id: string;
        name: string;
        contactName: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        // Dodajte _count ako je uključen pri fetchovanju za edit
        // _count?: { contracts: number; vasServices: number; bulkServices: number; complaints: number; };
    };
    // isEditing prop je redundant ako prosleđujemo provider objekat
    // Možemo utvrditi da li je editing na osnovu toga da li provider postoji
    // isEditing?: boolean; // Uklanjamo ili zadržavamo po želji, ali je nepotreban
}

// Komponenta forme za kreiranje ili editovanje provajdera
export function ProviderForm({ provider }: ProviderFormProps) {
    const router = useRouter();
    const { toast } = useToast(); // Initialize useToast
    const [isLoading, setIsLoading] = useState(false);
    // Server greška će se rukovati kroz useToast ili prikazati unutar forme
    // const [serverError, setServerError] = useState<string | null>(null); // Uklanjamo ovo u korist useToast


    // Određujemo da li se forma koristi za editovanje na osnovu postojanja provider objekta
    const isEditing = !!provider;


    // Definisanje forme sa zodResolver-om i stvarnom šemom
    const form = useForm<ProviderFormData>({
        resolver: zodResolver(providerSchema), // Koristimo stvarnu Zod šemu
        defaultValues: isEditing && provider
            ? {
                name: provider.name,
                contactName: provider.contactName ?? '', // Mapiranje null/undefined na prazan string za formu
                email: provider.email ?? '',
                phone: provider.phone ?? '',
                address: provider.address ?? '',
                isActive: provider.isActive,
            }
            : {
                isActive: true, // Podrazumevano aktivan pri kreiranju
                name: '',
                contactName: '',
                email: '',
                phone: '',
                address: '',
            },
         mode: 'onSubmit', // Validacija pri slanju (opciono, možete koristiti 'onBlur' ili 'onChange')
         // reValidateMode: 'onBlur', // Opciono: re-validiraj pri gubitku fokusa
    });

     // Resetovanje forme kada se provider objekat promeni (npr. pri navigaciji između edit stranica)
     useEffect(() => {
         if (provider) {
              form.reset({
                   name: provider.name || '',
                   contactName: provider.contactName ?? '',
                   email: provider.email ?? '',
                   phone: provider.phone ?? '',
                   address: provider.address ?? '',
                   isActive: provider.isActive ?? true,
              });
         } else {
             // Reset na prazne vrednosti i default ako nema providera (za new formu)
             form.reset({
                 name: '',
                 contactName: '',
                 email: '',
                 phone: '',
                 address: '',
                 isActive: true,
             });
         }
     }, [provider, form]); // Dodajemo 'form' kao zavisnost


    const onSubmit = async (data: ProviderFormData) => {
        // setServerError(null); // Resetuj server grešku (višak sa useToast)
        setIsLoading(true);

        let result;
        if (isEditing && provider) {
            // Pozivanje STVARNE server akcije za ažuriranje
            result = await updateProvider(provider.id, data); // provider.id je sigurno definisan kada je isEditing true
        } else {
            // Pozivanje STVARNE server akcije za kreiranje
            result = await createProvider(data);
        }

        setIsLoading(false);

        // Rukovanje rezultatom server akcije i prikaz Toast notifikacija
        if (result?.success) {
            toast({
                title: 'Success!',
                description: result.success,
            });
            // Preusmeri na stranicu detalja ili listu nakon uspeha
            // Akcija createProvider vraća ID u result.id
            const newItemId = isEditing ? provider?.id : result.id;
            if (newItemId) {
                router.push(`/providers/${newItemId}`); // Preusmeri na detalje
            } else {
                router.push('/providers'); // Fallback na listu
            }
             router.refresh(); // Osveži cache rute

        } else {
            // Rukovanje greškom servera ili validacije iz akcije
            console.error("Failed to save provider:", result?.error);
            // Prikaz greške servera kao Toast notifikacija
             toast({
                  title: 'Error',
                  description: result?.error || 'An unknown error occurred.',
                  variant: 'destructive',
             });
             // Ako akcija vraća detalje greške validacije iz Zoda (result.details),
             // možete ih ručno setovati na hook-form greške:
             // if (result?.details) {
             //    Object.keys(result.details).forEach(key => {
             //         if (form.get ailmentTypeof key) {
             //              form.setError(key as keyof ProviderFormData, {
             //                  type: 'server',
             //                  message: result.details[key]._errors.join(', ') // Zod format error structure
             //              });
             //         }
             //    });
             // }
        }
    };


    return (
        <Card className="w-full max-w-2xl mx-auto"> {/* Koristimo Shadcn Card */}
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Provider" : "Create New Provider"}</CardTitle>
                 <p className="text-sm text-muted-foreground">
                    {isEditing ? `Edit details for provider: ${provider?.name}` : 'Fill in the details for a new provider.'}
                 </p>
            </CardHeader>
            <CardContent>
                {/* Omotajte formu Shadcn Form kontextom za bolju integraciju validacije i UI */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Polje: Name */}
                        <FormField
                            control={form.control}
                            name="name" // Ime polja u ProviderFormData
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider Name</FormLabel> {/* Koristimo Shadcn FormLabel */}
                                    <FormControl>
                                        {/* Koristimo Shadcn Input */}
                                        <Input placeholder="Enter provider name" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage /> {/* Prikazuje Shadcn FormMessage (validacione greške iz hook-form/zod) */}
                                </FormItem>
                            )}
                        />

                         {/* Polje: Contact Name */}
                         <FormField
                             control={form.control}
                             name="contactName"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Contact Name (Optional)</FormLabel>
                                     <FormControl>
                                         <Input placeholder="Enter contact name" {...field} disabled={isLoading} />
                                     </FormControl>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />

                         {/* Polje: Email */}
                         <FormField
                             control={form.control}
                             name="email"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Email (Optional)</FormLabel>
                                     <FormControl>
                                         <Input type="email" placeholder="Enter email" {...field} disabled={isLoading} />
                                     </FormControl>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />

                         {/* Polje: Phone */}
                         <FormField
                             control={form.control}
                             name="phone"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Phone (Optional)</FormLabel>
                                     <FormControl>
                                         <Input type="tel" placeholder="Enter phone number" {...field} disabled={isLoading} />
                                     </FormControl>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />

                         {/* Polje: Address */}
                         <FormField
                             control={form.control}
                             name="address"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Address (Optional)</FormLabel>
                                     <FormControl>
                                         {/* Koristimo Shadcn Textarea */}
                                         <Textarea placeholder="Enter address" {...field} disabled={isLoading} rows={3} />
                                     </FormControl>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />

                        {/* Polje: isActive (Checkbox) */}
                         <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                 <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                     <FormControl>
                                         {/* Koristimo Shadcn Checkbox */}
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


                        {/* Dugmad za akciju */}
                        <div className="flex justify-end space-x-4">
                             {/* Koristimo Shadcn Button */}
                             {/* Opciono: Dugme za povratak/Cancel */}
                             <Button
                                 type="button"
                                 variant="outline"
                                 onClick={() => router.back()}
                                 disabled={isLoading}
                             >
                                 Cancel
                             </Button>
                             {/* Koristimo Shadcn Button */}
                             <Button
                                 type="submit"
                                 disabled={isLoading}
                             >
                                 {isLoading ? "Saving..." : isEditing ? "Update Provider" : "Create Provider"}
                             </Button>
                        </div>
                    </form>
                </Form>
             </CardContent>
             {/* Opciono: CardFooter za dodatne informacije */}
              {isEditing && provider && (
                  <CardFooter className="text-xs text-muted-foreground">
                      Created: {new Date(provider.createdAt).toLocaleString()} | Last Updated: {new Date(provider.updatedAt).toLocaleString()}
                 </CardFooter>
              )}
        </Card>
    );
}