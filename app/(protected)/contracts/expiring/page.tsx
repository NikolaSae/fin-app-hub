// app/(protected)/contracts/expiring/page.tsx
import { ExpiryTimelineChart } from "@/components/contracts/charts/ExpiryTimelineChart";
import { EnhancedContractList } from "@/components/contracts/enhanced-contract-list";
import { Metadata } from "next";
import { getExpiringContractsTimeline } from "@/actions/contracts/get-expiring-contracts-timeline";
import { getExpiringContracts } from "@/actions/contracts/get-expiring-contracts";

export const metadata: Metadata = {
  title: "Expiring Contracts | Management Dashboard",
  description: "View contracts that are expiring soon",
};

export default async function ExpiringContractsPage() {
  const [timelineData, expiringContracts] = await Promise.all([
    getExpiringContractsTimeline(),
    getExpiringContracts()
  ]);

  // Get current server time for expiry calculations
  const serverTime = new Date().toISOString();

  // Debug logs
  console.log("Timeline data:", timelineData);
  console.log("Expiring contracts:", expiringContracts);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expiring Contracts</h1>
        <p className="text-gray-500">
          View and manage contracts that are expiring soon
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <ExpiryTimelineChart data={timelineData} />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Expiring Contracts List</h2>
        <EnhancedContractList 
          contracts={expiringContracts}
          serverTime={serverTime}
        />
      </div>
    </div>
  );
}