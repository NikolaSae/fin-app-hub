///actions/analytics/get-financial-data.ts

"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canViewFinancialData } from "@/lib/security/permission-checker";
import { revalidatePath } from "next/cache";

export type FinancialDataParams = {
  startDate?: Date;
  endDate?: Date;
  serviceType?: string;
  providerId?: string;
};

export type FinancialMetrics = {
  totalRevenue: number;
  outstandingAmount: number;
  collectedAmount: number;
  canceledAmount: number;
  revenueByMonth: {
    month: string;
    revenue: number;
    collected: number;
    outstanding: number;
  }[];
  serviceTypeBreakdown: {
    serviceType: string;
    revenue: number;
    percentage: number;
  }[];
  providerBreakdown: {
    providerName: string;
    revenue: number;
    percentage: number;
  }[];
};

export async function getFinancialData({
  startDate,
  endDate,
  serviceType,
  providerId,
}: FinancialDataParams = {}): Promise<FinancialMetrics> {
  const user = await currentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  // Check if the user has permission to view financial data
  const hasPermission = await canViewFinancialData(user.id);
  if (!hasPermission) {
    throw new Error("You don't have permission to access financial data");
  }

  // Set default date range to last 12 months if not provided
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || defaultEndDate;

  // Query VAS service data
  const vasData = await db.vasService.findMany({
    where: {
      mesec_pruzanja_usluge: {
        gte: effectiveStartDate,
        lte: effectiveEndDate,
      },
      ...(serviceType ? { service: { type: serviceType as any } } : {}),
      ...(providerId ? { provajderId: providerId } : {}),
    },
    include: {
      service: true,
      provider: true,
    },
    orderBy: {
      mesec_pruzanja_usluge: "asc",
    },
  });

  // Group by month for time series
  const monthlyData = vasData.reduce((acc, item) => {
    const monthYear = item.mesec_pruzanja_usluge.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        revenue: 0,
        collected: 0,
        outstanding: 0,
      };
    }
    
    acc[monthYear].revenue += item.fakturisan_iznos;
    acc[monthYear].collected += item.naplacen_iznos;
    acc[monthYear].outstanding += item.nenaplacen_iznos;
    
    return acc;
  }, {} as Record<string, { revenue: number; collected: number; outstanding: number; }>);

  // Group by service type
  const serviceTypeData = vasData.reduce((acc, item) => {
    const type = item.service.type;
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    acc[type] += item.fakturisan_iznos;
    
    return acc;
  }, {} as Record<string, number>);

  // Group by provider
  const providerData = vasData.reduce((acc, item) => {
    const name = item.provider.name;
    
    if (!acc[name]) {
      acc[name] = 0;
    }
    
    acc[name] += item.fakturisan_iznos;
    
    return acc;
  }, {} as Record<string, number>);

  // Calculate totals
  const totalRevenue = vasData.reduce((sum, item) => sum + item.fakturisan_iznos, 0);
  const collectedAmount = vasData.reduce((sum, item) => sum + item.naplacen_iznos, 0);
  const outstandingAmount = vasData.reduce((sum, item) => sum + item.nenaplacen_iznos, 0);
  const canceledAmount = vasData.reduce((sum, item) => sum + item.otkazan_iznos, 0);

  // Format data for response
  const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    collected: data.collected,
    outstanding: data.outstanding,
  }));

  const serviceTypeBreakdown = Object.entries(serviceTypeData).map(([serviceType, revenue]) => ({
    serviceType,
    revenue,
    percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
  }));

  const providerBreakdown = Object.entries(providerData)
    .map(([providerName, revenue]) => ({
      providerName,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Top 10 providers

  revalidatePath("/analytics/financials");

  return {
    totalRevenue,
    outstandingAmount,
    collectedAmount,
    canceledAmount,
    revenueByMonth,
    serviceTypeBreakdown,
    providerBreakdown,
  };
}