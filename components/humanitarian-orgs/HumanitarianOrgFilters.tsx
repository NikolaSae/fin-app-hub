// Path: components/humanitarian-orgs/HumanitarianOrgFilters.tsx
"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { HumanitarianOrgFilterOptions } from "@/lib/types/humanitarian-org-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface HumanitarianOrgFiltersProps {
  // onFilterChange is expected to be a useCallback wrapped function from the parent
  onFilterChange: (filters: HumanitarianOrgFilterOptions) => void;
  // Add initialFilters prop to sync local state with URL params on first render
  initialFilters: HumanitarianOrgFilterOptions;
}

export function HumanitarianOrgFilters({ onFilterChange, initialFilters }: HumanitarianOrgFiltersProps) {
  // Initialize local state from initialFilters prop
  const [localFilters, setLocalFilters] = useState<HumanitarianOrgFilterOptions>(initialFilters);

  // Separate state for search input to handle debounce
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');

  // Sync searchInput with initialFilters.search on mount
  useEffect(() => {
    setSearchInput(initialFilters.search || '');
    // Note: localFilters is already initialized with initialFilters
  }, [initialFilters]);


  // Debounce effect for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      // Update local search filter AFTER debounce
      const newSearch = searchInput.trim() === '' ? undefined : searchInput.trim();

      // Only update filters and call onFilterChange if the debounced search value actually changed
      if (newSearch !== localFilters.search) {
        // Create a new filter object with the updated search term
        const updatedFilters = { ...localFilters, search: newSearch };
        setLocalFilters(updatedFilters); // Update local state
        onFilterChange(updatedFilters); // Call parent's onFilterChange
      }
    }, 300); // Debounce period

    return () => clearTimeout(timer); // Cleanup timer
  }, [searchInput, localFilters.search, onFilterChange]); // Dependencies: searchInput, localFilters.search, and onFilterChange


  // Handlers for other filters that call onFilterChange directly
  const handleIsActiveChange = useCallback((value: string) => {
    const newValue = value === 'all' ? undefined : value === 'active';
    // Create a new filter object with the updated isActive value
    const updatedFilters = { ...localFilters, isActive: newValue };
    setLocalFilters(updatedFilters); // Update local state
    onFilterChange(updatedFilters); // Call parent's onFilterChange
  }, [localFilters, onFilterChange]);

  const handleSortByChange = useCallback((value: string) => {
    const newValue = value as HumanitarianOrgFilterOptions['sortBy'];
    const updatedFilters = { ...localFilters, sortBy: newValue };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [localFilters, onFilterChange]);

  const handleSortDirectionChange = useCallback((value: string) => {
    const newValue = value as HumanitarianOrgFilterOptions['sortDirection'];
    const updatedFilters = { ...localFilters, sortDirection: newValue };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [localFilters, onFilterChange]);

  const handleHasContractsChange = useCallback((checked: boolean | 'indeterminate') => {
    const newValue = checked === true ? true : undefined;
    const updatedFilters = { ...localFilters, hasContracts: newValue };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [localFilters, onFilterChange]);

  const handleHasComplaintsChange = useCallback((checked: boolean | 'indeterminate') => {
    const newValue = checked === true ? true : undefined;
    const updatedFilters = { ...localFilters, hasComplaints: newValue };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [localFilters, onFilterChange]);


  // Reset filtera
  const handleResetFilters = useCallback(() => {
    const resetFilters: HumanitarianOrgFilterOptions = {
      search: undefined, // Reset search to undefined
      isActive: undefined,
      country: undefined,
      city: undefined,
      hasContracts: undefined,
      hasComplaints: undefined,
      sortBy: 'name', // Default sort
      sortDirection: 'asc' // Default direction
    };
    setSearchInput(''); // Reset search input state
    setLocalFilters(resetFilters); // Reset local filters state
    onFilterChange(resetFilters); // Call parent's onFilterChange with reset values
  }, [onFilterChange]); // Dependency: onFilterChange


  return (
    <div className="bg-white p-4 rounded-md border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name, email, contact..."
            value={searchInput} // Bind to searchInput state
            onChange={(e) => setSearchInput(e.target.value)} // Update searchInput state
          />
        </div>

        {/* Active status filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup
            value={localFilters.isActive === undefined ? 'all' : localFilters.isActive ? 'active' : 'inactive'}
            onValueChange={handleIsActiveChange} // Use the new handler
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
              onValueChange={handleSortByChange} // Use the new handler
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
              onValueChange={handleSortDirectionChange} // Use the new handler
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
                onCheckedChange={handleHasContractsChange} // Use the new handler
              />
              <Label htmlFor="hasContracts">Has Contracts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasComplaints"
                checked={localFilters.hasComplaints === true}
                onCheckedChange={handleHasComplaintsChange} // Use the new handler
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
        {/* You could add an explicit "Apply Filters" button here if preferred */}
        {/* <Button onClick={() => onFilterChange(localFilters)}>Apply Filters</Button> */}
      </div>
    </div>
  );
}
