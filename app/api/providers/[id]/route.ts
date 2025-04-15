// app/api/providers/[id]/route.ts
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
  
      // Asinhrono dohvat params
      const { id } = await params;
      
      if (!id) {
        return NextResponse.json({ error: 'ID provajdera je obavezan' }, { status: 400 });
      }
  
      try {
        const provider = await prisma.provajder.findUnique({
          where: { id: id },
        });
  
        if (!provider) {
          return NextResponse.json({ error: 'Provajder nije pronađen' }, { status: 404 });
        }
  
        return NextResponse.json(provider);
      } catch (error) {
        console.error('Greška pri dohvatu provajdera:', error);
        return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
      }
    } catch (error) {
      console.error('Greška pri autentifikaciji:', error);
      return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
    }
  }
  

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Apply auth protection
  const session = await auth();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const id = params.id;
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Provider name is required' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const existingProvider = await db.provajder.findUnique({
      where: { id: id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Update provider
    const updatedProvider = await db.provajder.update({
      where: { id: id },
      data: {
        name: body.name,
        description: body.description || null,
        isActive: body.isActive !== undefined ? body.isActive : existingProvider.isActive,
      },
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
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
      const existingProvider = await prisma.provajder.findUnique({
        where: { name: body.name },
      });
      
      if (existingProvider) {
        return NextResponse.json(
          { error: 'Provider with this name already exists' },
          { status: 409 }
        );
      }
      
      // Create new provider
      const newProvider = await prisma.provajder.create({
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