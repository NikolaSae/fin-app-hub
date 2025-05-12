// Path: /components/contracts/RevenueBreakdown.tsx
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueBreakdownProps {
  contract: {
    revenuePercentage: number;
    operatorRevenue?: number | null;
    isRevenueSharing: boolean;
    operator?: { name: string } | null;
  };
}

export function RevenueBreakdown({ contract }: RevenueBreakdownProps) {
  // Calculate the remaining percentage (e.g., for the service provider)
  const calculateRemainingPercentage = () => {
    let totalAllocated = contract.revenuePercentage; // Platform percentage
    
    // Add operator percentage if revenue sharing is enabled and operator revenue is defined
    if (contract.isRevenueSharing && typeof contract.operatorRevenue === 'number') {
      totalAllocated += contract.operatorRevenue;
    }
    
    // Return what's left for the service provider
    return 100 - totalAllocated;
  };

  const remainingPercentage = calculateRemainingPercentage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Revenue Model: {contract.isRevenueSharing ? "Revenue Sharing" : "Standard"}</h3>
            <div className="bg-muted rounded-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="text-lg font-bold">{contract.revenuePercentage}%</p>
                </div>
                
                {contract.isRevenueSharing && typeof contract.operatorRevenue === 'number' && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Operator {contract.operator?.name ? `(${contract.operator.name})` : ""}</p>
                    <p className="text-lg font-bold">{contract.operatorRevenue}%</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Service Provider</p>
                  <p className="text-lg font-bold">{remainingPercentage}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual representation of the revenue breakdown */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Revenue Distribution</p>
            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 float-left" 
                style={{ width: `${contract.revenuePercentage}%` }}
                title={`Platform: ${contract.revenuePercentage}%`}
              ></div>
              
              {contract.isRevenueSharing && typeof contract.operatorRevenue === 'number' && (
                <div 
                  className="h-full bg-purple-500 float-left" 
                  style={{ width: `${contract.operatorRevenue}%` }}
                  title={`Operator: ${contract.operatorRevenue}%`}
                ></div>
              )}
              
              <div 
                className="h-full bg-green-500 float-left" 
                style={{ width: `${remainingPercentage}%` }}
                title={`Service Provider: ${remainingPercentage}%`}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Platform</span>
              </div>
              
              {contract.isRevenueSharing && typeof contract.operatorRevenue === 'number' && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                  <span>Operator</span>
                </div>
              )}
              
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Service Provider</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}