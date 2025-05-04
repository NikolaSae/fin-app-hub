// Path: components/complaints/ServiceSelection.tsx

"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl } from '@/components/ui/form';
import { getServicesByProviderId } from "@/actions/complaints/services";
import { Service } from '@prisma/client';

interface ServiceSelectionProps {
  providerId: string | null | undefined;
  selectedServiceId: string;
  onServiceSelect: (serviceId: string) => void;
}

export function ServiceSelection({ providerId, selectedServiceId, onServiceSelect }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setServices([]);
    setError(null);

    if (!providerId) {
      console.log("No providerId provided to fetch services.");
      return;
    }

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const fetchedServices = await getServicesByProviderId(providerId);
        const validServices = fetchedServices.filter(service => service.id !== '');
        setServices(validServices as Service[]);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();

  }, [providerId, onServiceSelect]);

   useEffect(() => {
       if (selectedServiceId && services.length > 0 && !services.find(s => s.id === selectedServiceId)) {
           console.log(`Selected service ${selectedServiceId} not found in new list, resetting.`);
           onServiceSelect('');
       }
       if (!providerId && selectedServiceId) {
           console.log("Provider cleared, resetting selected service.");
            onServiceSelect('');
       }
   }, [services, selectedServiceId, onServiceSelect, providerId]);

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
    <Select
      value={selectedServiceId}
      onValueChange={onServiceSelect}
      disabled={!providerId || isLoading || !!error}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent>
         {/* Render only actual service items with non-empty IDs */}
         {!isLoading && !error && services.length > 0 && (
             services.map(service => (
                 <SelectItem key={service.id} value={service.id}>
                     {service.name}
                 </SelectItem>
             ))
         )}
      </SelectContent>
    </Select>
  );
} 