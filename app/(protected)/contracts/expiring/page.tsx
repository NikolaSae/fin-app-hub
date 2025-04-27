///app/(protected)/contracts/expiring/page.tsx

import { Suspense } from "react";
import { ExpiryTimelineChart } from "@/components/contracts/charts/ExpiryTimelineChart";
import { ContractList } from "@/components/contracts/ContractList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expiring Contracts | Management Dashboard",
  description: "View contracts that are expiring soon",
};

export default function ExpiringContractsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expiring Contracts</h1>
        <p className="text-gray-500">
          View and manage contracts that are expiring soon
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Suspense fallback={<div>Loading expiry timeline...</div>}>
          <ExpiryTimelineChart />
        </Suspense>
      </div>
      
      <Suspense fallback={<div>Loading expiring contracts...</div>}>
        <ContractList filter="expiring" />
      </Suspense>
    </div>
  );
}