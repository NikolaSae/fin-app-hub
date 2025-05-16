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

      {/* OperatorFilters je Client Component i treba da koristi useSearchParams */}
      {/* Prosleđivanje initialFilters iz searchParams je u redu za inicijalizaciju */}
      <OperatorFilters initialFilters={searchParams} />

      <Suspense fallback={<OperatorListSkeleton />}>
        {/* Prosleđujemo searchParams pomoćnoj komponenti OperatorsList */}
        <OperatorsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Pomoćna async komponenta za dohvatanje podataka i renderovanje liste
async function OperatorsList({ searchParams }: {
    searchParams: {
        search?: string;
        active?: "all" | "active" | "inactive";
        sortBy?: "name" | "code" | "createdAt";
        sortOrder?: "asc" | "desc";
        page?: string;
        pageSize?: string;
    };
}) {
  // Parsiramo parametre OVDE, ne u roditeljskoj komponenti OperatorsPage
   const params = {
     search: searchParams.search ?? "",
     active: (searchParams.active ?? "all") as "all" | "active" | "inactive",
     sortBy: (searchParams.sortBy ?? "name") as "name" | "code" | "createdAt",
     sortOrder: (searchParams.sortOrder ?? "asc") as "asc" | "desc",
     page: searchParams.page ? Number(searchParams.page) : 1,
     pageSize: searchParams.pageSize ? Number(searchParams.pageSize) : 10,
   };

   // Dodatna provera za NaN nakon Number() parsiranja
   const safeParams = {
       ...params,
       page: isNaN(params.page) ? 1 : params.page,
       pageSize: isNaN(params.pageSize) ? 10 : params.pageSize,
   };

  // Poziv Server Action za dohvatanje podataka
  const result = await getOperators(safeParams); // getOperators vraća { operators: [...], ... }

  // --- FIX: Prosleđujemo SAMO niz operatora komponenti OperatorList ---
  // Takođe prosleđujemo podatke za paginaciju
  return <OperatorList data={result.operators} totalCount={result.totalCount} pageCount={result.pageCount} currentPage={result.currentPage} />;
  // ------------------------------------------------------------------
}

// Komponenta za prikaz Skeletona dok se podaci učitavaju
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
