// app/providers/[id]/page.tsx (Server Component)
import { getServerSession } from "next-auth";
import { db } from "@/auth"; // Adjust to your Prisma path
import { Auth } from "@/lib/auth"; // Your auth options
import { ProviderServiceTabs } from "@/components/ProviderServiceTabs"; // Tabs component for filtering services
import { Table } from "@/components/Table"; // Table component for sorting

export default async function ProviderPage({ params }) {
  const { id } = params; // Provider ID from URL
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>You need to be logged in to access this page</div>;
  }

  const provider = await db.provajder.findUnique({
    where: { id },
    include: {
      vasServices: {
        include: {
          complaints: true, // Include complaints for VAS services
        },
      },
      bulkServices: {
        include: {
          complaints: true, // Include complaints for Bulk services
        },
      },
      parkingServices: {
        include: {
          complaints: true, // Include complaints for Parking services
        },
      },
      humanServices: {
        include: {
          complaints: true, // Include complaints for Human services
        },
      },
    },
  });

  if (!provider) {
    return <div>Provider not found</div>;
  }

  return (
    <div>
      <h1>{provider.name} Services</h1>
      <ProviderServiceTabs provider={provider} />
      <Table services={provider.vasServices} serviceType="VAS" />
      <Table services={provider.bulkServices} serviceType="Bulk" />
      <Table services={provider.parkingServices} serviceType="Parking" />
      <Table services={provider.humanServices} serviceType="Human" />
    </div>
  );
}
