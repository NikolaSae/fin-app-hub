// lib/providerServices.ts

import { db } from "@/lib/db";
import { Provajder, VasService, BulkService, ParkingService, HumanService } from "@prisma/client";

// Tip za kreiranje novog provajdera (isključujući automatska polja)
type ProviderCreate = Omit<Provajder, "id" | "createdAt" | "updatedAt">;

// Tip za ažuriranje provajdera
type ProviderUpdate = Partial<Omit<Provajder, "id" | "createdAt" | "updatedAt">>;

// Dobijanje svih provajdera sa svim povezanim servisima
export async function getAllProviders() {
  const providers = await db.provajder.findMany({
    include: {
      vasServices: true,
      bulkServices: true,
      parkingServices: true,
      humanServices: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return providers;
}

// Dobijanje provajdera po ID-u
export async function getProviderById(id: string) {
  const provider = await db.provajder.findUnique({
    where: { id },
    include: {
      vasServices: true,
      bulkServices: true,
      parkingServices: true,
      humanServices: true,
    },
  });

  if (!provider) {
    return null;
  }

  return provider;
}

// Kreiranje novog provajdera
export async function createProvider(data: ProviderCreate) {
  const provider = await db.provajder.create({
    data,
  });

  return provider;
}

// Ažuriranje provajdera
export async function updateProvider(id: string, data: ProviderUpdate) {
  const updatedProvider = await db.provajder.update({
    where: { id },
    data,
  });

  return updatedProvider;
}

// Brisanje provajdera
export async function deleteProvider(id: string) {
  return await db.provajder.delete({
    where: { id },
  });
}

// Dobijanje povezanih servisa za određenog provajdera
export async function getProviderServices(id: string) {
  const provider = await db.provajder.findUnique({
    where: { id },
    include: {
      vasServices: true,
      bulkServices: true,
      parkingServices: true,
      humanServices: true,
    },
  });

  if (!provider) {
    return null;
  }

  return {
    vasServices: provider.vasServices,
    bulkServices: provider.bulkServices,
    parkingServices: provider.parkingServices,
    humanServices: provider.humanServices,
  };
}
