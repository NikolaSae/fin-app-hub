// Path: components/providers/ProviderList.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Provider,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProvider } from "@/actions/providers/delete";

type ProviderWithRelations = Provider & {
};

interface ProviderListProps {
  providers: ProviderWithRelations[];
  totalProviders: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  userRole: string;
  onDeleteSuccess: () => void;
}

export function ProviderList({
  providers,
  totalProviders,
  page,
  pageSize,
  onPageChange,
  userRole,
  onDeleteSuccess,
}: ProviderListProps): JSX.Element {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalProviders / pageSize);
  const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

  const handleView = (id: string) => {
    router.push(`/providers/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/providers/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteProvider(deleteId);

      if (result?.success) {
        toast.success("Provider has been deleted");
        setDeleteId(null);
        onDeleteSuccess();
      } else {
        toast.error(result?.error || "Failed to delete provider");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during deletion");
      console.error("Delete Provider Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSafeDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return "N/A";
      const validDate = date instanceof Date ? date : new Date(date);
      if (isNaN(validDate.getTime())) return "Invalid Date";
      return formatDistanceToNow(validDate, { addSuffix: true });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Error";
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!Array.isArray(providers) || providers.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No providers found
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow
                    key={provider.id}
                    onClick={() => handleView(provider.id)}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{provider.contactName || "N/A"}</TableCell>
                    <TableCell>{provider.email || "N/A"}</TableCell>
                    <TableCell>{provider.phone || "N/A"}</TableCell>
                    <TableCell>
                      {formatSafeDate(provider.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(provider.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(provider.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem
                              onClick={() => setDeleteId(provider.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum} className={pageNum === page ? "font-bold" : ""}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the provider
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}