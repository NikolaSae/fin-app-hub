// app/(protected)/contracts/expiring/page.tsx
import { ExpiryTimelineChart } from "@/components/contracts/charts/ExpiryTimelineChart";
import { EnhancedContractList } from "@/components/contracts/enhanced-contract-list";
import { Metadata } from "next";
import { getExpiringContractsTimeline } from "@/actions/contracts/get-expiring-contracts-timeline";
import { getExpiringContracts } from "@/actions/contracts/get-expiring-contracts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Expiring Contracts | Management Dashboard",
  description: "View contracts that are expiring soon or recently expired",
};

export default async function ExpiringContractsPage() {
  // ✅ Explicitly pass 60 days threshold
  const [timelineData, expiringContracts] = await Promise.all([
    getExpiringContractsTimeline(60), // 60 days for timeline
    getExpiringContracts(60)          // 60 days for contracts list
  ]);
  
  // Get current server time for expiry calculations
  const serverTime = new Date().toISOString();
  
  // Debug logs
  console.log("=== EXPIRING CONTRACTS PAGE ===");
  console.log("Server time:", serverTime);
  console.log("Timeline data points:", timelineData?.length || 0);
  console.log("Expiring contracts count:", expiringContracts?.length || 0);
  
  // Log each contract with its expiry status
  expiringContracts?.forEach(contract => {
    const endDate = new Date(contract.endDate);
    const currentDate = new Date(serverTime);
    const diffInMs = endDate.getTime() - currentDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    console.log(`Contract: ${contract.name} | Days to expiry: ${diffInDays} | Status: ${contract.status}`);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expiring Contracts</h1>
          <p className="text-gray-500">
            View and manage contracts expiring within 60 days or recently expired
          </p>
        </div>
        <Link
          href="/contracts"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Link>
      </div>
      
      {/* Timeline Chart */}
      {timelineData && timelineData.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Contract Expiry Timeline</h2>
          <ExpiryTimelineChart data={timelineData} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Contract Expiry Timeline</h2>
          <p className="text-gray-500">No timeline data available</p>
        </div>
      )}
      
      {/* Contracts List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Expiring & Recently Expired Contracts</h2>
          <div className="text-sm text-gray-500">
            Showing contracts within 60 days (past and future)
          </div>
        </div>
        
        {expiringContracts && expiringContracts.length > 0 ? (
          <EnhancedContractList 
            contracts={expiringContracts}
            serverTime={serverTime}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">No expiring contracts found</h3>
              <p className="text-gray-500 mt-1">
                No contracts are expiring within the next 60 days or have expired in the last 60 days.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}