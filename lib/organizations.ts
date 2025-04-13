// lib/organizations.ts

import { db } from "@/lib/db";
import { HumanitarnaOrganizacija, IstorijaPromena, OrganizationStatus } from "@prisma/client";
import { calculateStatus } from "@/utils/organizationStatus";

type OrganizationCreate = Omit<HumanitarnaOrganizacija, "id" | "createdAt" | "updatedAt">;

type OrganizationUpdate = Partial<Omit<HumanitarnaOrganizacija, "id" | "createdAt" | "updatedAt">>;

// Dobijanje svih organizacija sa izračunatim statusom
export async function getAllOrganizations() {
  const organizations = await db.humanitarnaOrganizacija.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  });
  
  // Dodajemo status svakoj organizaciji
  const organizationsWithStatus = organizations.map(org => ({
    ...org,
    status: calculateStatus(org.datumIsteka) as OrganizationStatus
  }));
  
  return organizationsWithStatus;
}

// Dobijanje organizacije po ID-u
export async function getOrganizationById(id: string) {
  const organization = await db.humanitarnaOrganizacija.findUnique({
    where: { id },
  });
  
  if (!organization) {
    return null;
  }
  
  return {
    ...organization,
    status: calculateStatus(organization.datumIsteka) as OrganizationStatus
  };
}

// Kreiranje nove organizacije
export async function createOrganization(data: OrganizationCreate, userId: string) {
  const organization = await db.humanitarnaOrganizacija.create({
    data,
  });
  
  // Beležimo kreiranje kao istoriju
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      await db.istorijaPromena.create({
        data: {
          humanitarnaOrganizacijaId: organization.id,
          polje: key,
          staraVrednost: '', // Nova organizacija nema staru vrednost
          novaVrednost: key === 'datumPocetka' || key === 'datumIsteka' 
            ? new Date(value as Date).toISOString() 
            : String(value),
          userId,
        },
      });
    }
  }
  
  return {
    ...organization,
    status: calculateStatus(organization.datumIsteka) as OrganizationStatus
  };
}

// Ažuriranje organizacije i praćenje promena
export async function updateOrganization(
  id: string, 
  data: OrganizationUpdate, 
  userId: string
) {
  // Prvo pribavimo trenutne podatke
  const currentOrganization = await db.humanitarnaOrganizacija.findUnique({
    where: { id },
  });
  
  if (!currentOrganization) {
    throw new Error("Organizacija nije pronađena");
  }
  
  // Ažuriramo organizaciju
  const updatedOrganization = await db.humanitarnaOrganizacija.update({
    where: { id },
    data,
  });
  
  // Beležimo promene u istoriji
  for (const [key, newValue] of Object.entries(data)) {
    if (newValue !== undefined && newValue !== null) {
      const oldValue = (currentOrganization as any)[key];
      
      // Proveravamo da li je došlo do promene
      if (String(oldValue) !== String(newValue)) {
        await db.istorijaPromena.create({
          data: {
            humanitarnaOrganizacijaId: id,
            polje: key,
            staraVrednost: key === 'datumPocetka' || key === 'datumIsteka' 
              ? new Date(oldValue).toISOString() 
              : String(oldValue),
            novaVrednost: key === 'datumPocetka' || key === 'datumIsteka' 
              ? new Date(newValue as Date).toISOString() 
              : String(newValue),
            userId,
          },
        });
      }
    }
  }
  
  return {
    ...updatedOrganization,
    status: calculateStatus(updatedOrganization.datumIsteka) as OrganizationStatus
  };
}

// Brisanje organizacije
export async function deleteOrganization(id: string) {
  return await db.humanitarnaOrganizacija.delete({
    where: { id },
  });
}

// Dobijanje istorije promena za organizaciju
export async function getOrganizationHistory(id: string) {
  const history = await db.istorijaPromena.findMany({
    where: {
      humanitarnaOrganizacijaId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return history;
}