// Path: components/humanitarian-orgs/HumanitarianOrgList.tsx
"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { useHumanitarianOrgs } from "@/hooks/use-humanitarian-orgs";
import { HumanitarianOrgFilters } from "@/components/humanitarian-orgs/HumanitarianOrgFilters";
import { HumanitarianOrgFilterOptions, PaginationOptions } from "@/lib/types/humanitarian-org-types"; // Import types
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Import Pagination components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


export function HumanitarianOrgList() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Get URL search parameters

    // Read filter and pagination parameters from URL
    // Parse filter options from URL
    const initialFilters: HumanitarianOrgFilterOptions = {
        search: searchParams.get("search") || undefined,
        isActive: searchParams.has("isActive") ? searchParams.get("isActive") === 'true' : undefined,
        country: searchParams.get("country") || undefined,
        city: searchParams.get("city") || undefined,
        hasContracts: searchParams.has("hasContracts") ? searchParams.get("hasContracts") === 'true' : undefined,
        hasComplaints: searchParams.has("hasComplaints") ? searchParams.get("hasComplaints") === 'true' : undefined,
        sortBy: (searchParams.get("sortBy") as HumanitarianOrgFilterOptions['sortBy']) || 'name', // Default sort
        sortDirection: (searchParams.get("sortDirection") as HumanitarianOrgFilterOptions['sortDirection']) || 'asc', // Default direction
    };

    // Parse pagination options from URL
    const initialPagination: PaginationOptions = {
        page: parseInt(searchParams.get("page") || "1", 10),
        limit: parseInt(searchParams.get("limit") || "10", 10), // Default limit
    };


    // Pass initial filters and pagination to the hook
    const { humanitarianOrgs, totalCount, loading, error, setFilters, setPagination } = useHumanitarianOrgs(
        initialFilters,
        initialPagination
    );

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalCount / initialPagination.limit);


    // Callback to handle filter changes from HumanitarianOrgFilters
    // This function updates the URL search parameters
    const handleFilterChange = useCallback((filterOptions: HumanitarianOrgFilterOptions) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        // Update search param
        if (filterOptions.search) {
            newSearchParams.set("search", filterOptions.search);
        } else {
            newSearchParams.delete("search");
        }

        // Update isActive param
        if (filterOptions.isActive !== undefined) {
            newSearchParams.set("isActive", filterOptions.isActive.toString());
        } else {
            newSearchParams.delete("isActive");
        }

        // Update country param
        if (filterOptions.country) {
            newSearchParams.set("country", filterOptions.country);
        } else {
            newSearchParams.delete("country");
        }

        // Update city param
        if (filterOptions.city) {
            newSearchParams.set("city", filterOptions.city);
        } else {
            newSearchParams.delete("city");
        }

        // Update hasContracts param
        if (filterOptions.hasContracts !== undefined) {
             newSearchParams.set("hasContracts", filterOptions.hasContracts.toString());
        } else {
             newSearchParams.delete("hasContracts");
        }

         // Update hasComplaints param
        if (filterOptions.hasComplaints !== undefined) {
             newSearchParams.set("hasComplaints", filterOptions.hasComplaints.toString());
        } else {
             newSearchParams.delete("hasComplaints");
        }

        // Update sortBy param (only if not default)
        if (filterOptions.sortBy && filterOptions.sortBy !== 'name') {
             newSearchParams.set("sortBy", filterOptions.sortBy);
        } else {
             newSearchParams.delete("sortBy");
        }

        // Update sortDirection param (only if not default)
        if (filterOptions.sortDirection && filterOptions.sortDirection !== 'asc') {
             newSearchParams.set("sortDirection", filterOptions.sortDirection);
        } else {
             newSearchParams.delete("sortDirection");
        }


        // Reset page to 1 when filters change
        newSearchParams.set("page", "1");

        // Push the new URL with updated search parameters
        router.push(`?${newSearchParams.toString()}`);

        // Also update the hook's filters state immediately (optional but can make UI snappier)
        // The hook will refetch based on the new state, and the URL change will sync on next render
        setFilters(filterOptions);


    }, [searchParams, router, setFilters]); // Add setFilters to dependencies

    // Callback to handle pagination changes
    const handlePageChange = useCallback((newPage: number) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("page", newPage.toString());
        router.push(`?${newSearchParams.toString()}`);

        // Also update the hook's pagination state immediately
        setPagination(prev => ({ ...prev, page: newPage }));

    }, [searchParams, router, setPagination]); // Add setPagination to dependencies


    if (loading) {
         return <div className="text-center py-4 text-muted-foreground">Loading organizations...</div>;
    }

    if (error) {
         return <div className="text-center py-4 text-red-500">Error loading organizations: {error.message}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Pass initialFilters and onFilterChange to the filters component */}
            <HumanitarianOrgFilters
                initialFilters={initialFilters}
                onFilterChange={handleFilterChange}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Contracts Count</TableHead>
                            <TableHead>Complaints Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {humanitarianOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                    No humanitarian organizations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            humanitarianOrgs.map((org) => {
                                return (
                                    <TableRow key={org.id}>
                                        <TableCell className="font-medium">
                                             <Link
                                                 href={`/humanitarian-orgs/${org.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {org.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{org.contactPerson || 'N/A'}</TableCell>
                                        <TableCell>{org.email || 'N/A'}</TableCell>
                                        <TableCell>{org.phone || 'N/A'}</TableCell>
                                        <TableCell>{org.isActive ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>{org._count?.contracts ?? 0}</TableCell>
                                        <TableCell>{org._count?.complaints ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/humanitarian-orgs/${org.id}`)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageChange(Math.max(1, initialPagination.page - 1))}
                                disabled={initialPagination.page === 1 || loading}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum} className={pageNum === initialPagination.page ? "font-bold" : ""}>
                                <PaginationLink
                                    onClick={() => handlePageChange(pageNum)}
                                    isActive={pageNum === initialPagination.page}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageChange(Math.min(totalPages, initialPagination.page + 1))}
                                disabled={initialPagination.page === totalPages || loading}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
