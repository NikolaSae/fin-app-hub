// components/complaints/reports/KpiDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusChart } from "@/components/complaints/charts/StatusChart";
import { TrendChart } from "@/components/complaints/charts/TrendChart";
import { MonthlyComparisonChart } from "@/components/complaints/charts/MonthlyComparisonChart";
import { ServiceCategoryBreakdown } from "@/components/complaints/charts/ServiceCategoryBreakdown";
import { ProviderPerformance } from "@/components/complaints/charts/ProviderPerformance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "@/components/ui/date-range";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
import { ComplaintStatus, ServiceType } from "@/lib/types/enums";
import { format, addDays, subDays, subMonths } from "date-fns";

interface KpiDashboardProps {
  onExport?: () => void;
}

export function KpiDashboard({ onExport }: KpiDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "providers">("overview");
  
  // Sample data - in a real app, you would fetch this from your API
  const [statusData, setStatusData] = useState<{ status: ComplaintStatus; count: number }[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [providerData, setProviderData] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would make an API call like:
        // const response = await fetch(`/api/complaints/statistics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
        // const data = await response.json();
        
        // For now, we'll use mock data
        setTimeout(() => {
          // Mock status data
          setStatusData([
            { status: ComplaintStatus.NEW, count: 23 },
            { status: ComplaintStatus.ASSIGNED, count: 15 },
            { status: ComplaintStatus.IN_PROGRESS, count: 32 },
            { status: ComplaintStatus.PENDING, count: 8 },
            { status: ComplaintStatus.RESOLVED, count: 42 },
            { status: ComplaintStatus.CLOSED, count: 67 },
            { status: ComplaintStatus.REJECTED, count: 12 },
          ]);
          
          // Mock trend data
          const trendMockData = [];
          for (let i = 30; i >= 0; i--) {
            const date = subDays(new Date(), i);
            trendMockData.push({
              date: format(date, "MMM dd"),
              new: Math.floor(Math.random() * 10),
              resolved: Math.floor(Math.random() * 8),
              closed: Math.floor(Math.random() * 7),
              total: Math.floor(Math.random() * 15) + 20,
            });
          }
          setTrendData(trendMockData);
          
          // Mock service data
          setServiceData([
            { name: "VAS", count: 65, percentage: 32.5 },
            { name: "BULK", count: 45, percentage: 22.5 },
            { name: "HUMANITARIAN", count: 53, percentage: 26.5 },
            { name: "PARKING", count: 37, percentage: 18.5 },
          ]);
          
          // Mock provider data
          setProviderData([
            { name: "Provider A", complaints: 32, resolutionTime: 3.2, satisfaction: 4.2 },
            { name: "Provider B", complaints: 24, resolutionTime: 2.5, satisfaction: 3.8 },
            { name: "Provider C", complaints: 18, resolutionTime: 4.1, satisfaction: 3.5 },
            { name: "Provider D", complaints: 12, resolutionTime: 1.8, satisfaction: 4.7 },
            { name: "Provider E", complaints: 8, resolutionTime: 2.9, satisfaction: 4.0 },
          ]);
          
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange]);
  
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "overview" | "services" | "providers")}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRange
            dateRange={dateRange}
            onUpdate={setDateRange}
          />
          
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={isLoading}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <TabsContent value="overview" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "199"}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "78"}
              </div>
              <p className="text-xs text-muted-foreground">
                -3% from previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "3.2 days"}
              </div>
              <p className="text-xs text-muted-foreground">
                -0.5 days from previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "92%"}
              </div>
              <p className="text-xs text-muted-foreground">
                +2.5% from previous period
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart 
            data={trendData} 
            isLoading={isLoading} 
            title="Complaint Trends"
          />
          
          <StatusChart 
            data={statusData} 
            isLoading={isLoading} 
            title="Complaints by Status"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="services" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceCategoryBreakdown 
            data={serviceData} 
            isLoading={isLoading}
          />
          
          <MonthlyComparisonChart 
            isLoading={isLoading}
            title="Complaints by Service Type (Monthly)"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="providers" className="space-y-6 mt-6">
        <ProviderPerformance 
          data={providerData} 
          isLoading={isLoading}
        />
      </TabsContent>
    </div>
  );
}