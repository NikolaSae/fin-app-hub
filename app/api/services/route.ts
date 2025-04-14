// app/api/services/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';  // Changed from Auth to auth
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    console.log("Auth check result:", !!session?.user);
    
    if (!session || !session.user) {
      console.log("Unauthorized request, no valid session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log("Fetching providers from database...");
    const providers = await db.Provajder.findMany({
      include: {
        vasServices: true,
        bulkServices: true,
        parkingServices: true,
        humanServices: true
      }
    });
    
    console.log(`Found ${providers.length} providers`);
    
    // If no providers, add a dummy one for testing
    if (providers.length === 0) {
      console.log("No providers found, consider adding test data");
    }
    
    return NextResponse.json({ providers }, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}