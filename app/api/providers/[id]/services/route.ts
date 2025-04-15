// app/api/providers/[id]/services/route.ts
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
        const id = await params;
        const providerId = params.id;
        
        if (!providerId) {
          return NextResponse.json({ error: 'ID provajdera je obavezan' }, { status: 400 });
        }
    
        try {
          // Dohvat svih tipova servisa za provajdera
          const vasServices = await db.vasService.findMany({
            where: { provajderId: providerId },
            orderBy: { name: 'asc' },
          });
    
          const bulkServices = await db.bulkService.findMany({
            where: { provajderId: providerId },
            orderBy: { name: 'asc' },
          });
    
          const parkingServices = await db.parkingService.findMany({
            where: { provajderId: providerId },
            orderBy: { name: 'asc' },
          });
    
          const humanServices = await db.humanService.findMany({
            where: { provajderId: providerId },
            orderBy: { name: 'asc' },
          });
    
          // Kombinovanje svih servisa u jedan niz
          const allServices = [
            ...vasServices,
            ...bulkServices,
            ...parkingServices,
            ...humanServices,
          ];
    
          return NextResponse.json(allServices);
        } catch (error) {
          console.error('Greška pri dohvatu usluga:', error);
          return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
        }
      } catch (error) {
        console.error('Greška pri autentifikaciji:', error);
        return NextResponse.json({ error: 'Interna serverska greška' }, { status: 500 });
      }
    }
    