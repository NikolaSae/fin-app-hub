// components/analytics/ComplaintAnalytics.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useComplaintAnalytics } from "@/hooks/use-complaint-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplaintStatus } from "@prisma/client";

const STATUS_COLORS = {
  NEW: "#4299e1",
  ASSIGNED: "#805ad5",
  IN_PROGRESS: "#f6ad55",
  PENDING: "#f6e05e",
  RESOLVED: "#68d391",
  CLOSED: "#38a169",
  REJECTED: "#e53e3e"
};

const PRIORITY_COLORS = ["#e53e3e", "#dd6b20", "#ecc94b", "#38a169", "#3182ce"];

export default function ComplaintAnalytics() {
  const { 
    trendData, 
    statusDistribution, 
    resolutionTimeAvg, 
    priorityDistribution, 
    isLoading, 
    error 
  } = useComplaintAnalytics();
  
  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Complaint Analytics</CardTitle>
          <CardDescription>Error loading complaint data</CardDescription>
        </CardHeader>
        <CardContent className="text-red-500">
          Failed to load complaint analytics. Please try again later.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Complaint Analytics</CardTitle>
        <CardDescription>Complaints trends and statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-2xl font-bold">{resolutionTimeAvg.overall} days</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Priority Avg. Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-2xl font-bold">{resolutionTimeAvg.highPriority} days</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-2xl font-bold">
                  {statusDistribution?.filter(s => 
                    ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING"].includes(s.status)
                  ).reduce((acc, curr) => acc + curr.count, 0)}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="text-2xl font-bold">
                  {trendData?.slice(-1)[0]?.resolved || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Complaint Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={trendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="new" stroke="#4299e1" name="New" />
                    <Line type="monotone" dataKey="resolved" stroke="#38a169" name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={statusDistribution}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Complaints">
                      {statusDistribution?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || "#000"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="priority"
                      label
                    >
                      {priorityDistribution?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PRIORITY_COLORS[entry.priority - 1] || "#000"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} complaints`, `Priority ${name}`]} />
                    <Legend formatter={(value) => `Priority ${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Resolution Time by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Resolution Time by Service Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={resolutionTimeAvg.byServiceType}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, "Avg. Resolution Time"]} />
                    <Legend />
                    <Bar dataKey="avgDays" name="Avg. Resolution Time (days)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}