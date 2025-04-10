import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const where = {
      status: searchParams.get('status') as ClaimStatus || undefined,
      type: searchParams.get('type') as ClaimType || undefined,
      OR: searchParams.get('search') ? [
        { subject: { contains: searchParams.get('search') } },
        { description: { contains: searchParams.get('search') } },
        { claimNumber: { contains: searchParams.get('search') } }
      ] : undefined
    };

    const claims = await prisma.claim.findMany({
      where,
      include: {
        submitter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        attachments: true,
        notes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(claims);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}