////components/security/PerformanceMetrics.tsx


"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface PerformanceMetricsProps {
  initialData?: PerformanceData[];
  timeRange?: string;
}

export default function PerformanceMetrics({ 
  initialData = [],
  timeRange: initialTimeRange = "24h" 
}: PerformanceMetricsProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>(initialData);
  const [loading, setLoading] = useState<boolean>(initialData.length === 0);
  const [timeRange, setTimeRange] = useState<string>(initialTimeRange);
  const [activeTab, setActiveTab] = useState<string>("response-time");

  // Calculate metrics
  const calculateMetrics = () => {
    if (performanceData.length === 0) return { avg: 0, max: 0, min: 0, current: 0 };
    
    let values: number[] = [];
    
    switch (activeTab) {
      case "response-time":
        values = performanceData.map(d => d.responseTime);
        break;
      case "request-count":
        values = performanceData.map(d => d.requestCount);
        break;
      case "error-rate":
        values = performanceData.map(d => d.errorRate);
        break;
      case "system-resources":
        values = performanceData.map(d => d.cpuUsage);
        break;
    }
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const current = values[values.length - 1];
    
    return { avg, max, min, current };
  };

  const metrics = calculateMetrics();

  // Fetch performance data
  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/security/performance?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch performance data");
      
      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount or when time range changes
  useEffect(() => {
    if (initialData.length === 0) {
      fetchPerformanceData();
    }
  }, [timeRange, initialData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>System and API performance monitoring</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchPerformanceData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="response-time">Response Time</TabsTrigger>
            <TabsTrigger value="request-count">Request Count</TabsTrigger>
            <TabsTrigger value="error-rate">Error Rate</TabsTrigger>
            <TabsTrigger value="system-resources">System Resources</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Current</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics.current.toFixed(2)}
                  {activeTab === "response-time" && " ms"}
                  {activeTab === "error-rate" && "%"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics.avg.toFixed(2)}
                  {activeTab === "response-time" && " ms"}
                  {activeTab === "error-rate" && "%"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Maximum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics.max.toFixed(2)}
                  {activeTab === "response-time" && " ms"}
                  {activeTab === "error-rate" && "%"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm text-muted-foreground">Minimum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics.min.toFixed(2)}
                  {activeTab === "response-time" && " ms"}
                  {activeTab === "error-rate" && "%"}
                </p>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="response-time" className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value.toFixed(2)} ms`, "Response Time"]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    name="Response Time (ms)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="request-count" className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [value, "Requests"]}
                  />
                  <Legend />
                  <Bar dataKey="requestCount" name="Request Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="error-rate" className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Error Rate"]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="errorRate" 
                    name="Error Rate (%)" 
                    stroke="#ff7300" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="system-resources" className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number, name) => {
                      return [
                        `${value.toFixed(2)}%`, 
                        name === "cpuUsage" ? "CPU Usage" : "Memory Usage"
                      ];
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cpuUsage" 
                    name="CPU Usage (%)" 
                    stroke="#8884d8" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memoryUsage" 
                    name="Memory Usage (%)" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}