///app/(protected)/analytics/sales/page.tsx

import { auth } from "@/auth";
import SalesChart from "@/components/analytics/SalesChart";
import DataFilters from "@/components/analytics/DataFilters";
import { Metadata } from "next";
import { getSalesMetrics } from "@/actions/analytics/get-sales-metrics";

export const metadata: Metadata = {
  title: "Sales Analytics",
  description: "Sales performance metrics and trend analysis",
};

export default async function SalesAnalyticsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    return <div>Access denied. Please log in to view sales analytics.</div>;
  }

  // Fetch sales metrics using server action
  const salesData = await getSalesMetrics();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Detailed sales performance metrics and trend analysis
          </p>
        </div>
      </div>
      
      <DataFilters />
      
      <div className="grid gap-6">
        <SalesChart data={salesData} />
      </div>
    </div>
  );
}