// app/api/email-processor/config/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    // Define a default storage path - customize this as needed
    // This example uses a directory in the project for storage
    // You could also use a system directory like os.tmpdir() for temporary storage
    const storagePath = path.join(process.cwd(), 'email-storage');

    return NextResponse.json({ 
      storagePath,
      success: true 
    });
  } catch (error) {
    console.error('Error getting email processor config:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}