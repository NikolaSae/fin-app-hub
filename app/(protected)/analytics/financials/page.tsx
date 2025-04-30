///app/(protected)/analytics/financials/page.tsx

import { auth } from "@/auth";
import FinancialOverview from "@/components/analytics/FinancialOverview";
import DataFilters from "@/components/analytics/DataFilters";
import { Metadata } from "next";
import { getFinancialData } from "@/actions/analytics/get-financial-data";

export const metadata: Metadata = {
  title: "Financial Analytics",
  description: "Financial performance metrics and analysis",
};

export default async function FinancialAnalyticsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    return <div>Access denied. Please log in to view financial analytics.</div>;
  }

  // Fetch financial data using server action
  const financialData = await getFinancialData();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive financial performance metrics and analysis
          </p>
        </div>
      </div>
      
      <DataFilters />
      
      <div className="grid gap-6">
        <FinancialOverview data={financialData} />
      </div>
    </div>
  );
}