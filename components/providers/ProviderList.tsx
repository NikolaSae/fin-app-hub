// components/providers/ProviderList.tsx
"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Link from "next/link";
import { useProviders } from "@/hooks/use-providers";

export function ProviderList() {
  const { providers, total, pagination, loading, error, setPagination } = useProviders();

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) return <div className="text-center py-4">Loading providers...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Contracts</TableHead>
              <TableHead>Complaints</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map(provider => (
              <TableRow key={provider.id}>
                <TableCell>
                  <Link href={`/providers/${provider.id}`} className="font-medium text-blue-600 hover:underline">
                    {provider.name}
                  </Link>
                </TableCell>
                <TableCell>{provider.contactName || "N/A"}</TableCell>
                <TableCell>{provider.email || "N/A"}</TableCell>
                <TableCell>{provider.phone || "N/A"}</TableCell>
                <TableCell>{provider.isActive ? "Yes" : "No"}</TableCell>
                <TableCell>{provider._count?.contracts || 0}</TableCell>
                <TableCell>{provider._count?.complaints || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > pagination.limit && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
              />
            </PaginationItem>
            {Array.from({ length: Math.ceil(total / pagination.limit) }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={index + 1 === pagination.page}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(Math.ceil(total / pagination.limit), pagination.page + 1))}
                disabled={pagination.page >= Math.ceil(total / pagination.limit)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}