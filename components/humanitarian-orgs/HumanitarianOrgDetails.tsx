// /components/humanitarian-orgs/HumanitarianOrgDetails.tsx
"use client";
import React from 'react';
// Uvozimo custom tip HumanitarianOrgWithDetails
import { HumanitarianOrgWithDetails } from '@/lib/types/humanitarian-org-types';
// Uvozimo UI komponente iz Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link'; // U slučaju da se prikazuju linkovi ka povezanim entitetima

interface HumanitarianOrgDetailsProps {
    organization: HumanitarianOrgWithDetails; // Očekuje objekat organizacije sa (opcionim) detaljima i brojačima
}

// Komponenta za prikaz detalja humanitarne organizacije
export function HumanitarianOrgDetails({ organization }: HumanitarianOrgDetailsProps) {
    if (!organization) {
        return <div>No organization data available.</div>;
    }

    // Koristimo nativne HTML elemente kao u placeholderima
    return (
        <div className="space-y-6">
            {/* Koristiti Shadcn Card ako je importovan */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div>
                        <strong>Name:</strong> {organization.name}
                    </div>
                    <div>
                        <strong>Contact Person:</strong> {organization.contactPerson || 'N/A'}
                    </div>
                    <div>
                        <strong>Email:</strong> {organization.email || 'N/A'}
                    </div>
                    <div>
                        <strong>Phone:</strong> {organization.phone || 'N/A'}
                    </div>
                    <div>
                        <strong>Address:</strong> {organization.address || 'N/A'}
                    </div>
                    <div>
                        <strong>Website:</strong> {organization.website || 'N/A'}
                    </div>
                    <div>
                        <strong>Active:</strong> {organization.isActive ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <strong>Created:</strong> {organization.createdAt.toLocaleString()}
                    </div>
                    <div>
                        <strong>Updated:</strong> {organization.updatedAt.toLocaleString()}
                    </div>
                </CardContent>
            </Card>
            
            {/* Prikazivanje brojača povezanih entiteta ako su dostupni */}
            {organization._count && (
                <Card>
                    <CardHeader>
                        <CardTitle>Related Entities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <strong>Contracts:</strong> {organization._count.contracts}
                        </div>
                        <div>
                            <strong>Complaints:</strong> {organization._count.complaints}
                        </div>
                        {organization._count.humanitarianRenewals !== undefined && (
                            <div>
                                <strong>Renewals:</strong> {organization._count.humanitarianRenewals}
                            </div>
                        )}
                        {/* Možete dodati linkove ka listama filtriranim po ovoj organizaciji */}
                    </CardContent>
                </Card>
            )}
            
            {organization.complaints && organization.complaints.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Complaints ({organization.complaints.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Ovde bi išla lista reklamacija, verovatno tabela ili lista stavki */}
                    </CardContent>
                </Card>
            )}
            {/* Ugovori se prikazuju u posebnoj komponenti HumanitarianOrgContracts */}
        </div>
    );
}