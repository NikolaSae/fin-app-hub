// components/providers/ProviderList.tsx
import { useState } from 'react';
import ProviderCard from './ProviderCard';

export interface Provider {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProviderListProps {
  providers: Provider[];
  onViewDetails: (id: string) => void;
}

export default function ProviderList({ providers, onViewDetails }: ProviderListProps) {
  const [filter, setFilter] = useState('all'); // all, active, inactive

  const filteredProviders = providers.filter(provider => {
    if (filter === 'all') return true;
    if (filter === 'active') return provider.isActive;
    if (filter === 'inactive') return !provider.isActive;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button 
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          Svi ({providers.length})
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('active')}
        >
          Aktivni ({providers.filter(p => p.isActive).length})
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'inactive' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('inactive')}
        >
          Neaktivni ({providers.filter(p => !p.isActive).length})
        </button>
      </div>

      {filteredProviders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nema pronađenih provajdera</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard 
              key={provider.id} 
              provider={provider} 
              onClick={() => onViewDetails(provider.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}