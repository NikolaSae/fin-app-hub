//components/parking-services/ParkingServiceFilters.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export default function ParkingServiceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFiltersActive, setIsFiltersActive] = useState(false);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: searchParams.get("search") || "",
      status: (searchParams.get("status") as "all" | "active" | "inactive") || "all",
    },
  });

  // Check if any filters are active
  useEffect(() => {
    const search = form.watch("search");
    const status = form.watch("status");
    setIsFiltersActive(
      (search && search.length > 0) || status !== "all"
    );
  }, [form.watch("search"), form.watch("status")]);

  const onSubmit = (data: FilterFormValues) => {
    const params = new URLSearchParams();
    
    if (data.search) {
      params.set("search", data.search);
    }
    
    if (data.status !== "all") {
      params.set("status", data.status);
    }
    
    const queryString = params.toString();
    router.push(`/parking-services${queryString ? `?${queryString}` : ""}`);
  };

  const resetFilters = () => {
    form.reset({
      search: "",
      status: "all",
    });
    router.push("/parking-services");
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 md:flex-row md:items-end">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Search</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or contact..."
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full md:w-[180px]">
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex gap-2 ml-auto">
              {isFiltersActive && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
              <Button type="submit" className="min-w-[100px]">
                Filter
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}