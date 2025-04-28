// /components/providers/ProviderDetails.tsx
'use client';

import { ProviderWithDetails } from '@/lib/types/provider-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';


interface ProviderDetailsProps {
    provider: ProviderWithDetails;
}

export function ProviderDetails({ provider }: ProviderDetailsProps) {
    // Pretpostavljamo da provider prop nikada neće biti null/undefined
    // Parent page (npr. [id]/page.tsx) treba da rukuje 404 stanjem ako provajder nije pronađen.

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <p className="text-sm font-medium text-muted-foreground">Name</p>
                             <p>{provider.name}</p>
                         </div>
                         <div>
                              <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                              <p>{provider.contactName || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-sm font-medium text-muted-foreground">Email</p>
                             <p>{provider.email || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-sm font-medium text-muted-foreground">Phone</p>
                             <p>{provider.phone || 'N/A'}</p>
                         </div>
                         <div className="md:col-span-2">
                             <p className="text-sm font-medium text-muted-foreground">Address</p>
                             <p>{provider.address || 'N/A'}</p>
                         </div>
                         <div>
                             <p className="text-sm font-medium text-muted-foreground">Active</p>
                             <p>{provider.isActive ? 'Yes' : 'No'}</p>
                         </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                         <div>
                             <p className="font-medium">Created</p>
                             <p>{provider.createdAt.toLocaleString()}</p>
                         </div>
                         <div>
                             <p className="font-medium">Last Updated</p>
                             <p>{provider.updatedAt.toLocaleString()}</p>
                         </div>
                    </div>

                </CardContent>
            </Card>


            {provider._count && (
                <Card>
                     <CardHeader>
                         <CardTitle>Related Entities</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <p className="text-sm font-medium text-muted-foreground">Contracts</p>
                                   <p>{provider._count.contracts}</p>
                              </div>
                              <div>
                                   <p className="text-sm font-medium text-muted-foreground">VAS Services</p>
                                   <p>{provider._count.vasServices}</p>
                              </div>
                              <div>
                                   <p className="text-sm font-medium text-muted-foreground">Bulk Services</p>
                                   <p>{provider._count.bulkServices}</p>
                              </div>
                              <div>
                                   <p className="text-sm font-medium text-muted-foreground">Complaints</p>
                                   <p>{provider._count.complaints}</p>
                              </div>
                         </div>
                     </CardContent>
                </Card>
            )}

            {/* Opciono: Sekcije za prikaz povezanih lista (ugovori, reklamacije, itd.) ako su fetchovane i prosleđene */}
            {/* Primer strukture za ugovore ako su uključeni u fetch sa 'include: { contracts: true }' */}
            {/* {provider.contracts && provider.contracts.length > 0 && (
                 <Card>
                     <CardHeader>
                         <CardTitle>Contracts ({provider.contracts.length})</CardTitle>
                     </CardHeader>
                     <CardContent>
                          // Renderujte listu ugovora ovde, možda sa linkovima ka detaljima ugovora
                     </CardContent>
                 </Card>
             )} */}


        </div>
    );
}