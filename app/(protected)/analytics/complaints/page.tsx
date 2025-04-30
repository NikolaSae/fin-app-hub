/app/(protected)/analytics/complaints/page.tsx

import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import ComplaintAnalytics from "@/components/analytics/ComplaintAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataFilters from "@/components/analytics/DataFilters";
import AnomalyDetection from "@/components/analytics/AnomalyDetection";

export const metadata: Metadata = {
  title: "Complaint Analytics | Dashboard",
  description: "Analysis and trends of complaint data",
};

export default async function ComplaintAnalyticsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaint Analytics</h1>
          <p className="text-muted-foreground">
            Monitor complaint trends, resolution rates, and performance metrics
          </p>
        </div>
      </div>

      <DataFilters 
        defaultDateRange="last30days"
        filterOptions={[
          {
            id: "status",
            name: "Status",
            options: ["All", "New", "Assigned", "In Progress", "Resolved", "Closed"],
          },
          {
            id: "priority",
            name: "Priority",
            options: ["All", "High", "Medium", "Low"],
          },
          {
            id: "serviceType",
            name: "Service Type",
            options: ["All", "VAS", "BULK", "HUMANITARIAN", "PARKING"],
          },
        ]}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="resolution">Resolution Times</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ComplaintAnalytics view="overview" />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <ComplaintAnalytics view="trends" />
        </TabsContent>
        
        <TabsContent value="resolution" className="space-y-4">
          <ComplaintAnalytics view="resolution" />
        </TabsContent>
        
        <TabsContent value="anomalies" className="space-y-4">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Complaint Anomalies</h2>
            <AnomalyDetection 
              dataType="complaints"
              description="Unusual patterns in complaint submissions or resolution times"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}