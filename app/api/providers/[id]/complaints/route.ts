// app/api/providers/[id]/complaints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Provjera autentifikacije
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Neautorizovano' }, { status: 401 });
    }

    // Dohvat ID-a provajdera
    const providerId = await params.id;
    
    if (!providerId) {
      return NextResponse.json({ error: 'ID provajdera je obavezan' }, { status: 400 });
    }

    // Dohvat žalbi za provajdera
    const complaints = await db.complaint.findMany({
      where: { providerId: providerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Greška pri dohvatu žalbi:', error);
    return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
  }
}