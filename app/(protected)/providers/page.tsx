// app/providers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProviderList from '@/components/providers/ProviderList';
import ProviderForm from '@/components/providers/ProviderForm';
import Button from '@/components/providers/Button';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProviders() {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/providers');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/sign-in');
            return;
          }
          throw new Error('Failed to fetch providers');
        }
        const data = await response.json();
        setProviders(data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchProviders();
    }
  }, [status, router]);

  const handleAddProvider = async (providerData) => {
    try {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/sign-in');
          return;
        }
        throw new Error('Failed to add provider');
      }
      
      const newProvider = await response.json();
      setProviders([...providers, newProvider]);
      setShowAddModal(false);
      router.refresh();
    } catch (error) {
      console.error('Error adding provider:', error);
    }
  };

  // Show loading or authenticated content
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Provajderi</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Dodaj novog provajdera
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Učitavanje provajdera...</p>
        </div>
      ) : (
        <ProviderList 
          providers={providers} 
          onViewDetails={(id) => router.push(`/providers/${id}`)}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Dodaj novog provajdera</h2>
            <ProviderForm 
              onSubmit={handleAddProvider} 
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}