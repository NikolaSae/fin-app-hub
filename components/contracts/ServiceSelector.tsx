// /components/contracts/ServiceSelector.tsx
"use client";

import { useState, useEffect } from "react"; // Keep useState for other internal states
import { ContractType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast, useToast } from "@/components/ui/use-toast";
import { XCircle, PlusCircle } from "lucide-react";

// Assuming these actions exist and work
// These actions should return { success: string } or { error: string }
// Note: These actions might not actually exist yet based on our plan structure.
// They would belong to Section 6.4 (Contract Actions).
// For now, let's assume they exist for the sake of fixing the ServiceSelector logic.
// We'll need to create them later.
// Placeholder/assumed actions for now:
// async function addContractService({ contractId, serviceId, specificTerms }): Promise<{ success?: string, error?: string }> { return { success: "Added" }; }
// async function removeContractService({ contractId, serviceId }): Promise<{ success?: string, error?: string }> { return { success: "Removed" }; }
// async function getServicesByType(type: ContractType): Promise<{ data?: Service[], error?: string }> { return { data: [] }; } // Assuming this returns a list of Services

// Import the actual actions (assuming they will be created/updated in Section 6.4)
import { addContractService, removeContractService } from '@/actions/contracts/services'; // Assuming an actions file for managing related services
import { getServicesByType } from '@/actions/services/get'; // Assuming this action fetches services by type


// Define types used in this component
interface Service { // Minimal Service type needed for selection
  id: string;
  name: string;
  type: ContractType; // Should be ServiceType, but ContractForm passes ContractType
}

interface SelectedService { // Represents a service already linked to the contract
  id: string; // The ID of the LINKED entity (e.g., ContractsOnServices ID)
  serviceId: string; // The ID of the actual Service
  service: Service; // The Service details
  specificTerms?: string | null;
}


interface ServiceSelectorProps {
  contractId?: string; // ID of the contract (exists when editing)
  contractType: ContractType; // Type of the contract determines which services are available
  // Receive the list of selected services as a prop from the parent
  selectedServices: SelectedService[]; // This prop is the source of truth
  // Callback to notify parent when the list should change
  // Parent is responsible for updating its state based on this callback
  onChange: (services: SelectedService[]) => void; // Callback to update parent state
  readOnly?: boolean; // If true, component is disabled for interaction
}

