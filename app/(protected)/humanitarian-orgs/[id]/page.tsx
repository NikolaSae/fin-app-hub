// /app/(protected)/humanitarian-orgs/[id]/page.tsx

import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HumanitarianOrgWithDetails } from '@/lib/types/humanitarian-org-types';
import { HumanitarianOrgDetails } from "@/components/humanitarian-orgs/HumanitarianOrgDetails";
import { HumanitarianOrgContracts } from "@/components/humanitarian-orgs/HumanitarianOrgContracts";

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface HumanitarianOrgDetailsPageProps {
    params: {
        id: string;
    };
}

async function getHumanitarianOrgDetails(orgId: string): Promise<HumanitarianOrgWithDetails | null> {
    try {
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
                        // Ova relacija je na Contract modelu, i zove se 'humanitarianRenewals'
                        humanitarianRenewals: {
                            select: {
                                id: true,
                                subStatus: true,
                                renewalStartDate: true,
                                proposedStartDate: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                    orderBy: { endDate: 'desc' },
                },
                complaints: {
                    select: { id: true, title: true, status: true, createdAt: true },
                },
                // ISPRAVKA: Uključivanje relacije 'renewals' na HumanitarianOrg modelu
                renewals: true,
                _count: {
                    // ISPRAVKA: _count za 'renewals'
                    select: { contracts: true, complaints: true, renewals: true }
                }
            }
        });

        return organization as HumanitarianOrgWithDetails | null;

    } catch (error) {
        console.error(`Error fetching humanitarian organization ${orgId} details from DB:`, error);
        return null;
    }
}

export async function generateMetadata({ params }: HumanitarianOrgDetailsPageProps): Promise<Metadata> {
     const { id } = await params;
     const organization = await getHumanitarianOrgDetails(id);

     return {
         title: organization ? `${organization.name} | Organization Details` : 'Organization Not Found',
         description: organization ? `Details for humanitarian organization ${organization.name}.` : 'Details for organization.',
     };
}

export default async function HumanitarianOrgDetailsPage({ params }: HumanitarianOrgDetailsPageProps) {
    const { id: orgId } = await params;

    const organization = await getHumanitarianOrgDetails(orgId);

    if (!organization) {
        notFound();
    }

    const associatedContracts = organization.contracts || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
                    <p className="text-gray-500">
                        Details for humanitarian organization: {organization.id}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button asChild variant="outline">
                        <Link href="/humanitarian-orgs">
                            Back to Organizations
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/humanitarian-orgs/${organization.id}/edit`}>
                            Edit Organization
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/humanitarian-orgs/${organization.id}/contracts/new`}>
                            Create New Contract
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/humanitarian-orgs/${organization.id}/complaints/new`}>
                            Submit Complaint
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts ({organization._count.contracts})</TabsTrigger>
                    <TabsTrigger value="complaints">Complaints ({organization._count.complaints})</TabsTrigger>
                </TabsList>

                <Suspense fallback={<div>Loading organization details...</div>}>
                    <TabsContent value="details" className="mt-4">
                        <HumanitarianOrgDetails organization={organization} />
                    </TabsContent>
                </Suspense>

                <Suspense fallback={<div>Loading contracts...</div>}>
                    <TabsContent value="contracts" className="mt-4">
                        <HumanitarianOrgContracts contracts={associatedContracts} />
                        {organization._count.contracts > 0 && (
                            <div className="mt-4 text-right">
                                <Button asChild variant="outline">
                                    <Link href={`/humanitarian-orgs/${organization.id}/contracts`}>
                                        View All Contracts
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Suspense>

                <Suspense fallback={<div>Loading complaints...</div>}>
                    <TabsContent value="complaints" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Complaints Associated with {organization.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>There are {organization._count.complaints} complaints associated with this organization.</p>
                                {organization._count.complaints > 0 && (
                                    <Button asChild className="mt-4">
                                        <Link href={`/humanitarian-orgs/${organization.id}/complaints`}>
                                            View All Complaints
                                        </Link>
                                    </Button>
                                )}
                                {organization._count.complaints === 0 && (
                                    <p className="text-sm text-gray-500 mt-2">No complaints recorded yet for this organization.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Suspense>
            </Tabs>
        </div>
    );
}