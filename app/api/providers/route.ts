// app/api/providers/route.ts
// app/api/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    // Provjera autentifikacije
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Neautorizovano' }, { status: 401 });
    }

    // Dohvat svih provajdera
    const providers = await db.provajder.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Greška pri dohvatu provajdera:', error);
    return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Apply auth protection
  const session = await auth();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Provider name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const existingProvider = await db.provajder.findUnique({
      where: { name: body.name },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Provider with this name already exists' },
        { status: 409 }
      );
    }

    // Create new provider
    const newProvider = await db.provajder.create({
      data: {
        name: body.name,
        description: body.description || null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(newProvider, { status: 201 });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { error: 'Failed to create provider' },
      { status: 500 }
    );
  }
}