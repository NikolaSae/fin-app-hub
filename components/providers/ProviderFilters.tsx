// components/providers/ProviderFilters.tsx
"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function ProviderFilters({ initialFilters, onFilterChange }) {
  const [searchInput, setSearchInput] = useState(initialFilters.search || "");
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== localFilters.search) {
        handleFilterChange({ search: searchInput });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    setSearchInput("");
    handleFilterChange({
      search: "",
      isActive: undefined,
      hasContracts: undefined,
      hasComplaints: undefined,
      sortBy: "name",
      sortDirection: "asc"
    });
  };

  return (
    <div className="bg-white p-4 rounded-md border space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Search</Label>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search providers..."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <RadioGroup
            value={localFilters.isActive ?? "all"}
            onValueChange={(value) => handleFilterChange({ isActive: value === "all" ? undefined : value === "true" })}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="status-active" />
              <Label htmlFor="status-active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="status-inactive" />
              <Label htmlFor="status-inactive">Inactive</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label>Sort By</Label>
          <Select
            value={localFilters.sortBy}
            onValueChange={(value) => handleFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Relations</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasContracts"
                checked={localFilters.hasContracts ?? false}
                onCheckedChange={(checked) => handleFilterChange({ hasContracts: checked })}
              />
              <Label htmlFor="hasContracts">Has Contracts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasComplaints"
                checked={localFilters.hasComplaints ?? false}
                onCheckedChange={(checked) => handleFilterChange({ hasComplaints: checked })}
              />
              <Label htmlFor="hasComplaints">Has Complaints</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}