// /app/(protected)/services/[serviceType]/[id]/page.tsx

import { Metadata } from "next";
import { ServiceDetails } from "@/components/services/ServiceDetails";
import { getServiceById } from '@/actions/services/get';
import { ServiceType } from "@prisma/client";


interface ServiceDetailsPageProps {
    params: {
        serviceType: string;
        id: string;
    };
}

export async function generateMetadata(
    { params }: ServiceDetailsPageProps,
): Promise<Metadata> {
    const { id: paramId } = await params;

    const result = await getServiceById(paramId);
    const service = result.data;

    return {
        title: service ? `${service.name} Details | Management Dashboard` : "Service Details | Management Dashboard",
        description: service ? `Details for service: ${service.name}` : "Service details page.",
    };
}


export default async function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {

    const { serviceType: urlServiceType, id } = await params;


    const result = await getServiceById(id);


    if (result.error || !result.data) {
         return (
             <div className="p-6 text-center text-red-500">
                 {result.error || "Service not found."}
             </div>
         );
    }

    const service = result.data;


     if (service.type.toLowerCase() !== urlServiceType.toLowerCase()) {
         console.warn(`Service type mismatch in URL. Expected ${service.type}, got ${urlServiceType}. Rendering details for actual type.`);
     }


    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Service Details</h1>
                    <p className="text-gray-500">
                       Details for service: <span className="font-medium">{service.name}</span>
                    </p>
                </div>
            </div>

            <ServiceDetails serviceId={id} />

        </div>
    );
}