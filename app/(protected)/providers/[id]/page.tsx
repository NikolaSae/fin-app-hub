// /app/(protected)/providers/[id]/page.tsx
 
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Assuming you have an action that fetches provider details and returns { success, data, error }
import { getProviderDetails } from '@/actions/providers/getProviderDetails'; // Update this import if needed

// Import UI and custom components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader"; // Assuming PageHeader exists
import DetailSkeleton from "@/components/skeletons/DetailSkeleton"; // Assuming DetailSkeleton exists

// Import the ProviderDetails component (from the immersive artifact)
import ProviderDetails from "@/components/providers/ProviderDetails";
// Import the ProviderContracts component (assuming it exists)
import ProviderContracts from "@/components/providers/ProviderContracts";


interface ProviderDetailsPageProps {
    params: {
        id: string;
    };
}

// Generisanje metadata za stranicu
export async function generateMetadata({ params }: ProviderDetailsPageProps): Promise<Metadata> {
     const { id } = await params;
     // Use the action to fetch data for metadata
     const providerResult = await getProviderDetails(id);

     return {
         title: providerResult.success && providerResult.data ? `${providerResult.data.name} | Provider Details` : 'Provider Not Found',
         description: providerResult.success && providerResult.data ? `Details for provider ${providerResult.data.name}.` : 'Details for provider.',
     };
}

// Async Server Component to fetch and render provider details
async function ProviderDetailsFetcher({ providerId }: { providerId: string }) {
    const providerResult = await getProviderDetails(providerId);

    if (!providerResult.success || !providerResult.data) {
        // If details fetching fails or provider not found, call notFound
        notFound();
    }

    const provider = providerResult.data;

    // Render the ProviderDetails component with the fetched data
    return <ProviderDetails provider={provider} />;
}

// Async Server Component to fetch and render provider contracts
async function ProviderContractsFetcher({ providerId }: { providerId: string }) {
    // This component will likely pass the providerId to a Client Component
    // (like ProviderContracts) that uses a hook to fetch the contracts.
    // If you have a server action to fetch contracts by provider ID,
    // you would call it here and pass the data to ProviderContracts.
    // For now, we assume ProviderContracts handles its own fetching via hook.
    return <ProviderContracts providerId={providerId} />;
}


// Glavna Server Komponenta za stranicu detalja provajdera
export default async function ProviderDetailsPage({ params }: ProviderDetailsPageProps) {
    // Await params before accessing its properties
    const { id: providerId } = await params;

    // Fetch provider details here to get the name for the PageHeader
    // This is a separate fetch, but can be optimized depending on your needs
    const providerHeaderResult = await getProviderDetails(providerId);

     if (!providerHeaderResult.success || !providerHeaderResult.data) {
         // If the provider is not found, show 404
         notFound();
     }

     const providerForHeader = providerHeaderResult.data;


    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Page Header */}
             <PageHeader
                 title={providerForHeader.name}
                 description={`Details for provider: ${providerId}`} // Or a more user-friendly description
                 actions={
                     <Link href={`/providers/${providerId}/edit`} passHref>
                         <Button>
                             <Pencil className="mr-2 h-4 w-4" />
                             Edit Provider
                         </Button>
                     </Link>
                 }
                 backLink={{
                     href: "/providers",
                     label: "Back to Providers",
                 }}
             />


            {/* Tabs for Details and other sections */}
            <Tabs defaultValue="details">
                <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                    {/* Add more tabs for other relations if needed */}
                    {/* <TabsTrigger value="vas-services">VAS Services</TabsTrigger> */}
                    {/* <TabsTrigger value="bulk-services">Bulk Services</TabsTrigger> */}
                    {/* <TabsTrigger value="complaints">Complaints</TabsTrigger> */}
                </TabsList>

                {/* Details Tab Content */}
                <TabsContent value="details">
                    <Card>
                        <CardContent className="pt-6">
                            {/* Suspense for the main provider details fetching */}
                            <Suspense fallback={<DetailSkeleton />}>
                                {/* ProviderDetailsFetcher handles fetching and rendering ProviderDetails */}
                                <ProviderDetailsFetcher providerId={providerId} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contracts Tab Content */}
                <TabsContent value="contracts">
                     <Card>
                        <CardContent className="pt-6">
                             {/* Suspense for the contracts list fetching */}
                             {/* Use ListSkeleton or a more specific ContractsListSkeleton */}
                            <Suspense fallback={<DetailSkeleton />}> {/* Using DetailSkeleton for simplicity, consider ListSkeleton */}
                                {/* ProviderContractsFetcher handles fetching and rendering ProviderContracts */}
                                <ProviderContractsFetcher providerId={providerId} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* Add more TabsContent for other relations if needed */}

            </Tabs>
        </div>
    );
}
