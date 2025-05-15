// components/providers/ProviderCard.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Check, X, RefreshCw } from "lucide-react";

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    isActive: boolean;
    _count?: {
      contracts?: number;
      complaints?: number;
      vasServices?: number;
      bulkServices?: number;
    };
  };
  onStatusChange?: (id: string, isActive: boolean) => Promise<void>;
  onRenewContract?: (id: string) => Promise<void>;
}

export function ProviderCard({ provider, onStatusChange, onRenewContract }: ProviderCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async () => {
    if (!onStatusChange) return;
    
    setIsLoading(true);
    try {
      await onStatusChange(provider.id, !provider.isActive);
    } catch (error) {
      console.error("Failed to change status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewContract = async () => {
    if (!onRenewContract) return;
    
    setIsLoading(true);
    try {
      await onRenewContract(provider.id);
    } catch (error) {
      console.error("Failed to renew contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Link href={`/providers/${provider.id}`} className="hover:underline">
            <CardTitle className="text-lg font-semibold truncate">{provider.name}</CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/providers/${provider.id}`)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/providers/${provider.id}/edit`)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleStatusChange} disabled={isLoading}>
                {provider.isActive ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    <span>Deactivate</span>
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    <span>Activate</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRenewContract} disabled={isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Renew Contract</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <Badge variant={provider.isActive ? "success" : "destructive"} className="mb-2">
              {provider.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Contact:</span> {provider.contactName || "N/A"}
          </div>
          <div>
            <span className="font-medium">Email:</span> {provider.email || "N/A"}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {provider.phone || "N/A"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex flex-wrap justify-between text-xs text-gray-500 gap-1">
        <div>Contracts: {provider._count?.contracts || 0}</div>
        <div>Complaints: {provider._count?.complaints || 0}</div>
        <div>VAS: {provider._count?.vasServices || 0}</div>
        <div>Bulk: {provider._count?.bulkServices || 0}</div>
      </CardFooter>
    </Card>
  );
}