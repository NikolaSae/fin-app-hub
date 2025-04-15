// components/providers/ProviderForm.tsx
import { useState } from 'react';
import Button from '@/components/providers/Button';
import { Provider } from './ProviderList';

interface ProviderFormProps {
  provider?: Provider;
  onSubmit: (data: { name: string; description: string; isActive: boolean }) => void;
  onCancel: () => void;
}

export default function ProviderForm({ provider, onSubmit, onCancel }: ProviderFormProps) {
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    description: provider?.description || '',
    isActive: provider?.isActive ?? true,
  });
  
  const [errors, setErrors] = useState({
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = { name: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Naziv provajdera je obavezan';
    }
    
    if (newErrors.name) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Naziv*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Unesite naziv provajdera"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Unesite opis provajdera"
        />
      </div>
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={handleToggleActive}
            className="h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-sm">Aktivan</span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Otkaži
        </Button>
        <Button type="submit" variant="primary">
          {provider ? 'Sačuvaj izmene' : 'Dodaj provajdera'}
        </Button>
      </div>
    </form>
  );
}