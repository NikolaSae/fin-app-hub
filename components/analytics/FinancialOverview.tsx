///components/analytics/FinancialOverview.tsx

"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FinancialDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProviderRevenue {
  provider: string;
  revenue: number;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
}

interface FinancialOverviewProps {
  data: {
    monthlyFinancials: FinancialDataPoint[];
    providerRevenue: ProviderRevenue[];
    serviceRevenue: ServiceRevenue[];
    quarterlyComparison: {
      quarter: string;
      thisYear: number;
      lastYear: number;
      growth: number;
    }[];
  };
}

export default function FinancialOverview({ data }: FinancialOverviewProps) {
  const totalRevenue = useMemo(() => {
    return data.monthlyFinancials.reduce((sum, item) => sum + item.revenue, 0);
  }, [data.monthlyFinancials]);

  const totalProfit = useMemo(() => {
    return data.monthlyFinancials.reduce((sum, item) => sum + item.profit, 0);
  }, [data.monthlyFinancials]);

  const averageProfit = useMemo(() => {
    return totalProfit / data.monthlyFinancials.length;
  }, [totalProfit, data.monthlyFinancials]);

  const topProviders = useMemo(() => {
    return [...data.providerRevenue]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data.providerRevenue]);

  const chartColors = {
    revenue: "#4f46e5",
    expenses: "#f43f5e",
    profit: "#10b981",
    thisYear: "#8b5cf6",
    lastYear: "#a3a3a3",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString()} €
            </div>
            <CardDescription className="mt-2 text-xs">
              Cumulative revenue in the period
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProfit.toLocaleString()} €
            </div>
            <CardDescription className="mt-2 text-xs">
              Cumulative profit in the period
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Monthly Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageProfit.toLocaleString()} €
            </div>
            <CardDescription className="mt-2 text-xs">
              Average monthly profit in the period
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly Comparison</TabsTrigger>
          <TabsTrigger value="providers">Provider Revenue</TabsTrigger>
          <TabsTrigger value="services">Service Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Performance</CardTitle>
              <CardDescription>
                Revenue, expenses, and profit over the period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartColors.revenue}
                      name="Revenue"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke={chartColors.expenses}
                      name="Expenses"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke={chartColors.profit}
                      name="Profit"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quarterly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Revenue Comparison</CardTitle>
              <CardDescription>
                Current year vs previous year quarterly revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.quarterlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="thisYear"
                      fill={chartColors.thisYear}
                      name="This Year"
                    />
                    <Bar
                      dataKey="lastYear"
                      fill={chartColors.lastYear}
                      name="Last Year"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Revenue Breakdown</CardTitle>
              <CardDescription>
                Revenue distribution across top providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProviders}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="provider"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="revenue"
                      fill={chartColors.revenue}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Revenue Breakdown</CardTitle>
              <CardDescription>
                Revenue distribution across services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.serviceRevenue}
                    layout="vertical"
                    margin={{ left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="service"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="revenue"
                      fill={chartColors.thisYear}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}