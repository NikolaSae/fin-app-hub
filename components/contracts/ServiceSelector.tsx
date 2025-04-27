///components/contracts/ServiceSelector.tsx


"use client";

import { useState, useEffect } from "react";
import { Check, X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { addContractService } from '@/actions/contracts/add-service'; // Koristite ime koje izvozi fajl
import { removeContractService } from '@/actions/contracts/remove-service'; // Koristite ime koje izvozi fajl
import { ServiceType } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
}

interface SelectedService {
  id: string;
  name: string;
  type: ServiceType;
  specificTerms?: string;
}

interface ServiceSelectorProps {
  contractId: string;
  contractType: "PROVIDER" | "HUMANITARIAN" | "PARKING";
  initialServices?: SelectedService[];
  onServicesChange?: (services: SelectedService[]) => void;
  readOnly?: boolean;
}

export function ServiceSelector({
  contractId,
  contractType,
  initialServices = [],
  onServicesChange,
  readOnly = false
}: ServiceSelectorProps) {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [specificTerms, setSpecificTerms] = useState("");
  const { toast } = useToast();

  // Filter services based on contract type
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/services?type=${contractType}`);
        if (!response.ok) throw new Error("Failed to fetch services");
        
        const data = await response.json();
        setAvailableServices(data.services);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error fetching services",
          description: "Failed to load available services",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [contractType, toast]);

  // Handle adding a service to the contract
  const handleAddContractService = async () => {
    if (!selectedServiceId) return;
    
    try {
      setAddingService(true);
      
      const serviceToAdd = availableServices.find(service => service.id === selectedServiceId);
      if (!serviceToAdd) return;
      
      const result = await addContractService({
        contractId,
        serviceId: selectedServiceId,
        specificTerms: specificTerms.trim() || undefined
      });
      
      if (result.success) {
        const newService: SelectedService = {
          id: serviceToAdd.id,
          name: serviceToAdd.name,
          type: serviceToAdd.type,
          specificTerms: specificTerms.trim() || undefined
        };
        
        const updated = [...selectedServices, newService];
        setSelectedServices(updated);
        
        if (onServicesChange) {
          onServicesChange(updated);
        }
        
        // Reset form
        setSelectedServiceId("");
        setSpecificTerms("");
        
        toast({
          title: "Service added",
          description: `Added ${serviceToAdd.name} to the contract`,
        });
      } else {
        toast({
          title: "Failed to add service",
          description: result.error || "An error occurred while adding the service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "Failed to add service to contract",
        variant: "destructive",
      });
    } finally {
      setAddingService(false);
    }
  };

  // Handle removing a service from the contract
  const handleRemoveContractService = async (serviceId: string) => {
    try {
      const result = await removeContractService({
        contractId,
        serviceId,
      });
      
      if (result.success) {
        const updated = selectedServices.filter(s => s.id !== serviceId);
        setSelectedServices(updated);
        
        if (onServicesChange) {
          onServicesChange(updated);
        }
        
        toast({
          title: "Service removed",
          description: "Service has been removed from the contract",
        });
      } else {
        toast({
          title: "Failed to remove service",
          description: result.error || "An error occurred while removing the service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing service:", error);
      toast({
        title: "Error",
        description: "Failed to remove service from contract",
        variant: "destructive",
      });
    }
  };

  // Filter out already selected services and apply search term
  const filteredServices = availableServices
    .filter(service => !selectedServices.some(s => s.id === service.id))
    .filter(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Get the appropriate service type label
  const getServiceTypeLabel = (type: ServiceType) => {
    switch (type) {
      case "VAS":
        return "Value Added";
      case "BULK":
        return "Bulk";
      case "HUMANITARIAN":
        return "Humanitarian";
      case "PARKING":
        return "Parking";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Contract Services</h3>
        
        {!readOnly && (
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-select">Select Service</Label>
                <Select
                  value={selectedServiceId}
                  onValueChange={setSelectedServiceId}
                  disabled={loading || addingService}
                >
                  <SelectTrigger id="service-select" className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="p-2 text-center text-muted-foreground">Loading services...</div>
                    ) : filteredServices.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground">No services available</div>
                    ) : (
                      filteredServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({getServiceTypeLabel(service.type)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specific-terms">Specific Terms (Optional)</Label>
                <Textarea
                  id="specific-terms"
                  placeholder="Enter any specific terms for this service"
                  value={specificTerms}
                  onChange={(e) => setSpecificTerms(e.target.value)}
                  disabled={addingService}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddContractService}
                disabled={!selectedServiceId || addingService}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {addingService ? "Adding..." : "Add Service"}
              </Button>
            </div>
          </div>
        )}
        
        {/* List of selected services */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Services</h4>
            {!readOnly && selectedServices.length > 0 && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            )}
          </div>
          
          {selectedServices.length === 0 ? (
            <div className="p-4 text-center border rounded-md text-muted-foreground">
              No services added to this contract yet
            </div>
          ) : (
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div 
                  key={service.id} 
                  className="p-4 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="outline">{getServiceTypeLabel(service.type)}</Badge>
                    </div>
                    {service.specificTerms && (
                      <p className="text-sm text-muted-foreground">{service.specificTerms}</p>
                    )}
                  </div>
                  
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContractService(service.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end md:self-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}