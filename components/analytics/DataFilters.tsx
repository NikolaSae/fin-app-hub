///components/analytics/DataFilters.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  FilterIcon,
  XIcon,
  CheckIcon,
  Search,
  ChevronDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow
} from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface DataFilterOptions {
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  providerIds?: string[];
  serviceTypes?: string[];
  productIds?: string[];
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DataFiltersProps {
  initialFilters?: DataFilterOptions;
  onFilterChange?: (filters: DataFilterOptions) => void;
  showDateRange?: boolean;
  showProviders?: boolean;
  showServiceTypes?: boolean;
  showProducts?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  className?: string;
  // Optional: provide actual data instead of mocks
  providersData?: { id: string; name: string }[];
  serviceTypesData?: { id: string; name: string }[];
  productsData?: { id: string; name: string }[];
}

// Mock data for filters (can be replaced by props)
const PROVIDERS = [
  { id: 'p1', name: 'Provider A' },
  { id: 'p2', name: 'Provider B' },
  { id: 'p3', name: 'Provider C' },
  { id: 'p4', name: 'Provider D' },
  { id: 'p5', name: 'Provider E' },
];

const SERVICE_TYPES = [
  { id: 'VAS', name: 'VAS Services' },
  { id: 'BULK', name: 'Bulk Services' },
  { id: 'HUMANITARIAN', name: 'Humanitarian Services' },
  { id: 'PARKING', name: 'Parking Services' },
];

const PRODUCTS = [
  { id: 'prod1', name: 'SMS' },
  { id: 'prod2', name: 'MMS' },
  { id: 'prod3', name: 'Voice' },
  { id: 'prod4', name: 'Data' },
  { id: 'prod5', name: 'IoT' },
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'collected', label: 'Collected Amount' },
];

