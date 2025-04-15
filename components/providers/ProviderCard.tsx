// components/providers/ProviderCard.tsx
import { Provider } from './ProviderList';

interface ProviderCardProps {
  provider: Provider;
  onClick: () => void;
}

export default function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <div 
      className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{provider.name}</h3>
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            provider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {provider.isActive ? 'Aktivan' : 'Neaktivan'}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">
        {provider.description || 'Nema opisa'}
      </p>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>Kreiran: {new Date(provider.createdAt).toLocaleDateString()}</span>
        <span>Ažuriran: {new Date(provider.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}