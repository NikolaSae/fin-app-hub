///components/analytics/KpiDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  DollarSignIcon, 
  ShoppingCartIcon, 
  AlertCircleIcon, 
  PercentIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatters";
import { FinancialData, SalesData, ComplaintData } from "@/lib/types/analytics-types";

interface KpiDashboardProps {
  financialData: FinancialData;
  salesData: SalesData;
  complaintData: ComplaintData;
}

export default function KpiDashboard({
  financialData,
  salesData,
  complaintData,
}: KpiDashboardProps) {
  // To handle client-side data refreshes
  const [financial, setFinancial] = useState<FinancialData>(financialData);
  const [sales, setSales] = useState<SalesData>(salesData);
  const [complaints, setComplaints] = useState<ComplaintData>(complaintData);

  // Update state when props change
  useEffect(() => {
    setFinancial(financialData);
    setSales(salesData);
    setComplaints(complaintData);
  }, [financialData, salesData, complaintData]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Revenue"
        value={formatCurrency(financial.totalRevenue)}
        description={`${financial.revenueChangePercentage >= 0 ? "+" : ""}${financial.revenueChangePercentage}% from previous period`}
        icon={<DollarSignIcon className="h-4 w-4" />}
        changeValue={financial.revenueChangePercentage}
      />
      
      <KpiCard
        title="Services Sold"
        value={sales.totalServices.toString()}
        description={`${sales.serviceChangePercentage >= 0 ? "+" : ""}${sales.serviceChangePercentage}% from previous period`}
        icon={<ShoppingCartIcon className="h-4 w-4" />}
        changeValue={sales.serviceChangePercentage}
      />
      
      <KpiCard
        title="Complaint Resolution"
        value={`${complaints.resolutionRatePercentage}%`}
        description={`${complaints.resolutionRateChange >= 0 ? "+" : ""}${complaints.resolutionRateChange}% from previous period`}
        icon={<AlertCircleIcon className="h-4 w-4" />}
        changeValue={complaints.resolutionRateChange}
      />
      
      <KpiCard
        title="Contract Renewal Rate"
        value={`${financial.contractRenewalRate}%`}
        description={`${financial.contractRenewalRateChange >= 0 ? "+" : ""}${financial.contractRenewalRateChange}% from previous period`}
        icon={<PercentIcon className="h-4 w-4" />}
        changeValue={financial.contractRenewalRateChange}
      />
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  changeValue: number;
}

function KpiCard({ title, value, description, icon, changeValue }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {icon}
            </TooltipTrigger>
            <TooltipContent>
              <p>Key performance indicator</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {changeValue > 0 ? (
            <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
          ) : changeValue < 0 ? (
            <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
          ) : null}
          <span
            className={cn(
              changeValue > 0 ? "text-green-500" : "",
              changeValue < 0 ? "text-red-500" : ""
            )}
          >
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}