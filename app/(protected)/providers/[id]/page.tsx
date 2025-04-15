// app/providers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Dodano za auth
import ProviderTabs from '@/components/providers/ProviderTabs';
import ProviderForm from '@/components/providers/ProviderForm';
import Button from '@/components/providers/Button';

export default function ProviderDetailPage() {
  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // Osigurava da ID bude string
  const router = useRouter();
  const { data: session, status } = useSession(); // Dodano za auth

  useEffect(() => {
    // Provjera autentifikacije
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    async function fetchProviderDetails() {
      if (!id) {
        setIsLoading(false);
        setError('ID provajdera nije naveden');
        return;
      }

      try {
        console.log(`Dohvaćanje provajdera s ID-om: ${id}`);
        
        // Dodavanje auth tokena u zahtjev
        const response = await fetch(`/api/providers/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            // Ako je potrebno, dodajte token iz sesije
            ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API greška: ${response.status} - ${errorText}`);
          
          if (response.status === 404) {
            setError('Provajder nije pronađen');
          } else if (response.status === 401) {
            setError('Nemate pristup ovom resursu');
          } else {
            setError(`Greška pri dohvaćanju podataka: ${response.statusText}`);
          }
          return;
        }
        
        const data = await response.json();
        console.log("Primljeni podaci provajdera:", data);
        setProvider(data);
      } catch (error) {
        console.error('Greška pri dohvaćanju detalja provajdera:', error);
        setError('Nije moguće učitati detalje provajdera. Pokušajte ponovno kasnije.');
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchProviderDetails();
    }
  }, [id, router, session, status]);

  const handleUpdateProvider = async (providerData) => {
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
        },
        body: JSON.stringify(providerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Neuspješno ažuriranje provajdera: ${errorText}`);
      }
      
      const updatedProvider = await response.json();
      setProvider(updatedProvider);
      setIsEditing(false);
    } catch (error) {
      console.error('Greška pri ažuriranju provajdera:', error);
      alert('Neuspješno ažuriranje provajdera. Pokušajte ponovno.');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/providers/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Neuspješna promjena statusa provajdera: ${errorText}`);
      }
      
      const updatedProvider = await response.json();
      setProvider(updatedProvider);
    } catch (error) {
      console.error('Greška pri promjeni statusa provajdera:', error);
      alert('Neuspješna promjena statusa provajdera. Pokušajte ponovno.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Učitavanje detalja provajdera...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Provajder nije pronađen</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/providers')}>
          Nazad na listu provajdera
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{provider.name}</h1>
          <p className="text-gray-500 mt-2">{provider.description || 'Nema opisa'}</p>
          <div className="mt-2">
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                provider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {provider.isActive ? 'Aktivan' : 'Neaktivan'}
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={provider.isActive ? 'danger' : 'success'}
            onClick={handleToggleStatus}
          >
            {provider.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            Izmeni
          </Button>
        </div>
      </div>

      <ProviderTabs provider={provider} />

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Izmeni provajdera</h2>
            <ProviderForm 
              provider={provider}
              onSubmit={handleUpdateProvider} 
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}