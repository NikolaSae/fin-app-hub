// /components/contracts/ContractForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
    services?: SelectedService[];
    createdAt: Date;
    updatedAt: Date;
  };

  contract?: any;
  isEditing?: boolean;

  humanitarianOrgs?: Array<{ id: string; name: string }>;
  providers?: Array<{ id: string; name: string }>;
  parkingServices?: Array<{ id: string; name: string }>;
}

export function ContractForm({
  contract,

export function ContractForm({ 
  contract, 
  isEditing = false,

  humanitarianOrgs = [],
  providers = [],
  parkingServices = []
}: ContractFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!contract;

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
     isEditing && contract?.services
      ? contract.services
      : []
  );

  const form = useForm<ContractFormData>({
     resolver: zodResolver(contractSchema),
     defaultValues: isEditing && contract
        ? {
           name: contract.name,
           contractNumber: contract.contractNumber,
           type: contract.type,
           status: contract.status,
           startDate: contract.startDate.toISOString().split('T')[0],
           endDate: contract.endDate.toISOString().split('T')[0],
           revenuePercentage: contract.revenuePercentage,
           description: contract.description ?? '',
           providerId: contract.providerId ?? '',
           humanitarianOrgId: contract.humanitarianOrgId ?? '',
           parkingServiceId: contract.parkingServiceId ?? '',
         }
       : {
           name: '',
           contractNumber: '',
           type: ContractType.PROVIDER,
           status: "ACTIVE",
           startDate: '',
           endDate: '',
           revenuePercentage: 10,
           description: '',
           providerId: '',
           humanitarianOrgId: '',
           parkingServiceId: '',
       },
     mode: 'onSubmit',
   });
  
   const contractType = form.watch("type");

    useEffect(() => {
        if (contract) {
            form.reset({
                name: contract.name,
                contractNumber: contract.contractNumber,
                type: contract.type,
                status: contract.status,
                startDate: contract.startDate.toISOString().split('T')[0],
                endDate: contract.endDate.toISOString().split('T')[0],
                revenuePercentage: contract.revenuePercentage,
                description: contract.description ?? '',
                providerId: contract.providerId ?? '',
                humanitarianOrgId: contract.humanitarianOrgId ?? '',
                parkingServiceId: contract.parkingServiceId ?? '',
            });
            setSelectedServices(contract.services || []);
        } else {
            form.reset({
                name: '',
                contractNumber: '',
                type: ContractType.PROVIDER,
                status: "ACTIVE",
                startDate: '',
                endDate: '',
                revenuePercentage: 10,
                description: '',
                providerId: '',
                humanitarianOrgId: '',
                parkingServiceId: '',
            });
            setSelectedServices([]);
        }
    }, [contract, form]);


   const onSubmit = async (data: ContractFormData) => {
     setIsLoading(true);

     try {
       const formattedData = {
         ...data,
         startDate: new Date(data.startDate),
         endDate: new Date(data.endDate),

         services: selectedServices,
       };

        let result;
        if (isEditing && contract) {
            result = await updateContract(contract.id, formattedData as any);
        } else {
            result = await createContract(formattedData as any);
        }

       setIsLoading(false);

       if (result?.success) {
         toast({
           title: 'Success!',
           description: result.success,
         });
         const newItemId = isEditing ? contract?.id : result.id;
         if (newItemId) {
           router.push(`/contracts/${newItemId}`);
         } else {
           router.push('/contracts');
         }
          router.refresh();

       } else {
         console.error("Failed to save contract:", result?.error);
         toast({
           title: 'Error',
           description: result?.error || 'An unknown error occurred.',
           variant: 'destructive',
         });
       }

     } catch (error) {
       console.error("Error saving contract:", error);
       setIsLoading(false);
       toast({
         title: 'Error',
         description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
         variant: 'destructive',
       });
     }
   };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: isEditing && contract
      ? {
          name: contract.name,
          contractNumber: contract.contractNumber,
          type: contract.type,
          status: contract.status,
          startDate: new Date(contract.startDate).toISOString().split('T')[0],
          endDate: new Date(contract.endDate).toISOString().split('T')[0],
          revenuePercentage: contract.revenuePercentage,
          description: contract.description,
          providerId: contract.providerId,
          humanitarianOrgId: contract.humanitarianOrgId,
          parkingServiceId: contract.parkingServiceId,
        }
      : {
          status: "ACTIVE",
          revenuePercentage: 10,
          type: "PROVIDER" as ContractType,
        },
  });

  const contractType = watch("type");
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ContractType;
    setSelectedType(newType);
    setValue("type", newType);

    // Reset related IDs when changing contract type
    if (newType === "PROVIDER") {
      setValue("humanitarianOrgId", undefined);
      setValue("parkingServiceId", undefined);
      clearErrors(["humanitarianOrgId", "parkingServiceId"]);
    } else if (newType === "HUMANITARIAN") {
      setValue("providerId", undefined);
      setValue("parkingServiceId", undefined);
      clearErrors(["providerId", "parkingServiceId"]);
    } else if (newType === "PARKING") {
      setValue("providerId", undefined);
      setValue("humanitarianOrgId", undefined);
      clearErrors(["providerId", "humanitarianOrgId"]);
    }
  };



  return (

     <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>{isEditing ? "Edit Contract" : "Create New Contract"}</CardTitle>
             <p className="text-sm text-muted-foreground">
                {isEditing ? `Edit details for contract: ${contract?.name}` : 'Fill in the details for a new contract.'}
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
                                <FormLabel>Contract Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter contract name" {...field} disabled={isLoading} />
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
                                <FormLabel>Contract Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter contract number" {...field} disabled={isLoading || isEditing} />
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
                                 <FormLabel>Contract Type</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || isEditing}>
                                     <FormControl>
                                         <SelectTrigger>
                                             <SelectValue placeholder="Select a contract type" />
                                         </SelectTrigger>
                                     </FormControl>
                                      <SelectContent>
                                         {Object.values(ContractType).map(type => (
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
                                 <FormLabel>Status</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                     <FormControl>
                                         <SelectTrigger>
                                             <SelectValue placeholder="Select a status" />
                                         </SelectTrigger>
                                     </FormControl>
                                      <SelectContent>
                                          {["ACTIVE", "EXPIRED", "PENDING", "RENEWAL_IN_PROGRESS"].map(status => (
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

                     <FormField
                         control={form.control}
                         name="startDate"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Start Date</FormLabel>
                                 <FormControl>
                                     <Input type="date" {...field} disabled={isLoading} />
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
                                 <FormLabel>End Date</FormLabel>
                                 <FormControl>
                                     <Input type="date" {...field} disabled={isLoading} />
                                </FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />

                     <FormField
                         control={form.control}
                         name="revenuePercentage"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Revenue Percentage (%)</FormLabel>
                                 <FormControl>
                                     <Input
                                         type="number"
                                         step="0.01"
                                         min="0"
                                         max="100"
                                         placeholder="Enter percentage"
                                         {...field}
                                         onChange={e => field.onChange(parseFloat(e.target.value))}
                                         disabled={isLoading}
                                     />
                                </FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />


                     {contractType === ContractType.PROVIDER && (
                         <FormField
                             control={form.control}
                             name="providerId"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>Provider</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                         <FormControl>
                                             <SelectTrigger>
                                                 <SelectValue placeholder="Select a provider" />
                                             </SelectTrigger>
                                         </FormControl>
                                          <SelectContent>
                                             {providers.map(provider => (
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
                                     <FormLabel>Humanitarian Organization</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                         <FormControl>
                                             <SelectTrigger>
                                                 <SelectValue placeholder="Select an organization" />
                                             </SelectTrigger>
                                         </FormControl>
                                          <SelectContent>
                                             {humanitarianOrgs.map(org => (
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
                                     <FormLabel>Parking Service</FormLabel>
                                     <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                         <FormControl>
                                             <SelectTrigger>
                                                 <SelectValue placeholder="Select a parking service" />
                                             </SelectTrigger>
                                         </FormControl>
                                          <SelectContent>
                                             {parkingServices.map(service => (
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


                    <div className="space-y-2">
                         <Label>Services</Label>
                         <ServiceSelector
                             contractId={contract?.id}
                             contractType={contractType}
                             selectedServices={selectedServices}
                             onChange={setSelectedServices}
                             readOnly={isLoading}
                          />
                    </div>


                     <FormField
                         control={form.control}
                         name="description"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Description (Optional)</FormLabel>
                                 <FormControl>
                                     <Textarea placeholder="Enter contract description" {...field} disabled={isLoading} rows={4} />
                                 </FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />


                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEditing ? "Update Contract" : "Create Contract"}
                        </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
          {isEditing && contract && (
              <CardFooter className="text-xs text-muted-foreground">
                  Created: {new Date(contract.createdAt).toLocaleString()} | Last Updated: {new Date(contract.updatedAt).toLocaleString()}
             </CardFooter>
          )}
     </Card>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Contract Name
          </label>
          <input
            id="name"
            type="text"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="Enter contract name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="contractNumber" className="block text-sm font-medium">
            Contract Number
          </label>
          <input
            id="contractNumber"
            type="text"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            placeholder="Enter contract number"
            disabled={isEditing}
            {...register("contractNumber")}
          />
          {errors.contractNumber && (
            <p className="text-red-500 text-sm">{errors.contractNumber.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-medium">
            Contract Type
          </label>
          <select
            id="type"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            disabled={isEditing}
            value={selectedType}
            {...register("type")}
            onChange={handleTypeChange}
          >
            <option value="PROVIDER">Provider</option>
            <option value="HUMANITARIAN">Humanitarian</option>
            <option value="PARKING">Parking</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            {...register("status")}
          >
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING">Pending</option>
            <option value="RENEWAL_IN_PROGRESS">Renewal In Progress</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm">{errors.startDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm">{errors.endDate.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="revenuePercentage" className="block text-sm font-medium">
            Revenue Percentage (%)
          </label>
          <input
            id="revenuePercentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
            {...register("revenuePercentage", {
              valueAsNumber: true,
            })}
          />
          {errors.revenuePercentage && (
            <p className="text-red-500 text-sm">{errors.revenuePercentage.message}</p>
          )}
        </div>
        
        {contractType === "PROVIDER" && (
          <div className="space-y-2">
            <label htmlFor="providerId" className="block text-sm font-medium">
              Provider
            </label>
            <select
              id="providerId"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              {...register("providerId")}
            >
              <option value="">Select Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            {errors.providerId && (
              <p className="text-red-500 text-sm">{errors.providerId.message}</p>
            )}
          </div>
        )}
        
        {contractType === "HUMANITARIAN" && (
          <div className="space-y-2">
            <label htmlFor="humanitarianOrgId" className="block text-sm font-medium">
              Humanitarian Organization
            </label>
            <select
              id="humanitarianOrgId"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              {...register("humanitarianOrgId")}
            >
              <option value="">Select Organization</option>
              {humanitarianOrgs.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.humanitarianOrgId && (
              <p className="text-red-500 text-sm">{errors.humanitarianOrgId.message}</p>
            )}
          </div>
        )}
        
        {contractType === "PARKING" && (
          <div className="space-y-2">
            <label htmlFor="parkingServiceId" className="block text-sm font-medium">
              Parking Service
            </label>
            <select
              id="parkingServiceId"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              {...register("parkingServiceId")}
            >
              <option value="">Select Parking Service</option>
              {parkingServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.parkingServiceId && (
              <p className="text-red-500 text-sm">{errors.parkingServiceId.message}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Services</label>
        <ServiceSelector 
          selectedServices={selectedServices} 
          onChange={setSelectedServices}
          contractType={selectedType}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          placeholder="Enter contract description"
          {...register("description")}
        ></textarea>
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          {isLoading ? "Saving..." : isEditing ? "Update Contract" : "Create Contract"}
        </button>
      </div>
    </form>

  );
}