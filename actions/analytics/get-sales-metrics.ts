///actions/analytics/get-sales-metrics.ts

"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canViewSalesData } from "@/lib/security/permission-checker";
import { revalidatePath } from "next/cache";

export type SalesMetricsParams = {
  startDate?: Date;
  endDate?: Date;
  serviceType?: string;
  providerId?: string;
};

export type SalesMetrics = {
  totalTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  transactionsByMonth: {
    month: string;
    transactions: number;
    revenue: number;
  }[];
  transactionsByServiceType: {
    serviceType: string;
    transactions: number;
    percentage: number;
  }[];
  topProviders: {
    providerName: string;
    transactions: number;
    revenue: number;
  }[];
  growthRate: {
    transactionsGrowth: number;
    revenueGrowth: number;
  };
};

export async function getSalesMetrics({
  startDate,
  endDate,
  serviceType,
  providerId,
}: SalesMetricsParams = {}): Promise<SalesMetrics> {
  const user = await currentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  // Check if the user has permission to view sales data
  const hasPermission = await canViewSalesData(user.id);
  if (!hasPermission) {
    throw new Error("You don't have permission to access sales data");
  }

  // Set default date range to last 12 months if not provided
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || defaultEndDate;

  // Calculate comparison period for growth metrics
  const periodLength = effectiveEndDate.getTime() - effectiveStartDate.getTime();
  const comparisonStartDate = new Date(effectiveStartDate.getTime() - periodLength);
  const comparisonEndDate = new Date(effectiveStartDate.getTime() - 1); // Just before current period

  // Query current period VAS service data
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

  // Query comparison period data for growth calculation
  const comparisonData = await db.vasService.findMany({
    where: {
      mesec_pruzanja_usluge: {
        gte: comparisonStartDate,
        lte: comparisonEndDate,
      },
      ...(serviceType ? { service: { type: serviceType as any } } : {}),
      ...(providerId ? { provajderId: providerId } : {}),
    },
  });

  // Group by month for time series
  const monthlyData = vasData.reduce((acc, item) => {
    const monthYear = item.mesec_pruzanja_usluge.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        transactions: 0,
        revenue: 0,
      };
    }
    
    acc[monthYear].transactions += item.broj_transakcija;
    acc[monthYear].revenue += item.fakturisan_iznos;
    
    return acc;
  }, {} as Record<string, { transactions: number; revenue: number; }>);

  // Group by service type
  const serviceTypeData = vasData.reduce((acc, item) => {
    const type = item.service.type;
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    acc[type] += item.broj_transakcija;
    
    return acc;
  }, {} as Record<string, number>);

  // Group by provider
  const providerData = vasData.reduce((acc, item) => {
    const name = item.provider.name;
    
    if (!acc[name]) {
      acc[name] = {
        transactions: 0,
        revenue: 0,
      };
    }
    
    acc[name].transactions += item.broj_transakcija;
    acc[name].revenue += item.fakturisan_iznos;
    
    return acc;
  }, {} as Record<string, { transactions: number; revenue: number; }>);

  // Calculate totals
  const totalTransactions = vasData.reduce((sum, item) => sum + item.broj_transakcija, 0);
  const totalRevenue = vasData.reduce((sum, item) => sum + item.fakturisan_iznos, 0);
  const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Calculate previous period totals for growth comparison
  const prevTotalTransactions = comparisonData.reduce((sum, item) => sum + item.broj_transakcija, 0);
  const prevTotalRevenue = comparisonData.reduce((sum, item) => sum + item.fakturisan_iznos, 0);

  // Calculate growth rates
  const transactionsGrowth = prevTotalTransactions > 0 
    ? ((totalTransactions - prevTotalTransactions) / prevTotalTransactions) * 100 
    : 0;
  const revenueGrowth = prevTotalRevenue > 0 
    ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
    : 0;

  // Format data for response
  const transactionsByMonth = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    transactions: data.transactions,
    revenue: data.revenue,
  }));

  const transactionsByServiceType = Object.entries(serviceTypeData).map(([serviceType, transactions]) => ({
    serviceType,
    transactions,
    percentage: totalTransactions > 0 ? (transactions / totalTransactions) * 100 : 0,
  }));

  const topProviders = Object.entries(providerData)
    .map(([providerName, data]) => ({
      providerName,
      transactions: data.transactions,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.transactions - a.transactions)
    .slice(0, 10); // Top 10 providers

  revalidatePath("/analytics/sales");

  return {
    totalTransactions,
    totalRevenue,
    averageTransactionValue,
    transactionsByMonth,
    transactionsByServiceType,
    topProviders,
    growthRate: {
      transactionsGrowth,
      revenueGrowth,
    },
  };
}