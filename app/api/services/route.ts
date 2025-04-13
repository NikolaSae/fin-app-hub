// app/api/services/route.ts

import { NextResponse } from 'next/server';
import { Auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Preuzimanje provajdera sa njihovim servisima
    const providers = await db.provajder.findMany({
      include: {
        vasServices: true,
        bulkServices: true,
        parkingServices: true,
        humanServices: true
      }
    });

    return NextResponse.json({ providers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}