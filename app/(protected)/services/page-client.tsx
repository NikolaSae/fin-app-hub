// app/(protected)/services/page-client.tsx

"use client";

import { useState, useEffect } from 'react';
import ServiceDashboard from './page';
import { Provider, VasService, BulkService, ParkingService, HumanService } from '@prisma/client';

type ProviderWithServices = Provider & {
  vasServices: VasService[];
  bulkServices: BulkService[];
  parkingServices: ParkingService[];
  humanServices: HumanService[];
};

export default function ServicesClientPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderWithServices[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/services');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProviders(data.providers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka');
        console.error('Error fetching service data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">Greška pri učitavanju</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    );
  }

  return <ServiceDashboard providers={providers} />;