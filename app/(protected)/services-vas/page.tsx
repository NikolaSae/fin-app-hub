// app/(protected)/services-vas/page.tsx

import { db } from "@/lib/db";
import { ProviderStatistics } from "@/components/services/ProviderStatistics";
import { ProviderServiceTabs } from "@/components/services/ProviderServiceTabs";

// Server komponenta za učitavanje podataka
export default async function ServiceDashboard() {
  const providers = await db.provajder.findMany({
    include: {
      vasServices: true,
      bulkServices: true,
      parkingServices: true,
      humanServices: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Servisa</h1>
      {/* Statistika provajdera */}
      <ProviderStatistics providers={providers} />
      {/* Tabele sa servisima */}
      {providers.length > 0 && <ProviderServiceTabs provider={providers[0]} />}
    </div>
  );
}
