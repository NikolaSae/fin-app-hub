// /components/humanitarian-orgs/HumanitarianOrgContracts.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { AlertCircle, Clock, FileText } from "lucide-react";

interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING" | "RENEWAL_IN_PROGRESS";
  startDate: string | Date;
  endDate: string | Date;
  revenuePercentage: number;
  type: "HUMANITARIAN";
}

interface HumanitarianOrgContractsProps {
  organizationId: string;
  organizationName: string;
}

export function HumanitarianOrgContracts({ organizationId, organizationName }: HumanitarianOrgContractsProps) {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Funkcija za učitavanje ugovora za ovu humanitarnu organizaciju
  const loadContracts = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ovde pretpostavljamo da postoji API endpoint za dohvatanje ugovora
      const response = await fetch(`/api/humanitarian-orgs/${organizationId}/contracts?page=${page}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`Failed to load contracts: ${response.statusText}`);
      }
      
      const data = await response.json();
      setContracts(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError("Failed to load contracts. Please try again later.");
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Učitavanje ugovora pri prvom renderovanju
  useEffect(() => {
    loadContracts(1);
  }, [organizationId]);

  // Funkcija za promenu stranice
  const handlePageChange = (page: number) => {
    loadContracts(page);
  };

  // Funkcija za status badge
  const renderStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'RENEWAL_IN_PROGRESS':
        return <Badge className="bg-blue-500">Renewal in Progress</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Contracts</CardTitle>
        <Button
          onClick={() => router.push(`/contracts/new?orgId=${organizationId}&orgName=${encodeURIComponent(organizationName)}`)}
        >
          Add Contract
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">No contracts found</h3>
            <p className="text-gray-500 mb-4">This organization doesn't have any contracts yet.</p>
            <Button 
              onClick={() => router.push(`/contracts/new?orgId=${organizationId}&orgName=${encodeURIComponent(organizationName)}`)}
            >
              Add First Contract
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Contract Name</th>
                    <th className="text-left py-3 px-4">Contract No.</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-left py-3 px-4">Revenue %</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:underline">
                          {contract.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{contract.contractNumber}</td>
                      <td className="py-3 px-4">{renderStatusBadge(contract.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{contract.revenuePercentage}%</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/contracts/${contract.id}`)}
                          >
                            View
                          </Button>
                          {contract.status === 'ACTIVE' && (
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/contracts/${contract.id}/edit`)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-4 text-center">
              Showing {contracts.length} of {totalResults} contracts
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}