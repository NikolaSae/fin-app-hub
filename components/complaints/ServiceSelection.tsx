// components/complaints/ServiceSelection.tsx

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Service, ServiceType } from '@prisma/client';

interface ServiceSelectionProps {
  selectedServiceId: string;
  onServiceSelect: (serviceId: string) => void;
  filterByType?: ServiceType | ServiceType[];
  includeInactive?: boolean;
  disabled?: boolean;
}

export function ServiceSelection({
  selectedServiceId,
  onServiceSelect,
  filterByType,
  includeInactive = false,
  disabled = false
}: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch services from API
        const response = await fetch('/api/services?includeInactive=' + includeInactive);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        
        // Filter services by type if specified
        let filteredServices = data.services;
        if (filterByType) {
          const types = Array.isArray(filterByType) ? filterByType : [filterByType];
          filteredServices = filteredServices.filter((service: Service) => 
            types.includes(service.type)
          );
        }
        
        setServices(filteredServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [includeInactive, filterByType]);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  // Group services by type
  const servicesByType: Record<ServiceType, Service[]> = {
    VAS: [],
    BULK: [],
    HUMANITARIAN: [],
    PARKING: []
  };

  services.forEach(service => {
    servicesByType[service.type].push(service);
  });

  return (
    <Select 
      value={selectedServiceId} 
      onValueChange={onServiceSelect}
      disabled={disabled || services.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={services.length === 0 ? "No services available" : "Select a service"} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(servicesByType).map(([type, typeServices]) => (
          typeServices.length > 0 && (
            <SelectGroup key={type}>
              <SelectLabel>{type}</SelectLabel>
              {typeServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )
        ))}
      </SelectContent>
    </Select>
  );
}