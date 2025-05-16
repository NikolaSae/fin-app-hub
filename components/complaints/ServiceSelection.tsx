// Path: components/complaints/ServiceSelection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from '@/components/ui/form'; // Uvezite FormControl ako se koristi unutar komponente
// Uvezite ispravnu akciju sa ispravne putanje
import { getServicesByProvider } from "@/actions/complaints/getServicesByProvider"; // <-- Ispravljena putanja i ime funkcije

// Definirajte tip za servis opcije (mora odgovarati onome što vraća akcija)
interface ServiceOption {
    id: string;
    name: string;
    type: string; // Dodajte i tip servisa ako je relevantno
}

interface ServiceSelectionProps {
    providerId: string | null | undefined; // ID izabranog provajdera
    selectedServiceId: string | undefined; // Trenutno izabrani Service ID (iz react-hook-form) - može biti string ili undefined
    onServiceSelect: (serviceId: string) => void; // Callback kada se servis izabere
    disabled?: boolean; // Da li je polje onemogućeno (npr. tokom submitovanja)
}

export function ServiceSelection({
    providerId,
    selectedServiceId,
    onServiceSelect,
    disabled = false,
}: ServiceSelectionProps) {
    const [services, setServices] = useState<ServiceOption[]>([]); // Koristimo ServiceOption[] tip
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efekat koji se pokreće kada se providerId promeni
    useEffect(() => {
        // Resetujte listu servisa i izabrani servis kada se provajder promeni
        setServices([]);
        // onServiceSelect(''); // Ne resetujte selectedServiceId ovde, to radi roditeljska komponenta (ComplaintForm)
        setError(null);

        // Ako nema izabranog provajdera, nema potrebe da se dohvaćaju servisi
        if (!providerId) {
            console.log("No providerId provided to fetch services.");
            return;
        }

        const fetchServices = async () => {
            setIsLoading(true);
            try {
                // Pozovite ispravnu Server Action funkciju
                const result = await getServicesByProvider(providerId); // <-- Poziv ispravne funkcije

                if (result.error) {
                    setError(result.error);
                    setServices([]);
                } else {
                    // Filtrirajte servise sa praznim ID-em ako je potrebno, mada akcija ne bi trebalo da ih vraća
                    const validServices = result.data.filter(service => service.id !== '');
                    setServices(validServices); // Postavite listu dohvaćenih servisa
                    setError(null);
                }

            } catch (err: any) {
                console.error("Error fetching services:", err);
                setError("Failed to load services");
                setServices([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();

        // Cleanup funkcija ako je potrebno
        // return () => { ... };

    }, [providerId]); // Zavisnost samo od providerId (onServiceSelect je stabilan callback)

    // Efekat za resetovanje izabranog servisa ako se promeni lista servisa ili providerId
    useEffect(() => {
        // Ako je izabran servis, a taj servis nije u novodohvaćenoj listi, resetujte ga
        if (selectedServiceId && services.length > 0 && !services.find(s => s.id === selectedServiceId)) {
            console.log(`Selected service ${selectedServiceId} not found in new list, resetting.`);
            onServiceSelect('');
        }
        // Ako je providerId poništen, a selectedServiceId i dalje postoji, resetujte selectedServiceId
        if (!providerId && selectedServiceId) {
            console.log("Provider cleared, resetting selected service.");
             onServiceSelect('');
        }
    }, [services, selectedServiceId, onServiceSelect, providerId]); // Zavisnosti od stanja i propova

    // Hendler za promenu izabranog servisa u Select komponenti
    const handleSelectChange = useCallback((value: string) => {
        onServiceSelect(value); // Pozovite callback roditeljske komponente sa izabranim ID-em
    }, [onServiceSelect]); // Zavisnost od onServiceSelect callbacka

    // Odredite placeholder tekst na osnovu stanja
    let placeholderText = "Select a provider first";
    if (providerId) {
        placeholderText = isLoading ? "Loading services..." : "Select service";
    }
    if (error) {
        placeholderText = error;
    }
    if (!isLoading && !error && providerId && services.length === 0) {
        placeholderText = "No services found for this provider";
    }


    return (
        // Select komponenta
        <Select
            onValueChange={handleSelectChange} // Koristite lokalni hendler
            value={selectedServiceId || ""} // Vrednost se vezuje za selectedServiceId prop (koristite "" za null/undefined)
            disabled={disabled || !providerId || isLoading || services.length === 0 || !!error} // Onemogući ako se učitava, nema izabranog provajdera, ima greške, nema servisa ili je prosleđen disabled prop
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholderText} /> {/* Prikaz placeholder teksta */}
            </SelectTrigger>
            <SelectContent>
                {/* Uklonjen eksplicitni SelectItem sa value="" */}
                {/* Lista servisa se prikazuje samo ako su dohvaćeni i nema grešaka */}
                {!isLoading && !error && services.length > 0 && (
                     services.map((service) => (
                         <SelectItem key={service.id} value={service.id}>
                             {service.name} ({service.type}) {/* Prikaz imena i tipa servisa */}
                         </SelectItem>
                     ))
                 )}
                 {/* Opciono: Prikazati poruku u SelectContent ako nema servisa, ali bez SelectItem sa praznim value */}
                 {/* Ovo može zahtevati prilagođavanje SelectContent stila */}
                 {/*
                 {!isLoading && !error && providerId && services.length === 0 && (
                     <div className="px-2 py-1.5 text-sm text-muted-foreground">
                         {placeholderText}
                     </div>
                 )}
                 */}
            </SelectContent>
        </Select>
    );
}
