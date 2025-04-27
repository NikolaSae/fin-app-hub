// hooks/use-service-categories.ts
import { useState, useEffect } from "react";
import { ServiceType } from "@/lib/types/enums";
import { Service } from "@/lib/types/interfaces";

interface UseServiceCategoriesResult {
  categories: ServiceType[];
  services: Service[];
  isLoading: boolean;
  error: Error | null;
}

export function useServiceCategories(): UseServiceCategoriesResult {
  const [categories, setCategories] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await fetch("/api/services/categories");
        
        if (!response.ok) {
          throw new Error(`Error fetching service categories: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategories(data.categories);
        setServices(data.services);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);

  return {
    categories,
    services,
    isLoading,
    error
  };
}