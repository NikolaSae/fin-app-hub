// /actions/products/get.ts
'use server';

import { db } from '@/lib/db';
// Uvozimo ažurirane tipove
import { ProductWithDetails, ProductFilterOptions, ProductsApiResponse } from '@/lib/types/product-types';
// Uvozimo auth funkcije za proveru autentifikacije/autorizacije
import { auth } from '@/auth';
import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

interface GetProductsParams extends ProductFilterOptions {
    page?: number;
    limit?: number;
}

/**
 * Server akcija za dohvatanje liste proizvoda sa filterima i paginacijom.
 * Koristi se u hooku useProducts i API rutama.
 * Usklađena sa Product modelom u schema.prisma.
 * @param params Opcije filtera i paginacije.
 * @returns Objekat sa listom proizvoda, ukupnim brojem rezultata i eventualnom greškom.
 */
export async function getProducts(params: GetProductsParams): Promise<ProductsApiResponse & { error: string | null }> {
     // Provera da li je korisnik ulogovan
     const session = await auth();
     if (!session?.user) {
       return { data: [], total: 0, error: "Unauthorized" };
     }

     // Provera uloge ako je potrebna
    // const role = await currentRole();
    // if (role !== UserRole.ADMIN && role !== UserRole.MANAGER && role !== UserRole.USER) { // Prilagodite uloge
    //    return { data: [], total: 0, error: "Forbidden" };
    // }

    try {
        // Usklađeno sa ProductFilterOptions
        const { search, isActive, page = 1, limit = 100 } = params;

        // Izgradnja Prisma WHERE klauzule
        const where: any = {};
        if (search) {
            // Pretraga po 'name', 'code' i 'description'
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { code: { contains: search, mode: 'insensitive' as const } }, // Pretraga i po code
                { description: { contains: search, mode: 'insensitive' as const } },
            ];
        }
         if (isActive !== null && isActive !== undefined) {
             where.isActive = isActive;
         }
        // serviceId filter NE postoji na osnovu schema.prisma

        const skip = (page - 1) * limit;
        const take = limit;


        // Dohvatanje podataka i ukupnog broja
        const [products, totalCount] = await Promise.all([
            db.product.findMany({
                where,
                take,
                skip,
                orderBy: { name: 'asc' }, // Podrazumevano sortiranje
                 include: {
                     // Uključite brojače za relacije koje postoje u schema.prisma Product modelu
                     _count: {
                          select: { complaints: true } // Relacija Complaint[]
                     }
                     // Relacija 'services' NE postoji na Product modelu
                 }
            }),
            db.product.count({ where }),
        ]);

        // Vraćanje podataka i ukupnog broja (kastovano na ProductWithDetails)
        return { data: products as ProductWithDetails[], total: totalCount, error: null };

    } catch (error) {
        console.error("Error fetching products in action:", error);
        return { data: [], total: 0, error: "Failed to fetch products." };
    }
}


/**
 * Server akcija za dohvatanje pojedinačnog proizvoda po ID-u.
 * Dohvata više detalja (relacije) nego getProducts.
 * Usklađena sa Product modelom u schema.prisma.
 * @param id - ID proizvoda.
 * @returns Objekat sa proizvodom ili greškom.
 */
export async function getProductById(id: string): Promise<{ data: ProductWithDetails | null; error: string | null }> {
     // Provera autentifikacije/autorizacije
      const session = await auth();
      if (!session?.user) {
        return { data: null, error: "Unauthorized" };
      }
     // Provera uloge ako je potrebna

    try {
        const product = await db.product.findUnique({
            where: { id },
             include: {
                  // Uključite relacije potrebne za prikaz detalja iz schema.prisma Product modela
                 complaints: { // Relacija Complaint[]
                      select: {
                           id: true,
                           title: true,
                           status: true,
                           createdAt: true,
                           // Uključite relaciju Provider ako je potrebna na listi reklamacija
                           // provider: { select: { id: true, name: true } }
                       },
                      orderBy: { createdAt: 'desc' }
                 },
                 // Relacija 'service' NE postoji
                 _count: { // Brojači za detalje
                      select: { complaints: true }
                 }
            }
        });

        if (!product) {
            return { data: null, error: "Product not found." };
        }

        // Vraćanje podataka, kastovano na ProductWithDetails
        return { data: product as ProductWithDetails, error: null };

    } catch (error) {
        console.error(`Error fetching product with ID ${id} in action:`, error);
        return { data: null, error: "Failed to fetch product details." };
    }
}