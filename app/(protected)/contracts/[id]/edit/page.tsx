// /app/(protected)/contracts/[id]/edit/page.tsx
import { ContractForm } from "@/components/contracts/ContractForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    // Await the params before accessing its properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const contract = await db.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return {
        title: "Contract Not Found",
        description: "The requested contract could not be found",
      };
    }

    return {
      title: `Edit ${contract.name} | Contract Management`,
      description: `Edit details for contract ${contract.contractNumber}`,
    };
  } catch (error) {
    console.error("[METADATA_ERROR]", error);
    return {
      title: "Error Loading Contract",
      description: "There was an error loading the contract details",
    };
  }
}

interface EditContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getContract(id: string) {
  try {
    // Add more detailed debugging
    console.log(`[GET_CONTRACT] Fetching contract with ID: ${id}`);
    
    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true, 
            contactName: true,
            email: true,
            phone: true,
            address: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            contracts: true,
            vasServices: true,
            bulkServices: true,
            complaints: true,
            _count: true
          }
        },
        humanitarianOrg: {
          select: {
            id: true,
            name: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
            website: true,
            mission: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            contracts: true,
            renewals: true,
            complaints: true,
            _count: true
          }
        },
        operator: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            logoUrl: true,
            website: true,
            contactEmail: true,
            contactPhone: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            contracts: true,
            _count: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        lastModifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    });

    if (!contract) {
      console.error(`[GET_CONTRACT] Contract with ID ${id} not found`);
      return notFound();
    }

    // Debug log to see what data we're getting from the database
    console.log(`[GET_CONTRACT] Contract found:`, {
      id: contract.id,
      name: contract.name,
      contractNumber: contract.contractNumber,
      type: contract.type,
      providerId: contract.providerId,
      provider: contract.provider ? contract.provider.name : null,
      operatorId: contract.operatorId,
      operator: contract.operator ? contract.operator.name : null,
      serviceCount: contract.services?.length || 0
    });

    // Format contract data for consistent rendering
    const formattedContract = {
      ...contract,
      // Ensure startDate and endDate are properly serialized
      startDate: contract.startDate ? new Date(contract.startDate) : null,
      endDate: contract.endDate ? new Date(contract.endDate) : null,
      // Properly handle services data with safe defaults
      services: Array.isArray(contract.services) ? contract.services.map(sc => ({
        serviceId: sc.serviceId || "",
        specificTerms: sc.specificTerms || "",
        service: sc.service || {}
      })) : [],
      // Ensure provider data is available with safe defaults
      providerId: contract.providerId || null,
      provider: contract.provider || null,
      // Ensure operator data is available with safe defaults
      operatorId: contract.operatorId || null,
      operator: contract.operator || null,
      // Ensure humanitarianOrg data is available with safe defaults
      humanitarianOrgId: contract.humanitarianOrgId || null,
      humanitarianOrg: contract.humanitarianOrg || null,
      // Ensure isRevenueSharing is a boolean
      isRevenueSharing: contract.isRevenueSharing === null ? true : !!contract.isRevenueSharing,
    };
    
    // Log the formatted contract for debugging
    console.log(`[GET_CONTRACT] Formatted contract:`, {
      providerId: formattedContract.providerId,
      provider: formattedContract.provider ? formattedContract.provider.name : null,
      operatorId: formattedContract.operatorId,
      operator: formattedContract.operator ? formattedContract.operator.name : null,
      servicesCount: formattedContract.services.length
    });
    
    return formattedContract;
  } catch (error) {
    console.error("[GET_CONTRACT_ERROR]", error);
    return notFound();
  }
}

// Function to fetch providers
async function getProviders() {
  try {
    const providers = await db.provider.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`[GET_PROVIDERS] Found ${providers.length} providers`);
    return providers;
  } catch (error) {
    console.error("[GET_PROVIDERS_ERROR]", error);
    return [];
  }
}

// Function to fetch operators
async function getOperators() {
  try {
    const operators = await db.operator.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`[GET_OPERATORS] Found ${operators.length} operators`);
    return operators;
  } catch (error) {
    console.error("[GET_OPERATORS_ERROR]", error);
    return [];
  }
}

// Function to fetch humanitarian organizations
async function getHumanitarianOrgs() {
  try {
    const orgs = await db.humanitarianOrganization.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`[GET_HUMANITARIAN_ORGS] Found ${orgs.length} humanitarian organizations`);
    return orgs;
  } catch (error) {
    console.error("[GET_HUMANITARIAN_ORGS_ERROR]", error);
    return [];
  }
}

// Function to fetch parking services
async function getParkingServices() {
  try {
    const services = await db.service.findMany({
      where: { 
        type: 'PARKING',
        isActive: true 
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`[GET_PARKING_SERVICES] Found ${services.length} parking services`);
    return services;
  } catch (error) {
    console.error("[GET_PARKING_SERVICES_ERROR]", error);
    return [];
  }
}

export default async function EditContractPage({ params }: EditContractPageProps) {
  try {
    // Await the params before accessing its properties
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Fetch all necessary data in parallel
    const [contract, providers, operators, humanitarianOrgs, parkingServices] = await Promise.all([
      getContract(id),
      getProviders(),
      getOperators(),
      getHumanitarianOrgs(),
      getParkingServices()
    ]);
    
    // Additional debug log in the page component
    console.log("[EDIT_PAGE] Contract data for form:", {
      id: contract.id,
      contractNumber: contract.contractNumber,
      providerId: contract.providerId,
      provider: contract.provider ? contract.provider.name : "No provider",
      operatorId: contract.operatorId,
      operator: contract.operator ? contract.operator.name : "No operator",
      providerOptionsCount: providers.length,
      operatorOptionsCount: operators.length
    });

    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Contract</h1>
          <p className="text-gray-500">
            Update details for contract #{contract.contractNumber}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <ContractForm 
            contract={contract} 
            isEditing={true} 
            providers={providers}
            operators={operators}
            humanitarianOrgs={humanitarianOrgs}
            parkingServices={parkingServices}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("[EDIT_CONTRACT_PAGE_ERROR]", error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Contract</h1>
        <p>There was an error loading the contract details. Please try again later.</p>
      </div>
    );
  }
}