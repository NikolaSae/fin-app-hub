///components/services/ServiceList.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Check, 
  X,
  Loader2,
  Eye 
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useServices } from "@/hooks/use-services";
import { formatDate } from "@/lib/utils";
import { ServiceType } from "@/lib/types/service-types";

interface ServiceListProps {
  serviceType?: string;
}

export function ServiceList({ serviceType }: ServiceListProps) {
  const router = useRouter();
  const { services, isLoading, error } = useServices({ type: serviceType });
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedServices = [...(services || [])].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === "type") {
      return sortDirection === "asc" 
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    }
    if (sortField === "updatedAt") {
      return sortDirection === "asc" 
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VAS":
        return "bg-blue-100 text-blue-800";
      case "BULK":
        return "bg-purple-100 text-purple-800";
      case "HUMANITARIAN":
        return "bg-green-100 text-green-800";
      case "PARKING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading services: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services</CardTitle>
        <Link href="/services/new">
          <Button>Add New Service</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                <div className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("type")} className="cursor-pointer">
                <div className="flex items-center">
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort("updatedAt")} className="cursor-pointer">
                <div className="flex items-center">
                  Last Updated
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-[80px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sortedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              sortedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(service.type)}>
                      {service.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {service.isActive ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        <X className="mr-1 h-3 w-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(service.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => router.push(`/services/${service.type.toLowerCase()}/${service.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => router.push(`/services/${service.type.toLowerCase()}/${service.id}/edit`)}
                        >
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}