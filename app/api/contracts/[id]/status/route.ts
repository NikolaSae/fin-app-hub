// app/api/contracts/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContractStatus } from '@prisma/client';

interface UpdateStatusRequest {
  status: ContractStatus;
  notes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: contractId } = await params;
    const body: UpdateStatusRequest = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Proverava da li ugovor postoji
    const existingContract = await db.contract.findUnique({
      where: { id: contractId },
      include: {
        humanitarianOrg: true,
        provider: true,
        parkingService: true
      }
    });

    if (!existingContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Koristi transakciju da osigura konzistentnost podataka
    const result = await db.$transaction(async (tx) => {
      // Ažuriraj status ugovora
      const updatedContract = await tx.contract.update({
        where: { id: contractId },
        data: {
          status,
          lastModifiedById: session.user.id,
          updatedAt: new Date(),
          // Dodaj notes u description ili posebno polje ako postoji
          ...(notes && { description: notes })
        },
        include: {
          humanitarianOrg: true,
          provider: true,
          parkingService: true,
          createdBy: true,
          lastModifiedBy: true
        }
      });

      let renewalId: string | undefined;

      // Ako je status postavljen na RENEWAL_IN_PROGRESS i ugovor je humanitarni,
      // automatski kreiraj HumanitarianContractRenewal entitet
      if (status === 'RENEWAL_IN_PROGRESS' && existingContract.type === 'HUMANITARIAN') {
        // Proverava da li već postoji renewal za ovaj ugovor
        const existingRenewal = await tx.humanitarianContractRenewal.findFirst({
          where: { contractId: contractId }
        });

        if (!existingRenewal) {
          // Izračunava predložene datume (logika može biti prilagođena)
          const currentEndDate = new Date(existingContract.endDate);
          const proposedStartDate = new Date(currentEndDate);
          const proposedEndDate = new Date(currentEndDate);
          proposedEndDate.setFullYear(proposedEndDate.getFullYear() + 1); // +1 godine

          // Kreiraj HumanitarianContractRenewal entitet
          const renewal = await tx.humanitarianContractRenewal.create({
            data: {
              contractId: contractId,
              humanitarianOrgId: existingContract.humanitarianOrgId!,
              proposedStartDate,
              proposedEndDate,
              proposedRevenue: existingContract.revenuePercentage,
              subStatus: 'DOCUMENT_COLLECTION',
              documentsReceived: false,
              legalApproved: false,
              financialApproved: false,
              signatureReceived: false,
              notes: notes ? `Automatski kreiran renewal. ${notes}` : 'Automatski kreiran renewal pri postavljanju statusa na RENEWAL_IN_PROGRESS.',
              createdById: session.user.id,
              lastModifiedById: session.user.id
            }
          });

          renewalId = renewal.id;
        } else {
          renewalId = existingRenewal.id;
        }
      }

      return { contract: updatedContract, renewalId };
    });

    return NextResponse.json({
      success: true,
      contract: result.contract,
      renewalId: result.renewalId,
      message: result.renewalId 
        ? 'Contract status updated and renewal process initialized'
        : 'Contract status updated successfully'
    });

  } catch (error) {
    console.error('Error updating contract status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint za dohvatanje trenutnog statusa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: contractId } = await params;

    const contract = await db.contract.findUnique({
      where: { id: contractId },
      select: {
        id: true,
        status: true,
        type: true,
        updatedAt: true,
        lastModifiedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Ako je humanitarni ugovor u renewal statusu, dohvati i renewal info
    let renewalInfo = null;
    if (contract.type === 'HUMANITARIAN' && contract.status === 'RENEWAL_IN_PROGRESS') {
      renewalInfo = await db.humanitarianContractRenewal.findFirst({
        where: { contractId: contractId },
        select: {
          id: true,
          subStatus: true,
          documentsReceived: true,
          legalApproved: true,
          financialApproved: true,
          signatureReceived: true,
          updatedAt: true
        }
      });
    }

    return NextResponse.json({
      contract,
      renewalInfo
    });

  } catch (error) {
    console.error('Error fetching contract status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}