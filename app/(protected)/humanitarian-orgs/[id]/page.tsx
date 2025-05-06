// /app/(protected)/humanitarian-orgs/[id]/page.tsx

import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { HumanitarianOrgWithDetails } from '@/lib/types/humanitarian-org-types';
import { HumanitarianOrgDetails } from "@/components/humanitarian-orgs/HumanitarianOrgDetails";
import { HumanitarianOrgContracts } from "@/components/humanitarian-orgs/HumanitarianOrgContracts";

interface HumanitarianOrgDetailsPageProps {
    params: {
        id: string;
    };
}

// Function to fetch humanitarian organization details with included relations
async function getHumanitarianOrgDetails(orgId: string): Promise<HumanitarianOrgWithDetails | null> {
    try {
        // Fetch organization by ID with included relations
        const organization = await db.humanitarianOrg.findUnique({
            where: { id: orgId },
            include: {
                contracts: {
                    select: {
                        id: true,
                        name: true,
                        contractNumber: true,
                        status: true,
                        startDate: true,
                        endDate: true,
                        type: true,
                        revenuePercentage: true,
                        // Include related HumanitarianContractRenewal model
                        humanitarianRenewals: {
                            select: {
                                id: true,
                                subStatus: true,
                                renewalStartDate: true,
                                proposedStartDate: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 1, // Take only the latest renewal
                        },
                    },
                    orderBy: { endDate: 'desc' }, // Sort contracts
                },
                complaints: {
                    select: { 
                        id: true, 
                        title: true, 
                        status: true, 
                        createdAt: true 
                    },
                },
                // Include other needed counts
                _count: {
                    select: { 
                        contracts: true, 
                        complaints: true 
                    }
                }
            }
        });

        return organization as HumanitarianOrgWithDetails | null;

    } catch (error) {
        console.error(`Error fetching humanitarian organization ${orgId} details from DB:`, error);
        return null;
    }
}

// Generate metadata for the page
export async function generateMetadata({ params }: HumanitarianOrgDetailsPageProps): Promise<Metadata> {
    const { id } = params;
    const organization = await getHumanitarianOrgDetails(id);

    return {
        title: organization ? `${organization.name} | Organization Details` : 'Organization Not Found',
        description: organization ? `Details for humanitarian organization ${organization.name}.` : 'Details for organization.',
    };
}

// Main Server Component for humanitarian organization details page
export default async function HumanitarianOrgDetailsPage({ params }: HumanitarianOrgDetailsPageProps) {
    const { id: orgId } = params;
    const organization = await getHumanitarianOrgDetails(orgId);

    // If organization not found, show 404 page
    if (!organization) {
        notFound();
    }

    // Extract list of contracts to pass to the component
    const associatedContracts = organization.contracts || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
                    <p className="text-gray-500">
                        Details for humanitarian organization: {organization.id}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Link to edit organization */}
                    <a
                        href={`/humanitarian-orgs/${organization.id}/edit`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    >
                        Edit Organization
                    </a>
                    {/* Optional: Delete button */}
                </div>
            </div>

            {/* Suspense boundary for async components */}
            <Suspense fallback={<div>Loading organization details...</div>}>
                {/* Render organization details component */}
                <HumanitarianOrgDetails organization={organization} />

                {/* Render related contracts component */}
                <HumanitarianOrgContracts contracts={associatedContracts} />
            </Suspense>
        </div>
    );
}