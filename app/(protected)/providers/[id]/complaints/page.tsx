// app/providers/[id]/complaints/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProviderTabs from '@/components/providers/ProviderTabs';
import Button from '@/components/providers/Button';

export default function ProviderComplaintsPage() {
  const [provider, setProvider] = useState(null);
  const [complaints, setComplaints] = useState([]);
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
        
        // Dohvat žalbi provajdera
        const complaintsResponse = await fetch(`/api/providers/${id}/complaints`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.token && { 'Authorization': `Bearer ${session.user.token}` })
          }
        });
        
        if (!complaintsResponse.ok) {
          setError(`Greška pri dohvaćanju žalbi: ${complaintsResponse.statusText}`);
          setIsLoading(false);
          return;
        }
        
        const complaintsData = await complaintsResponse.json();
        setComplaints(complaintsData);
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
          <h2 className="text-2xl font-bold">Žalbe</h2>
          <Button onClick={() => { /* Otvori formu za dodavanje nove žalbe */ }}>
            Dodaj žalbu
          </Button>
        </div>

        {complaints.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p>Ovaj provajder još nema evidentiranih žalbi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg">{complaint.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    complaint.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {complaint.status === 'OPEN' ? 'Otvorena' :
                     complaint.status === 'IN_PROGRESS' ? 'U obradi' :
                     complaint.status === 'RESOLVED' ? 'Riješena' : 'Zatvorena'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{complaint.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Podneseno: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  <Button variant="secondary" size="sm" onClick={() => { /* Prikaži detalje žalbe */ }}>
                    Detalji
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