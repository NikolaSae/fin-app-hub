// Path: components/humanitarian-orgs/HumanitarianOrgForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { humanitarianOrgSchema, HumanitarianOrgFormData } from "@/schemas/humanitarian-org";
import { createHumanitarianOrg } from "@/actions/humanitarian-orgs/create";
import { updateHumanitarianOrg } from "@/actions/humanitarian-orgs/update";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // UVEZENO: Importujemo toast


interface HumanitarianOrgFormProps {
    organization?: {
         id: string;
         name: string;
         contactName: string | null;
         email: string | null;
         phone: string | null;
         address: string | null;
         website: string | null;
         mission: string | null;
         isActive: boolean;
         createdAt: Date;
         updatedAt: Date;
         // ... ostala polja sa servera koja nisu u formi
    };
    isEditing?: boolean;
}

// Komponenta forme za kreiranje ili editovanje humanitarne organizacije
export function HumanitarianOrgForm({ organization, isEditing = false }: HumanitarianOrgFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // UKLONJENO: Stanje za poruku o grešci servera, koristićemo toast
    // const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // UVEZENO: Reset funkcija za formu
        // setValue, // Ostavljeno ako je potrebno dinamički menjati vrednosti
        // watch, // Ostavljeno ako je potrebno pratiti vrednosti polja
    } = useForm<HumanitarianOrgFormData>({
        resolver: zodResolver(humanitarianOrgSchema), // Koristimo stvarnu Zod šemu
        defaultValues: isEditing && organization
            ? {
                name: organization.name,
                contactName: organization.contactName ?? '', // Mapiranje null na prazan string za input
                email: organization.email ?? '',
                phone: organization.phone ?? '',
                address: organization.address ?? '',
                website: organization.website ?? '',
                mission: organization.mission ?? '',
                isActive: organization.isActive,
            }
            : {
                 isActive: true, // Podrazumevano aktivna pri kreiranju
                 // Default vrednosti za ostala polja
                 name: '',
                 contactName: '',
                 email: '',
                 phone: '',
                 address: '',
                 website: '',
                 mission: '',
            },
        mode: 'onBlur', // Validacija pri gubitku fokusa (opciono)
    });

    // Pratite vrednost isActive ako forma koristi select ili radio dugmad
    // const isActive = watch('isActive');

    const onSubmit = async (data: HumanitarianOrgFormData) => {
        // UKLONJENO: setServerError(null); // Resetuj server grešku
        try {
            setIsLoading(true);

            let result;
            if (isEditing && organization) {
                 // Pozivanje STVARNE server akcije za ažuriranje
                 // Prosleđujemo ID i validirane podatke
                 result = await updateHumanitarianOrg(organization.id, data);
            } else {
                 // Pozivanje STVARNE server akcije za kreiranje
                 // Prosleđujemo validirane podatke
                 result = await createHumanitarianOrg(data);
            }

            if (result && result.success) {
                // PRIKAZ TOAST NOTIFIKACIJE ZA USPEH
                toast.success(isEditing ? "Organization updated successfully!" : "Organization created successfully!");

                 // Preusmeri na stranicu detalja ili listu nakon uspeha
                const newItemId = isEditing ? organization?.id : result.id;
                if (newItemId) {
                     router.push(`/humanitarian-orgs/${newItemId}`); // Preusmeri na detalje
                } else {
                     router.push('/humanitarian-orgs'); // Fallback na listu ako nema ID-a
                }

            } else {
                 // Rukovanje greškom servera
                 console.error("Failed to save organization:", result?.error);
                 // PRIKAZ TOAST NOTIFIKACIJE ZA GREŠKU SERVERA
                 toast.error(result?.error || 'An unknown error occurred.');
                 // Ako imate detalje greške validacije iz Zoda (result.details), možete ih mapirati na hook-form greške
                 // if (result?.details) { ... map errors ... }
            }

        } catch (error) {
            console.error("Error saving organization:", error);
            // PRIKAZ TOAST NOTIFIKACIJE ZA NEOČEKIVANU GREŠKU
            toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Koristimo nativne HTML elemente za formu
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* UKLONJENO: Prikazivanje greške sa servera ako postoji */}
            {/* {serverError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {serverError}</span>
                </div>
             )} */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Polje za Ime organizacije */}
                <div className="space-y-2">
                    {/* Koristiti Shadcn Label i Input komponente ako su importovane */}
                    <label htmlFor="name" className="block text-sm font-medium">
                        Organization Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter organization name"
                        {...register("name")}
                    />
                    {/* Prikazivanje greške validacije forme */}
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                </div>

                {/* Polje za Kontakt osobu */}
                 <div className="space-y-2">
                    <label htmlFor="contactName" className="block text-sm font-medium">
                        Contact Person (Optional)
                    </label>
                    <input
                        id="contactName"
                        type="text"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter contact person name"
                        {...register("contactName")}
                    />
                     {errors.contactName && (
                        <p className="text-red-500 text-sm">{errors.contactName.message}</p>
                    )}
                </div>

                {/* Polje za Email */}
                 <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email (Optional)
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter email"
                        {...register("email")}
                    />
                     {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                </div>

                {/* Polje za Telefon */}
                 <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                        Phone (Optional)
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter phone number"
                        {...register("phone")}
                    />
                     {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone.message}</p>
                    )}
                </div>

                {/* Polje za Web sajt */}
                 <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium">
                        Website (Optional)
                    </label>
                    <input
                        id="website"
                        type="url"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter website URL"
                        {...register("website")}
                    />
                     {errors.website && (
                        <p className="text-red-500 text-sm">{errors.website.message}</p>
                    )}
                </div>

                 {/* Polje za Adresu */}
                 <div className="space-y-2 col-span-full">
                    <label htmlFor="address" className="block text-sm font-medium">
                        Address (Optional)
                    </label>
                    <textarea
                        id="address"
                        rows={2}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter address"
                        {...register("address")}
                    ></textarea>
                     {errors.address && (
                        <p className="text-red-500 text-sm">{errors.address.message}</p>
                    )}
                </div>

                 {/* Polje za Misiju */}
                 <div className="space-y-2 col-span-full">
                    <label htmlFor="mission" className="block text-sm font-medium">
                        Mission (Optional)
                    </label>
                    <textarea
                        id="mission"
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter organization mission"
                        {...register("mission")}
                    ></textarea>
                     {errors.mission && (
                        <p className="text-red-500 text-sm">{errors.mission.message}</p>
                    )}
                </div>

                {/* Polje za Aktivno (Checkbox) */}
                <div className="space-y-2 flex items-center">
                     {/* Koristiti Shadcn Checkbox ako je importovan */}
                     <input
                        id="isActive"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                         {...register("isActive")}
                    />
                     {/* Koristiti Shadcn Label ako je importovan */}
                     <label htmlFor="isActive" className="ml-2 block text-sm font-medium">
                        Is Active
                    </label>
                     {/* Validacija greške ako se koristi striktna validacija za boolean */}
                     {errors.isActive && (
                        <p className="text-red-500 text-sm">{errors.isActive.message}</p>
                    )}
                </div>
            </div>

            {/* Dugmad za akciju */}
            <div className="flex justify-end space-x-4">
                {/* Koristiti Shadcn Button ako je importovan */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                >
                    Cancel
                </button>
                {/* Koristiti Shadcn Button ako je importovan */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                >
                    {isLoading ? "Saving..." : isEditing ? "Update Organization" : "Create Organization"}
                </button>
            </div>
        </form>
    );
}
