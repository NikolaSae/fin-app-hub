// components/contracts/contractform.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContract } from "@/actions/contracts/create";
import { updateContract } from "@/actions/contracts/update";
import { ServiceSelector } from "@/components/contracts/ServiceSelector";
import { ContractType } from "@prisma/client";
import { contractSchema } from "@/schemas/contract";
import { ContractFormData, SelectedService } from "@/lib/types/contract-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ContractFormProps {
  contract?: {
    id: string;
    name: string;
    contractNumber: string;
    type: ContractType;
    status: string;
    startDate: Date;
    endDate: Date;
    revenuePercentage: number;
    description: string | null;
    providerId: string | null;
    humanitarianOrgId: string | null;
    parkingServiceId: string | null;
    operatorId: string | null;
    operatorRevenue: number | null;
    isRevenueSharing: boolean;
    services?: Array<{ serviceId: string; specificTerms?: string }>;
    createdAt: Date;
    updatedAt: Date;
  };
  isEditing?: boolean;
  humanitarianOrgs?: Array<{ id: string; name: string }>;
  providers?: Array<{ id: string; name: string }>;
  parkingServices?: Array<{ id: string; name: string }>;
  operators?: Array<{ id: string; name: string }>;
}

export function ContractForm({
  contract,
  isEditing = false,
  humanitarianOrgs = [],
  providers = [],
  parkingServices = [],
  operators = []
}: ContractFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      name: contract?.name || '',
      contractNumber: contract?.contractNumber || '',
      type: contract?.type || ContractType.PROVIDER,
      status: contract?.status || "ACTIVE",
      startDate: contract?.startDate ? contract.startDate.toISOString().split('T')[0] : '',
      endDate: contract?.endDate ? contract.endDate.toISOString().split('T')[0] : '',
      revenuePercentage: contract?.revenuePercentage || 10,
      isRevenueSharing: contract?.isRevenueSharing ?? true,
      operatorId: contract?.operatorId || '',
      operatorRevenue: contract?.operatorRevenue || 0,
      description: contract?.description || '',
      providerId: contract?.providerId || '',
      humanitarianOrgId: contract?.humanitarianOrgId || '',
      parkingServiceId: contract?.parkingServiceId || '',
      services: contract?.services || [],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (contract) {
      const initialServices = contract.services?.map(s => ({
        serviceId: s.serviceId,
        specificTerms: s.specificTerms || ''
      })) || [];

      setSelectedServices(initialServices);
      form.reset({
        ...contract,
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        services: initialServices,
        isRevenueSharing: contract.isRevenueSharing ?? true,
        operatorId: contract.operatorId || '',
        operatorRevenue: contract.operatorRevenue || 0,
      });
    } else {
      form.reset({
        name: '',
        contractNumber: '',
        type: ContractType.PROVIDER,
        status: "ACTIVE",
        startDate: '',
        endDate: '',
        revenuePercentage: 10,
        isRevenueSharing: true,
        operatorId: '',
        operatorRevenue: 0,
        description: '',
        providerId: '',
        humanitarianOrgId: '',
        parkingServiceId: '',
        services: [],
      });
      setSelectedServices([]);
    }
  }, [contract, form]);

  useEffect(() => {
    const currentType = form.watch('type');
    if (!isEditing || (isEditing && contract && currentType !== contract.type)) {
      setSelectedServices([]);
      form.setValue('services', []);
    }
  }, [form.watch('type'), contract?.type, isEditing, form]);

  useEffect(() => {
    const validateForm = async () => {
      const values = form.getValues();
      const currentType = values.type;

      let isValid = true;

      if (!values.name || !values.contractNumber || !values.startDate || !values.endDate) {
        isValid = false;
      }

      if (selectedServices.length === 0) {
        isValid = false;
      }

      if (currentType === ContractType.PROVIDER && !values.providerId) {
        isValid = false;
      } else if (currentType === ContractType.HUMANITARIAN && !values.humanitarianOrgId) {
        isValid = false;
      } else if (currentType === ContractType.PARKING && !values.parkingServiceId) {
        isValid = false;
      }

      if (values.startDate && values.endDate) {
        const startDate = new Date(values.startDate);
        const endDate = new Date(values.endDate);
        if (endDate < startDate) {
          isValid = false;
        }
      }

      if (values.revenuePercentage < 0 || values.revenuePercentage > 100) {
        isValid = false;
      }

      if (values.isRevenueSharing && values.operatorId && !values.operatorRevenue) {
        isValid = false;
      }

      if (values.operatorRevenue && (values.operatorRevenue < 0 || values.operatorRevenue > 100)) {
        isValid = false;
      }

      setSubmitEnabled(isValid && !isLoading);
    };

    const subscription = form.watch(() => {
      validateForm();
    });

    validateForm();

    return () => subscription.unsubscribe();
  }, [form, selectedServices, isLoading]);

  useEffect(() => {
    form.setValue('services', selectedServices);
  }, [selectedServices, form]);

  const contractType = form.watch("type");
  const isRevenueSharing = form.watch("isRevenueSharing");

  const onSubmit = async (data: ContractFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        services: selectedServices,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };

      console.log('Submitting contract:', payload);

      const result = isEditing && contract
        ? await updateContract(contract.id, payload)
        : await createContract(payload);

      if (result?.success) {
        toast.success(result.success);
        router.push(result.id ? `/contracts/${result.id}` : '/contracts');
      } else {
        toast.error(result?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Contract" : "Create New Contract"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isEditing ? `Editing: ${contract?.name}` : 'Fill in all required fields to create a new contract'}
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contract name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Number *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter contract number"
                      disabled={isLoading || isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ContractType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["ACTIVE", "EXPIRED", "PENDING", "RENEWAL_IN_PROGRESS"].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Revenue Configuration Section */}
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-4">Revenue Configuration</h3>
              
              <FormField
                control={form.control}
                name="revenuePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Revenue Percentage (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="isRevenueSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Revenue Sharing with Operator</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {isRevenueSharing && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="operatorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {operators.map((operator) => (
                              <SelectItem key={operator.id} value={operator.id}>
                                {operator.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="operatorRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator Revenue Percentage (%) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {contractType === ContractType.PROVIDER && (
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {contractType === ContractType.HUMANITARIAN && (
              <FormField
                control={form.control}
                name="humanitarianOrgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {humanitarianOrgs.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {contractType === ContractType.PARKING && (
              <FormField
                control={form.control}
                name="parkingServiceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parking Service *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parking service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parkingServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <FormLabel>Services *</FormLabel>
                  <ServiceSelector
                    contractType={contractType}
                    selectedServices={selectedServices}
                    onChange={(services) => {
                      setSelectedServices(services);
                      form.setValue('services', services, { shouldValidate: true });
                    }}
                    error={form.formState.errors.services?.message as string}
                    disabled={isLoading}
                  />
                  <FormMessage className="text-red-500">
                    {form.formState.errors.services?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add contract description"
                      disabled={isLoading}
                      rows={4}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!submitEnabled}
                className="w-32"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">↻</span>
                    Saving...
                  </span>
                ) : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {isEditing && contract && (
        <CardFooter className="text-xs text-muted-foreground">
          Created: {contract.createdAt.toLocaleDateString()} |
          Last Updated: {contract.updatedAt.toLocaleDateString()}
        </CardFooter>
      )}
    </Card>
  );
}