// components/claims/ClaimsFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClaimStatus, ClaimType } from '@/types/claims';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

export interface ClaimsFiltersProps {
  users?: Array<{ id: string; name: string }>;
  defaultValues?: Partial<Filters>;
}

interface Filters {
  status: ClaimStatus | 'ALL';
  type: ClaimType | 'ALL';
  priority: string;
  search: string;
  assignedTo: string;
  dateRange: DateRange | undefined;
}

export function ClaimsFilters({ users, defaultValues }: ClaimsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    status: (searchParams.get('status') as ClaimStatus) || 'ALL',
    type: (searchParams.get('type') as ClaimType) || 'ALL',
    priority: searchParams.get('priority') || 'ALL',
    search: searchParams.get('search') || '',
    assignedTo: searchParams.get('assignedTo') || 'ALL',
    dateRange: {
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
    },
  });

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
    if (filters.priority && filters.priority !== 'ALL') params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    if (filters.assignedTo && filters.assignedTo !== 'ALL') params.set('assignedTo', filters.assignedTo);
    if (filters.dateRange?.from) params.set('from', filters.dateRange.from.toISOString());
    if (filters.dateRange?.to) params.set('to', filters.dateRange.to.toISOString());

    router.replace(`/claims?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(updateUrlParams, 300);
    return () => clearTimeout(debounceTimer);
  }, [filters]);

  const handleReset = () => {
    setFilters({
      status: 'ALL',
      type: 'ALL',
      priority: 'ALL',
      search: '',
      assignedTo: 'ALL',
      dateRange: undefined,
    });
    router.replace('/claims', { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-muted/50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as ClaimStatus }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(ClaimStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as ClaimType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {Object.values(ClaimType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              {[1, 2, 3, 4, 5].map((priority) => (
                <SelectItem key={priority} value={String(priority)}>
                  {['Highest', 'High', 'Medium', 'Low', 'Lowest'][priority - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To Filter */}
        {users && (
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => setFilters(prev => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range Picker */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <DateRangePicker
            selected={filters.dateRange}
            onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
          />
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search claims..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}