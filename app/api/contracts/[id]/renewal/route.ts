// /app/api/contracts/[id]/renewal/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ContractRenewalSubStatus } from '@prisma/client';

// GET - Dobij renewal podatke za ugovor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;

    // Pronađi aktivan renewal za ovaj ugovor
    const renewal = await db.contractRenewal.findFirst({
      where: { contractId },
      include: {
        attachments: {
          include: {
            uploadedBy: {
              select: { name: true, email: true }
            }
          },
          orderBy: { uploadedAt: 'desc' }
        },
        createdBy: {
          select: { name: true, email: true }
        },
        lastModifiedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ renewal });
  } catch (error) {
    console.error('Error fetching contract renewal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch renewal data' },
      { status: 500 }
    );
  }
}

// POST - Kreiraj novi renewal process
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;
    const body = await request.json();
    
    const {
      proposedStartDate,
      proposedEndDate,
      proposedRevenue,
      comments,
      subStatus = ContractRenewalSubStatus.DOCUMENT_COLLECTION
    } = body;

    // Proveri da li ugovor postoji
    const contract = await db.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Kreiraj renewal record
    const renewal = await db.contractRenewal.create({
      data: {
        contractId,
        subStatus,
        proposedStartDate: new Date(proposedStartDate),
        proposedEndDate: new Date(proposedEndDate),
        proposedRevenue,
        comments,
        createdById: session.user.id
      },
      include: {
        attachments: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    // Ažuriraj status ugovora na RENEWAL_IN_PROGRESS
    await db.contract.update({
      where: { id: contractId },
      data: {
        status: 'RENEWAL_IN_PROGRESS',
        lastModifiedById: session.user.id
      }
    });

    return NextResponse.json({ renewal }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract renewal:', error);
    return NextResponse.json(
      { error: 'Failed to create renewal' },
      { status: 500 }
    );
  }
}

// PUT - Ažuriraj renewal status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = params.id;
    const body = await request.json();
    
    const {
      subStatus,
      comments,
      internalNotes,
      documentsReceived,
      legalApproved,
      financialApproved,
      technicalApproved,
      managementApproved,
      signatureReceived,
      proposedRevenue
    } = body;

    // Pronađi postojeći renewal
    const existingRenewal = await db.contractRenewal.findFirst({
      where: { contractId },
      orderBy: { createdAt: 'desc' }
    });

    if (!existingRenewal) {
      return NextResponse.json({ error: 'Renewal not found' }, { status: 404 });
    }

    // Ažuriraj renewal
    const updatedRenewal = await db.contractRenewal.update({
      where: { id: existingRenewal.id },
      data: {
        subStatus,
        comments,
        internalNotes,
        documentsReceived,
        legalApproved,
        financialApproved,
        technicalApproved,
        managementApproved,
        signatureReceived,
        proposedRevenue,
        lastModifiedById: session.user.id
      },
      include: {
        attachments: {
          include: {
            uploadedBy: {
              select: { name: true, email: true }
            }
          }
        },
        createdBy: {
          select: { name: true, email: true }
        },
        lastModifiedBy: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({ renewal: updatedRenewal });
  } catch (error) {
    console.error('Error updating contract renewal:', error);
    return NextResponse.json(
      { error: 'Failed to update renewal' },
      { status: 500 }
    );
  }
}

