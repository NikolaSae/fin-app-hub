// Path: app/(protected)/operators/page.tsx

import { getOperators } from "@/actions/operators";
import { OperatorList } from "@/components/operators/OperatorList";
import { OperatorFilters } from "@/components/operators/OperatorFilters";
import { Suspense } from "react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Operators | Management Platform",
  description: "Manage operators in the system",
};

export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    active?: "all" | "active" | "inactive";
    sortBy?: "name" | "code" | "createdAt";
    sortOrder?: "asc" | "desc";
    page?: string;
    pageSize?: string;
  };
}) {
  // In Next.js v5, you need to await searchParams before accessing its properties
  const searchParamsData = await searchParams;
  
  const initialFilters = {
    search: searchParamsData.search ?? "",
    active: (searchParamsData.active ?? "all") as "all" | "active" | "inactive",
    sortBy: (searchParamsData.sortBy ?? "name") as "name" | "code" | "createdAt",
    sortOrder: (searchParamsData.sortOrder ?? "asc") as "asc" | "desc",
    page: searchParamsData.page ? Number(searchParamsData.page) : 1,
    pageSize: searchParamsData.pageSize ? Number(searchParamsData.pageSize) : 10,
  };

  // Additional check for NaN after Number() parsing
  const safeFilters = {
    ...initialFilters,
    page: isNaN(initialFilters.page) ? 1 : initialFilters.page,
    pageSize: isNaN(initialFilters.pageSize) ? 10 : initialFilters.pageSize,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operators</h1>
          <p className="text-muted-foreground">
            Manage operators within the system
          </p>
        </div>
        <Button asChild>
          <Link href="/operators/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Operator
          </Link>
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Pass the awaited searchParams to the client component */}
      <OperatorFilters initialFilters={searchParamsData} />

      <Suspense fallback={<OperatorListSkeleton />}>
        {/* Pass the processed filters to the OperatorsList component */}
        <OperatorsList filters={safeFilters} />
      </Suspense>
    </div>
  );
}

// Helper async component for fetching data and rendering the list
async function OperatorsList({ filters }: {
    filters: {
      search: string;
      active: "all" | "active" | "inactive";
      sortBy: "name" | "code" | "createdAt";
      sortOrder: "asc" | "desc";
      page: number;
      pageSize: number;
    };
}) {
  // Call Server Action to fetch data using the processed filters
  const result = await getOperators(filters);

  // Pass only the operators array to the OperatorList component
  // Also pass pagination data
  return <OperatorList data={result.operators} totalCount={result.totalCount} pageCount={result.pageCount} currentPage={result.currentPage} />;
}

// Component to display skeleton while data is loading
function OperatorListSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="rounded-md border">
        <div className="bg-muted/50 p-4">
          <div className="grid grid-cols-6 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
          </div>
        </div>
        <div className="divide-y">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4">
                <div className="grid grid-cols-6 gap-4">
                  {Array(6)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-6" />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}