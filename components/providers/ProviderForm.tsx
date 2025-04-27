// /components/providers/ProviderForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Uvozimo stvarne server akcije za provajdere
import { createProvider } from "@/actions/providers/create";
import { updateProvider } from "@/actions/providers/update";

// Uvozimo stvarnu Zod šemu i TypeScript tipove za provajdere
import { providerSchema, ProviderFormData } from "@/schemas/provider"; // providerSchema je sada ProviderFormData šema


// Uklanjamo placeholder šemu i tip
// const providerSchema: any = {}; // Uklonjeno
// interface ProviderFormData { ... } // Uklonjeno

// Uvozimo UI komponente ako su Shadcn UI
// import { Input } from "@/components/ui/input"; // Odkomentarisati
// import { Button } from "@/components/ui/button"; // Odkomentarisati
// import { Checkbox } from "@/components/ui/checkbox"; // Odkomentarisati ako se koristi Shadcn Checkbox
// import { Label } from "@/components/ui/label"; // Odkomentarisati
// import { Textarea } from "@/components/ui/textarea"; // Odkomentarisati


interface ProviderFormProps {
    // Opcioni prop za editovanje (postojeći podaci provajdera)
    // Tip Provider FormData odgovara strukturi forme, ali provider sa servera ima i ID, createdAt, updatedAt
    // Koristimo Provider tip sa servera i mapiramo na ProviderFormData za default values
    provider?: { // Ovo je tip koji dolazi sa servera fetch-om
         id: string;
         name: string;
         contactName: string | null;
         email: string | null;
         phone: string | null;
         address: string | null;
         isActive: boolean;
         createdAt: Date; // Dodajemo ako se fetchuje
         updatedAt: Date; // Dodajemo ako se fetchuje
         // ... ostala polja sa servera koja nisu u formi
    };
    isEditing?: boolean;
}

// Komponenta forme za kreiranje ili editovanje provajdera
export function ProviderForm({ provider, isEditing = false }: ProviderFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    // Stanje za poruku o grešci servera (ako je potrebno)
    const [serverError, setServerError] = useState<string | null>(null);


    const {
        register,
        handleSubmit,
        formState: { errors },
        // setValue, // Ostavljeno ako je potrebno dinamički menjati vrednosti
        // watch, // Ostavljeno ako je potrebno pratiti vrednosti polja
    } = useForm<ProviderFormData>({
        resolver: zodResolver(providerSchema), // Koristimo stvarnu Zod šemu
        defaultValues: isEditing && provider
            ? {
                name: provider.name,
                contactName: provider.contactName ?? '', // Rukovanje null/undefined mapiranjem na prazan string za input
                email: provider.email ?? '',
                phone: provider.phone ?? '',
                address: provider.address ?? '',
                isActive: provider.isActive,
            }
            : {
                 isActive: true, // Podrazumevano aktivan pri kreiranju
                 // Opciono: default vrednosti za ostala polja ako nisu obavezna
                 name: '',
                 contactName: '',
                 email: '',
                 phone: '',
                 address: '',
            },
        mode: 'onBlur', // Validacija pri gubitku fokusa (opciono)
    });

    // Pratite vrednost isActive ako forma koristi select ili radio dugmad
    // const isActive = watch('isActive');

    const onSubmit = async (data: ProviderFormData) => {
        setServerError(null); // Resetuj server grešku
        try {
            setIsLoading(true);

            let result;
            if (isEditing && provider) {
                 // Pozivanje STVARNE server akcije za ažuriranje
                 result = await updateProvider(provider.id, data);
            } else {
                 // Pozivanje STVARNE server akcije za kreiranje
                 result = await createProvider(data);
            }

            if (result && result.success) {
                console.log(result.success);
                 // Preusmeri na stranicu detalja ili listu nakon uspeha
                // Pretpostavljamo da akcija vraća ID u slučaju uspeha kreiranja
                const newItemId = isEditing ? provider?.id : result.id;
                if (newItemId) {
                     router.push(`/providers/${newItemId}`); // Preusmeri na detalje
                } else {
                     router.push('/providers'); // Fallback na listu ako nema ID-a
                }

            } else {
                 // Rukovanje greškom servera
                 console.error("Failed to save provider:", result?.error);
                 setServerError(result?.error || 'An unknown error occurred.');
                 // Ako imate detalje greške validacije iz Zoda (result.details), možete ih mapirati na hook-form greške
                 // if (result?.details) { ... map errors ... }
            }

        } catch (error) {
            console.error("Error saving provider:", error);
            setServerError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Prikazivanje greške sa servera ako postoji */}
             {serverError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {serverError}</span>
                </div>
             )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Polje za Ime provajdera */}
                <div className="space-y-2">
                    {/* Koristiti Shadcn Label i Input komponente ako su importovane */}
                    <label htmlFor="name" className="block text-sm font-medium">
                        Provider Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter provider name"
                        {...register("name")}
                    />
                    {/* Prikazivanje greške validacije forme */}
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name.message}</p>
                    )}
                </div>

                {/* Polje za Kontakt ime */}
                 <div className="space-y-2">
                    <label htmlFor="contactName" className="block text-sm font-medium">
                        Contact Name (Optional)
                    </label>
                    <input
                        id="contactName"
                        type="text"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                        placeholder="Enter contact name"
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
                    {isLoading ? "Saving..." : isEditing ? "Update Provider" : "Create Provider"}
                </button>
            </div>
        </form>
    );
}