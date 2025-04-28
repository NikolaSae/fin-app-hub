///components/services/ServiceFilters.tsx

"use client";
import React from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceType } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface ServiceFiltersProps {
  currentFilters: {
    type?: string;
    query?: string;
    status?: string;
  };
  onFilterChange: (filters: { type?: string; query?: string; status?: string }) => void;
}

export function ServiceFilters({ currentFilters, onFilterChange }: ServiceFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const handleTypeChange = (value: string) => {
    const newFilters = { ...currentFilters, type: value || undefined };
    onFilterChange(newFilters);
  };
  
  const handleStatusChange = (value: string) => {
    const newFilters = { ...currentFilters, status: value || undefined };
    onFilterChange(newFilters);
  };
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...currentFilters, query: e.target.value || undefined };
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-md shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Service Type</label>
          <select
            className="w-full border border-gray-300 rounded-md h-10 px-3"
            value={currentFilters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">All Types</option>
            <option value={ServiceType.VAS}>VAS</option>
            <option value={ServiceType.BULK}>Bulk</option>
            <option value={ServiceType.HUMANITARIAN}>Humanitarian</option>
            <option value={ServiceType.PARKING}>Parking</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <select
            className="w-full border border-gray-300 rounded-md h-10 px-3"
            value={currentFilters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Search</label>
          <Input
            type="text"
            placeholder="Search services..."
            value={currentFilters.query || ''}
            onChange={handleQueryChange}
            className="w-full"
          />
        </div>
        
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}