// app/api/providers/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Provjera autentifikacije
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Neautorizovano' }, { status: 401 });
    }

    const id = params.id;
    
    // Dohvat postojećeg provajdera
    const provider = await db.provajder.findUnique({
      where: { id: id }
    });
    
    if (!provider) {
      return NextResponse.json({ error: 'Provajder nije pronađen' }, { status: 404 });
    }
    
    // Promjena statusa (toggle)
    const updatedProvider = await db.provajder.update({
      where: { id: id },
      data: { isActive: !provider.isActive }
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error('Greška pri mijenjanju statusa provajdera:', error);
    return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
  }
}