export function DataFilters({
  initialFilters = {},
  onFilterChange,
  showDateRange = true,
  showProviders = true,
  showServiceTypes = true,
  showProducts = false,
  showSearch = true,
  showSort = true,
  className = '',
  providersData = PROVIDERS,
  serviceTypesData = SERVICE_TYPES,
  productsData = PRODUCTS,
}: DataFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for filters
  const [filters, setFilters] = useState<DataFilterOptions>(initialFilters);

  // Date picker states
  const [dateOpen, setDateOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);


  // Effect to sync initial filters from URL params on mount
  // This ensures state reflects URL when component loads
  useState(() => {
    const params = searchParams;
    const urlFilters: DataFilterOptions = {
      dateRange: { from: null, to: null }, // Initialize to prevent errors if not in URL
      providerIds: params.get('providers')?.split(',') || [],
      serviceTypes: params.get('serviceTypes')?.split(',') || [],
      productIds: params.get('products')?.split(',') || [],
      searchQuery: params.get('q') || '',
      sortBy: params.get('sort') || 'date',
      sortOrder: (params.get('order') as 'asc' | 'desc') || 'desc',
    };

    const dateFrom = params.get('dateFrom');
    const dateTo = params.get('dateTo');
    if (dateFrom) {
      try { urlFilters.dateRange!.from = new Date(dateFrom); } catch (e) { }
    }
    if (dateTo) {
      try { urlFilters.dateRange!.to = new Date(dateTo); } catch (e) { }
    }

    // Merge initialFilters prop with URL filters, URL takes precedence
    const finalFilters = { ...initialFilters, ...urlFilters };

    // Special handling for dateRange - merge cautiously
    if (initialFilters.dateRange || urlFilters.dateRange) {
       finalFilters.dateRange = {
         from: urlFilters.dateRange?.from ?? initialFilters.dateRange?.from ?? null,
         to: urlFilters.dateRange?.to ?? initialFilters.dateRange?.to ?? null,
       };
    }


    setFilters(finalFilters);
    // Optionally call onFilterChange here if you want initial URL filters to trigger it
    // if (onFilterChange && Object.keys(urlFilters).length > 0) {
    //   onFilterChange(finalFilters);
    // }
  }, [initialFilters, searchParams]); // Dependency on initialFilters and searchParams

  // Handle date selection
  const handleDateSelect = (range: { from?: Date | null; to?: Date | null } | undefined) => {
    if (!range) return; // Ensure range is defined

    const newDateRange = {
      from: range.from || null, // Ensure null if undefined
      to: range.to || null,     // Ensure null if undefined
    };

    updateFilters({ dateRange: newDateRange });
  };


  // Handle provider selection
  const handleProviderToggle = (providerId: string) => {
    const currentProviders = filters.providerIds || [];
    const newProviders = currentProviders.includes(providerId)
      ? currentProviders.filter(id => id !== providerId)
      : [...currentProviders, providerId];

    updateFilters({ providerIds: newProviders });
  };

  // Handle service type selection
  const handleServiceTypeToggle = (serviceType: string) => {
    const currentTypes = filters.serviceTypes || [];
    const newTypes = currentTypes.includes(serviceType)
      ? currentTypes.filter(type => type !== serviceType)
      : [...currentTypes, serviceType];

    updateFilters({ serviceTypes: newTypes });
  };

  // Handle product selection
  const handleProductToggle = (productId: string) => {
    const currentProducts = filters.productIds || [];
    const newProducts = currentProducts.includes(productId)
      ? currentProducts.filter(id => id !== productId)
      : [...currentProducts, productId];

    updateFilters({ productIds: newProducts });
  };

  // Handle search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    // We debounce or wait for a submit for search in a real app, but for simplicity,
    // we'll update on change here.
    updateFilters({ searchQuery: query });
  };

  // Handle sort changes
  const handleSortByChange = (sortBy: string) => {
    updateFilters({ sortBy });
  };

  const handleSortOrderChange = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortOrder: newOrder });
  };

  // Update filters and propagate changes
  const updateFilters = (newFilters: Partial<DataFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };

    // Ensure nested objects like dateRange are merged correctly
    if (newFilters.dateRange !== undefined) {
      updatedFilters.dateRange = {
        ...filters.dateRange,
        ...newFilters.dateRange,
      };
    }

    setFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }

    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());

    // Update individual parameters based on newFilters
    if (newFilters.dateRange !== undefined) {
      if (newFilters.dateRange.from) {
        params.set('dateFrom', format(newFilters.dateRange.from, 'yyyy-MM-dd'));
      } else {
        params.delete('dateFrom');
      }
      if (newFilters.dateRange.to) {
        params.set('dateTo', format(newFilters.dateRange.to, 'yyyy-MM-dd'));
      } else {
        params.delete('dateTo');
      }
    }

    if (newFilters.providerIds !== undefined) {
      newFilters.providerIds.length > 0
        ? params.set('providers', newFilters.providerIds.join(','))
        : params.delete('providers');
    }

    if (newFilters.serviceTypes !== undefined) {
      newFilters.serviceTypes.length > 0
        ? params.set('serviceTypes', newFilters.serviceTypes.join(','))
        : params.delete('serviceTypes');
    }

    if (newFilters.productIds !== undefined) {
      newFilters.productIds.length > 0
        ? params.set('products', newFilters.productIds.join(','))
        : params.delete('products');
    }

    if (newFilters.searchQuery !== undefined) {
      newFilters.searchQuery ? params.set('q', newFilters.searchQuery) : params.delete('q');
    }

    if (newFilters.sortBy !== undefined) {
      params.set('sort', newFilters.sortBy);
    }

    if (newFilters.sortOrder !== undefined) {
      params.set('order', newFilters.sortOrder);
    }

     // Only push if there are changes to avoid unnecessary navigation
    // This simple check might not be perfect for all cases, but prevents loop on initial load if state == URL
    // A more robust check would compare params string before and after updates
    const currentParamsString = searchParams.toString();
    const newParamsString = params.toString();

    if (currentParamsString !== newParamsString) {
       router.push(`${pathname}?${params.toString()}`);
    }
  };


  // Reset all filters
  const resetFilters = () => {
    const emptyFilters: DataFilterOptions = {
      dateRange: { from: null, to: null },
      providerIds: [],
      serviceTypes: [],
      productIds: [],
      searchQuery: '',
      sortBy: 'date', // Reset to default sort
      sortOrder: 'desc', // Reset to default order
    };

    setFilters(emptyFilters);

    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }

    router.push(pathname); // Navigate to base path, clearing all params
  };

  // Format date range for display
  const formatDateRange = () => {
    const { from, to } = filters.dateRange || { from: null, to: null };

    if (from && to) {
      // Check if from and to are the same day
      if (from.toDateString() === to.toDateString()) {
         return format(from, 'MMM d, yyyy');
      }
      return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
    }

    if (from) {
      return `From ${format(from, 'MMM d, yyyy')}`;
    }

    if (to) {
      return `Until ${format(to, 'MMM d, yyyy')}`;
    }

    return 'All Time';
  };

  // Count selected providers
  const selectedProviderCount = (filters.providerIds || []).length;
  const selectedServiceCount = (filters.serviceTypes || []).length;
  const selectedProductCount = (filters.productIds || []).length;
  const hasActiveFilters =
     (filters.dateRange?.from || filters.dateRange?.to) ||
     selectedProviderCount > 0 ||
     selectedServiceCount > 0 ||
     selectedProductCount > 0 ||
     (filters.searchQuery && filters.searchQuery.length > 0);


  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-2 lg:space-x-4 items-center">
          {/* Search Filter */}
          {showSearch && (
            <div className="flex-1 min-w-[150px] max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={filters.searchQuery || ''}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg bg-background pl-8"
                />
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          {showDateRange && (
             <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                   <Button
                      variant={"outline"}
                      className={cn(
                         "w-[240px] justify-start text-left font-normal",
                         !filters.dateRange?.from && !filters.dateRange?.to && "text-muted-foreground"
                      )}
                   >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange?.from || new Date()}
                      selected={filters.dateRange as any} // Calendar expects { from, to }
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                   />
                   <div className="flex justify-end p-2">
                     <Button variant="outline" size="sm" onClick={() => setDateOpen(false)}>Close</Button>
                   </div>
                </PopoverContent>
             </Popover>
          )}

          {/* Provider Filter */}
          {showProviders && (
             <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      {selectedProviderCount > 0 ? `${selectedProviderCount} Providers` : 'All Providers'}
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                   <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                      <div className="grid gap-2">
                         {providersData.map(provider => (
                            <div key={provider.id} className="flex items-center space-x-2">
                               <Checkbox
                                  id={`provider-${provider.id}`}
                                  checked={filters.providerIds?.includes(provider.id)}
                                  onCheckedChange={() => handleProviderToggle(provider.id)}
                               />
                               <Label
                                  htmlFor={`provider-${provider.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                  {provider.name}
                               </Label>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </PopoverContent>
             </Popover>
          )}

           {/* Service Type Filter */}
           {showServiceTypes && (
             <Popover open={serviceTypeOpen} onOpenChange={setServiceTypeOpen}>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      {selectedServiceCount > 0 ? `${selectedServiceCount} Services` : 'All Services'}
                       <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                   <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                      <div className="grid gap-2">
                         {serviceTypesData.map(type => (
                            <div key={type.id} className="flex items-center space-x-2">
                               <Checkbox
                                  id={`service-type-${type.id}`}
                                  checked={filters.serviceTypes?.includes(type.id)}
                                  onCheckedChange={() => handleServiceTypeToggle(type.id)}
                               />
                               <Label
                                  htmlFor={`service-type-${type.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                  {type.name}
                               </Label>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </PopoverContent>
             </Popover>
          )}

           {/* Product Filter */}
           {showProducts && (
             <Popover open={productOpen} onOpenChange={setProductOpen}>
                <PopoverTrigger asChild>
                   <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      {selectedProductCount > 0 ? `${selectedProductCount} Products` : 'All Products'}
                       <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                   <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                      <div className="grid gap-2">
                         {productsData.map(product => (
                            <div key={product.id} className="flex items-center space-x-2">
                               <Checkbox
                                  id={`product-${product.id}`}
                                  checked={filters.productIds?.includes(product.id)}
                                  onCheckedChange={() => handleProductToggle(product.id)}
                               />
                               <Label
                                  htmlFor={`product-${product.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                  {product.name}
                               </Label>
                            </div>
                         ))}
                      </div>
                   </CardContent>
                </PopoverContent>
             </Popover>
          )}


          {/* Sort Filter */}
          {showSort && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort-by" className="sr-only">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={handleSortByChange}>
                 <SelectTrigger id="sort-by" className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                 </SelectTrigger>
                 <SelectContent>
                    {SORT_OPTIONS.map(option => (
                       <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>
               <Button variant="outline" size="icon" onClick={handleSortOrderChange}>
                  {filters.sortOrder === 'asc' ? (
                     <ArrowUpWideNarrow className="h-4 w-4" />
                  ) : (
                     <ArrowDownWideNarrow className="h-4 w-4" />
                  )}
               </Button>
            </div>
          )}

          {/* Reset Filters Button */}
           {hasActiveFilters && (
              <Button variant="ghost" onClick={resetFilters} className="shrink-0">
                 <XIcon className="mr-1 h-4 w-4" />
                 Reset Filters
              </Button>
           )}

        </div>
      </CardContent>
    </Card>
  );
}