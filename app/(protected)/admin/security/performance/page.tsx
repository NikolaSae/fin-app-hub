////app/(protected)/admin/security/performance/page.tsx


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceMetrics from "@/components/security/PerformanceMetrics"; // Default import
import SystemResources from "@/components/security/SystemResources";
import APIResponseTimes from "@/components/security/APIResponseTimes";
import DatabasePerformance from "@/components/security/DatabasePerformance";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { useEffect, useState } from "react"; // Dodato za Client Component State/Effects
import { AlertTriangle, Cpu, Activity, Clock, HardDrive } from "lucide-react"; // Ikone za kartice


export const metadata: Metadata = {
  title: 'Performance Monitoring | Admin',
  description: 'Monitor system performance metrics and resource utilization',
};

interface PerformanceSummary {
  totalRequests: number;
  avgResponseTime: number | null;
  errorRate: number | null;
  avgCpuUsage: number | null;
  avgMemoryUsage: number | null;
}

const formatValue = (value: number | null, type: string) => {
    if (value === null) return "--";
    switch(type) {
        case "time": return `${value.toFixed(2)}ms`;
        case "percentage": return `${value.toFixed(2)}%`;
        case "count": return value.toLocaleString();
        case "memory": // Pretpostavljamo da je vrednost u GB ili se mora konvertovati
             if (value < 1024) return `${value.toFixed(0)} MB`; // Primer: ako je ulaz MB
             return `${(value / 1024).toFixed(1)} GB`; // Primer: konverzija MB u GB
        default: return value.toString();
    }
}

export default async function PerformanceMonitoringPageServer() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
    // Fetchovanje podrazumevanih sumarnih metrika na Serveru (za 24h)
    const defaultSummaryResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/security/performance/summary?timeRange=24h`, { cache: 'no-store' });
    const initialSummary: PerformanceSummary = defaultSummaryResponse.ok ? await defaultSummaryResponse.json() : { totalRequests: 0, avgResponseTime: null, errorRate: null, avgCpuUsage: null, avgMemoryUsage: null };


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system performance metrics and resource utilization
          </p>
        </div>
      </div>

      {/* Sumarne kartice - sada popunjene inicijalnim podacima fetched na Serveru */}
      {/* Ove kartice se NEĆE dinamički ažurirati kada se promeni timeRange u PerformanceMetrics bez dodatne Client-side logike */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                 <div className="text-2xl font-bold">
                      {formatValue(initialSummary.totalRequests, "count")}
                 </div>
                 <p className="text-xs text-muted-foreground">last 24 hours</p>
             </CardContent>
         </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                 <div className="text-2xl font-bold">
                      {formatValue(initialSummary.avgResponseTime, "time")}
                 </div>
                 <p className="text-xs text-muted-foreground">last 24 hours</p>
             </CardContent>
         </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                 <div className="text-2xl font-bold">
                      {formatValue(initialSummary.errorRate, "percentage")}
                 </div>
                 <p className="text-xs text-muted-foreground">last 24 hours</p>
             </CardContent>
         </Card>
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">Avg System Resources</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                 <div className="text-lg font-bold">
                      CPU: {formatValue(initialSummary.avgCpuUsage, "percentage")}
                 </div>
                  <div className="text-lg font-bold">
                      Mem: {formatValue(initialSummary.avgMemoryUsage, "percentage")}
                 </div>
                  <p className="text-xs text-muted-foreground">last 24 hours</p>
             </CardContent>
         </Card>
      </div>

      {/* Tabs za različite sekcije performansi */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="resources">System Resources</TabsTrigger>
        </TabsList>

        {/* Tab Content - Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* PerformanceMetrics komponenta (originalna verzija) ide ovde */}
          <PerformanceMetrics /> {/* Dohvaća podatke sa /api/security/performance */}
        </TabsContent>

        {/* Tab Content - API Performance */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Response Times</CardTitle>
              <CardDescription>
                Performance metrics for API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIResponseTimes />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content - Database */}
        <TabsContent value="database" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>
                Query execution times and database metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabasePerformance />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content - System Resources */}
        <TabsContent value="resources" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>
                CPU, memory, and disk usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemResources />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}