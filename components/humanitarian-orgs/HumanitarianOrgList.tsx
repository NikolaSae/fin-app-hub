// /components/humanitarian-orgs/HumanitarianOrgList.tsx
"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHumanitarianOrgs } from "@/hooks/use-humanitarian-orgs";
import { HumanitarianOrgFilters } from "@/components/humanitarian-orgs/HumanitarianOrgFilters";
import { HumanitarianOrgFilterOptions } from "@/lib/types/humanitarian-org-types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function HumanitarianOrgList() {
    const router = useRouter();

    const { humanitarianOrgs, totalCount, loading, error, setFilters } = useHumanitarianOrgs(
        {}, 
        { page: 1, limit: 100 }
    );

    const handleFilterChange = useCallback((filterOptions: HumanitarianOrgFilterOptions) => {
        setFilters(filterOptions);
    }, [setFilters]);

    if (loading) {
         return <div className="text-center py-4 text-muted-foreground">Loading organizations...</div>;
    }

    if (error) {
         return <div className="text-center py-4 text-red-500">Error loading organizations: {error.message}</div>;
    }

    return (
        <div className="space-y-4">
            <HumanitarianOrgFilters onFilterChange={handleFilterChange} />

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
        </div>
    );
}