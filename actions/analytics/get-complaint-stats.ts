///actions/analytics/get-complaint-stats.ts


"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canViewComplaintData } from "@/lib/security/permission-checker";
import { revalidatePath } from "next/cache";
import { ComplaintStatus } from "@prisma/client";

export type ComplaintStatsParams = {
  startDate?: Date;
  endDate?: Date;
  serviceType?: string;
  providerId?: string;
};

export type ComplaintStats = {
  totalComplaints: number;
  resolvedComplaints: number;
  openComplaints: number;
  averageResolutionTime: number;
  complaintsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  complaintsByMonth: {
    month: string;
    total: number;
    resolved: number;
  }[];
  complaintsByService: {
    serviceName: string;
    count: number;
    percentage: number;
  }[];
  complaintsByProvider: {
    providerName: string;
    count: number;
    resolvedCount: number;
    averageResolutionTime: number;
  }[];
  highPriorityComplaints: number;
  financialImpact: number;
};

export async function getComplaintStats({
  startDate,
  endDate,
  serviceType,
  providerId,
}: ComplaintStatsParams = {}): Promise<ComplaintStats> {
  const user = await currentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  // Check if the user has permission to view complaint data
  const hasPermission = await canViewComplaintData(user.id);
  if (!hasPermission) {
    throw new Error("You don't have permission to access complaint data");
  }

  // Set default date range to last 12 months if not provided
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || defaultEndDate;

  // Query complaint data
  const complaints = await db.complaint.findMany({
    where: {
      createdAt: {
        gte: effectiveStartDate,
        lte: effectiveEndDate,
      },
      ...(serviceType ? { service: { type: serviceType } } : {}),
      ...(providerId ? { providerId: providerId } : {}),
    },
    include: {
      service: true,
      provider: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Calculate core metrics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => 
    c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED
  ).length;
  const openComplaints = totalComplaints - resolvedComplaints;
  
  // Calculate average resolution time
  const resolvedComplaintsWithDates = complaints.filter(c => 
    (c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED) && c.resolvedAt
  );
  
  const totalResolutionTimeMs = resolvedComplaintsWithDates.reduce((sum, complaint) => {
    return sum + (complaint.resolvedAt?.getTime() ?? 0) - complaint.createdAt.getTime();
  }, 0);
  
  const averageResolutionTime = resolvedComplaintsWithDates.length > 0 
    ? totalResolutionTimeMs / resolvedComplaintsWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
    : 0;

  // Group by status
  const statusCounts = complaints.reduce((acc, complaint) => {
    const status = complaint.status;
    
    if (!acc[status]) {
      acc[status] = 0;
    }
    
    acc[status]++;
    
    return acc;
  }, {} as Record<string, number>);

  // Group by month
  const monthlyData = complaints.reduce((acc, complaint) => {
    const monthYear = complaint.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        total: 0,
        resolved: 0,
      };
    }
    
    acc[monthYear].total++;
    if (complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED) {
      acc[monthYear].resolved++;
    }
    
    return acc;
  }, {} as Record<string, { total: number; resolved: number; }>);

  // Group by service
  const serviceData = complaints.reduce((acc, complaint) => {
    const serviceName = complaint.service?.name || 'Unknown';
    
    if (!acc[serviceName]) {
      acc[serviceName] = 0;
    }
    
    acc[serviceName]++;
    
    return acc;
  }, {} as Record<string, number>);

  // Group by provider
  const providerData = complaints.reduce((acc, complaint) => {
    const providerName = complaint.provider?.name || 'Unknown';
    
    if (!acc[providerName]) {
      acc[providerName] = {
        count: 0,
        resolvedCount: 0,
        totalResolutionTime: 0,
      };
    }
    
    acc[providerName].count++;
    
    if ((complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.CLOSED) && complaint.resolvedAt) {
      acc[providerName].resolvedCount++;
      acc[providerName].totalResolutionTime += complaint.resolvedAt.getTime() - complaint.createdAt.getTime();
    }
    
    return acc;
  }, {} as Record<string, { count: number; resolvedCount: number; totalResolutionTime: number; }>);

  // High priority complaints (priority 1 or 2)
  const highPriorityComplaints = complaints.filter(c => c.priority <= 2).length;
  
  // Financial impact
  const financialImpact = complaints.reduce((sum, complaint) => {
    return sum + (complaint.financialImpact || 0);
  }, 0);

  // Format data for response
  const complaintsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalComplaints > 0 ? (count / totalComplaints) * 100 : 0,
  }));

  const complaintsByMonth = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    total: data.total,
    resolved: data.resolved,
  }));

  const complaintsByService = Object.entries(serviceData)
    .map(([serviceName, count]) => ({
      serviceName,
      count,
      percentage: totalComplaints > 0 ? (count / totalComplaints) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const complaintsByProvider = Object.entries(providerData)
    .map(([providerName, data]) => ({
      providerName,
      count: data.count,
      resolvedCount: data.resolvedCount,
      averageResolutionTime: data.resolvedCount > 0 
        ? data.totalResolutionTime / data.resolvedCount / (1000 * 60 * 60 * 24) // Convert to days
        : 0,
    }))
    .sort((a, b) => b.count - a.count);

  revalidatePath("/analytics/complaints");

  return {
    totalComplaints,
    resolvedComplaints,
    openComplaints,
    averageResolutionTime,
    complaintsByStatus,
    complaintsByMonth,
    complaintsByService,
    complaintsByProvider,
    highPriorityComplaints,
    financialImpact,
  };
}