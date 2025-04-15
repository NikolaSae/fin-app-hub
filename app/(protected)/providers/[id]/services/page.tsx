// app/providers/[id]/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProviderTabs from '@/components/providers/ProviderTabs';
import Button from '@/components/providers/Button';

export default function ProviderServicesPage() {
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Provjera autentifikacije
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    async function fetchData() {
      if (!id) {
        setIsLoading(false);
        setError('ID provajdera nije naveden');
        return;
      }

      try {
        // Dohvat podataka o provajderu
        const providerResponse = await fetch(`/api/providers/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
          }
        });
        
        if (!providerResponse.ok) {
          if (providerResponse.status === 404) {
            setError('Provajder nije pronađen');
          } else {
            setError(`Greška pri dohvaćanju podataka o provajderu: ${providerResponse.statusText}`);
          }
          setIsLoading(false);
          return;
        }
        
        const providerData = await providerResponse.json();
        setProvider(providerData);
        
        // Dohvat usluga provajdera
        const servicesResponse = await fetch(`/api/providers/${id}/services`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
          }
        });
        
        if (!servicesResponse.ok) {
          setError(`Greška pri dohvaćanju usluga: ${servicesResponse.statusText}`);
          setIsLoading(false);
          return;
        }
        
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
        setError('Nije moguće učitati podatke. Pokušajte ponovno kasnije.');
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchData();
    }
  }, [id, router, session, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Učitavanje...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Greška</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/providers')}>
          Nazad na listu provajdera
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{provider.name}</h1>
        <p className="text-gray-500 mt-2">{provider.description || 'Nema opisa'}</p>
      </div>

      <ProviderTabs provider={provider} />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Usluge</h2>
          <Button onClick={() => { /* Otvori formu za dodavanje nove usluge */ }}>
            Dodaj uslugu
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p>Ovaj provajder još nema definisanih usluga.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description || 'Nema opisa'}</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cijena: {service.price} €</span>
                  <Button variant="secondary" size="sm" onClick={() => { /* Uredi uslugu */ }}>
                    Uredi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}