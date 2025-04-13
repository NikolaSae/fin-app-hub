// components/organizations/OrganizationHistory.tsx

import { IstorijaPromena } from '@prisma/client';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrganizationHistoryProps {
  history: (IstorijaPromena & {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  })[];
}

export function OrganizationHistory({ history }: OrganizationHistoryProps) {
  // Funkcija za formatiranje vremena
  const formatDateTime = (date: Date) => {
    return format(new Date(date), "dd.MM.yyyy HH:mm", { locale: sr });
  };

  // Funkcija za formatiranje vrednosti u zavisnosti od tipa polja
  const formatValue = (field: string, value: string) => {
    if (field === 'datumPocetka' || field === 'datumIsteka') {
      try {
        return format(new Date(value), "dd.MM.yyyy", { locale: sr });
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  // Funkcija za formatiranje naziva polja na srpskom
  const formatFieldName = (field: string) => {
    const fieldMap: Record<string, string> = {
      naziv: 'Naziv',
      kratkiBroj: 'Kratki broj',
      ugovor: 'Ugovor',
      datumPocetka: 'Datum početka',
      datumIsteka: 'Datum isteka',
      racun: 'Račun',
      banka: 'Banka',
      pib: 'PIB',
      mb: 'Matični broj',
      namena: 'Namena'
    };
    
    return fieldMap[field] || field;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Istorija promena</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nema zabeleženih promena
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vreme promene</TableHead>
                <TableHead>Korisnik</TableHead>
                <TableHead>Izmenjeno polje</TableHead>
                <TableHead>Stara vrednost</TableHead>
                <TableHead>Nova vrednost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>{item.user.name || item.user.email}</TableCell>
                  <TableCell>{formatFieldName(item.polje)}</TableCell>
                  <TableCell>{formatValue(item.polje, item.staraVrednost)}</TableCell>
                  <TableCell>{formatValue(item.polje, item.novaVrednost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}