// Component for selecting and managing services associated with a contract.
// This is a CONTROLLED component: parent manages the list of selected services state.
export function ServiceSelector({
  contractId,
  contractType,
  selectedServices, // Use this prop for rendering the list
  onChange, // Use this callback to request changes
  readOnly = false,
}: ServiceSelectorProps) {
  // Keep internal state for fetching available services and form inputs
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingService, setAddingService] = useState(false);

  // State for the form to add a new service link
  const [serviceToAddId, setServiceToAddId] = useState<string>("");
  const [specificTerms, setSpecificTerms] = useState("");

  const { toast } = useToast();

  // Fetch available services based on contract type
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      // Use the getServicesByType action (assuming it exists and is correct)
      const result = await getServicesByType(contractType as any); // Cast ContractType to any/ServiceType if mismatch
      setLoading(false);

      if (result.data) {
        // Filter out services that are already selected by ID
        const currentlySelectedIds = selectedServices.map(s => s.serviceId);
        const filteredAvailable = result.data.filter(service => !currentlySelectedIds.includes(service.id));

        setAvailableServices(filteredAvailable);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch available services.",
          variant: "destructive",
        });
        setAvailableServices([]); // Reset on error
      }
    };

    // Fetch only if contractType is defined and not readOnly
    if (contractType && !readOnly) {
       fetchServices();
    } else {
        // If readOnly or no type, clear available services
        setAvailableServices([]);
    }
     // Re-fetch when contractType changes OR when selectedServices changes (to update available list)
  }, [contractType, selectedServices, readOnly, toast]); // Add selectedServices to dependency array


  // Handle adding a service to the contract
  const handleAddService = async () => {
    if (!serviceToAddId) {
      toast({ title: "Error", description: "Please select a service.", variant: "destructive" });
      return;
    }
    // specificTerms can be empty/optional based on requirements

    setAddingService(true);
    try {
      // Find the selected service object from availableServices
      const serviceToAdd = availableServices.find(s => s.id === serviceToAddId);
      if (!serviceToAdd) {
          toast({ title: "Error", description: "Selected service not found.", variant: "destructive" });
          return;
      }

      // If contractId exists (editing), call the server action to link the service
      if (contractId) {
           // Assuming addContractService action takes contractId, serviceId, specificTerms
           const actionResult = await addContractService({
               contractId,
               serviceId: serviceToAddId,
               specificTerms: specificTerms || null,
           });

           if (actionResult.success) {
               // Create the new item structure similar to SelectedService
               const newItem: SelectedService = {
                   // The ID here would be the ID of the ContractsOnServices link if action returns it,
                   // otherwise, you might need a temporary ID or refetch the contract.
                   // For simplicity here, let's assume the action returns the created link object or its ID.
                   // If the action just returns success, you might need a different way to get the link ID or refetch.
                   // Let's assume actionResult has the new link details including its ID and the service details
                   id: actionResult.newLink?.id || `${contractId}-${serviceToAddId}`, // Use actual link ID or a temp one
                   serviceId: serviceToAdd.id,
                   service: serviceToAdd, // Include service details
                   specificTerms: specificTerms || null,
               };

               // Notify the parent component about the change
               // Parent is responsible for updating its state based on this
               onChange([...selectedServices, newItem]); // Pass the new list including the added item

               toast({ title: "Success", description: actionResult.success, variant: "default" });
               setServiceToAddId(""); // Reset form fields
               setSpecificTerms("");
           } else {
                toast({ title: "Error", description: actionResult.error || "Failed to add service.", variant: "destructive" });
           }

      } else {
          // If contractId does NOT exist (creating), manage the list purely on the client side
          // until the contract is saved. The SelectedService structure might differ slightly.
          // In this case, `id` is not a database ID yet, it's just a temporary identifier.
          // The parent form's onSubmit logic will need to handle saving these temporary links.

           const newItem: SelectedService = {
               id: `temp-${Date.now()}-${serviceToAddId}`, // Temporary client-side ID
               serviceId: serviceToAdd.id,
               service: serviceToAdd, // Include service details
               specificTerms: specificTerms || null,
           };

           // Notify the parent component about the change
           onChange([...selectedServices, newItem]); // Pass the new list including the added item

           toast({ title: "Success", description: `Service '${serviceToAdd.name}' added to the list.`, variant: "default" });
           setServiceToAddId(""); // Reset form fields
           setSpecificTerms("");
           // Note: The actual linking in the database happens when the parent form saves the contract.
      }

    } catch (error) {
      console.error("Error adding service:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setAddingService(false);
    }
  };

  // Handle removing a service from the contract
  // This handles both temporary client-side items (when creating) and database-linked items (when editing)
  const handleRemoveService = async (itemToRemove: SelectedService) => { // Pass the SelectedService object/item
      setAddingService(true); // Re-using state, maybe rename to isUpdating
      try {
          let removeSuccess = false;
          let errorMessage = "";

          // If contractId exists, attempt to remove the link from the database
          if (contractId) {
              // Need the ID of the link (ContractsOnServices), not just the serviceId.
              // The itemToRemove object should contain this link ID (`itemToRemove.id`).
              if (!itemToRemove.id) {
                 console.error("Cannot remove linked service, missing link ID:", itemToRemove);
                  toast({ title: "Error", description: "Missing link ID to remove service.", variant: "destructive" });
                  return; // Exit if link ID is missing when editing
              }

              // Assuming removeContractService action takes the link ID
               const actionResult = await removeContractService(itemToRemove.id); // Pass the link ID

               if (actionResult.success) {
                   removeSuccess = true;
                    toast({ title: "Success", description: actionResult.success, variant: "default" });
               } else {
                   errorMessage = actionResult.error || "Failed to remove service link.";
                    toast({ title: "Error", description: errorMessage, variant: "destructive" });
               }

          } else {
              // If contractId does NOT exist (creating), simply remove from the client-side list
              removeSuccess = true; // Client-side removal is always 'successful' in this context
              toast({ title: "Success", description: `Service '${itemToRemove.service.name}' removed from the list.`, variant: "default" });
          }


          // If removal was successful (either from DB or client-side)
          if (removeSuccess) {
              // Filter the list to remove the item
              const updatedSelected = selectedServices.filter(s => s.id !== itemToRemove.id); // Filter by item ID

              // Notify the parent component about the change
              onChange(updatedSelected); // Pass the new list
          }


      } catch (error) {
          console.error("Error removing service:", error);
          toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
          setAddingService(false); // Or isUpdating
      }
  };

  // Filter available services based on search term and exclude already selected ones
  const filteredAvailableServices = availableServices
     .filter(service =>
          // Filter by search term
         service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         // Optional: Filter by service type label (if relevant)
          service.type.toLowerCase().includes(searchTerm.toLowerCase()) // Assuming type exists and is string
     )
     .filter(service =>
         // Exclude services already in the selectedServices list (check by serviceId)
         !selectedServices.some(selected => selected.serviceId === service.id)
     );


  // Map ContractType to ServiceType for fetching available services
  // This is necessary because schema uses ServiceType enum but contract form uses ContractType enum
  // Need a mapping function if ServiceType is different from ContractType values
  // Assuming for now that ContractType values match ServiceType values ('PROVIDER', 'HUMANITARIAN', 'PARKING')
  // If they don't, you need a mapping:
  // const serviceTypeForFetch = mapContractTypeToServiceType(contractType);


  return (
    <div className={`space-y-6 ${readOnly ? 'opacity-75 pointer-events-none' : ''}`}>
      {!readOnly && (
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Add Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="available-services">Select Service</Label>
               {/* Use Shadcn Select for available services */}
               <Select
                  value={serviceToAddId}
                  onValueChange={setServiceToAddId}
                  disabled={loading || addingService || readOnly} // Disable during loading or adding
               >
                  <SelectTrigger id="available-services">
                       <SelectValue placeholder={loading ? "Loading services..." : "Select a service"} />
                  </SelectTrigger>
                   <SelectContent>
                       {/* Option for no selection */}
                       <SelectItem value="" disabled>Select a service</SelectItem>
                       {/* Map filtered available services */}
                       {filteredAvailableServices.map(service => (
                           <SelectItem key={service.id} value={service.id}>
                               {service.name} ({service.type.replace(/_/g, ' ')}) {/* Display name and type */}
                           </SelectItem>
                       ))}
                   </SelectContent>
               </Select>
               {/* Optional: Search input for available services */}
                <Input
                    placeholder="Search available..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading || addingService || readOnly}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="specific-terms">Specific Terms (Optional)</Label>
                <Input
                    id="specific-terms"
                    placeholder="e.g., Commission rate"
                    value={specificTerms}
                    onChange={(e) => setSpecificTerms(e.target.value)}
                    disabled={addingService || readOnly}
                />
            </div>
          </div>
          {/* Add Service Button */}
          <Button
             onClick={handleAddService} // Use the new handler
             disabled={!serviceToAddId || addingService || readOnly} // Disable if no service selected or adding
          >
             {addingService ? "Adding..." : "Add Selected Service"}
          </Button>
        </div>
      )}

      {/* List of Selected Services */}
      <div className="space-y-4 p-4 border rounded-md">
         <h3 className="text-lg font-semibold">Selected Services ({selectedServices.length})</h3>
          {selectedServices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No services selected yet.</p>
          ) : (
               <ul className="space-y-2">
                   {/* Render the list using the `selectedServices` prop */}
                  {selectedServices.map(item => ( // Map over the prop
                      <li key={item.id} className="flex items-center justify-between p-2 border rounded-md bg-secondary/30">
                          {/* Display service name and optional specific terms */}
                           <div>
                               <span className="font-medium">{item.service.name}</span>
                                {item.specificTerms && (
                                     <span className="ml-2 text-sm text-muted-foreground">({item.specificTerms})</span>
                                )}
                           </div>
                           {/* Remove Button */}
                           {!readOnly && (
                               <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleRemoveService(item)} // Pass the item to the new handler
                                   disabled={addingService} // Disable while adding/removing others
                               >
                                   <XCircle className="h-4 w-4 text-red-500" />
                               </Button>
                           )}
                      </li>
                   ))}
               </ul>
          )}
      </div>
    </div>
  );
}