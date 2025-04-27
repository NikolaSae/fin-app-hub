// /components/humanitarian-orgs/HumanitarianOrgFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { HumanitarianOrgFilterOptions } from "@/lib/types/humanitarian-org-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface HumanitarianOrgFiltersProps {
  onFilterChange: (filters: HumanitarianOrgFilterOptions) => void;
}

export function HumanitarianOrgFilters({ onFilterChange }: HumanitarianOrgFiltersProps) {
  // Lokalno stanje za filtere (pre nego što se primene)
  const [localFilters, setLocalFilters] = useState<HumanitarianOrgFilterOptions>({
    search: '',
    isActive: undefined,
    country: undefined,
    city: undefined,
    hasContracts: undefined,
    hasComplaints: undefined,
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  // Debounce za search input
  const [searchInput, setSearchInput] = useState('');
  
  // Funkcija za ažuriranje lokalnih filtera
  const updateLocalFilter = (key: keyof HumanitarianOrgFilterOptions, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Primena filtera nakon debounce perioda za search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== localFilters.search) {
        updateLocalFilter('search', searchInput);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput, localFilters.search]);
  
  // Primena filtera nakon što se promene lokalni filteri
  useEffect(() => {
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);
  
  // Reset filtera
  const handleResetFilters = () => {
    setSearchInput('');
    setLocalFilters({
      search: '',
      isActive: undefined,
      country: undefined,
      city: undefined,
      hasContracts: undefined,
      hasComplaints: undefined,
      sortBy: 'name',
      sortDirection: 'asc'
    });
  };
  
  return (
    <div className="bg-white p-4 rounded-md border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name, email, contact..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        {/* Active status filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup
            value={localFilters.isActive === undefined ? 'all' : localFilters.isActive ? 'active' : 'inactive'}
            onValueChange={(value) => {
              updateLocalFilter('isActive', value === 'all' ? undefined : value === 'active');
            }}
          >
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">Inactive</Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* Sorting */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <div className="flex space-x-2">
            <Select
              value={localFilters.sortBy}
              onValueChange={(value: any) => updateLocalFilter('sortBy', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="contractsCount">Contracts Count</SelectItem>
                <SelectItem value="complaintsCount">Complaints Count</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={localFilters.sortDirection}
              onValueChange={(value: any) => updateLocalFilter('sortDirection', value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Additional filters */}
        <div className="space-y-2">
          <Label>Relations</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasContracts"
                checked={localFilters.hasContracts === true}
                onCheckedChange={(checked) => updateLocalFilter('hasContracts', checked === true ? true : undefined)}
              />
              <Label htmlFor="hasContracts">Has Contracts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasComplaints"
                checked={localFilters.hasComplaints === true}
                onCheckedChange={(checked) => updateLocalFilter('hasComplaints', checked === true ? true : undefined)}
              />
              <Label htmlFor="hasComplaints">Has Complaints</Label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}