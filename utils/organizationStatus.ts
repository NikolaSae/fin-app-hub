// utils/organizationStatus.ts

import { HumanitarnaOrganizacija } from '@prisma/client';

export type OrganizationStatus = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Izračunava status hitnosti na osnovu datuma isteka ugovora
 * 
 * LOW: > 90 dana do isteka
 * MEDIUM: 31-90 dana do isteka
 * HIGH: 8-30 dana do isteka
 * URGENT: < 7 dana do isteka ili istekao
 */
export function calculateStatus(datumIsteka: Date): OrganizationStatus {
  const today = new Date();
  const daysUntilExpiration = Math.ceil(
    (datumIsteka.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration <= 7) {
    return 'URGENT';
  } else if (daysUntilExpiration <= 30) {
    return 'HIGH';
  } else if (daysUntilExpiration <= 90) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}

/**
 * Vraća boju koja odgovara statusu za UI prikaz
 */
export function getStatusColor(status: OrganizationStatus): string {
  switch (status) {
    case 'LOW':
      return 'green';
    case 'MEDIUM':
      return 'blue';
    case 'HIGH':
      return 'orange';
    case 'URGENT':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Proširuje model humanitarne organizacije sa statusom
 */
export function enrichOrganizationWithStatus(
  organization: HumanitarnaOrganizacija
): HumanitarnaOrganizacija & { status: OrganizationStatus } {
  const status = calculateStatus(organization.datumIsteka);
  return {
    ...organization,
    status,
  };
}

/**
 * Sortira organizacije po prioritetu (URGENT prvo, pa HIGH, itd.)
 */
export function sortOrganizationsByPriority(
  organizations: (HumanitarnaOrganizacija & { status: OrganizationStatus })[]
): (HumanitarnaOrganizacija & { status: OrganizationStatus })[] {
  const statusPriority: Record<OrganizationStatus, number> = {
    'URGENT': 0,
    'HIGH': 1,
    'MEDIUM': 2,
    'LOW': 3
  };
  
  return [...organizations].sort((a, b) => 
    statusPriority[a.status] - statusPriority[b.status]
  );
}