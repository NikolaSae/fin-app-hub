///components/contracts/charts/ExpiryTimelineChart.tsx


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractType } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface ExpiryData {
  month: string;
  date: Date;
  provider: number;
  humanitarian: number;
  parking: number;
  total: number;
}

interface ExpiryTimelineChartProps {
  data: ExpiryData[];
  title?: string;
}

export function ExpiryTimelineChart({ 
  data,
  title = "Contract Expiry Timeline"
}: ExpiryTimelineChartProps) {
  // Format the tooltip content
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(item => item.month === label);

      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-medium mb-2">{label}</p>
          {dataPoint && (
            <p className="text-xs text-muted-foreground mb-2">
              {formatDate(dataPoint.date, { month: 'long', year: 'numeric' })}
            </p>
          )}
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div 
                key={`tooltip-item-${index}`} 
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}</span>
              </div>
            ))}
            <div className="pt-1 mt-1 border-t flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-medium">
                {payload.reduce((sum, entry) => sum + (entry.value as number), 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Get color for contract type
  const getContractTypeColor = (type: ContractType | string) => {
    switch (type.toLowerCase()) {
      case "provider":
        return "#3b82f6"; // blue
      case "humanitarian":
        return "#10b981"; // green
      case "parking":
        return "#f59e0b"; // amber
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No expiry data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar 
                dataKey="provider" 
                name="Provider" 
                stackId="a" 
                fill={getContractTypeColor("provider")} 
              />
              <Bar 
                dataKey="humanitarian" 
                name="Humanitarian" 
                stackId="a" 
                fill={getContractTypeColor("humanitarian")} 
              />
              <Bar 
                dataKey="parking" 
                name="Parking" 
                stackId="a" 
                fill={getContractTypeColor("parking")} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}