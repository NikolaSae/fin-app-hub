//app/(protected)/parking-services/page.tsx


import { Suspense } from "react";
import { Metadata } from "next";
import { getParkingServices } from "@/actions/parking-services/getParkingServices";
import ParkingServiceList from "@/components/parking-services/ParkingServiceList";
import ParkingServiceFilters from "@/components/parking-services/ParkingServiceFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ListSkeleton from "@/components/skeletons/ListSkeleton";

export const metadata: Metadata = {
  title: "Parking Services | Contract Management System",
  description: "Manage parking services in the contract management system",
};

interface ParkingServiceFilters {
  name?: string;
  isActive?: boolean | undefined;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

async function ParkingServiceListFetcher({ filters }: { filters: ParkingServiceFilters }) {
  const result = await getParkingServices(filters);

  if (!result.success || !result.data) {
    console.error("Failed to fetch parking services:", result.error);
    return <div>Greška pri učitavanju parking servisa: {result.error || "Nepoznata greška"}</div>;
  }

  const parkingServicesArray = result.data.parkingServices;

  return <ParkingServiceList parkingServices={parkingServicesArray} />;
}


export default async function ParkingServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const awaitedSearchParams = await searchParams;

  const filters: ParkingServiceFilters = {
    name: awaitedSearchParams.name as string | undefined,
    isActive: awaitedSearchParams.isActive === "true" ? true : awaitedSearchParams.isActive === "false" ? false : undefined,
    page: awaitedSearchParams.page ? parseInt(awaitedSearchParams.page as string) : 1,
    limit: awaitedSearchParams.limit ? parseInt(awaitedSearchParams.limit as string) : 10,
    sortBy: awaitedSearchParams.sortBy as string | undefined,
    sortOrder: awaitedSearchParams.sortOrder as "asc" | "desc" | undefined,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Parking Services"
        description="Upravljajte parking servisima za potrebe upravljanja ugovorima"
        actions={
          <Link href="/parking-services/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj novi servis
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Parking servisi</CardTitle>
        </CardHeader>
        <CardContent>
          <ParkingServiceFilters initialFilters={filters} />

          <Suspense fallback={<ListSkeleton count={filters.limit} />}>
            <ParkingServiceListFetcher filters={filters} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}