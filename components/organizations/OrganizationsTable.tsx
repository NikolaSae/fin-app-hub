// components/organizations/OrganizationsTable.tsx

import { useState } from 'react';
import { 
  HumanitarnaOrganizacija, 
  OrganizationStatus 
} from '@prisma/client';
import { 
  calculateStatus, 
  getStatusColor 
} from '@/utils/organizationStatus';
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableHeader, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Filter } from 'lucide-react';
import Link from 'next/link';

type OrganizationWithStatus = HumanitarnaOrganizacija & {
  status: OrganizationStatus;
};

interface OrganizationsTableProps {
  organizations: OrganizationWithStatus[];
}

export function OrganizationsTable({ organizations: initialOrganizations }: OrganizationsTableProps) {
  const [filteredOrganizations, setFilteredOrganizations] = useState<OrganizationWithStatus[]>(initialOrganizations);
  const [searchTerm, setSearchTerm] = useState('');

  // Funkcija za formatiranje datuma
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS');
  };

  // Funkcija za filtriranje organizacija
  const filterOrganizations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredOrganizations(initialOrganizations);
      return;
    }
    
    const filtered = initialOrganizations.filter(org => 
      org.naziv.toLowerCase().includes(term) ||
      org.kratkiBroj.toLowerCase().includes(term) ||
      org.pib.toLowerCase().includes(term)
    );
    
    setFilteredOrganizations(filtered);
  };

  // Funkcija za filtriranje po statusu
  const filterByStatus = (status: OrganizationStatus | 'ALL') => {
    if (status === 'ALL') {
      setFilteredOrganizations(initialOrganizations);
      return;
    }
    
    const filtered = initialOrganizations.filter(org => org.status === status);
    setFilteredOrganizations(filtered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži organizacije..."
              className="pl-8 w-[300px]"
              value={searchTerm}
              onChange={filterOrganizations}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => filterByStatus('ALL')}>
                Sve organizacije
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterByStatus('URGENT')}>
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                Hitno
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterByStatus('HIGH')}>
                <span className="h-2 w-2 rounded-full bg-orange-500 mr-2" />
                Visok prioritet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterByStatus('MEDIUM')}>
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                Srednji prioritet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => filterByStatus('LOW')}>
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Nizak prioritet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Link href="/organizations/new">
          <Button>Nova organizacija</Button>
        </Link>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Kratki broj</TableHead>
              <TableHead>Datum isteka</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PIB</TableHead>
              <TableHead>Namena</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nema pronađenih organizacija
                </TableCell>
              </TableRow>
            ) : (
              filteredOrganizations.map((org) => {
                const statusColor = getStatusColor(org.status);
                return (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      <Link href={`/organizations/${org.id}`} className="hover:underline">
                        {org.naziv}
                      </Link>
                    </TableCell>
                    <TableCell>{org.kratkiBroj}</TableCell>
                    <TableCell>{formatDate(org.datumIsteka)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
                      >
                        {org.status === 'URGENT' && 'Hitno'}
                        {org.status === 'HIGH' && 'Visok'}
                        {org.status === 'MEDIUM' && 'Srednji'}
                        {org.status === 'LOW' && 'Nizak'}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.pib}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{org.namena}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Opcije</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/organizations/${org.id}`}>Pregled</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/organizations/${org.id}/edit`}>Izmeni</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/organizations/${org.id}/history`}>Istorija promena</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}